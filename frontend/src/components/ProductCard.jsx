import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { formatPrice } from '../api';
import { useNavigate, Link } from 'react-router-dom';

const ProductCard = ({ product: p }) => {
  const { addToCart } = useCart();
  const { isLoggedIn } = useAuth();
  const { showToast }  = useToast();
  const navigate = useNavigate();

  const disc = p.originalPrice && p.originalPrice > p.price
    ? Math.round((1 - p.price / p.originalPrice) * 100) : 0;

  const starsEl = (rating = 0) => {
    const full = Math.floor(rating);
    const arr  = Array.from({ length: 5 }, (_, i) => i < full ? '★' : '☆');
    return arr.map((s, i) => (
      <span key={i} className={i < full ? 'text-gold' : 'text-slate-700'}>{s}</span>
    ));
  };

  const handleAdd = () => {
    if (!isLoggedIn()) {
      showToast('Please sign in to add items to cart', 'warning');
      setTimeout(() => navigate('/login'), 900);
      return;
    }
    addToCart(p);
    showToast(`${p.name.substring(0, 28)}… added! 🛒`, 'success');
  };

  return (
    <div className="product-card glass border border-white/[0.07] rounded-2xl overflow-hidden flex flex-col group">
      {/* Image */}
      <Link to={`/product/${p._id}`} className="relative overflow-hidden aspect-square bg-surface-secondary block">
        <img
          src={p.image}
          alt={p.name}
          className="product-img w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
          onError={(e) => { e.target.src = 'https://via.placeholder.com/400x400/080d1a/f97316?text=⚡'; }}
        />
        {/* Badges */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5">
          {disc > 0 && (
            <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
              -{disc}%
            </span>
          )}
          {p.featured && (
            <span className="bg-brand text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
              ⭐ Featured
            </span>
          )}
        </div>
        {p.stock === 0 && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
            <span className="text-white text-sm font-semibold">Out of Stock</span>
          </div>
        )}
      </Link>

      {/* Body */}
      <div className="p-4 flex flex-col flex-1">
        <div className="text-xs text-brand font-semibold mb-1">{p.category}</div>
        <Link to={`/product/${p._id}`} className="hover:text-brand transition-colors flex-1 flex flex-col">
          <div className="font-semibold text-white text-sm leading-snug mb-2 line-clamp-2 flex-1">{p.name}</div>
        </Link>
        <div className="flex items-center gap-1 text-xs mb-3">
          {starsEl(p.rating)}
          <span className="text-slate-600 ml-1">({p.numReviews?.toLocaleString()})</span>
        </div>
        <div className="flex items-center gap-2 mb-3">
          <span className="text-brand font-black text-lg">{formatPrice(p.price)}</span>
          {p.originalPrice && (
            <span className="text-slate-600 line-through text-xs">{formatPrice(p.originalPrice)}</span>
          )}
          {disc > 0 && (
            <span className="text-green-400 text-xs font-semibold">{disc}% off</span>
          )}
        </div>
        <button
          onClick={handleAdd}
          disabled={p.stock === 0}
          className="w-full py-2 text-sm font-semibold rounded-xl transition-all
          bg-gradient-btn text-white hover:shadow-glow disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {p.stock === 0 ? 'Out of Stock' : '🛒 Add to Cart'}
        </button>
      </div>
    </div>
  );
};

export default ProductCard;
