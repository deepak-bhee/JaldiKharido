const features = [
  { icon: '⚡', title: 'Lightning Delivery',  desc: 'Same-day & next-day delivery in 500+ cities across India', color: 'from-orange-500/15 to-yellow-500/8 border-orange-500/20' },
  { icon: '↩️', title: 'Easy Returns',        desc: '30-day hassle-free return policy on all products',         color: 'from-blue-500/15   to-cyan-500/8   border-blue-500/20'  },
  { icon: '🔒', title: '100% Secure',         desc: 'Bank-grade encryption on every transaction, always',       color: 'from-green-500/15  to-teal-500/8   border-green-500/20' },
  { icon: '⭐', title: 'Premium Quality',      desc: 'Curated genuine products from India\'s top brands',       color: 'from-purple-500/15 to-pink-500/8   border-purple-500/20' },
];

const FeaturesSection = () => (
  <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {features.map(f => (
        <div key={f.title}
          className={`glass bg-gradient-to-br ${f.color} border rounded-2xl p-6 text-center
            hover:scale-105 transition-transform duration-300`}>
          <div className="text-4xl mb-3">{f.icon}</div>
          <div className="font-bold text-white mb-1">{f.title}</div>
          <div className="text-xs text-slate-500 leading-relaxed">{f.desc}</div>
        </div>
      ))}
    </div>
  </section>
);

export default FeaturesSection;
