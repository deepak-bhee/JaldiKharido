import { useNavigate } from 'react-router-dom';
import { formatPrice } from '../../api';

const OrderSuccessModal = ({ order, onClose }) => {
  const navigate = useNavigate();

  if (!order) return null;

  const handleViewOrders = () => {
    onClose();
    navigate('/orders');
  };

  const handleKeepShopping = () => {
    onClose();
    navigate('/catalog');
  };

  const shortId = order._id ? order._id.slice(-8).toUpperCase() : 'CONFIRMED';
  const totalAmount = order.totalAmount || 0;
  const customerEmail = order.user?.email || 'your email';

  return (
    <div className="fixed inset-0 z-[1300] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade">
      {/* Modal Container */}
      <div className="glass border-2 border-brand/50 rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl relative overflow-hidden text-center animate-celebration-glow">
        
        {/* Background Glow & Floating Party Particles */}
        <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 via-amber-500/10 to-indigo-500/10 pointer-events-none" />
        <div className="absolute top-2 left-6 text-2xl animate-confetti-1">🎉</div>
        <div className="absolute top-4 right-8 text-2xl animate-confetti-2">✨</div>
        <div className="absolute bottom-3 left-10 text-2xl animate-confetti-3">🚀</div>
        <div className="absolute bottom-4 right-8 text-2xl animate-confetti-1">🥳</div>

        {/* Big Festive Circle */}
        <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-btn text-white flex items-center justify-center text-4xl shadow-glow animate-festive-bounce relative z-10">
          🎉
        </div>

        {/* Title */}
        <div className="relative z-10 space-y-2 mb-6">
          <h2 className="font-display font-black text-2xl sm:text-3xl text-white tracking-tight leading-tight">
            Order Placed Successfully! 🥳
          </h2>
          <p className="text-slate-300 text-xs sm:text-sm max-w-xs mx-auto">
            Woohoo! Your order has been placed and is being prepared for express delivery.
          </p>
        </div>

        {/* Order Details Badge */}
        <div className="bg-white/[0.04] border border-white/10 rounded-2xl p-4 mb-5 relative z-10 space-y-2 text-left">
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-400 font-medium">Order Reference:</span>
            <span className="font-mono font-bold text-brand bg-brand/10 border border-brand/20 px-2 py-0.5 rounded">
              #{shortId}
            </span>
          </div>
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-400 font-medium">Total Paid / COD:</span>
            <span className="font-bold text-white text-sm">{formatPrice(totalAmount)}</span>
          </div>
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-400 font-medium">Payment Method:</span>
            <span className="font-semibold text-slate-200">{order.paymentMethod || 'COD'}</span>
          </div>
        </div>

        {/* Email Notification Alert Badge */}
        <div className="inline-flex items-center gap-2 bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 px-3.5 py-2 rounded-xl text-xs font-semibold mb-6 relative z-10">
          <span>✉️</span>
          <span>Confirmation email dispatched via <strong>jaldikharidoo.in</strong></span>
        </div>

        {/* Action CTAs */}
        <div className="space-y-2.5 relative z-10">
          <button
            onClick={handleViewOrders}
            className="w-full py-3 text-center text-sm font-bold bg-gradient-btn text-white rounded-xl hover:shadow-glow transition-all"
          >
            📦 Track & View My Orders
          </button>
          <button
            onClick={handleKeepShopping}
            className="w-full py-2.5 text-center text-xs font-semibold bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 rounded-xl transition-all"
          >
            🛍️ Continue Shopping
          </button>
        </div>

      </div>
    </div>
  );
};

export default OrderSuccessModal;
