const items = [
  '⚡ Same Day Delivery','🛡️ 100% Secure','↩️ Easy Returns','⭐ Top Brands',
  '🚀 10 Min Delivery','💳 EMI Available','🎁 Gift Wrapping','📞 24/7 Support',
  '⚡ Same Day Delivery','🛡️ 100% Secure','↩️ Easy Returns','⭐ Top Brands',
  '🚀 10 Min Delivery','💳 EMI Available','🎁 Gift Wrapping','📞 24/7 Support',
];

const MarqueeStrip = () => (
  <div className="relative overflow-hidden bg-gradient-to-r from-brand/10 via-brand/5 to-brand/10
    border-y border-brand/20 py-3">
    <div className="marquee-track">
      {items.map((item, i) => (
        <span key={i} className="mx-8 text-sm font-medium text-slate-400 whitespace-nowrap flex items-center gap-2">
          {item}
          {i < items.length - 1 && <span className="text-brand/50 mx-4">✦</span>}
        </span>
      ))}
    </div>
  </div>
);

export default MarqueeStrip;
