import { useNavigate } from 'react-router-dom';
import { formatPrice } from '../../api';

const AddToCartModal = ({ item, cartSubtotal = 0, cartCount = 0, onClose }) => {
  const navigate = useNavigate();

  if (!item || !item.product) return null;

  const product = item.product;
  const quantity = item.quantity || 1;
  const price = product.price || 0;
  const name = product.name || 'Product';
  const category = product.category || 'General';
  const image = product.image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&h=600&fit=crop';

  const handleCheckout = () => {
    if (onClose) onClose();
    navigate('/checkout');
  };

  const handleViewCart = () => {
    if (onClose) onClose();
    navigate('/cart');
  };

  return (
    <div className="fixed inset-0 z-[1300] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade">
      {/* Modal Card Container */}
      <div className="bg-surface-secondary border border-white/10 rounded-3xl max-w-md w-full p-5 sm:p-6 shadow-2xl relative overflow-hidden transition-all duration-300">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-full p-2 transition-all"
          aria-label="Close modal"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Clean Header */}
        <div className="flex items-center gap-3 mb-4 pb-3 border-b border-white/10">
          <div className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center text-xl font-bold">
            ✓
          </div>
          <div>
            <h3 className="text-lg font-bold text-white leading-tight">Added to Cart</h3>
            <p className="text-xs text-slate-400">Item saved in your shopping bag</p>
          </div>
        </div>

        {/* Item Info */}
        <div className="flex gap-3.5 items-center bg-white/[0.03] border border-white/10 rounded-2xl p-3 mb-4">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl bg-surface overflow-hidden border border-white/10 flex-shrink-0">
            <img
              src={image}
              alt={name}
              className="w-full h-full object-cover"
              onError={(e) => { e.target.onerror = null; e.target.src = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&h=600&fit=crop'; }}
            />
          </div>
          <div className="flex-1 min-w-0">
            <span className="text-[10px] font-bold text-brand uppercase tracking-wider">{category}</span>
            <h4 className="font-semibold text-white text-xs sm:text-sm line-clamp-1">{name}</h4>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-brand font-black text-sm">{formatPrice(price)}</span>
              <span className="text-[11px] text-slate-400 bg-white/5 px-2 py-0.5 rounded border border-white/10">
                Qty: <strong className="text-white">{quantity}</strong>
              </span>
            </div>
          </div>
        </div>

        {/* Cart Subtotal Summary */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-3 mb-5 space-y-1 text-xs">
          <div className="flex justify-between text-slate-300">
            <span>Cart Items:</span>
            <span className="font-semibold text-white">{cartCount} items</span>
          </div>
          <div className="flex justify-between text-slate-300">
            <span>Subtotal:</span>
            <span className="font-bold text-brand text-sm">{formatPrice(cartSubtotal)}</span>
          </div>
        </div>

        {/* Action CTAs */}
        <div className="space-y-2">
          <button
            onClick={handleCheckout}
            className="w-full py-2.5 text-center text-xs sm:text-sm font-bold bg-gradient-btn text-white rounded-xl hover:shadow-glow transition-all"
          >
            ⚡ Checkout Now ({formatPrice(cartSubtotal)})
          </button>
          
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={handleViewCart}
              className="py-2 text-center text-xs font-semibold bg-white/10 hover:bg-white/15 text-white border border-white/10 rounded-xl transition-all"
            >
              🛒 View Cart
            </button>
            <button
              onClick={onClose}
              className="py-2 text-center text-xs font-semibold bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 rounded-xl transition-all"
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
