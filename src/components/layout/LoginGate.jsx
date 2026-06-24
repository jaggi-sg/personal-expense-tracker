// src/components/LoginGate.jsx
// Simple local PIN/passphrase lock — gates the entire app
// PIN is stored as a SHA-256 hash in localStorage (never plain text)
// Session persists for 8 hours then requires re-entry

import React, { useState, useEffect, useRef } from 'react';
import { Lock, Eye, EyeOff, Wallet, ShieldCheck, AlertCircle } from 'lucide-react';

const SESSION_KEY  = 'app_session_expires';
const PIN_HASH_KEY = 'app_pin_hash';
const SESSION_HOURS = 8;

// Default PIN hash — SHA-256 of '1234' — user should change on first login
const DEFAULT_PIN = '1234';

async function sha256(str) {
  const buf  = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(str));
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
}

function isSessionValid() {
  try {
    const exp = localStorage.getItem(SESSION_KEY);
    return exp && Date.now() < parseInt(exp);
  } catch { return false; }
}

function startSession() {
  try {
    localStorage.setItem(SESSION_KEY, String(Date.now() + SESSION_HOURS * 60 * 60 * 1000));
  } catch {}
}

function clearSession() {
  try { localStorage.removeItem(SESSION_KEY); } catch {}
}

// ── Change PIN modal ──────────────────────────────────────────────────────────
const ChangePinModal = ({ onClose, onChanged }) => {
  const [current,  setCurrent]  = useState('');
  const [next,     setNext]     = useState('');
  const [confirm,  setConfirm]  = useState('');
  const [error,    setError]    = useState('');
  const [show,     setShow]     = useState(false);
  const [saving,   setSaving]   = useState(false);

  const handleSave = async () => {
    if (next.length < 4)         { setError('PIN must be at least 4 characters'); return; }
    if (next !== confirm)        { setError('New PINs do not match'); return; }
    setSaving(true);
    try {
      const stored  = localStorage.getItem(PIN_HASH_KEY);
      const curHash = await sha256(current);
      const defHash = await sha256(DEFAULT_PIN);
      // Allow change if current matches stored hash, OR if no PIN set yet (first time)
      if (stored && curHash !== stored && stored !== defHash) {
        setError('Current PIN is incorrect'); setSaving(false); return;
      }
      const newHash = await sha256(next);
      localStorage.setItem(PIN_HASH_KEY, newHash);
      onChanged();
      onClose();
    } catch { setError('Error saving PIN'); }
    setSaving(false);
  };

  const inp = 'w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white text-base focus:outline-none focus:border-violet-400 placeholder-white/30';

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-white/15 rounded-2xl w-full max-w-sm shadow-2xl p-6 space-y-4">
        <h3 className="text-white font-bold text-lg">Change PIN</h3>

        {error && (
          <div className="bg-red-500/10 border border-red-500/25 rounded-xl px-4 py-2.5 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <p className="text-red-300 text-sm">{error}</p>
          </div>
        )}

        <div className="relative">
          <input className={inp} placeholder="Current PIN"
            type={show ? 'text' : 'password'} value={current}
            onChange={e => { setCurrent(e.target.value); setError(''); }} />
        </div>
        <input className={inp} placeholder="New PIN (min 4 characters)"
          type={show ? 'text' : 'password'} value={next}
          onChange={e => { setNext(e.target.value); setError(''); }} />
        <input className={inp} placeholder="Confirm new PIN"
          type={show ? 'text' : 'password'} value={confirm}
          onChange={e => { setConfirm(e.target.value); setError(''); }} />

        <button onClick={() => setShow(s => !s)}
          className="flex items-center gap-1.5 text-purple-400 text-xs hover:text-purple-200 transition-colors">
          {show ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
          {show ? 'Hide' : 'Show'} PIN
        </button>

        <div className="flex gap-3 pt-1">
          <button onClick={onClose}
            className="flex-1 border border-white/20 text-purple-300 rounded-xl py-2.5 text-sm hover:text-white transition-colors">
            Cancel
          </button>
          <button onClick={handleSave} disabled={saving}
            className="flex-1 bg-violet-600 hover:bg-violet-500 text-white font-semibold rounded-xl py-2.5 text-sm transition-all disabled:opacity-50">
            {saving ? 'Saving...' : 'Save PIN'}
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Main login gate ───────────────────────────────────────────────────────────
const LoginGate = ({ children }) => {
  const [unlocked,    setUnlocked]    = useState(false);
  const [pin,         setPin]         = useState('');
  const [showPin,     setShowPin]     = useState(false);
  const [error,       setError]       = useState('');
  const [loading,     setLoading]     = useState(false);
  const [showChange,  setShowChange]  = useState(false);
  const [firstTime,   setFirstTime]   = useState(false);
  const [pinChanged,  setPinChanged]  = useState(false);
  const inputRef = useRef();

  useEffect(() => {
    if (isSessionValid()) { setUnlocked(true); return; }
    // Check if PIN has been set before
    const stored = localStorage.getItem(PIN_HASH_KEY);
    if (!stored) setFirstTime(true);
    setTimeout(() => inputRef.current?.focus(), 100);
  }, []);

  const handleUnlock = async () => {
    if (!pin.trim()) return;
    setLoading(true); setError('');
    try {
      const entered = await sha256(pin);
      const stored  = localStorage.getItem(PIN_HASH_KEY);

      if (!stored) {
        // First time — hash default PIN and compare
        const defHash = await sha256(DEFAULT_PIN);
        if (entered !== defHash) {
          setError('Incorrect PIN. Default is 1234'); setLoading(false); return;
        }
      } else if (entered !== stored) {
        setError('Incorrect PIN'); setLoading(false);
        setPin(''); inputRef.current?.focus(); return;
      }

      // If first time, store the default hash
      if (!stored) localStorage.setItem(PIN_HASH_KEY, await sha256(DEFAULT_PIN));

      startSession();
      setUnlocked(true);
    } catch { setError('Something went wrong. Try again.'); }
    setLoading(false);
  };

  const handleLock = () => { clearSession(); setUnlocked(false); setPin(''); setError(''); };

  if (unlocked) {
    return (
      <>
        {children}

        {/* Lock button — fixed bottom right */}
        <div className="fixed bottom-4 right-4 z-40 flex flex-col items-end gap-2">
          {showChange && (
            <ChangePinModal
              onClose={() => setShowChange(false)}
              onChanged={() => setPinChanged(true)}
            />
          )}
          <div className="flex gap-2">
            <button onClick={() => setShowChange(true)}
              className="bg-slate-800/90 backdrop-blur border border-white/15 text-purple-400 hover:text-white rounded-full px-3 py-2 text-xs flex items-center gap-1.5 transition-all shadow-lg">
              <ShieldCheck className="w-3.5 h-3.5" /> Change PIN
            </button>
            <button onClick={handleLock}
              className="bg-slate-800/90 backdrop-blur border border-white/15 text-purple-400 hover:text-white rounded-full px-3 py-2 text-xs flex items-center gap-1.5 transition-all shadow-lg">
              <Lock className="w-3.5 h-3.5" /> Lock
            </button>
          </div>
          {pinChanged && (
            <p className="text-emerald-400 text-xs bg-slate-900/90 px-3 py-1.5 rounded-full border border-emerald-500/30">
              PIN updated successfully
            </p>
          )}
        </div>
      </>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4"
      style={{ background: 'linear-gradient(135deg, #0d0a1e 0%, #130d2e 40%, #0f1729 70%, #0a0d1f 100%)' }}
    >      <div className="w-full max-w-sm space-y-6">

        {/* Logo */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-violet-600/20 border border-violet-500/30 mx-auto">
            <Wallet className="w-8 h-8 text-violet-400" />
          </div>
          <div>
            <h1 className="text-white font-bold text-2xl">Expense Tracker</h1>
            <p className="text-purple-400 text-sm mt-1">Enter your PIN to continue</p>
          </div>
        </div>

        {/* Card */}
        <div className="bg-white/8 backdrop-blur-lg border border-white/15 rounded-2xl p-6 space-y-4 shadow-2xl">

          {firstTime && !pinChanged && (
            <div className="bg-amber-500/10 border border-amber-500/25 rounded-xl px-4 py-3 flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-amber-300 text-sm font-semibold">First time setup</p>
                <p className="text-amber-400 text-xs mt-0.5">Default PIN is <strong>1234</strong>. Please change it after logging in.</p>
              </div>
            </div>
          )}

          {error && (
            <div className="bg-red-500/10 border border-red-500/25 rounded-xl px-4 py-2.5 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <p className="text-red-300 text-sm">{error}</p>
            </div>
          )}

          <div className="relative">
            <Lock className="w-4 h-4 text-purple-500 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              ref={inputRef}
              type={showPin ? 'text' : 'password'}
              value={pin}
              onChange={e => { setPin(e.target.value); setError(''); }}
              onKeyDown={e => e.key === 'Enter' && handleUnlock()}
              placeholder="Enter PIN"
              className="w-full bg-white/10 border border-white/20 rounded-xl pl-11 pr-11 py-3.5 text-white text-lg tracking-widest focus:outline-none focus:border-violet-400 placeholder-white/20 placeholder:tracking-normal placeholder:text-sm"
            />
            <button onClick={() => setShowPin(s => !s)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-purple-500 hover:text-purple-300 transition-colors">
              {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          <button
            onClick={handleUnlock}
            disabled={loading || !pin.trim()}
            className="w-full bg-violet-600 hover:bg-violet-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold rounded-xl py-3.5 text-base transition-all shadow-lg shadow-violet-500/25 flex items-center justify-center gap-2"
          >
            {loading
              ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Verifying...</>
              : <><Lock className="w-4 h-4" /> Unlock</>}
          </button>
        </div>

        {/* Session info */}
        <p className="text-center text-purple-600 text-xs">
          Session stays unlocked for {SESSION_HOURS} hours
        </p>

      </div>
    </div>
  );
};

export default LoginGate;