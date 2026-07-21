import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { apiFetch, formatPrice } from '../api';

const Checkout = () => {
  const { items, cartTotal, clearCart } = useCart();
  const { showToast, showSmsNotification } = useToast();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [address, setAddress] = useState({ fullName: '', phone: '', address: '', city: '', state: '', pinCode: '' });
  const [paymentMethod, setPaymentMethod] = useState('COD');

  if (items.length === 0) {
    navigate('/cart');
    return null;
  }

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const orderItems = items.map(i => ({ product: i.product || i._id || i.id, quantity: i.quantity }));
      const data = await apiFetch('/orders', {
        method: 'POST',
        body: JSON.stringify({ items: orderItems, shippingAddress: address, paymentMethod })
      });
      clearCart();
      showToast('Order placed successfully! 🎉', 'success');
      navigate('/orders', { state: { justPlaced: true, order: data.order } });
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickFill = () => {
    setAddress({
      fullName: 'Deepak',
      phone: '9844834494',
      address: '123 MG Road, Sector 4',
      city: 'Bengaluru',
      state: 'Karnataka',
      pinCode: '560001'
    });
  };

  return (
    <div className="min-h-screen bg-surface py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="font-display font-black text-3xl text-white">Checkout</h1>
          <button type="button" onClick={handleQuickFill}
            className="px-3.5 py-1.5 bg-brand/20 hover:bg-brand/30 border border-brand/40 text-brand text-xs font-bold rounded-lg transition-all">
            ⚡ Quick Fill Address
          </button>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left - Form */}
          <div className="space-y-6">
            <div className="glass border border-white/10 rounded-2xl p-6">
              <h2 className="text-xl font-bold text-white mb-4">Shipping Address</h2>
              <form id="checkout-form" onSubmit={handlePlaceOrder} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-xs font-medium text-slate-400 mb-1">Full Name</label>
                    <input type="text" required value={address.fullName} onChange={e => setAddress(a => ({...a, fullName: e.target.value}))}
                      className="w-full bg-surface-secondary border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-brand/50" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">Phone Number</label>
                    <input type="text" required value={address.phone} onChange={e => setAddress(a => ({...a, phone: e.target.value}))}
                      className="w-full bg-surface-secondary border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-brand/50" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">Pin Code</label>
                    <input type="text" required value={address.pinCode} onChange={e => setAddress(a => ({...a, pinCode: e.target.value}))}
                      className="w-full bg-surface-secondary border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-brand/50" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-medium text-slate-400 mb-1">Street Address</label>
                    <input type="text" required value={address.address} onChange={e => setAddress(a => ({...a, address: e.target.value}))}
                      className="w-full bg-surface-secondary border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-brand/50" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">City</label>
                    <input type="text" required value={address.city} onChange={e => setAddress(a => ({...a, city: e.target.value}))}
                      className="w-full bg-surface-secondary border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-brand/50" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">State</label>
                    <input type="text" required value={address.state} onChange={e => setAddress(a => ({...a, state: e.target.value}))}
                      className="w-full bg-surface-secondary border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-brand/50" />
                  </div>
                </div>
              </form>
            </div>

            <div className="glass border border-white/10 rounded-2xl p-6">
              <h2 className="text-xl font-bold text-white mb-4">Payment Method</h2>
              <div className="space-y-3">
                {['COD', 'UPI', 'Card'].map(pm => (
                  <label key={pm} className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-colors ${
                    paymentMethod === pm ? 'bg-brand/10 border-brand' : 'bg-white/5 border-white/10 hover:border-white/30'
                  }`}>
                    <input type="radio" name="payment" value={pm} checked={paymentMethod === pm}
                      onChange={e => setPaymentMethod(e.target.value)} className="text-brand focus:ring-brand" />
                    <span className="text-white font-medium">{pm === 'COD' ? 'Cash on Delivery' : pm}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Right - Summary */}
          <div>
            <div className="glass border border-white/10 rounded-2xl p-6 sticky top-24">
              <h2 className="text-lg font-bold text-white mb-4">Order Summary</h2>
              <div className="space-y-4 mb-6 max-h-60 overflow-y-auto pr-2 scrollbar-hide">
                {items.map(item => (
                  <div key={item.product} className="flex gap-4">
                    <img src={item.image} alt={item.name} className="w-16 h-16 rounded-lg object-cover" />
                    <div className="flex-1">
                      <div className="text-sm font-semibold text-white truncate">{item.name}</div>
                      <div className="text-xs text-slate-400 mt-1">Qty: {item.quantity}</div>
                      <div className="text-brand font-bold text-sm mt-1">{formatPrice(item.price * item.quantity)}</div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="border-t border-white/10 pt-4 mb-6">
                <div className="flex justify-between items-end">
                  <span className="text-base font-bold text-white">Total to Pay</span>
                  <span className="text-2xl font-black gradient-text">{formatPrice(cartTotal)}</span>
                </div>
              </div>
              <button type="submit" form="checkout-form" disabled={loading}
                className="w-full py-3.5 px-4 bg-gradient-btn text-white text-sm font-bold rounded-xl hover:shadow-glow transition-all disabled:opacity-50">
                {loading ? 'Processing...' : 'Place Order'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
