import { useNavigate } from 'react-router-dom';

const cats = [
  { icon: '💻', label: 'Electronics',    desc: '1200+ Products',  class: 'from-indigo-500/15 to-cyan-500/8  border-indigo-500/20',  cat: 'Electronics'    },
  { icon: '👗', label: 'Clothing',       desc: 'Top Fashion',     class: 'from-pink-500/15  to-orange-500/8 border-pink-500/20',   cat: 'Clothing'       },
  { icon: '📚', label: 'Books',          desc: 'Knowledge Hub',   class: 'from-yellow-500/15 to-green-500/8 border-yellow-500/20', cat: 'Books'          },
  { icon: '🏋️', label: 'Sports',         desc: 'Stay Active',     class: 'from-green-500/15 to-cyan-500/8   border-green-500/20',  cat: 'Sports'         },
  { icon: '💄', label: 'Beauty',         desc: 'Glow Up',         class: 'from-pink-500/18  to-purple-500/10 border-pink-500/25',  cat: 'Beauty'         },
  { icon: '🏡', label: 'Home & Garden',  desc: 'Make It Home',    class: 'from-cyan-500/15  to-green-500/8  border-cyan-500/20',   cat: 'Home & Garden'  },
  { icon: '🛍️', label: 'All Products',   desc: 'Browse Everything',class:'from-orange-500/15 to-red-500/8  border-orange-500/20', cat: null             },
  { icon: '🆕', label: 'New Arrivals',   desc: 'Just Dropped!',   class: 'from-purple-500/15 to-indigo-500/8 border-purple-500/20',cat: null            },
];

const CategoryGrid = () => {
  const navigate = useNavigate();

  const go = (cat) => {
    if (cat) navigate(`/catalog?category=${cat}`);
    else     navigate('/catalog');
  };

  return (
    <section id="categories" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="text-center mb-10">
        <span className="text-brand text-sm font-semibold tracking-widest uppercase">Categories</span>
        <h2 className="font-display font-black text-3xl sm:text-4xl text-white mt-2">
          Everything You Need
        </h2>
        <p className="text-slate-500 mt-2 max-w-lg mx-auto">
          From the latest gadgets to everyday essentials — find it all here.
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
        {cats.map(c => (
          <button
            key={c.label}
            onClick={() => go(c.cat)}
            className={`cat-card relative glass bg-gradient-to-br ${c.class}
              rounded-2xl p-5 sm:p-6 text-left overflow-hidden border cursor-pointer group`}
          >
            <div className="text-3xl sm:text-4xl mb-3 transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-3">
              {c.icon}
            </div>
            <div className="font-bold text-sm sm:text-base text-white">{c.label}</div>
            <div className="text-xs text-slate-500 mt-0.5">{c.desc}</div>
            <div className="cat-arrow absolute bottom-4 right-4 w-7 h-7 rounded-full bg-white/5
              flex items-center justify-center text-sm text-slate-400 transition-all duration-300">
              →
            </div>
          </button>
        ))}
      </div>
    </section>
  );
};

export default CategoryGrid;
