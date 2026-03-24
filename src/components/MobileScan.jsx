// src/components/MobileScan.jsx
import React, { useState, useRef } from 'react';
import { Camera, Upload, Loader, CheckCircle, AlertCircle, Scan, RefreshCw } from 'lucide-react';

const MONTHS = ['January','February','March','April','May','June',
                'July','August','September','October','November','December'];

const MobileScan = () => {
  const [phase,    setPhase]    = useState('upload');
  const [preview,  setPreview]  = useState(null);
  const [b64Data,  setB64Data]  = useState(null);
  const [mimeType, setMimeType] = useState('image/jpeg');
  const [result,   setResult]   = useState(null);
  const [error,    setError]    = useState(null);
  const [sending,  setSending]  = useState(false);
  // single file input — we switch capture attr via key trick
  const inputRef = useRef();

  const handleFile = (file) => {
    if (!file) return;
    setError(null); setResult(null); setPhase('upload');
    setMimeType(file.type || 'image/jpeg');
    const reader = new FileReader();
    reader.onload = (ev) => {
      setPreview(ev.target.result);
      setB64Data(ev.target.result.split(',')[1]);
    };
    reader.readAsDataURL(file);
  };

  const openCamera  = () => {
    // Create a temporary input with capture to avoid page reload issues on iOS
    const tmp = document.createElement('input');
    tmp.type    = 'file';
    tmp.accept  = 'image/*';
    tmp.capture = 'environment';
    tmp.style.display = 'none';
    document.body.appendChild(tmp);
    tmp.addEventListener('change', ev => { handleFile(ev.target.files[0]); document.body.removeChild(tmp); });
    tmp.click();
  };

  const openGallery = () => {
    const tmp = document.createElement('input');
    tmp.type   = 'file';
    tmp.accept = 'image/*';
    tmp.style.display = 'none';
    document.body.appendChild(tmp);
    tmp.addEventListener('change', ev => { handleFile(ev.target.files[0]); document.body.removeChild(tmp); });
    tmp.click();
  };

  const scan = async () => {
    if (!b64Data) return;
    setPhase('scanning'); setError(null);

    const today  = new Date().toISOString().split('T')[0];
    const prompt = 'Analyze this receipt and return ONLY valid JSON (no markdown):\n'
      + '{"description":"merchant name","amount":0.00,"date":"YYYY-MM-DD",'
      + '"category":"what was BOUGHT e.g. Groceries, Food, Gas, Shopping, Dining",'
      + '"paymentType":"if card (VISA/Amex/MC) use Credit Card, if DEBIT use Debit Card, if cash use Cash, else empty",'
      + '"note":"items purchased max 80 chars"}\n'
      + 'Amount=total paid. Date=receipt date or ' + today + '. Category=what was bought not the store name.';

    try {
      const geminiKey    = import.meta.env.VITE_GEMINI_API_KEY;
      const anthropicKey = import.meta.env.VITE_ANTHROPIC_API_KEY;
      let parsed;

      if (geminiKey) {
        let models = ['gemini-2.0-flash', 'gemini-1.5-flash', 'gemini-1.5-pro'];
        try {
          const lr = await fetch('https://generativelanguage.googleapis.com/v1beta/models?key=' + geminiKey);
          if (lr.ok) {
            const ld = await lr.json();
            const found = (ld.models||[])
              .filter(m => (m.supportedGenerationMethods||[]).includes('generateContent'))
              .map(m => m.name.replace('models/',''))
              .filter(n => n.includes('flash') || n.includes('pro'));
            if (found.length) models = found;
          }
        } catch (_) {}

        let gData = null; let lastErr = '';
        for (const model of models.slice(0,4)) {
          const gr = await fetch(
            'https://generativelanguage.googleapis.com/v1beta/models/' + model + ':generateContent?key=' + geminiKey,
            { method:'POST', headers:{'Content-Type':'application/json'},
              body: JSON.stringify({ contents:[{ parts:[
                { inline_data:{ mime_type: mimeType, data: b64Data } }, { text: prompt }
              ]}], generationConfig:{ temperature:0 } }) }
          );
          if (gr.status === 429 || gr.status === 404) { lastErr = gr.status + ' on ' + model; continue; }
          if (!gr.ok) throw new Error('Gemini ' + gr.status);
          gData = await gr.json(); break;
        }
        if (!gData) throw new Error('No Gemini model available (' + lastErr + '). Wait 60s and retry.');
        parsed = JSON.parse((gData.candidates?.[0]?.content?.parts?.[0]?.text||'').replace(/```json|```/g,'').trim());

      } else if (anthropicKey) {
        const ar = await fetch('/api/anthropic/v1/messages', {
          method:'POST',
          headers:{'Content-Type':'application/json','x-api-key':anthropicKey,'anthropic-version':'2023-06-01'},
          body: JSON.stringify({ model:'claude-haiku-4-5-20251001', max_tokens:512,
            messages:[{ role:'user', content:[
              { type:'image', source:{ type:'base64', media_type:mimeType, data:b64Data } },
              { type:'text', text:prompt }
            ]}] })
        });
        if (!ar.ok) throw new Error('Anthropic ' + ar.status);
        const ad = await ar.json();
        parsed = JSON.parse(((ad.content||[]).find(b=>b.type==='text')?.text||'').replace(/```json|```/g,'').trim());

      } else {
        throw new Error('No API key. Set VITE_GEMINI_API_KEY or VITE_ANTHROPIC_API_KEY in .env');
      }

      if (!parsed.amount || isNaN(parseFloat(parsed.amount))) {
        throw new Error('Could not read total amount. Try a clearer photo.');
      }

      const dateStr = parsed.date || today;
      const d = new Date(dateStr + 'T00:00:00Z');
      setResult({
        description: parsed.description || '',
        amount:      parseFloat(parsed.amount).toFixed(2),
        date:        dateStr,
        month:       MONTHS[d.getUTCMonth()],
        category:    parsed.category    || '',
        paymentType: parsed.paymentType || '',
        note:        parsed.note        || '',
        by:          '',
      });
      setPhase('result');

    } catch (err) {
      setError(err.message.includes('JSON') ? 'Could not parse receipt — try a clearer photo.' : err.message);
      setPhase('error');
    }
  };

  const set = (key, val) => setResult(prev => ({ ...prev, [key]: val }));

  const sendToDesktop = async () => {
    if (!result) return;
    setSending(true); setError(null);
    try {
      const relayHost = window.location.hostname;
      const res = await fetch('http://' + relayHost + ':5176/scan-result', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...result, amount: parseFloat(result.amount)||0, scannedAt: Date.now() }),
      });
      if (!res.ok) throw new Error('Relay ' + res.status);
      setPhase('synced');
    } catch (err) {
      setError('Could not reach relay: ' + err.message + '. Make sure scan-relay.js is running.');
    } finally {
      setSending(false);
    }
  };

  const reset = () => {
    setPhase('upload'); setPreview(null); setB64Data(null);
    setResult(null); setError(null); setSending(false);
  };

  const inpCls = 'w-full bg-white/10 border border-white/15 rounded-2xl px-4 py-3 text-white text-base focus:outline-none focus:border-emerald-400 placeholder-white/30';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900 flex flex-col">

      {/* Header */}
      <div className="bg-slate-900/90 backdrop-blur border-b border-white/10 px-5 py-4 flex items-center gap-3 sticky top-0 z-10">
        <div className="bg-emerald-500/20 p-2 rounded-xl">
          <Scan className="w-5 h-5 text-emerald-400" />
        </div>
        <div>
          <h1 className="text-white font-bold text-lg leading-none">Receipt Scanner</h1>
          <p className="text-purple-400 text-xs mt-0.5">Scan and sync to your expense tracker</p>
        </div>
      </div>

      <div className="flex-1 px-5 py-6 space-y-4 max-w-lg mx-auto w-full">

        {/* SYNCED */}
        {phase === 'synced' && (
          <div className="space-y-4">
            <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-6 text-center space-y-3">
              <CheckCircle className="w-14 h-14 text-emerald-400 mx-auto" />
              <h2 className="text-white font-bold text-xl">Synced to Desktop!</h2>
              <p className="text-purple-300 text-sm">Switch to your laptop — the expense form has been filled.</p>
              {result && (
                <div className="bg-white/5 rounded-xl p-4 text-left space-y-1">
                  <p className="text-white font-semibold">{result.description}</p>
                  <p className="text-emerald-400 font-bold text-lg">{'$' + parseFloat(result.amount).toFixed(2)}</p>
                  <p className="text-purple-400 text-sm">{result.date + ' · ' + result.category}</p>
                  {result.by && <p className="text-purple-400 text-sm">{'Paid by: ' + result.by}</p>}
                </div>
              )}
            </div>
            <button onClick={reset}
              className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-2xl px-4 py-4 flex items-center justify-center gap-3 text-base transition-all">
              <Camera className="w-5 h-5" /> Scan Another Receipt
            </button>
          </div>
        )}

        {/* SCANNING */}
        {phase === 'scanning' && (
          <div className="flex flex-col items-center justify-center py-16 space-y-4">
            <div className="relative">
              <div className="w-20 h-20 rounded-full border-4 border-emerald-500/20 border-t-emerald-400 animate-spin" />
              <Scan className="w-8 h-8 text-emerald-400 absolute inset-0 m-auto" />
            </div>
            <p className="text-white font-semibold text-lg">Analyzing receipt...</p>
            <p className="text-purple-400 text-sm text-center">AI is extracting your expense details</p>
          </div>
        )}

        {/* ERROR */}
        {phase === 'error' && (
          <div className="space-y-4">
            <div className="bg-red-500/10 border border-red-500/25 rounded-2xl p-5 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
              <p className="text-red-300 text-sm">{error}</p>
            </div>
            <button onClick={reset}
              className="w-full bg-white/10 text-white font-semibold rounded-2xl px-4 py-4 flex items-center justify-center gap-2">
              <RefreshCw className="w-5 h-5" /> Try Again
            </button>
          </div>
        )}

        {/* RESULT — editable form */}
        {phase === 'result' && result && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-emerald-400" />
              <p className="text-emerald-300 font-semibold">Scanned — review and edit before sending</p>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/25 rounded-2xl px-4 py-3 text-red-300 text-sm">{error}</div>
            )}

            <div>
              <p className="text-purple-400 text-sm mb-2">Description</p>
              <input className={inpCls} value={result.description} onChange={ev => set('description', ev.target.value)} placeholder="Merchant / store name" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-purple-400 text-sm mb-2">Amount ($)</p>
                <input type="number" step="0.01" className={inpCls} value={result.amount} onChange={ev => set('amount', ev.target.value)} />
              </div>
              <div>
                <p className="text-purple-400 text-sm mb-2">Date</p>
                <input type="date" className={inpCls} value={result.date}
                  onChange={ev => {
                    const d = new Date(ev.target.value + 'T00:00:00Z');
                    setResult(prev => ({ ...prev, date: ev.target.value, month: MONTHS[d.getUTCMonth()] }));
                  }} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-purple-400 text-sm mb-2">Category</p>
                <input className={inpCls} value={result.category} onChange={ev => set('category', ev.target.value)} placeholder="e.g. Groceries" />
              </div>
              <div>
                <p className="text-purple-400 text-sm mb-2">Payment Type</p>
                <input className={inpCls} value={result.paymentType} onChange={ev => set('paymentType', ev.target.value)} placeholder="e.g. Credit Card" />
              </div>
            </div>

            <div>
              <p className="text-purple-400 text-sm mb-2">Paid By</p>
              <input className={inpCls} value={result.by||''} onChange={ev => set('by', ev.target.value)} placeholder="e.g. J Amex, A Venture..." />
            </div>

            <div>
              <p className="text-purple-400 text-sm mb-2">Note</p>
              <input className={inpCls} value={result.note||''} onChange={ev => set('note', ev.target.value)} placeholder="Items or details..." />
            </div>

            <button onClick={sendToDesktop} disabled={sending}
              className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:opacity-60 text-white font-bold rounded-2xl px-4 py-4 flex items-center justify-center gap-2 text-base transition-all shadow-lg shadow-emerald-500/25">
              {sending ? <><Loader className="w-5 h-5 animate-spin" /> Sending...</> : 'Send to Desktop Tracker'}
            </button>
            <button onClick={reset}
              className="w-full bg-white/10 text-purple-300 font-medium rounded-2xl px-4 py-3 text-sm transition-all">
              Rescan
            </button>
          </div>
        )}

        {/* UPLOAD */}
        {phase === 'upload' && (
          <div className="space-y-4 pt-2">
            {preview ? (
              <div className="space-y-4">
                <div className="relative rounded-2xl overflow-hidden border border-white/15 bg-black/30">
                  <img src={preview} alt="Receipt" className="w-full max-h-96 object-contain" />
                  <button onClick={reset} className="absolute top-3 right-3 bg-slate-900/80 text-white rounded-full p-2">
                    <RefreshCw className="w-4 h-4" />
                  </button>
                </div>
                <button onClick={scan}
                  className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-2xl px-4 py-4 flex items-center justify-center gap-3 text-base transition-all shadow-lg shadow-emerald-500/25">
                  <Scan className="w-5 h-5" /> Extract Expense Details
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <button onClick={openCamera}
                  className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-2xl px-4 py-5 flex items-center justify-center gap-3 text-lg transition-all shadow-lg shadow-emerald-500/25">
                  <Camera className="w-6 h-6" /> Take Photo of Receipt
                </button>

                <div className="flex items-center gap-3">
                  <div className="flex-1 border-t border-white/10" />
                  <span className="text-purple-500 text-xs">or</span>
                  <div className="flex-1 border-t border-white/10" />
                </div>

                <button onClick={openGallery}
                  className="w-full bg-white/10 hover:bg-white/15 text-white font-semibold rounded-2xl px-4 py-4 flex items-center justify-center gap-3 text-base transition-all border border-white/15">
                  <Upload className="w-5 h-5" /> Choose from Photos
                </button>

                <p className="text-purple-500 text-xs text-center pt-2">Results sync instantly to your laptop tracker</p>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
};

export default MobileScan;