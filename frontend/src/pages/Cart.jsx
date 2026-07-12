import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { formatPrice } from '../api';

const Cart = () => {
  const { items, updateQty, removeFromCart, cartSubtotal, shipping, cartTotal } = useCart();
  const navigate = useNavigate();

  if (items.length === 0) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4 bg-surface">
        <div className="text-center">
          <div className="text-6xl mb-6">🛒</div>
          <h2 className="font-display font-black text-3xl text-white mb-2">Your cart is empty</h2>
          <p className="text-slate-400 mb-8 max-w-sm mx-auto">Looks like you haven't added anything to your cart yet.</p>
          <Link to="/catalog" className="inline-flex px-8 py-3 bg-gradient-btn text-white font-bold rounded-xl hover:shadow-glow transition-all">
            Start Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="font-display font-black text-3xl text-white mb-8">Shopping Cart</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map(item => (
              <div key={item.product} className="glass border border-white/10 rounded-2xl p-4 sm:p-6 flex gap-4 sm:gap-6 items-center">
                <img src={item.image} alt={item.name} className="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded-xl bg-surface-secondary" />
                
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-white text-sm sm:text-base truncate">{item.name}</h3>
                  <div className="text-brand font-bold mt-1">{formatPrice(item.price)}</div>
                  
                  <div className="flex items-center gap-4 mt-3 sm:mt-4">
                    <div className="flex items-center bg-white/5 rounded-lg border border-white/10">
                      <button onClick={() => updateQty(item.product, item.quantity - 1)}
                        className="px-3 py-1 text-slate-400 hover:text-white hover:bg-white/5 rounded-l-lg transition">-</button>
                      <span className="px-3 py-1 text-sm font-semibold text-white min-w-[2.5rem] text-center">
                        {item.quantity}
                      </span>
                      <button onClick={() => updateQty(item.product, item.quantity + 1)}
                        disabled={item.quantity >= item.stock}
                        className="px-3 py-1 text-slate-400 hover:text-white hover:bg-white/5 rounded-r-lg transition disabled:opacity-30">+</button>
                    </div>
                    <button onClick={() => removeFromCart(item.product)}
                      className="text-xs text-red-400 hover:text-red-300 font-semibold flex items-center gap-1 transition">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                      <span className="hidden sm:inline">Remove</span>
                    </button>
                  </div>
                </div>
                
                <div className="text-right hidden sm:block">
                  <div className="text-sm font-bold text-white">{formatPrice(item.price * item.quantity)}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="glass border border-white/10 rounded-2xl p-6 sticky top-24">
              <h2 className="text-lg font-bold text-white mb-6">Order Summary</h2>
              
              <div className="space-y-4 text-sm">
                <div className="flex justify-between text-slate-300">
                  <span>Subtotal ({items.reduce((a,c) => a + c.quantity, 0)} items)</span>
                  <span className="font-medium text-white">{formatPrice(cartSubtotal)}</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Shipping</span>
                  {shipping === 0 ? (
                    <span className="text-green-400 font-semibold">Free</span>
                  ) : (
                    <span className="font-medium text-white">{formatPrice(shipping)}</span>
                  )}
                </div>
                {shipping > 0 && (
                  <div className="text-xs text-brand bg-brand/10 p-2 rounded-lg">
                    Add {formatPrice(500 - cartSubtotal)} more for free shipping!
                  </div>
                )}
                
                <div className="border-t border-white/10 pt-4 mt-4">
                  <div className="flex justify-between items-end">
                    <span className="text-base font-bold text-white">Total</span>
                    <span className="text-2xl font-black gradient-text">{formatPrice(cartTotal)}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => navigate('/checkout')}
                className="w-full mt-8 py-3.5 px-4 bg-gradient-btn text-white text-sm font-bold rounded-xl hover:shadow-glow transition-all"
              >
                Proceed to Checkout
              </button>
              
              <div className="mt-4 flex items-center justify-center gap-2 text-xs text-slate-500">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>
                Secure Checkout
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
