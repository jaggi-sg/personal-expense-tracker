// scan-relay.js — run with: node scan-relay.js
// Relay server that:
//   1. Proxies Gemini API calls server-side (key never exposed to browser)
//   2. Bridges mobile scan results to desktop tracker
//
// API key lives ONLY here on your Mac, never in the browser or git.

import { createServer } from 'http';
import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PORT      = 5176;

// ── Load API key from .env (never from browser) ──────────────────────────────
function loadEnv() {
  const envPath = join(__dirname, '.env');
  if (!existsSync(envPath)) return {};
  const vars = {};
  readFileSync(envPath, 'utf8').split('\n').forEach(line => {
    const m = line.match(/^([^#=]+)=(.*)$/);
    if (m) vars[m[1].trim()] = m[2].trim().replace(/^['"]|['"]$/g, '');
  });
  return vars;
}

const env         = loadEnv();
const GEMINI_KEY  = env.VITE_GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY || '';

if (!GEMINI_KEY) {
  console.warn('\n  WARNING: VITE_GEMINI_API_KEY not found in .env — receipt scanning will fail\n');
} else {
  console.log('  Gemini key loaded from .env (not exposed to browser)');
}

// Vision-capable models, newest first
const VISION_MODELS = [
  'gemini-2.5-flash',
  'gemini-2.5-flash-lite',
  'gemini-2.0-flash',
  'gemini-2.0-flash-lite',
];

// ── Pending scan result (for desktop polling) ────────────────────────────────
let pending = null;

// ── Read request body ────────────────────────────────────────────────────────
function readBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => { try { resolve(JSON.parse(body)); } catch { resolve({}); } });
    req.on('error', reject);
  });
}

// ── Gemini API call (server-side, key never sent to browser) ─────────────────
async function callGemini(mimeType, b64Data, prompt) {
  if (!GEMINI_KEY) throw new Error('No Gemini API key configured in .env');

  const errors = [];
  for (const model of VISION_MODELS) {
    const url = 'https://generativelanguage.googleapis.com/v1beta/models/'
      + model + ':generateContent?key=' + GEMINI_KEY;

    const body = JSON.stringify({
      contents: [{ parts: [
        { inline_data: { mime_type: mimeType, data: b64Data } },
        { text: prompt },
      ]}],
      generationConfig: { temperature: 0 },
    });

    // Node 18+ has built-in fetch
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
    });

    if (res.status === 404) { errors.push(model + ':404'); continue; }
    if (res.status === 429) { errors.push(model + ':429'); continue; }
    if (!res.ok) {
      const text = await res.text();
      errors.push(model + ':' + res.status + ' ' + text.slice(0, 80));
      continue;
    }

    const data = await res.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    const clean = text.replace(/```json|```/g, '').trim();
    console.log('[relay] Gemini success with', model);
    return JSON.parse(clean);
  }

  throw new Error('All Gemini models failed: ' + errors.join(', '));
}

// ── HTTP Server ───────────────────────────────────────────────────────────────
const server = createServer(async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') { res.writeHead(204); res.end(); return; }

  const json = (status, data) => {
    res.writeHead(status, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(data));
  };

  // ── POST /scan-receipt — mobile sends image, relay calls Gemini, returns parsed data
  if (req.method === 'POST' && req.url === '/scan-receipt') {
    try {
      const { mimeType, b64Data, prompt } = await readBody(req);
      if (!b64Data) return json(400, { error: 'Missing b64Data' });

      const today   = new Date().toISOString().split('T')[0];
      const p = prompt || (
        'Analyze this receipt and return ONLY valid JSON (no markdown):\n'
        + '{"description":"merchant name","amount":0.00,"date":"YYYY-MM-DD",'
        + '"category":"what was BOUGHT e.g. Groceries, Food, Gas, Shopping, Dining",'
        + '"paymentType":"if card (VISA/Amex/MC) use Credit Card, if DEBIT use Debit Card, if cash use Cash, else empty",'
        + '"note":"items purchased max 80 chars"}\n'
        + 'Amount=total paid. Date=receipt date or ' + today + '. Category=what was bought not the store name. '
        + 'Category must be semantic (what was bought), NEVER a store name.'
      );

      const parsed = await callGemini(mimeType || 'image/jpeg', b64Data, p);

      if (!parsed.amount || isNaN(parseFloat(parsed.amount))) {
        return json(422, { error: 'Could not read total amount from receipt. Try a clearer photo.' });
      }

      console.log('[relay] Scanned:', parsed.description, '$' + parsed.amount);
      json(200, { ok: true, data: parsed });
    } catch (err) {
      console.error('[relay] scan-receipt error:', err.message);
      json(500, { error: err.message });
    }
    return;
  }

  // ── POST /scan-result — mobile sends final edited data for desktop pickup
  if (req.method === 'POST' && req.url === '/scan-result') {
    try {
      const body = await readBody(req);
      pending = { ...body, scannedAt: Date.now() };
      console.log('[relay] Queued for desktop:', pending.description, '$' + pending.amount);
      json(200, { ok: true });
    } catch (err) {
      json(400, { error: 'Invalid JSON' });
    }
    return;
  }

  // ── GET /poll — desktop polls for scanned data
  if (req.method === 'GET' && req.url === '/poll') {
    if (pending && Date.now() - pending.scannedAt < 120000) {
      const result = pending;
      pending = null;
      console.log('[relay] Desktop picked up:', result.description);
      json(200, { result });
    } else {
      pending = null;
      json(200, { result: null });
    }
    return;
  }

  res.writeHead(404); res.end('Not found');
});

server.listen(PORT, '0.0.0.0', () => {
  console.log('\n  Expense Tracker Relay');
  console.log('  Port: ' + PORT);
  console.log('  Gemini calls: proxied server-side (key never sent to browser)');
  console.log('  Mobile scan:  http://<your-lan-ip>:' + PORT + '/scan-receipt');
  console.log('  Desktop poll: http://localhost:' + PORT + '/poll\n');
});