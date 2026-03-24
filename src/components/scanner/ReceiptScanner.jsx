// src/components/ReceiptScanner.jsx

import React, { useState, useRef } from 'react';
import { Upload, X, Loader, CheckCircle, AlertCircle, Scan, Plus } from 'lucide-react';

const inp = 'bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-emerald-400 w-full';
const sel = inp;

const ReceiptScanner = ({ onExtracted, onAddExpense, categories = [], paymentTypes = [], paidByOptions = [] }) => {
  const [open,     setOpen]     = useState(false);
  const [scanning, setScanning] = useState(false);
  const [error,    setError]    = useState(null);
  const [preview,  setPreview]  = useState(null);
  const [b64Data,  setB64Data]  = useState(null);
  const [mimeType, setMimeType] = useState('image/jpeg');
  const [draft,    setDraft]    = useState(null); // editable extracted data
  const fileRef = useRef();

  const reset = () => {
    setPreview(null); setB64Data(null); setDraft(null);
    setError(null); setScanning(false);
    if (fileRef.current) fileRef.current.value = '';
  };

  const handleFile = (file) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) { setError('Please upload an image file.'); return; }
    setError(null); setDraft(null);
    setMimeType(file.type || 'image/jpeg');
    const reader = new FileReader();
    reader.onload = (ev) => { setPreview(ev.target.result); setB64Data(ev.target.result.split(',')[1]); };
    reader.readAsDataURL(file);
  };

  const scanReceipt = async () => {
    if (!b64Data) return;
    setScanning(true); setError(null);

    const today   = new Date().toISOString().split('T')[0];
    const catList = categories.length > 0 ? categories.join(', ') : 'Groceries, Food, Gas, Shopping, Dining, Entertainment';
    const prompt  = 'Analyze this receipt and return ONLY valid JSON (no markdown):\n'
      + '{"description":"merchant name","amount":0.00,"date":"YYYY-MM-DD",'
      + '"category":"semantic category from: ' + catList + '",'
      + '"paymentType":"if card (VISA/Amex/MC/Discover) use Credit Card, if DEBIT use Debit Card, if cash use Cash, else empty",'
      + '"note":"items purchased max 80 chars"}\n'
      + 'Amount=total paid. Date=receipt date or ' + today + '. Category=what was BOUGHT not the store name.';

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
            models = (ld.models || [])
              .filter(m => (m.supportedGenerationMethods||[]).includes('generateContent'))
              .map(m => m.name.replace('models/',''))
              .filter(n => n.includes('flash') || n.includes('pro'));
          }
        } catch (_) {}

        let gData = null; let lastErr = '';
        for (const model of models.slice(0,4)) {
          const gr = await fetch('https://generativelanguage.googleapis.com/v1beta/models/' + model + ':generateContent?key=' + geminiKey, {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents: [{ parts: [
              { inline_data: { mime_type: mimeType, data: b64Data } }, { text: prompt }
            ]}], generationConfig: { temperature: 0 } }),
          });
          if (gr.status === 429 || gr.status === 404) { lastErr = gr.status + ' on ' + model; continue; }
          if (!gr.ok) throw new Error('Gemini error ' + gr.status);
          gData = await gr.json(); break;
        }
        if (!gData) throw new Error('No Gemini model available (' + lastErr + '). Try again in 60s.');
        parsed = JSON.parse((gData.candidates?.[0]?.content?.parts?.[0]?.text||'').replace(/```json|```/g,'').trim());
      } else if (anthropicKey) {
        const ar = await fetch('/api/anthropic/v1/messages', {
          method: 'POST',
          headers: { 'Content-Type':'application/json','x-api-key':anthropicKey,'anthropic-version':'2023-06-01' },
          body: JSON.stringify({ model:'claude-haiku-4-5-20251001', max_tokens:512, messages:[{ role:'user', content:[
            { type:'image', source:{ type:'base64', media_type:mimeType, data:b64Data } },
            { type:'text', text:prompt },
          ]}] }),
        });
        if (!ar.ok) throw new Error('API error ' + ar.status + ': ' + (await ar.text()).slice(0,200));
        const ad = await ar.json();
        parsed = JSON.parse(((ad.content||[]).find(b=>b.type==='text')?.text||'').replace(/```json|```/g,'').trim());
      } else {
        throw new Error('No API key. Set VITE_GEMINI_API_KEY or VITE_ANTHROPIC_API_KEY in .env');
      }

      if (!parsed.amount || isNaN(parseFloat(parsed.amount))) throw new Error('Could not read total. Try a clearer photo.');

      const dateStr = parsed.date || today;
      const d = new Date(dateStr + 'T00:00:00Z');
      setDraft({
        description: parsed.description || '',
        amount:      parseFloat(parsed.amount).toFixed(2),
        date:        dateStr,
        month:       d.toLocaleString('default', { month: 'long', timeZone: 'UTC' }),
        category:    parsed.category    || (categories[0] || ''),
        paymentType: parsed.paymentType || '',
        note:        parsed.note        || '',
        by:          '',
        status:      'PAID',
      });
    } catch (err) {
      setError(err.message.includes('JSON') ? 'Could not parse receipt — try a clearer photo.' : err.message);
    } finally {
      setScanning(false);
    }
  };

  const handleFillForm = () => {
    if (!draft) return;
    onExtracted({ ...draft, amount: parseFloat(draft.amount) || 0 });
    setOpen(false); reset();
  };

  const handleAddNow = () => {
    if (!draft || !onAddExpense) return;
    onAddExpense({ ...draft, amount: parseFloat(draft.amount) || 0 });
    setOpen(false); reset();
  };

  const set = (key, val) => setDraft(prev => ({ ...prev, [key]: val }));

  return (
    <>
      <button onClick={() => { reset(); setOpen(true); }}
        className="bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 hover:border-emerald-400 rounded-lg px-4 py-2 flex items-center gap-2 text-sm font-medium transition-all">
        <Scan className="w-4 h-4" /> Scan Receipt
      </button>

      {open && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => { setOpen(false); reset(); }}>
          <div className="bg-slate-900 border border-white/15 rounded-2xl w-full max-w-lg shadow-2xl max-h-screen overflow-y-auto"
            style={{ maxHeight: '92vh' }}
            onClick={ev => ev.stopPropagation()}>

            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 sticky top-0 bg-slate-900 z-10">
              <div className="flex items-center gap-3">
                <div className="bg-emerald-500/20 p-2 rounded-lg">
                  <Scan className="w-4 h-4 text-emerald-400" />
                </div>
                <div>
                  <h2 className="text-white font-bold text-base">Scan Receipt</h2>
                  <p className="text-purple-400 text-xs">AI extracts expense details</p>
                </div>
              </div>
              <button onClick={() => { setOpen(false); reset(); }} className="text-purple-400 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">

              {/* Upload zone */}
              {!preview ? (
                <div className="border-2 border-dashed border-white/20 hover:border-emerald-500/50 rounded-xl p-8 text-center transition-all cursor-pointer"
                  onClick={() => fileRef.current?.click()}
                  onDragOver={ev => ev.preventDefault()}
                  onDrop={ev => { ev.preventDefault(); handleFile(ev.dataTransfer.files[0]); }}>
                  <Upload className="w-10 h-10 text-purple-500 mx-auto mb-3" />
                  <p className="text-white font-semibold mb-1">Drop receipt here or click to upload</p>
                  <p className="text-purple-400 text-sm">JPG, PNG, HEIC supported</p>
                  <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={ev => handleFile(ev.target.files[0])} />
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="relative rounded-xl overflow-hidden border border-white/15 bg-black/30">
                    <img src={preview} alt="Receipt" className="w-full max-h-48 object-contain" />
                    <button onClick={reset} className="absolute top-2 right-2 bg-slate-900/80 text-white rounded-full p-1.5">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  {!draft && (
                    <button onClick={scanReceipt} disabled={scanning}
                      className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white font-semibold rounded-xl px-4 py-3 flex items-center justify-center gap-2 transition-all">
                      {scanning ? <><Loader className="w-4 h-4 animate-spin" />Analyzing...</> : <><Scan className="w-4 h-4" />Extract Expense Details</>}
                    </button>
                  )}
                </div>
              )}

              {/* Error */}
              {error && (
                <div className="bg-red-500/10 border border-red-500/25 rounded-xl px-4 py-3 flex items-start gap-3">
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                  <p className="text-red-300 text-sm">{error}</p>
                </div>
              )}

              {/* Editable result form */}
              {draft && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-400" />
                    <p className="text-emerald-300 font-semibold text-sm">Receipt scanned — review and confirm</p>
                  </div>

                  {/* Row 1: Description + Amount */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-purple-400 text-xs mb-1">Description</p>
                      <input className={inp} value={draft.description} onChange={ev => set('description', ev.target.value)} />
                    </div>
                    <div>
                      <p className="text-purple-400 text-xs mb-1">Amount ($)</p>
                      <input className={inp} type="number" step="0.01" value={draft.amount} onChange={ev => set('amount', ev.target.value)} />
                    </div>
                  </div>

                  {/* Row 2: Date + Category */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-purple-400 text-xs mb-1">Date</p>
                      <input className={inp} type="date" value={draft.date} onChange={ev => {
                        const d = new Date(ev.target.value + 'T00:00:00Z');
                        setDraft(prev => ({ ...prev, date: ev.target.value, month: d.toLocaleString('default',{month:'long',timeZone:'UTC'}) }));
                      }} />
                    </div>
                    <div>
                      <p className="text-purple-400 text-xs mb-1">Category</p>
                      <select className={sel} value={draft.category} onChange={ev => set('category', ev.target.value)}>
                        {categories.map(c => <option key={c} value={c}>{c}</option>)}
                        {!categories.includes(draft.category) && draft.category && <option value={draft.category}>{draft.category}</option>}
                      </select>
                    </div>
                  </div>

                  {/* Row 3: Payment Type + Paid By */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-purple-400 text-xs mb-1">Payment Type</p>
                      <select className={sel} value={draft.paymentType} onChange={ev => set('paymentType', ev.target.value)}>
                        <option value="">-- Select --</option>
                        {paymentTypes.map(t => <option key={t} value={t}>{t}</option>)}
                        {draft.paymentType && !paymentTypes.includes(draft.paymentType) && <option value={draft.paymentType}>{draft.paymentType}</option>}
                      </select>
                    </div>
                    <div>
                      <p className="text-purple-400 text-xs mb-1">Paid By</p>
                      <select className={sel} value={draft.by} onChange={ev => set('by', ev.target.value)}>
                        <option value="">-- Select --</option>
                        {paidByOptions.map(o => <option key={o} value={o}>{o}</option>)}
                      </select>
                    </div>
                  </div>

                  {/* Row 4: Status + Note */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-purple-400 text-xs mb-1">Status</p>
                      <select className={sel} value={draft.status} onChange={ev => set('status', ev.target.value)}>
                        <option value="PAID">PAID</option>
                        <option value="PENDING">PENDING</option>
                        <option value="OVERDUE">OVERDUE</option>
                      </select>
                    </div>
                    <div>
                      <p className="text-purple-400 text-xs mb-1">Note</p>
                      <input className={inp} value={draft.note} onChange={ev => set('note', ev.target.value)} placeholder="Optional note" />
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="flex gap-2 pt-1">
                    {onAddExpense && (
                      <button onClick={handleAddNow}
                        className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-lg px-4 py-2.5 flex items-center justify-center gap-2 text-sm transition-all">
                        <Plus className="w-4 h-4" /> Add Expense Now
                      </button>
                    )}
                    <button onClick={handleFillForm}
                      className="flex-1 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-lg px-4 py-2.5 text-sm transition-all border border-white/20">
                      Fill Form Instead
                    </button>
                    <button onClick={reset}
                      className="px-3 py-2.5 rounded-lg border border-white/20 text-purple-400 hover:text-white text-sm transition-all">
                      Rescan
                    </button>
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ReceiptScanner;