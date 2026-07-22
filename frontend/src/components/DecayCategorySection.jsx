import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CurvedInput from './CurvedInput';
import DecayCard from './DecayCard';

const CATEGORY_CARDS = [
  {
    label: 'Electronics',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&h=750&fit=crop',
    seed: 4,
    baseFrequency: 0.015,
    maxDisplacement: 350
  },
  {
    label: 'Clothing',
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&h=750&fit=crop',
    seed: 9,
    baseFrequency: 0.018,
    maxDisplacement: 280
  },
  {
    label: 'Books',
    image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&h=750&fit=crop',
    seed: 16,
    baseFrequency: 0.012,
    maxDisplacement: 300
  },
  {
    label: 'Home & Garden',
    image: 'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=600&h=750&fit=crop',
    seed: 22,
    baseFrequency: 0.02,
    maxDisplacement: 260
  }
];

const DecayCategorySection = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (val) => {
    if (!val || !val.includes('@')) return;
    setEmail(val);
    setSubscribed(true);
    setTimeout(() => setSubscribed(false), 3000);
  };

  return (
    <>
      {/* === Decay Category Showcase === */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-10">
          <span className="text-brand text-sm font-semibold tracking-widest uppercase">Explore</span>
          <h2 className="font-display font-black text-3xl sm:text-4xl text-white mt-2">
            Shop by Category
          </h2>
          <p className="text-slate-500 mt-2 text-sm">Move your cursor over the cards to experience the effect</p>
        </div>

        <div className="flex flex-wrap justify-center gap-6">
          {CATEGORY_CARDS.map((cat) => (
            <button
              key={cat.label}
              onClick={() => navigate(`/catalog?category=${encodeURIComponent(cat.label)}`)}
              className="group focus:outline-none"
              aria-label={`Shop ${cat.label}`}
            >
              <DecayCard
                width={220}
                height={300}
                image={cat.image}
                baseFrequency={cat.baseFrequency}
                numOctaves={5}
                seed={cat.seed}
                maxDisplacement={cat.maxDisplacement}
                movementBound={40}
              >
                <span style={{
                  fontSize: '1rem',
                  fontWeight: 900,
                  color: 'white',
                  textShadow: '0 2px 16px rgba(0,0,0,0.95)',
                  background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)',
                  padding: '2px 4px',
                  borderRadius: '4px'
                }}>
                  {cat.label}
                </span>
              </DecayCard>
            </button>
          ))}
        </div>
      </section>

      {/* === CurvedInput Newsletter / Search CTA === */}
      <section className="relative overflow-hidden py-20">
        {/* Background decoration */}
        <div className="absolute inset-0 bg-gradient-to-br from-brand/5 via-transparent to-accent/5" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-brand/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="text-brand text-sm font-semibold tracking-widest uppercase">Stay Updated</span>
          <h2 className="font-display font-black text-3xl sm:text-4xl text-white mt-3 mb-3">
            Get Exclusive Deals 🎁
          </h2>
          <p className="text-slate-400 text-base mb-8 max-w-lg mx-auto">
            Subscribe to our newsletter and be the first to know about flash sales, new arrivals, and special discounts.
          </p>

          <div className="flex justify-center">
            {subscribed ? (
              <div className="flex items-center gap-3 px-6 py-4 bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 rounded-2xl text-sm font-semibold animate-fade">
                <span className="text-xl">✅</span>
                <span>You're subscribed! Deals coming your way. 🎉</span>
              </div>
            ) : (
              <CurvedInput
                placeholder="your@email.com"
                buttonText="Subscribe"
                theme="dark"
                bend={22}
                height={64}
                width={480}
                type="email"
                backgroundColor="#111827"
                borderColor="#392e4e"
                buttonColor="#f97316"
                buttonTextColor="#ffffff"
                shadowSize="lg"
                shadowColor="#f97316"
                onSubmit={handleSubscribe}
              />
            )}
          </div>

          <p className="text-slate-600 text-xs mt-4">No spam. Unsubscribe at any time.</p>
        </div>
      </section>
    </>
  );
};

export default DecayCategorySection;
