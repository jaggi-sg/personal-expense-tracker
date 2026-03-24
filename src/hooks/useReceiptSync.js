// src/hooks/useReceiptSync.js
import { useEffect, useRef } from 'react';

const RELAY_URL = 'http://localhost:5176/poll';
const POLL_INTERVAL = 2500;

export function useReceiptSync(onReceived) {
  const callbackRef = useRef(onReceived);
  callbackRef.current = onReceived;

  useEffect(() => {
    let active = true;

    const poll = async () => {
      try {
        const res = await fetch(RELAY_URL);
        if (!res.ok) { console.warn('[receiptSync] poll not ok:', res.status); return; }
        const data = await res.json();
        console.log('[receiptSync] poll response:', data);
        if (data.result && active) {
          console.log('[receiptSync] calling onReceived with:', data.result);
          callbackRef.current(data.result);
        }
      } catch (err) {
        // Relay not running — silently ignore
      }
    };

    console.log('[receiptSync] starting poll every', POLL_INTERVAL, 'ms');
    poll();
    const timer = setInterval(poll, POLL_INTERVAL);
    return () => { active = false; clearInterval(timer); };
  }, []);
}