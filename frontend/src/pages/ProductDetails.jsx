import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { apiFetch, formatPrice } from '../api';
import ProductCard from '../components/ProductCard';

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { isLoggedIn } = useAuth();
  const { showToast } = useToast();

  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);

  // Generate realistic reviews based on rating
  const generateReviews = (rating) => {
    const comments = [
      { author: 'Aarav Mehta', title: 'Outstanding Quality!', comment: 'Exceeded my expectations. Build quality is top-notch and delivery was incredibly fast! Highly recommend this to everyone.', date: '2 weeks ago' },
      { author: 'Priya Sharma', title: 'Value for Money', comment: 'Very decent product for the price. Works exactly as described. Packaging was neat and clean.', date: '1 month ago' },
      { author: 'Rohan Gupta', title: 'Pretty Good', comment: 'Good purchase overall. Had a minor issue with setup but customer support was very helpful in resolving it.', date: '3 days ago' },
    ];
    return comments.map((c, i) => ({
      ...c,
      id: i,
      rating: Math.max(1, Math.min(5, Math.round(rating - (i % 2 === 0 ? 0.5 : -0.5))))
    }));
  };

  useEffect(() => {
    const fetchProductDetails = async () => {
      setLoading(true);
      try {
        const data = await apiFetch(`/products/${id}`);
        setProduct(data.product);
        
        // Fetch related products
        const relData = await apiFetch(`/products?category=${data.product.category}&limit=5`);
        setRelated(relData.products.filter(p => p._id !== id).slice(0, 4));
      } catch (err) {
        showToast(err.message, 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchProductDetails();
  }, [id, showToast]);

  const handleAdd = () => {
    if (!isLoggedIn()) {
      showToast('Please sign in to add items to cart', 'warning');
      setTimeout(() => navigate('/login'), 900);
      return;
    }
    for (let i = 0; i < qty; i++) {
      addToCart(product);
    }
    showToast(`${qty} × ${product.name.substring(0, 20)}… added to cart! 🛒`, 'success');
  };

  const starsEl = (rating = 0) => {
    const full = Math.floor(rating);
    return Array.from({ length: 5 }, (_, i) => (
      <span key={i} className={i < full ? 'text-gold' : 'text-slate-700'}>★</span>
    ));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-surface flex justify-center py-20">
        <div className="animate-spin text-4xl">⚡</div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-surface py-20 text-center">
        <div className="text-4xl mb-4">⚠️</div>
        <h2 className="text-xl font-bold text-white mb-2">Product Not Found</h2>
        <Link to="/catalog" className="text-brand hover:underline font-bold">Back to Catalog</Link>
      </div>
    );
  }

  const discount = product.originalPrice && product.originalPrice > product.price
    ? Math.round((1 - product.price / product.originalPrice) * 100)
    : 0;

  return (
    <div className="min-h-screen bg-surface py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumb */}
        <div className="text-xs text-slate-400 mb-6 flex gap-2 items-center">
          <Link to="/" className="hover:text-white transition-colors">Home</Link>
          <span>/</span>
          <Link to="/catalog" className="hover:text-white transition-colors">Catalog</Link>
          <span>/</span>
          <span className="text-slate-500 font-semibold">{product.category}</span>
        </div>

        {/* Product Details Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          
          {/* Left - Image */}
          <div className="glass border border-white/10 rounded-3xl overflow-hidden aspect-square flex items-center justify-center bg-surface-secondary relative group">
            <img 
              src={product.image} 
              alt={product.name} 
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
              onError={(e) => { e.target.onerror = null; e.target.src = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&h=600&fit=crop'; }}
            />
            {discount > 0 && (
              <span className="absolute top-4 left-4 bg-red-500 text-white text-xs font-black px-3 py-1 rounded-full shadow-lg">
                -{discount}% OFF
              </span>
            )}
          </div>

          {/* Right - Info */}
          <div className="flex flex-col justify-center">
            <span className="text-brand text-xs font-bold uppercase tracking-widest">{product.category}</span>
            <h1 className="font-display font-black text-3xl sm:text-4xl text-white mt-2 mb-4 leading-tight">{product.name}</h1>
            
            {/* Rating */}
            <div className="flex items-center gap-2 mb-6">
              <div className="flex text-lg">{starsEl(product.rating)}</div>
              <span className="text-white font-bold text-sm ml-1">{product.rating}</span>
              <span className="text-slate-500 text-sm">({product.numReviews || 3} reviews)</span>
            </div>

            {/* Price */}
            <div className="flex items-center gap-3 mb-6">
              <span className="text-3xl font-black gradient-text">{formatPrice(product.price)}</span>
              {product.originalPrice && (
                <span className="text-slate-500 line-through text-base font-semibold">{formatPrice(product.originalPrice)}</span>
              )}
              {discount > 0 && (
                <span className="text-green-400 text-sm font-bold bg-green-500/10 border border-green-500/20 px-2 py-0.5 rounded-lg">
                  Save {discount}%
                </span>
              )}
            </div>

            {/* Description */}
            <div className="glass border border-white/5 rounded-2xl p-5 mb-6">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Product Description</h3>
              <p className="text-slate-300 text-sm leading-relaxed">{product.description}</p>
            </div>

            {/* Stock Level Indicator */}
            <div className="mb-6 flex items-center gap-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Availability:</span>
              {product.stock === 0 ? (
                <span className="text-xs font-bold text-red-400 bg-red-500/10 border border-red-500/25 px-2.5 py-1 rounded-full">Out of Stock</span>
              ) : product.stock <= 3 ? (
                <span className="text-xs font-bold text-orange-400 bg-orange-500/10 border border-orange-500/25 px-2.5 py-1 rounded-full">Only {product.stock} Left!</span>
              ) : (
                <span className="text-xs font-bold text-green-400 bg-green-500/10 border border-green-500/25 px-2.5 py-1 rounded-full">In Stock ({product.stock} units)</span>
              )}
            </div>

            {/* Actions */}
            {product.stock > 0 && (
              <div className="flex gap-4">
                <div className="flex items-center border border-white/10 rounded-xl bg-white/[0.03] overflow-hidden">
                  <button onClick={() => setQty(q => Math.max(1, q - 1))} className="px-3.5 py-2 hover:bg-white/5 text-slate-400 hover:text-white transition-colors font-bold">−</button>
                  <span className="px-4 text-sm font-bold text-white min-w-[2.5rem] text-center">{qty}</span>
                  <button onClick={() => setQty(q => Math.min(product.stock, q + 1))} className="px-3.5 py-2 hover:bg-white/5 text-slate-400 hover:text-white transition-colors font-bold">+</button>
                </div>
                <button 
                  onClick={handleAdd}
                  className="flex-1 py-3 px-6 bg-gradient-btn text-white text-sm font-bold rounded-xl hover:shadow-glow transition-all flex items-center justify-center gap-2"
                >
                  🛒 Add to Cart
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Reviews Section */}
        <div className="mb-16">
          <h2 className="font-display font-black text-2xl text-white mb-6">Customer Reviews</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {generateReviews(product.rating).map(rev => (
              <div key={rev.id} className="glass border border-white/5 rounded-2xl p-5 hover:border-white/10 transition-all duration-300">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <div className="font-semibold text-white text-sm">{rev.author}</div>
                    <div className="text-[10px] text-slate-500 mt-0.5">{rev.date}</div>
                  </div>
                  <div className="flex text-xs">{starsEl(rev.rating)}</div>
                </div>
                <h4 className="text-sm font-bold text-white mb-1.5">{rev.title}</h4>
                <p className="text-slate-300 text-xs leading-relaxed">{rev.comment}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Related Products */}
        {related.length > 0 && (
          <div>
            <h2 className="font-display font-black text-2xl text-white mb-6">Related Products</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {related.map(p => (
                <ProductCard key={p._id} product={p} />
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default ProductDetails;
