import { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext(null);

const CART_KEY = 'jk_cart';

export const CartProvider = ({ children }) => {
  const [items, setItems] = useState(() => {
    try { return JSON.parse(localStorage.getItem(CART_KEY)) || []; } catch { return []; }
  });

  useEffect(() => {
    localStorage.setItem(CART_KEY, JSON.stringify(items));
  }, [items]);

  const addToCart = (product, qty = 1) => {
    setItems(prev => {
      const existing = prev.find(i => i.product === product._id);
      if (existing) {
        return prev.map(i =>
          i.product === product._id
            ? { ...i, quantity: Math.min(i.quantity + qty, product.stock) }
            : i
        );
      }
      return [...prev, {
        product: product._id,
        name:    product.name,
        price:   product.price,
        image:   product.image,
        stock:   product.stock,
        quantity: qty,
      }];
    });
  };

  const removeFromCart = (productId) =>
    setItems(prev => prev.filter(i => i.product !== productId));

  const updateQty = (productId, qty) => {
    if (qty < 1) { removeFromCart(productId); return; }
    setItems(prev =>
      prev.map(i => i.product === productId ? { ...i, quantity: qty } : i)
    );
  };

  const clearCart = () => setItems([]);

  const cartCount    = items.reduce((s, i) => s + i.quantity, 0);
  const cartSubtotal = items.reduce((s, i) => s + i.price * i.quantity, 0);
  const shipping     = cartSubtotal > 499 ? 0 : 49;
  const cartTotal    = cartSubtotal + shipping;

  return (
    <CartContext.Provider value={{
      items, addToCart, removeFromCart, updateQty, clearCart,
      cartCount, cartSubtotal, shipping, cartTotal,
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
