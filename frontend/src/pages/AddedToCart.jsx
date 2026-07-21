import { useState, useEffect } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { formatPrice, apiFetch } from '../api';
import ProductCard from '../components/ProductCard';

const AddedToCart = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { items, cartTotal } = useCart();
  
  const product = location.state?.product;
  const quantity = location.state?.quantity || 1;

  const [recommendations, setRecommendations] = useState([]);

  useEffect(() => {
    window.scrollTo(0, 0);
    const fetchRecommendations = async () => {
      try {
        const cat = product?.category || '';
        const data = await apiFetch(`/products?category=${encodeURIComponent(cat)}&limit=4`);
        setRecommendations(data.products.filter(p => p._id !== product?._id).slice(0, 4));
      } catch (err) {
        console.error('Failed to load recommendations:', err);
      }
    };
    fetchRecommendations();
  }, [product]);

  if (!product) {
    return (
      <div className="min-h-[70vh] bg-surface flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 rounded-full bg-brand/20 text-brand flex items-center justify-center text-3xl mb-4">
          🛒
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">No Item Selected</h2>
        <p className="text-slate-400 mb-6 max-w-md">Looks like you haven't recently added a product to your cart.</p>
        <Link to="/catalog" className="px-6 py-3 bg-gradient-btn text-white font-semibold rounded-xl hover:shadow-glow transition-all">
          Explore Products
        </Link>
      </div>
    );
  }

  const totalCartCount = items.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <div className="min-h-screen bg-surface py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Added Confirmation Card */}
        <div className="glass border-2 border-emerald-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden animate-celebration-glow">
          {/* Top subtle glow & floating confetti */}
          <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute top-2 left-6 text-xl animate-confetti-1">🎉</div>
          <div className="absolute top-4 right-8 text-xl animate-confetti-2">✨</div>
          <div className="absolute bottom-2 left-10 text-xl animate-confetti-3">🛍️</div>

          <div className="flex items-center gap-3.5 mb-6 pb-4 border-b border-white/10 relative z-10">
            <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center text-2xl font-bold shadow-lg animate-festive-bounce">
              ✓
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-white leading-tight flex items-center gap-2">
                <span>Added to Cart!</span>
                <span className="text-base">🛍️✨</span>
              </h1>
              <p className="text-xs text-slate-300">Great choice! Item is safely saved in your cart</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
            {/* Product Thumbnail & Details */}
            <div className="md:col-span-7 flex gap-4 items-center">
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-surface-secondary overflow-hidden border border-white/10 flex-shrink-0">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="space-y-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-brand">{product.category}</span>
                <h3 className="font-semibold text-white text-base sm:text-lg line-clamp-2 leading-snug">{product.name}</h3>
                <div className="flex items-center gap-3 pt-1">
                  <span className="text-brand font-black text-lg">{formatPrice(product.price)}</span>
                  <span className="text-xs text-slate-400 bg-white/5 px-2.5 py-1 rounded-md border border-white/10">
                    Qty: <strong className="text-white">{quantity}</strong>
                  </span>
                </div>
              </div>
            </div>

            {/* Cart Summary & Action CTAs */}
            <div className="md:col-span-5 bg-white/[0.03] border border-white/10 rounded-2xl p-4 flex flex-col justify-between gap-4">
              <div className="space-y-1.5 text-sm">
                <div className="flex justify-between text-slate-400">
                  <span>Cart Items:</span>
                  <span className="font-semibold text-white">{totalCartCount} items</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Cart Subtotal:</span>
                  <span className="font-bold text-brand text-base">{formatPrice(cartTotal)}</span>
                </div>
              </div>

              <div className="flex flex-col gap-2 pt-2 border-t border-white/[0.08]">
                <Link
                  to="/checkout"
                  className="w-full py-3 text-center text-sm font-bold bg-gradient-btn text-white rounded-xl hover:shadow-glow transition-all"
                >
                  ⚡ Proceed to Checkout ({formatPrice(cartTotal)})
                </Link>
                <div className="grid grid-cols-2 gap-2">
                  <Link
                    to="/cart"
                    className="py-2.5 text-center text-xs font-semibold bg-white/10 hover:bg-white/15 text-white border border-white/10 rounded-xl transition-all"
                  >
                    🛒 View Cart
                  </Link>
                  <button
                    onClick={() => navigate(-1)}
                    className="py-2.5 text-center text-xs font-semibold bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 rounded-xl transition-all"
                  >
                    🛍️ Keep Shopping
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recommended Products */}
        {recommendations.length > 0 && (
          <div className="space-y-4 pt-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">Recommended For You</h2>
              <Link to="/catalog" className="text-xs text-brand hover:underline font-semibold">View All →</Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {recommendations.map(p => (
                <ProductCard key={p._id} product={p} />
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default AddedToCart;
