// src/components/Header.jsx

import React, { useEffect, useRef } from 'react';
import { Wallet } from 'lucide-react';

// Animated canvas — subtle drifting particles for depth
const ParticleCanvas = () => {
  const ref = useRef();

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let raf;

    const resize = () => {
      canvas.width  = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const COUNT = 38;
    const dots  = Array.from({ length: COUNT }, () => ({
      x:  Math.random() * canvas.width,
      y:  Math.random() * canvas.height,
      r:  Math.random() * 1.4 + 0.4,
      vx: (Math.random() - 0.5) * 0.25,
      vy: (Math.random() - 0.5) * 0.18,
      a:  Math.random() * 0.5 + 0.15,
    }));

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      dots.forEach(d => {
        d.x += d.vx;
        d.y += d.vy;
        if (d.x < 0) d.x = canvas.width;
        if (d.x > canvas.width)  d.x = 0;
        if (d.y < 0) d.y = canvas.height;
        if (d.y > canvas.height) d.y = 0;

        ctx.beginPath();
        ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(167, 139, 250, ${d.a})`;
        ctx.fill();
      });

      // Draw faint connecting lines between close dots
      for (let i = 0; i < dots.length; i++) {
        for (let j = i + 1; j < dots.length; j++) {
          const dx   = dots[i].x - dots[j].x;
          const dy   = dots[i].y - dots[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 90) {
            ctx.beginPath();
            ctx.moveTo(dots[i].x, dots[i].y);
            ctx.lineTo(dots[j].x, dots[j].y);
            ctx.strokeStyle = `rgba(139, 92, 246, ${0.12 * (1 - dist / 90)})`;
            ctx.lineWidth = 0.6;
            ctx.stroke();
          }
        }
      }

      raf = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={ref}
      className="absolute inset-0 w-full h-full pointer-events-none"
    />
  );
};

const Header = () => (
  <div
    className="relative overflow-hidden rounded-2xl mb-6"
    style={{
      background: 'linear-gradient(135deg, #0d0a1e 0%, #130d2e 30%, #0f1729 60%, #0a0d1f 100%)',
      boxShadow: '0 0 0 1px rgba(139,92,246,0.15), 0 32px 64px -16px rgba(0,0,0,0.7), 0 0 80px -20px rgba(109,40,217,0.3)',
    }}
  >
    {/* Particle canvas */}
    <ParticleCanvas />

    {/* Ambient glows */}
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      <div className="absolute -top-20 -left-20 w-96 h-96 rounded-full"
        style={{ background: 'radial-gradient(circle, rgba(109,40,217,0.12) 0%, transparent 70%)' }} />
      <div className="absolute -bottom-16 -right-16 w-80 h-80 rounded-full"
        style={{ background: 'radial-gradient(circle, rgba(59,130,246,0.08) 0%, transparent 70%)' }} />
      {/* Top shimmer line */}
      <div className="absolute top-0 left-0 right-0 h-px"
        style={{ background: 'linear-gradient(90deg, transparent, rgba(139,92,246,0.6) 40%, rgba(167,139,250,0.9) 50%, rgba(139,92,246,0.6) 60%, transparent)' }} />
      {/* Bottom shimmer line */}
      <div className="absolute bottom-0 left-0 right-0 h-px"
        style={{ background: 'linear-gradient(90deg, transparent, rgba(139,92,246,0.3) 50%, transparent)' }} />
    </div>

    {/* Centered content */}
    <div className="relative z-10 flex flex-col items-center justify-center py-10 px-6 text-center">

      {/* Icon + wordmark */}
      <div className="flex items-center gap-4 mb-3">
        {/* Glowing icon */}
        <div className="relative">
          <div className="absolute inset-0 rounded-2xl blur-md opacity-70"
            style={{ background: 'linear-gradient(135deg, #7c3aed, #3b82f6)' }} />
          <div className="relative bg-gradient-to-br from-violet-600 to-blue-600 p-3.5 rounded-2xl shadow-xl">
            <Wallet className="w-7 h-7 text-white" strokeWidth={2} />
          </div>
        </div>

        {/* Title */}
        <h1
          className="font-black text-white leading-none"
          style={{
            fontSize: 'clamp(1.75rem, 5vw, 2.75rem)',
            fontFamily: '"Rajdhani", "Bebas Neue", "Impact", sans-serif',
            letterSpacing: '0.06em',
            textShadow: '0 0 40px rgba(139,92,246,0.6), 0 2px 4px rgba(0,0,0,0.5)',
          }}
        >
          EXPENSE TRACKER
        </h1>
      </div>

      {/* Decorated subtitle */}
      <div className="flex items-center gap-3 mb-3 w-full max-w-sm">
        <div className="h-px flex-1"
          style={{ background: 'linear-gradient(90deg, transparent, rgba(139,92,246,0.5))' }} />
        <p className="text-purple-300/70 text-xs font-semibold tracking-widest uppercase whitespace-nowrap">
          Personal Finance Dashboard
        </p>
        <div className="h-px flex-1"
          style={{ background: 'linear-gradient(90deg, rgba(139,92,246,0.5), transparent)' }} />
      </div>

      {/* Tagline */}
      <p className="text-purple-400/50 text-xs tracking-wide">
        Track your recurring and non-recurring expenses with ease
      </p>

      {/* Decorative dot bar */}
      <div className="flex items-center gap-1.5 mt-5">
        {[20, 8, 28, 8, 20].map((w, i) => (
          <div
            key={i}
            className="rounded-full"
            style={{
              width:  `${w}px`,
              height: '3px',
              background: i === 2
                ? 'linear-gradient(90deg, #7c3aed, #3b82f6)'
                : i === 1 || i === 3
                ? 'rgba(139,92,246,0.4)'
                : 'rgba(139,92,246,0.2)',
            }}
          />
        ))}
      </div>
    </div>
  </div>
);

export default Header;