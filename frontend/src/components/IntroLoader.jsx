import { useEffect, useRef, useState } from 'react';

const IntroLoader = ({ onDone }) => {
  const canvasRef = useRef(null);
  const [pct, setPct]     = useState(0);
  const [exiting, setExiting] = useState(false);

  /* ── Particle canvas ─────────────────────────── */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;

    const COLORS = ['249,115,22', '99,102,241', '251,191,36'];
    const particles = Array.from({ length: 100 }, () => ({
      x:  Math.random() * canvas.width,
      y:  Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.6,
      vy: (Math.random() - 0.5) * 0.6,
      r:  Math.random() * 2 + 0.5,
      a:  Math.random() * 0.5 + 0.2,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
    }));

    let rafId;
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > canvas.width)  p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${p.color},${p.a})`;
        ctx.fill();
      });
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const d  = Math.hypot(dx, dy);
          if (d < 90) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(249,115,22,${0.15 * (1 - d / 90)})`;
            ctx.lineWidth   = 0.5;
            ctx.stroke();
          }
        }
      }
      rafId = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(rafId);
  }, []);

  /* ── Progress counter ────────────────────────── */
  useEffect(() => {
    const duration = 2200;
    const start    = performance.now();

    const tick = (now) => {
      const t = Math.min((now - start) / duration, 1);
      const ease = 1 - Math.pow(1 - t, 3);
      const p = Math.round(ease * 100);
      setPct(p);
      if (p < 100) {
        requestAnimationFrame(tick);
      } else {
        setTimeout(() => {
          setExiting(true);
          setTimeout(onDone, 700);
        }, 300);
      }
    };
    requestAnimationFrame(tick);
  }, [onDone]);

  const emojis = [
    { e: '📱', s: 'top:15%;left:10%',   d: '0s'   },
    { e: '👟', s: 'top:70%;left:8%',    d: '0.5s' },
    { e: '📚', s: 'top:20%;right:12%',  d: '1s'   },
    { e: '💻', s: 'top:60%;right:10%',  d: '1.5s' },
    { e: '👗', s: 'top:40%;left:5%',    d: '0.8s' },
    { e: '🎮', s: 'bottom:20%;left:20%',d: '2s'   },
    { e: '⌚', s: 'top:10%;right:25%',  d: '1.2s' },
    { e: '🎧', s: 'bottom:15%;right:20%',d: '0.3s'},
  ];

  return (
    <div className={`fixed inset-0 z-[99999] bg-surface flex items-center justify-center overflow-hidden ${exiting ? 'loader-exit' : ''}`}>
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />

      {/* Floating emojis */}
      {emojis.map(({ e, s, d }) => (
        <div key={e} className="absolute text-3xl opacity-70 animate-float pointer-events-none"
          style={{ ...Object.fromEntries(s.split(';').filter(Boolean).map(x => {
            const [k, v] = x.trim().split(':');
            return [k.trim(), v.trim()];
          })), animationDelay: d }}
        >
          {e}
        </div>
      ))}

      {/* Corner dots */}
      {['top-6 left-6','top-6 right-6','bottom-6 left-6','bottom-6 right-6'].map(pos => (
        <div key={pos} className={`absolute ${pos} flex gap-1.5`}>
          {[0, 0.3, 0.6].map(delay => (
            <div key={delay} className="w-1.5 h-1.5 rounded-full bg-brand/40 animate-pulse-dot"
              style={{ animationDelay: `${delay}s` }} />
          ))}
        </div>
      ))}

      {/* Center content */}
      <div className="relative z-10 flex flex-col items-center gap-3 text-center px-4">
        {/* Ring */}
        <div className="relative w-32 h-32 sm:w-36 sm:h-36 mb-2">
          <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 200 200">
            <defs>
              <linearGradient id="rg" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%"   stopColor="#f97316" />
                <stop offset="50%"  stopColor="#fbbf24" />
                <stop offset="100%" stopColor="#ec4899" />
              </linearGradient>
            </defs>
            <circle cx="100" cy="100" r="88" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="4" />
            <circle cx="100" cy="100" r="88" fill="none" stroke="url(#rg)" strokeWidth="4" className="ring-progress" />
          </svg>
          <div className="absolute inset-3 rounded-full border border-brand/20
            bg-gradient-to-br from-brand/20 to-surface flex items-center justify-center">
            <span className="text-4xl sm:text-5xl" style={{ animation: 'boltPulse 1.5s ease-in-out infinite' }}>⚡</span>
          </div>
        </div>

        {/* Brand */}
        <div className="font-display font-black text-3xl sm:text-4xl tracking-tight animate-slide-up">
          <span className="gradient-text">Jaldi</span>
          <span className="text-white">Kharidoo</span>
        </div>
        <p className="text-slate-500 text-sm tracking-wide" style={{ animationDelay: '0.5s' }}>
          India's fastest shopping experience ⚡
        </p>

        {/* Progress */}
        <div className="mt-2 w-48 sm:w-64">
          <div className="h-0.5 bg-white/7 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-brand rounded-full transition-all duration-75"
              style={{ width: `${pct}%` }}
            />
          </div>
          <div className="text-brand text-xs font-bold mt-2 tracking-widest">{pct}%</div>
        </div>
      </div>

      <style>{`
        @keyframes boltPulse {
          0%,100% { transform:scale(1); filter:drop-shadow(0 0 8px rgba(249,115,22,0.4)); }
          50%      { transform:scale(1.2); filter:drop-shadow(0 0 24px rgba(249,115,22,0.9)); }
        }
      `}</style>
    </div>
  );
};

export default IntroLoader;
