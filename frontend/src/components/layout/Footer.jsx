import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  const [isVisible, setIsVisible] = useState(false);
  const footerRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      { 
        threshold: 0.05,
        rootMargin: '0px 0px 50px 0px' // Trigger slightly before it fully comes into view
      }
    );

    if (footerRef.current) {
      observer.observe(footerRef.current);
    }

    return () => {
      if (footerRef.current) {
        observer.unobserve(footerRef.current);
      }
    };
  }, []);

  const linkClass = "relative text-slate-500 hover:text-white transition-all duration-300 pb-0.5 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[1px] after:bg-brand hover:after:w-full after:transition-all after:duration-300";

  return (
    <footer 
      ref={footerRef}
      className={`relative border-t border-white/[0.06] bg-surface/80 backdrop-blur-md mt-20 overflow-hidden transition-all duration-1000 cubic-bezier(0.16, 1, 0.3, 1) ${
        isVisible 
          ? 'translate-y-0 opacity-100 scale-100 blur-0' 
          : 'translate-y-16 opacity-0 scale-[0.98] blur-sm'
      }`}
    >
      {/* Top glowing boundary line */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-[1px] bg-gradient-to-r from-transparent via-brand/40 to-transparent shadow-[0_0_20px_2px_rgba(249,115,22,0.3)]" />

      {/* Background neon wash that expands and pulses on entrance */}
      <div className={`absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-brand/5 rounded-full blur-[120px] transition-all duration-1000 delay-200 ${
        isVisible ? 'scale-110 opacity-100' : 'scale-50 opacity-0'
      }`} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative z-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          
          {/* Brand & Description */}
          <div className="sm:col-span-2 lg:col-span-1 space-y-4">
            <div className="flex items-center gap-2">
              <span className="text-2xl animate-pulse-dot">⚡</span>
              <span className="font-display font-black text-xl">
                <span className="gradient-text">Jaldi</span>
                <span className="text-white">Kharidoo</span>
              </span>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed text-left">
              India's fastest online store. Premium curated products, lightning-speed delivery,
              and unbeatable pricing — direct to your doorstep.
            </p>
            
            {/* Animated Social Badges */}
            <div className="flex gap-3 pt-2">
              {[
                { icon: '📘', link: '#' },
                { icon: '📸', link: '#' },
                { icon: '🐦', link: '#' },
                { icon: '▶️', link: '#' }
              ].map((item, i) => (
                <a 
                  key={i} 
                  href={item.link}
                  className="w-9 h-9 glass rounded-xl flex items-center justify-center text-sm hover:bg-brand/10 hover:border-brand/30 hover:scale-110 active:scale-95 transition-all duration-300 hover:shadow-glow"
                >
                  {item.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Shop Categories */}
          <div>
            <h4 className="font-display font-bold text-slate-300 uppercase tracking-widest text-xs mb-4 text-left">Shop</h4>
            <ul className="space-y-3 text-sm flex flex-col items-start">
              {['Electronics', 'Clothing', 'Books', 'Sports', 'Beauty', 'Home & Garden'].map(c => (
                <li key={c}>
                  <Link to={`/catalog?category=${c}`} className={linkClass}>
                    {c}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Customer Account */}
          <div>
            <h4 className="font-display font-bold text-slate-300 uppercase tracking-widest text-xs mb-4 text-left">Account</h4>
            <ul className="space-y-3 text-sm flex flex-col items-start">
              <li><Link to="/login" className={linkClass}>Sign In</Link></li>
              <li><Link to="/login" className={linkClass}>Register Account</Link></li>
              <li><Link to="/orders" className={linkClass}>My Orders</Link></li>
              <li><Link to="/cart" className={linkClass}>Shopping Cart</Link></li>
              <li><Link to="/checkout" className={linkClass}>Checkout</Link></li>
            </ul>
          </div>

          {/* Support & Customer Care */}
          <div className="space-y-5">
            <div>
              <h4 className="font-display font-bold text-slate-300 uppercase tracking-widest text-xs mb-4 text-left">Support</h4>
              <ul className="space-y-3 text-sm flex flex-col items-start">
                {['Help Center', 'Return Policy', 'Track Shipment', 'Contact Us'].map(l => (
                  <li key={l}>
                    <a href="#" className={linkClass}>{l}</a>
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-3.5 glass rounded-xl border border-white/5 space-y-1">
              <div className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold text-left">Customer Care</div>
              <div className="text-sm font-black text-brand tracking-wider text-left">1800-123-4567</div>
              <div className="text-[10px] text-slate-500 text-left">Mon–Sat 9:00 AM – 9:00 PM IST</div>
            </div>
          </div>

        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/[0.06] mt-12 pt-6 flex flex-col sm:flex-row
          items-center justify-between gap-4 text-xs text-slate-500">
          <span>© 2026 JaldiKharidoo. All rights reserved.</span>
          <div className="flex flex-wrap items-center gap-4 text-[10px] text-slate-400 font-medium">
            <span>🔒 Secure SSL Payments</span>
            <span>🚀 Lightning Delivery</span>
            <span>✅ 100% Authentic Catalog</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
