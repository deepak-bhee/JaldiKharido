import { useState, useEffect } from 'react';
import { apiFetch, formatPrice } from '../api';
import { useToast } from '../context/ToastContext';

const Admin = () => {
  const [tab, setTab] = useState('products'); // 'products' or 'orders'
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  // Product Form Modal States
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null); // null when creating, product object when editing
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: 0,
    originalPrice: '',
    category: 'Electronics',
    image: '',
    stock: 0,
    featured: false
  });

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        if (tab === 'products') {
          const data = await apiFetch('/products?limit=100');
          setProducts(data.products || []);
        } else {
          const data = await apiFetch('/orders'); // Admin gets all orders
          setOrders(data.orders || []);
        }
      } catch (err) {
        showToast(err.message, 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [tab, showToast]);

  const updateOrderStatus = async (orderId, status) => {
    try {
      await apiFetch(`/orders/${orderId}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status })
      });
      showToast('Order status updated', 'success');
      setOrders(orders.map(o => o._id === orderId ? { ...o, status } : o));
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const deleteProduct = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      await apiFetch(`/products/${id}`, { method: 'DELETE' });
      showToast('Product deleted successfully', 'success');
      setProducts(products.filter(p => p._id !== id));
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const openAddModal = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      description: '',
      price: 0,
      originalPrice: '',
      category: 'Electronics',
      image: '',
      stock: 0,
      featured: false
    });
    setShowModal(true);
  };

  const openEditModal = (p) => {
    setEditingProduct(p);
    setFormData({
      name: p.name,
      description: p.description,
      price: p.price,
      originalPrice: p.originalPrice || '',
      category: p.category,
      image: p.image || '',
      stock: p.stock,
      featured: p.featured || false
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        price: Number(formData.price),
        originalPrice: formData.originalPrice ? Number(formData.originalPrice) : null,
        stock: Number(formData.stock)
      };

      if (editingProduct) {
        // Edit Product
        const data = await apiFetch(`/products/${editingProduct._id}`, {
          method: 'PUT',
          body: JSON.stringify(payload)
        });
        showToast('Product updated successfully! 🏷️', 'success');
        setProducts(products.map(p => p._id === editingProduct._id ? data.product : p));
      } else {
        // Create Product
        const data = await apiFetch('/products', {
          method: 'POST',
          body: JSON.stringify(payload)
        });
        showToast('Product created successfully! 📦', 'success');
        setProducts([data.product, ...products]);
      }
      setShowModal(false);
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'delivered': return 'text-green-400 bg-green-400/10 border-green-400/20';
      case 'processing': return 'text-brand bg-brand/10 border-brand/20';
      case 'shipped': return 'text-indigo-400 bg-indigo-400/10 border-indigo-400/20';
      case 'cancelled': return 'text-red-400 bg-red-400/10 border-red-400/20';
      default: return 'text-slate-300 bg-white/5 border-white/10';
    }
  };

  return (
    <div className="min-h-screen bg-surface py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="font-display font-black text-3xl text-brand">⚙️ Admin Dashboard</h1>
            <p className="text-slate-500 text-xs mt-1">Manage shop catalog inventory and customer orders</p>
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            {tab === 'products' && (
              <button 
                onClick={openAddModal}
                className="px-4 py-2 bg-gradient-btn text-white text-sm font-bold rounded-xl hover:shadow-glow transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <span>⚡ Add Product</span>
              </button>
            )}
            <div className="flex bg-white/5 rounded-xl p-1 border border-white/10">
              <button 
                onClick={() => setTab('products')} 
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
                  tab === 'products' ? 'bg-brand text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Products
              </button>
              <button 
                onClick={() => setTab('orders')} 
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
                  tab === 'orders' ? 'bg-brand text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Orders
              </button>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><div className="animate-spin text-4xl">⚡</div></div>
        ) : tab === 'products' ? (
          <div className="glass border border-white/10 rounded-2xl overflow-hidden animate-fade">
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-300">
                <thead className="text-xs uppercase bg-white/5 text-slate-400 border-b border-white/10">
                  <tr>
                    <th className="px-6 py-4">Product Name</th>
                    <th className="px-6 py-4">Category</th>
                    <th className="px-6 py-4">Price</th>
                    <th className="px-6 py-4">Stock</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map(p => (
                    <tr key={p._id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                      <td className="px-6 py-4 font-semibold text-white">{p.name}</td>
                      <td className="px-6 py-4 text-slate-400">{p.category}</td>
                      <td className="px-6 py-4 text-brand font-bold">{formatPrice(p.price)}</td>
                      <td className="px-6 py-4">{p.stock} units</td>
                      <td className="px-6 py-4 text-right flex items-center justify-end gap-2">
                        <button 
                          onClick={() => openEditModal(p)} 
                          className="px-3 py-1.5 text-xs font-bold text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 rounded-lg hover:bg-indigo-500/20 hover:border-indigo-500/30 transition-all cursor-pointer"
                        >
                          Edit
                        </button>
                        <button 
                          onClick={() => deleteProduct(p._id)} 
                          className="px-3 py-1.5 text-xs font-bold text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg hover:bg-red-500/20 hover:border-red-500/30 transition-all cursor-pointer"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards View */}
            <div className="md:hidden divide-y divide-white/5">
              {products.map(p => (
                <div key={p._id} className="p-4 flex justify-between items-center bg-white/[0.01] hover:bg-white/[0.02] transition-colors">
                  <div className="min-w-0 pr-4">
                    <div className="font-bold text-white text-sm truncate">{p.name}</div>
                    <div className="text-xs text-slate-500 mt-0.5">{p.category}</div>
                    <div className="text-brand font-black text-sm mt-1">{formatPrice(p.price)}</div>
                    <div className="text-slate-400 text-xs mt-0.5">Available Stock: {p.stock} units</div>
                  </div>
                  <div className="flex-shrink-0 flex gap-2">
                    <button 
                      onClick={() => openEditModal(p)} 
                      className="px-3 py-1.5 text-xs font-bold text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 rounded-lg hover:bg-indigo-500/20 transition-all"
                    >
                      Edit
                    </button>
                    <button 
                      onClick={() => deleteProduct(p._id)} 
                      className="px-3 py-1.5 text-xs font-bold text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg hover:bg-red-500/20 transition-all"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="glass border border-white/10 rounded-2xl overflow-hidden animate-fade">
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-300">
                <thead className="text-xs uppercase bg-white/5 text-slate-400 border-b border-white/10">
                  <tr>
                    <th className="px-6 py-4">Order ID</th>
                    <th className="px-6 py-4">Customer</th>
                    <th className="px-6 py-4">Total Amount</th>
                    <th className="px-6 py-4 text-right">Status Option</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map(o => (
                    <tr key={o._id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                      <td className="px-6 py-4 font-mono text-xs">{o._id.toUpperCase()}</td>
                      <td className="px-6 py-4">{o.user?.name || 'Guest User'}</td>
                      <td className="px-6 py-4 text-brand font-bold">{formatPrice(o.totalAmount)}</td>
                      <td className="px-6 py-4 text-right">
                        <select 
                          value={o.status} 
                          onChange={e => updateOrderStatus(o._id, e.target.value)}
                          className="bg-surface border border-white/10 rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none focus:border-brand"
                        >
                          <option value="pending">Pending</option>
                          <option value="processing">Processing</option>
                          <option value="shipped">Shipped</option>
                          <option value="delivered">Delivered</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards View */}
            <div className="md:hidden divide-y divide-white/5">
              {orders.map(o => (
                <div key={o._id} className="p-4 space-y-3 bg-white/[0.01] hover:bg-white/[0.02] transition-colors">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-mono text-slate-400">Order #{o._id.slice(-8).toUpperCase()}</span>
                    <span className="text-brand font-black text-sm">{formatPrice(o.totalAmount)}</span>
                  </div>
                  <div className="text-xs text-slate-300">
                    Customer: <span className="font-semibold text-white">{o.user?.name || 'Guest User'}</span>
                  </div>
                  <div className="flex justify-between items-center border-t border-white/5 pt-2 mt-2">
                    <span className="text-xs text-slate-400">Update Status:</span>
                    <select 
                      value={o.status} 
                      onChange={e => updateOrderStatus(o._id, e.target.value)}
                      className={`border border-white/10 rounded-lg px-2.5 py-1 text-xs font-bold text-white bg-surface focus:outline-none`}
                    >
                      <option value="pending">Pending</option>
                      <option value="processing">Processing</option>
                      <option value="shipped">Shipped</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Product Form Modal Overlay */}
      {showModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto animate-fade">
          <div className="glass border border-white/10 rounded-2xl w-full max-w-lg p-6 relative flex flex-col max-h-[90vh] overflow-y-auto scrollbar-hide">
            <button onClick={() => setShowModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-white transition text-lg">✕</button>
            
            <h2 className="font-display font-black text-xl text-white mb-6">
              {editingProduct ? '✏️ Edit Product' : '📦 Add New Product'}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1 uppercase tracking-wider">Product Name</label>
                <input type="text" required value={formData.name} onChange={e => setFormData(f => ({...f, name: e.target.value}))}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-brand" />
              </div>
              
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1 uppercase tracking-wider">Description</label>
                <textarea required value={formData.description} onChange={e => setFormData(f => ({...f, description: e.target.value}))} rows={3}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-brand" />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1 uppercase tracking-wider">Price (₹)</label>
                  <input type="number" required min={0} value={formData.price} onChange={e => setFormData(f => ({...f, price: e.target.value}))}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-brand" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1 uppercase tracking-wider">Original Price (₹)</label>
                  <input type="number" min={0} value={formData.originalPrice} onChange={e => setFormData(f => ({...f, originalPrice: e.target.value}))}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-brand" placeholder="None" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1 uppercase tracking-wider">Category</label>
                  <select value={formData.category} onChange={e => setFormData(f => ({...f, category: e.target.value}))}
                    className="w-full bg-surface border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-brand">
                    {['Electronics', 'Clothing', 'Books', 'Home & Garden', 'Sports', 'Beauty', 'Toys', 'Food', 'Other'].map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1 uppercase tracking-wider">Stock Qty</label>
                  <input type="number" required min={0} value={formData.stock} onChange={e => setFormData(f => ({...f, stock: e.target.value}))}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-brand" />
                </div>
              </div>
              
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1 uppercase tracking-wider">Image URL</label>
                <input type="text" value={formData.image} onChange={e => setFormData(f => ({...f, image: e.target.value}))}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-brand" placeholder="https://unsplash.com/..." />
              </div>
              
              <div className="flex items-center gap-2 py-2">
                <input type="checkbox" id="featured" checked={formData.featured} onChange={e => setFormData(f => ({...f, featured: e.target.checked}))}
                  className="rounded border-white/10 text-brand focus:ring-brand bg-white/5" />
                <label htmlFor="featured" className="text-sm font-semibold text-white cursor-pointer select-none">Featured Product (Show on Home Page)</label>
              </div>
              
              <div className="flex gap-3 pt-4 border-t border-white/10">
                <button type="button" onClick={() => setShowModal(false)}
                  className="flex-1 py-2.5 px-4 glass border border-white/10 text-white rounded-xl hover:bg-white/5 transition font-semibold text-sm">
                  Cancel
                </button>
                <button type="submit"
                  className="flex-1 py-2.5 px-4 bg-gradient-btn text-white rounded-xl hover:shadow-glow transition font-bold text-sm">
                  {editingProduct ? 'Save Changes' : 'Create Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Admin;
