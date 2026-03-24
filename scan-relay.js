// scan-relay.js — run with: node scan-relay.js
import { createServer } from 'http';

const PORT = 5176;
let pending = null;

const server = createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204); res.end(); return;
  }

  if (req.method === 'POST' && req.url === '/scan-result') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        pending = JSON.parse(body);
        pending.scannedAt = Date.now();
        console.log('[relay] Received scan:', pending.description, '$' + pending.amount);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok: true }));
      } catch (e) {
        res.writeHead(400); res.end(JSON.stringify({ error: 'Invalid JSON' }));
      }
    });
    return;
  }

  if (req.method === 'GET' && req.url === '/poll') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    if (pending && Date.now() - pending.scannedAt < 120000) {
      const result = pending;
      pending = null;
      console.log('[relay] Desktop picked up:', result.description);
      res.end(JSON.stringify({ result }));
    } else {
      pending = null;
      res.end(JSON.stringify({ result: null }));
    }
    return;
  }

  res.writeHead(404); res.end('Not found');
});

server.listen(PORT, '0.0.0.0', () => {
  console.log('\n  Expense Tracker Relay Server');
  console.log('  Listening on port ' + PORT);
  console.log('  Keep this running while scanning receipts\n');
});