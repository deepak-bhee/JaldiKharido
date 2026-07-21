import { useNavigate } from 'react-router-dom';
import { formatPrice } from '../../api';

const AddToCartModal = ({ item, cartSubtotal, cartCount, onClose }) => {
  const navigate = useNavigate();

  if (!item || !item.product) return null;

  const product = item.product;
  const quantity = item.quantity || 1;

  const handleCheckout = () => {
    onClose();
    navigate('/checkout');
  };

  const handleViewCart = () => {
    onClose();
    navigate('/cart');
  };

  return (
    <div className="fixed inset-0 z-[1200] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fade">
      {/* Modal Container */}
      <div className="glass border-2 border-emerald-500/40 rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl relative overflow-hidden animate-celebration-glow">
        
        {/* Decorative Confetti & Glow */}
        <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-80 h-80 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-3 left-6 text-xl animate-confetti-1">🎉</div>
        <div className="absolute top-4 right-8 text-xl animate-confetti-2">✨</div>
        <div className="absolute bottom-4 left-8 text-xl animate-confetti-3">🛍️</div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-full p-2 transition-all"
          aria-label="Close modal"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Header */}
        <div className="flex items-center gap-3.5 mb-5 pb-4 border-b border-white/10 relative z-10">
          <div className="w-11 h-11 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center text-2xl font-bold shadow-md animate-festive-bounce">
            ✓
          </div>
          <div>
            <h3 className="text-xl font-black text-white leading-tight flex items-center gap-2">
              <span>Added to Cart!</span>
              <span className="text-base">🛍️</span>
            </h3>
            <p className="text-xs text-slate-300">Item is safely waiting in your shopping bag</p>
          </div>
        </div>

        {/* Item Info */}
        <div className="flex gap-4 items-center bg-white/[0.03] border border-white/10 rounded-2xl p-3.5 mb-5">
          <div className="w-20 h-20 rounded-xl bg-surface-secondary overflow-hidden border border-white/10 flex-shrink-0">
            <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
          </div>
          <div className="flex-1 min-w-0">
            <span className="text-[10px] font-bold text-brand uppercase tracking-wider">{product.category}</span>
            <h4 className="font-semibold text-white text-sm line-clamp-1">{product.name}</h4>
            <div className="flex items-center gap-2.5 mt-1.5">
              <span className="text-brand font-black text-base">{formatPrice(product.price)}</span>
              <span className="text-xs text-slate-400 bg-white/5 px-2 py-0.5 rounded border border-white/10">
                Qty: <strong className="text-white">{quantity}</strong>
              </span>
            </div>
          </div>
        </div>

        {/* Cart Subtotal Summary */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-4 mb-6 space-y-1.5 text-xs">
          <div className="flex justify-between text-slate-300">
            <span>Cart Items:</span>
            <span className="font-semibold text-white">{cartCount} items</span>
          </div>
          <div className="flex justify-between text-slate-300">
            <span>Cart Subtotal:</span>
            <span className="font-bold text-brand text-sm">{formatPrice(cartSubtotal)}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2.5">
          <button
            onClick={handleCheckout}
            className="w-full py-3 text-center text-sm font-bold bg-gradient-btn text-white rounded-xl hover:shadow-glow transition-all"
          >
            ⚡ Checkout Now ({formatPrice(cartSubtotal)})
          </button>
          
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={handleViewCart}
              className="py-2.5 text-center text-xs font-semibold bg-white/10 hover:bg-white/15 text-white border border-white/10 rounded-xl transition-all"
            >
              🛒 View Cart
            </button>
            <button
              onClick={onClose}
              className="py-2.5 text-center text-xs font-semibold bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 rounded-xl transition-all"
            >
              🛍️ Keep Shopping
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AddToCartModal;
