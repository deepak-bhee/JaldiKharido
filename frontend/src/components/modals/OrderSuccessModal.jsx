import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { formatPrice } from '../../api';

const OrderSuccessModal = ({ order, onClose }) => {
  const navigate = useNavigate();

  useEffect(() => {
    if (!order) return;
    const timer = setTimeout(() => {
      if (onClose) onClose();
    }, 5000); // Auto close after 5 seconds
    return () => clearTimeout(timer);
  }, [order?._id, onClose]);

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

  return (
    <div className="fixed inset-0 z-[1300] flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade">
      {/* Modal Container */}
      <div className="bg-surface-secondary/95 border border-brand/30 rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl relative overflow-hidden text-center transition-all duration-300">
        
        {/* Subtle Accent Glow */}
        <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-72 h-72 bg-brand/10 rounded-full blur-3xl pointer-events-none" />

        {/* Clean Circle Icon */}
        <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-gradient-btn text-white flex items-center justify-center text-3xl shadow-glow relative z-10">
          🎉
        </div>

        {/* Title */}
        <div className="relative z-10 space-y-1 mb-5">
          <h2 className="font-display font-black text-xl sm:text-2xl text-white tracking-tight leading-tight">
            Order Placed Successfully! 🎉
          </h2>
          <p className="text-slate-300 text-xs max-w-xs mx-auto">
            Your order has been received and is being prepared for express shipping.
          </p>
        </div>

        {/* Order Details */}
        <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-3.5 mb-4 relative z-10 space-y-2 text-left text-xs">
          <div className="flex justify-between items-center">
            <span className="text-slate-400 font-medium">Order Number:</span>
            <span className="font-mono font-bold text-brand bg-brand/10 border border-brand/20 px-2 py-0.5 rounded">
              #{shortId}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-400 font-medium">Total Amount:</span>
            <span className="font-bold text-white text-sm">{formatPrice(totalAmount)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-400 font-medium">Payment Method:</span>
            <span className="font-semibold text-slate-200">{order.paymentMethod || 'COD'}</span>
          </div>
        </div>

        {/* Email Notification Alert Badge */}
        <div className="inline-flex items-center justify-center gap-1.5 bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 px-3 py-1.5 rounded-xl text-[11px] font-semibold mb-5 relative z-10">
          <span>✉️</span>
          <span>Confirmation email sent via <strong>jaldikharidoo.in</strong></span>
        </div>

        {/* Action CTAs */}
        <div className="space-y-2 relative z-10">
          <button
            onClick={handleViewOrders}
            className="w-full py-2.5 text-center text-xs sm:text-sm font-bold bg-gradient-btn text-white rounded-xl hover:shadow-glow transition-all"
          >
            📦 Track & View My Orders
          </button>
          <button
            onClick={handleKeepShopping}
            className="w-full py-2 text-center text-xs font-semibold bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 rounded-xl transition-all"
          >
            🛍️ Continue Shopping
          </button>
        </div>

      </div>
    </div>
  );
};

export default OrderSuccessModal;
