import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';

const HeroSection = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const resize = () => { canvas.width = canvas.offsetWidth; canvas.height = canvas.offsetHeight; };
    resize();
    window.addEventListener('resize', resize);

    const pts = Array.from({ length: 60 }, () => ({
      x: Math.random() * canvas.width, y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.4, vy: (Math.random() - 0.5) * 0.4,
      r: Math.random() * 1.5 + 0.5, a: Math.random() * 0.4 + 0.1,
    }));

    let id;
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      pts.forEach(p => {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > canvas.width)  p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(249,115,22,${p.a})`; ctx.fill();
      });
      for (let i = 0; i < pts.length; i++)
        for (let j = i + 1; j < pts.length; j++) {
          const d = Math.hypot(pts[i].x - pts[j].x, pts[i].y - pts[j].y);
          if (d < 100) {
            ctx.beginPath(); ctx.moveTo(pts[i].x, pts[i].y); ctx.lineTo(pts[j].x, pts[j].y);
            ctx.strokeStyle = `rgba(249,115,22,${0.12 * (1 - d / 100)})`;
            ctx.lineWidth = 0.6; ctx.stroke();
          }
        }
      id = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(id); window.removeEventListener('resize', resize); };
  }, []);

  return (
    <section className="relative min-h-[calc(100vh-4rem)] flex items-center overflow-hidden bg-gradient-hero">
      {/* Canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full opacity-60" />

      {/* Grid overlay */}
      <div className="absolute inset-0 hero-grid opacity-40" />

      {/* Orbs */}
      <div className="orb w-96 h-96 bg-brand/20 top-1/4 -left-24 opacity-50" />
      <div className="orb w-80 h-80 bg-accent/20 bottom-1/4 -right-20 opacity-40" style={{ animationDelay: '3s' }} />
      <div className="orb w-64 h-64 bg-gold/10 top-1/2 left-1/2 opacity-30" style={{ animationDelay: '5s' }} />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left */}
          <div className="flex flex-col gap-6 text-center lg:text-left animate-slide-up">
            <div className="inline-flex items-center gap-2 px-4 py-2 glass rounded-full
              border border-brand/20 text-sm font-medium text-slate-300 mx-auto lg:mx-0 w-fit">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              ⚡ India's Fastest Growing Store
            </div>

            <h1 className="font-display font-black leading-tight">
              <span className="block text-5xl sm:text-6xl lg:text-7xl text-white">Jaldi</span>
              <span className="block text-5xl sm:text-6xl lg:text-7xl gradient-text">Kharidoo</span>
              <span className="block text-2xl sm:text-3xl lg:text-4xl text-slate-300 mt-2">
                Delivery Bhi Jaldi 🚀
              </span>
            </h1>

            <p className="text-slate-400 text-base sm:text-lg max-w-md mx-auto lg:mx-0 leading-relaxed">
              Premium products at unbeatable prices. Electronics, fashion, books —
              everything delivered to your doorstep at lightning speed.
            </p>

            {/* Trust pills */}
            <div className="flex flex-wrap gap-2 justify-center lg:justify-start">
              {['⚡ Same-day Delivery','🔒 Secure Payment','↩️ Easy Returns','⭐ 4.9 Rating'].map(t => (
                <span key={t}
                  className="px-3 py-1 glass border border-white/10 text-xs text-slate-400 rounded-full">
                  {t}
                </span>
              ))}
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
              <a href="#catalog"
                className="px-8 py-3 bg-gradient-btn text-white font-bold rounded-xl
                  hover:shadow-glow-lg transition-all flex items-center justify-center gap-2 group">
                <span>Abhi Kharido</span>
                <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none"
                  stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </a>
              <a href="#categories"
                className="px-8 py-3 glass border border-white/15 text-white font-medium
                  rounded-xl hover:border-brand/40 hover:bg-brand/5 transition-all text-center">
                Explore Categories
              </a>
            </div>
          </div>

          {/* Right — Showcase cards */}
          <div className="hidden lg:flex justify-center items-center">
            <div className="relative w-80 h-[420px]">
              {/* Main card */}
              <div className="absolute left-0 top-0 w-64 glass border border-white/10 rounded-2xl
                overflow-hidden shadow-glow animate-float">
                <div className="h-40 overflow-hidden">
                  <img
                    src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=240&fit=crop"
                    alt="Headphones"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-4">
                  <div className="text-xs text-brand font-semibold mb-1">Electronics</div>
                  <div className="font-bold text-white text-sm">Sony WH-1000XM5</div>
                  <div className="text-slate-400 text-xs">Noise Cancelling Headphones</div>
                  <div className="flex items-center justify-between mt-3">
                    <span className="text-brand font-bold">₹24,990</span>
                    <span className="text-xs text-green-400 font-semibold">In Stock</span>
                  </div>
                </div>
              </div>
              {/* Mini cards */}
              <div className="absolute right-0 top-16 glass border border-white/10 rounded-xl
                p-3 flex items-center gap-3 w-44 animate-float" style={{ animationDelay: '0.5s' }}>
                <img src="https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=60&h=60&fit=crop"
                  className="w-10 h-10 rounded-lg object-cover" alt="shoe" />
                <div>
                  <div className="text-xs text-slate-500">Clothing</div>
                  <div className="text-xs font-bold text-white">From ₹499</div>
                </div>
              </div>
              <div className="absolute right-0 bottom-16 glass border border-white/10 rounded-xl
                p-3 flex items-center gap-3 w-44 animate-float" style={{ animationDelay: '1s' }}>
                <img src="https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=60&h=60&fit=crop"
                  className="w-10 h-10 rounded-lg object-cover" alt="book" />
                <div>
                  <div className="text-xs text-slate-500">Books</div>
                  <div className="text-xs font-bold text-white">From ₹149</div>
                </div>
              </div>
              {/* Stats badge */}
              <div className="absolute left-4 bottom-4 glass border border-green-500/20 rounded-xl p-3">
                <div className="text-xs text-slate-500 mb-0.5">Happy Customers</div>
                <div className="text-lg font-black gradient-text">50K+</div>
                <div className="flex gap-0.5 mt-0.5">{'⭐⭐⭐⭐⭐'.split('').map((s,i)=><span key={i} className="text-xs">{s}</span>)}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-slate-600">
        <div className="w-5 h-8 border border-slate-700 rounded-full flex justify-center pt-1.5">
          <div className="w-1 h-2 bg-brand rounded-full scroll-dot" />
        </div>
        <span className="text-xs">Scroll to explore</span>
      </div>
    </section>
  );
};

export default HeroSection;
