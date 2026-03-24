// src/components/QRScanModal.jsx

import React, { useEffect, useRef, useState } from 'react';
import { X, Smartphone, Wifi, Copy, Check } from 'lucide-react';

// Minimal QR code generator — pure JS, no external dependency
// Based on the QR code spec for small alphanumeric/byte payloads
// Uses qrcode-generator via CDN loaded dynamically
const QRCode = ({ url, size = 220 }) => {
  const canvasRef = useRef();
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!url) return;

    const drawQR = (qr) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      const count = qr.getModuleCount();
      const cellSize = Math.floor(size / count);
      const actualSize = cellSize * count;
      canvas.width  = actualSize;
      canvas.height = actualSize;
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, actualSize, actualSize);
      ctx.fillStyle = '#000000';
      for (let r = 0; r < count; r++) {
        for (let c = 0; c < count; c++) {
          if (qr.isDark(r, c)) {
            ctx.fillRect(c * cellSize, r * cellSize, cellSize, cellSize);
          }
        }
      }
    };

    // Load qrcode-generator from CDN
    if (window.qrcode) {
      try {
        const qr = window.qrcode(0, 'M');
        qr.addData(url);
        qr.make();
        drawQR(qr);
      } catch (e) { setError(true); }
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/qrcode-generator/1.4.4/qrcode.min.js';
    script.onload = () => {
      try {
        const qr = window.qrcode(0, 'M');
        qr.addData(url);
        qr.make();
        drawQR(qr);
      } catch (e) { setError(true); }
    };
    script.onerror = () => setError(true);
    document.head.appendChild(script);
  }, [url, size]);

  if (error) {
    return (
      <div className="w-56 h-56 flex items-center justify-center bg-white rounded-xl text-slate-500 text-xs text-center p-4">
        QR unavailable — use the URL below
      </div>
    );
  }

  return (
    <div className="bg-white p-3 rounded-2xl shadow-lg inline-block">
      <canvas ref={canvasRef} style={{ display: 'block' }} />
    </div>
  );
};

const QRScanModal = ({ onClose }) => {
  const [url,    setUrl]    = useState('');
  const [copied, setCopied] = useState(false);
  const [lanIp,  setLanIp]  = useState('');

  useEffect(() => {
    const host = window.location.host; // e.g. localhost:5173 or 192.168.x.x:5173
    const scanUrl = window.location.protocol + '//' + host + '/scan';
    setUrl(scanUrl);

    // If on localhost, try to find the LAN IP hint
    if (host.startsWith('localhost') || host.startsWith('127.')) {
      const port = window.location.port || '5173';
      setLanIp('192.168.x.x:' + port);
    }
  }, []);

  const copy = () => {
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const isLocalhost = url.includes('localhost') || url.includes('127.0.0.1');

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}>
      <div className="bg-slate-900 border border-white/15 rounded-2xl w-full max-w-sm shadow-2xl"
        onClick={ev => ev.stopPropagation()}>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="bg-emerald-500/20 p-2 rounded-lg">
              <Smartphone className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-white font-bold text-base">Scan from Phone</h2>
              <p className="text-purple-400 text-xs">Point your camera at the QR code</p>
            </div>
          </div>
          <button onClick={onClose} className="text-purple-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">

          {/* QR Code */}
          <div className="flex justify-center">
            {url && <QRCode url={url} size={220} />}
          </div>

          {/* URL + copy */}
          <div className="bg-white/5 border border-white/10 rounded-xl px-4 py-3">
            <p className="text-purple-400 text-xs mb-1.5">Or open this on your phone</p>
            <div className="flex items-center gap-2">
              <p className="text-white text-xs font-mono break-all flex-1">{url}</p>
              <button onClick={copy}
                className="shrink-0 bg-white/10 hover:bg-white/20 rounded-lg p-1.5 transition-all">
                {copied
                  ? <Check className="w-3.5 h-3.5 text-emerald-400" />
                  : <Copy className="w-3.5 h-3.5 text-purple-400" />}
              </button>
            </div>
          </div>

          {/* Localhost warning */}
          {isLocalhost && (
            <div className="bg-orange-500/10 border border-orange-500/25 rounded-xl px-4 py-3 flex items-start gap-2">
              <Wifi className="w-4 h-4 text-orange-400 shrink-0 mt-0.5" />
              <div className="text-xs space-y-1">
                <p className="text-orange-300 font-semibold">Phone needs your Mac's IP address</p>
                <p className="text-orange-400">
                  Find it in System Settings → Wi-Fi → Details, then open:
                </p>
                <p className="text-white font-mono bg-black/30 rounded px-2 py-1 mt-1">
                  {'http://' + lanIp + '/scan'}
                </p>
                <p className="text-orange-500">Both devices must be on the same WiFi.</p>
              </div>
            </div>
          )}

          {/* Steps */}
          <div className="space-y-1.5 border-t border-white/10 pt-3">
            {[
              ['1', 'Scan QR with iPhone camera (or open URL on phone)'],
              ['2', 'Take a photo of your receipt'],
              ['3', 'Tap "Send to Desktop Tracker"'],
              ['4', 'Form auto-fills on this laptop'],
            ].map(([n, s]) => (
              <div key={n} className="flex items-start gap-2">
                <span className="text-emerald-500 font-bold text-xs shrink-0 mt-0.5">{n}.</span>
                <p className="text-purple-400 text-xs">{s}</p>
              </div>
            ))}
          </div>

        </div>
      </div>
    </div>
  );
};

export default QRScanModal;