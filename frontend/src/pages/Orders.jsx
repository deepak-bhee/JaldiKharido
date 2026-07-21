import { useState, useEffect } from 'react';
import { apiFetch, formatPrice } from '../api';
import { useToast } from '../context/ToastContext';

const TrackingTimeline = ({ order }) => {
  const steps = [
    { key: 'pending', label: 'Placed', icon: '📦' },
    { key: 'processing', label: 'Processing', icon: '⚙️' },
    { key: 'shipped', label: 'Shipped', icon: '🚚' },
    { key: 'delivered', label: 'Delivered', icon: '✅' }
  ];

  if (order.status === 'cancelled') {
    return (
      <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 mb-6 flex items-center gap-3">
        <span className="text-xl">🚫</span>
        <div>
          <h4 className="text-sm font-bold text-red-400">Order Cancelled</h4>
          <p className="text-xs text-slate-400 mt-0.5">This order has been cancelled and refunded if payment was processed.</p>
        </div>
      </div>
    );
  }

  const statusMapping = { pending: 0, processing: 1, shipped: 2, delivered: 3 };
  const currentStep = statusMapping[order.status] ?? 0;

  return (
    <div className="mb-6 mt-4 border-b border-white/5 pb-6">
      <div className="relative flex justify-between items-center w-full max-w-xl mx-auto px-2">
        {/* Connector Line */}
        <div className="absolute left-6 right-6 top-4 sm:top-5 h-[3px] bg-white/10 -z-10 rounded-full">
          <div 
            className="h-full bg-gradient-to-r from-orange-500 to-indigo-500 transition-all duration-500 rounded-full" 
            style={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
          />
        </div>

        {/* Steps */}
        {steps.map((step, idx) => {
          const isCompleted = idx <= currentStep;
          const isActive = idx === currentStep;

          return (
            <div key={step.key} className="flex flex-col items-center flex-1 text-center relative z-10">
              {/* Circle Icon */}
              <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-xs sm:text-base border transition-all duration-300 ${
                isCompleted 
                  ? 'bg-surface-secondary border-brand text-white shadow-[0_0_12px_rgba(249,115,22,0.25)]' 
                  : 'bg-surface border-white/10 text-slate-500'
              } ${isActive ? 'scale-110 ring-2 ring-brand/30 border-brand' : ''}`}>
                <span>{step.icon}</span>
              </div>
              
              {/* Label */}
              <span className={`text-[8px] sm:text-[10px] mt-2 font-bold tracking-wider uppercase transition-colors ${
                isCompleted ? 'text-white' : 'text-slate-500'
              }`}>
                {step.label}
              </span>

              {/* Timestamps */}
              {step.key === 'pending' && (
                <span className="text-[9px] text-slate-400 mt-0.5 font-medium">
                  {new Date(order.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                </span>
              )}
              {step.key === 'delivered' && order.deliveredAt && (
                <span className="text-[9px] text-slate-400 mt-0.5 font-medium">
                  {new Date(order.deliveredAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();
  const location = useLocation();

  const isJustPlaced = location.state?.justPlaced;

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const data = await apiFetch('/orders/my');
        setOrders(data.orders);
      } catch (err) {
        showToast(err.message, 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [showToast]);

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm('Are you sure you want to cancel this order? 🚫')) return;
    try {
      await apiFetch(`/orders/${orderId}/cancel`, { method: 'PUT' });
      showToast('Order cancelled successfully', 'success');
      setOrders(prev => prev.map(o => o._id === orderId ? { ...o, status: 'cancelled' } : o));
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'delivered': return 'text-green-400 bg-green-400/10 border-green-400/20';
      case 'processing': return 'text-brand bg-brand/10 border-brand/20';
      case 'shipped': return 'text-indigo-400 bg-indigo-400/10 border-indigo-400/20';
      case 'cancelled': return 'text-red-400 bg-red-400/10 border-red-400/20';
      default: return 'text-slate-300 bg-white/5 border-white/10';
    }
  };

  if (loading) {
    return <div className="min-h-screen bg-surface flex justify-center py-20"><div className="animate-spin text-4xl">⚡</div></div>;
  }

  return (
    <div className="min-h-screen bg-surface py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Celebration Banner when an order was just placed */}
        {isJustPlaced && (
          <div className="glass border-2 border-brand/40 rounded-3xl p-6 sm:p-10 mb-10 text-center relative overflow-hidden shadow-2xl animate-celebration-glow">
            {/* Background Glow & Floating Confetti Emojis */}
            <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 via-amber-500/10 to-indigo-500/10 pointer-events-none" />
            <div className="absolute top-2 left-6 text-2xl animate-confetti-1">🎉</div>
            <div className="absolute top-4 right-10 text-2xl animate-confetti-2">✨</div>
            <div className="absolute bottom-3 left-12 text-2xl animate-confetti-3">🚀</div>
            <div className="absolute bottom-4 right-8 text-2xl animate-confetti-1">🥳</div>

            <div className="relative z-10 space-y-3">
              <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto rounded-full bg-gradient-btn text-white flex items-center justify-center text-3xl sm:text-4xl shadow-glow animate-festive-bounce">
                🎉
              </div>
              
              <h2 className="font-display font-black text-2xl sm:text-4xl tracking-tight text-white">
                Order Confirmed! Woohoo! 🥳
              </h2>
              
              <p className="text-slate-300 text-sm sm:text-base max-w-lg mx-auto leading-relaxed">
                Thank you for shopping with <span className="gradient-text font-bold">JaldiKharidoo</span>! We've received your order and our team is already packing it up for express delivery.
              </p>

              <div className="inline-flex items-center gap-2 bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 px-4 py-2 rounded-full text-xs font-semibold mt-2">
                <span>✉️</span>
                <span>Confirmation email dispatched via <strong>jaldikharidoo.in</strong></span>
              </div>
            </div>
          </div>
        )}

        <h1 className="font-display font-black text-3xl text-white mb-8">My Orders</h1>
        {orders.length === 0 ? (
          <div className="glass border border-white/10 rounded-2xl p-12 text-center animate-fade">
            <div className="text-4xl mb-4">📦</div>
            <h3 className="text-xl font-bold text-white mb-2">No orders found</h3>
            <p className="text-slate-400">You haven't placed any orders yet.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map(order => (
              <div key={order._id} className="glass border border-white/10 rounded-2xl p-6 hover:border-white/20 transition-all duration-300 animate-fade">
                <div className="flex flex-wrap justify-between items-center gap-4 mb-4 border-b border-white/10 pb-4">
                  <div>
                    <div className="text-xs text-slate-400 font-semibold tracking-wider">ORDER #{order._id.slice(-8).toUpperCase()}</div>
                    <div className="text-[11px] text-slate-500 mt-1 font-medium">Placed: {new Date(order.createdAt).toLocaleDateString()}</div>
                    {order.status === 'delivered' ? (
                      <div className="text-[11px] text-green-400 font-bold mt-1.5 flex items-center gap-1">
                        <span>✅</span> Delivered on {new Date(order.deliveredAt || order.updatedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                      </div>
                    ) : order.status === 'cancelled' ? (
                      <div className="text-[11px] text-red-400 font-bold mt-1.5 flex items-center gap-1">
                        <span>🚫</span> Cancelled
                      </div>
                    ) : (
                      <div className="text-[11px] text-indigo-300 font-bold mt-1.5 flex items-center gap-1">
                        <span>⚡</span> Est. Delivery: {new Date(new Date(order.createdAt).getTime() + 3 * 24 * 60 * 60 * 1000).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                      </div>
                    )}
                  </div>
                  <div className="text-right flex flex-col items-end">
                    <div className="text-brand font-black text-lg">{formatPrice(order.totalAmount)}</div>
                    <span className={`inline-block mt-1.5 px-3 py-1 text-[10px] font-bold rounded-full border tracking-wide uppercase ${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                    {(order.status === 'pending' || order.status === 'processing') && (
                      <button 
                        onClick={() => handleCancelOrder(order._id)}
                        className="mt-2.5 px-2.5 py-1 text-[10px] font-extrabold text-red-400 bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 hover:border-red-500/30 transition-all rounded-lg cursor-pointer"
                      >
                        Cancel Order
                      </button>
                    )}
                  </div>
                </div>

                {/* Visual Order Tracking Stepper */}
                <TrackingTimeline order={order} />

                {/* Items list */}
                <div className="space-y-3 mt-4">
                  {order.items.map(item => (
                    <div key={item.product._id || item.product} className="flex gap-4 items-center p-2 rounded-xl bg-white/[0.02] hover:bg-white/[0.04] transition-colors">
                      <div className="w-12 h-12 rounded-lg bg-surface-secondary overflow-hidden border border-white/5">
                        <img src={item.image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&h=600&fit=crop'} alt={item.name} className="w-full h-full object-cover" onError={(e) => { e.target.onerror = null; e.target.src = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&h=600&fit=crop'; }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold text-white truncate">{item.name}</div>
                        <div className="text-xs text-slate-400">Qty: {item.quantity}</div>
                      </div>
                      <div className="text-sm font-semibold text-white whitespace-nowrap">
                        {formatPrice(item.price * item.quantity)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Orders;
