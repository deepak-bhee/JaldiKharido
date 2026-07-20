import { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { apiFetch, formatPrice } from '../../api';
import { AnimatedThemeToggler } from '../AnimatedThemeToggler';


const Navbar = () => {
  const { user, isLoggedIn, isAdmin, logout } = useAuth();
  const { cartCount } = useCart();
  const location = useLocation();
  const navigate  = useNavigate();
  const [open, setOpen]       = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Magic Search States
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const searchContainerRef = useRef(null);
  const mobileSearchContainerRef = useRef(null);

  // Search History State
  const [searchHistory, setSearchHistory] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('searchHistory')) || [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('searchHistory', JSON.stringify(searchHistory));
  }, [searchHistory]);

  const addToHistory = (query) => {
    if (!query.trim()) return;
    const cleanQuery = query.trim();
    setSearchHistory(prev => {
      const filtered = prev.filter(item => item.toLowerCase() !== cleanQuery.toLowerCase());
      return [cleanQuery, ...filtered].slice(0, 5);
    });
  };

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close drawer and search on route change
  useEffect(() => {
    setOpen(false);
    setShowSuggestions(false);
    setSearchQuery('');
  }, [location.pathname]);

  // Click outside to close recommendations (both desktop & mobile containers)
  useEffect(() => {
    const handleClickOutside = (event) => {
      const clickedDesktop = searchContainerRef.current && searchContainerRef.current.contains(event.target);
      const clickedMobile = mobileSearchContainerRef.current && mobileSearchContainerRef.current.contains(event.target);
      if (!clickedDesktop && !clickedMobile) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounced API fetch for search recommendations
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSuggestions([]);
      return;
    }

    const delayDebounceFn = setTimeout(async () => {
      setSearchLoading(true);
      try {
        const data = await apiFetch(`/products?search=${encodeURIComponent(searchQuery)}&limit=5`);
        setSuggestions(data.products || []);
        setShowSuggestions(true);
      } catch (err) {
        console.error(err);
      } finally {
        setSearchLoading(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      addToHistory(searchQuery);
      navigate(`/catalog?search=${encodeURIComponent(searchQuery)}`);
      setShowSuggestions(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navLink = (to, label) => {
    const active = location.pathname === to;
    return (
      <Link
        to={to}
        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200
          ${active
            ? 'text-brand bg-brand/10'
            : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
      >
        {label}
      </Link>
    );
  };

  // Reusable Suggestions Dropdown Component
  const renderSuggestions = () => {
    if (!showSuggestions) return null;

    if (!searchQuery.trim() && searchHistory.length > 0) {
      return (
        <div className="absolute top-full left-0 right-0 mt-2 glass border border-white/10 rounded-2xl overflow-hidden shadow-2xl z-[999] p-3 animate-fade text-left">
          <div className="flex justify-between items-center text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2 px-1">
            <span>Recent Searches</span>
            <button 
              type="button" 
              onClick={(e) => { e.stopPropagation(); setSearchHistory([]); }}
              className="hover:text-brand transition-colors text-[9px] cursor-pointer"
            >
              Clear All
            </button>
          </div>
          <div className="divide-y divide-white/5">
            {searchHistory.map((query, index) => (
              <div key={index} className="flex items-center justify-between py-2 px-1 hover:bg-white/[0.02] rounded-lg transition-colors group">
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery(query);
                    navigate(`/catalog?search=${encodeURIComponent(query)}`);
                    setShowSuggestions(false);
                  }}
                  className="flex items-center gap-2 text-xs text-slate-300 hover:text-white flex-1 text-left"
                >
                  <span>🕒</span>
                  <span className="truncate">{query}</span>
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSearchHistory(prev => prev.filter((_, i) => i !== index));
                  }}
                  className="text-slate-500 hover:text-red-400 px-2 text-xs transition-colors cursor-pointer"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>
      );
    }

    if (searchQuery.trim()) {
      if (suggestions.length > 0) {
        return (
          <div className="absolute top-full left-0 right-0 mt-2 glass border border-white/10 rounded-2xl overflow-hidden shadow-2xl z-[999] divide-y divide-white/5 animate-fade text-left">
            {suggestions.map((p) => (
              <Link 
                key={p._id} 
                to={`/product/${p._id}`}
                onClick={() => { 
                  addToHistory(p.name);
                  setShowSuggestions(false); 
                  setSearchQuery(''); 
                }}
                className="flex items-center gap-3 p-3 hover:bg-white/[0.04] transition-colors"
              >
                <img src={p.image} alt={p.name} className="w-8 h-8 rounded-lg object-cover bg-surface-secondary border border-white/5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-semibold text-white truncate">{p.name}</div>
                  <div className="text-[10px] text-slate-400">{p.category}</div>
                </div>
                <div className="text-xs font-bold text-brand flex-shrink-0">{formatPrice(p.price)}</div>
              </Link>
            ))}
          </div>
        );
      } else if (!searchLoading) {
        return (
          <div className="absolute top-full left-0 right-0 mt-2 glass border border-white/10 rounded-2xl p-4 text-center text-xs text-slate-400 shadow-2xl z-[999] animate-fade">
            No items found matching "{searchQuery}" 🔍
          </div>
        );
      }
    }

    return null;
  };

  const isHomepage = location.pathname === '/';

  return (
    <>
      {/* Outer Floating Wrapper Container */}
      <div className={`fixed top-0 left-0 right-0 z-[1000] transition-all duration-500 cubic-bezier(0.16, 1, 0.3, 1)
        ${scrolled ? 'p-3' : 'p-0'}`}
      >
        <nav className={`relative w-full mx-auto transition-all duration-500 cubic-bezier(0.16, 1, 0.3, 1)
          ${scrolled
            ? 'max-w-6xl bg-surface/85 backdrop-blur-md border border-white/10 rounded-2xl shadow-[0_12px_40px_rgba(0,0,0,0.6)] px-4 sm:px-6'
            : 'max-w-7xl bg-transparent border-b border-white/[0.06] rounded-none px-4 sm:px-6 lg:px-8'}`}
        >
          <div className={`flex items-center justify-between gap-4 transition-all duration-500 cubic-bezier(0.16, 1, 0.3, 1)
            ${scrolled ? 'h-14' : 'h-20'}`}
          >
            
            {/* Brand */}
            <Link to="/" className="flex items-center gap-1.5 group flex-shrink-0">
              <span className="text-xl sm:text-2xl group-hover:animate-pulse-dot">⚡</span>
              <span className="font-display font-black text-base sm:text-xl tracking-tight">
                <span className="gradient-text">Jaldi</span>
                <span className="text-white">Kharidoo</span>
              </span>
            </Link>

            {/* Desktop Magic Search Bar */}
            {!isAdmin() && (
              <div ref={searchContainerRef} className="hidden md:block flex-1 max-w-md relative mx-2">
                <form onSubmit={handleSearchSubmit} className="relative">
                  <input
                    type="text"
                    placeholder="Search products, brands and more... ⚡"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => setShowSuggestions(true)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-4 pr-10 py-1.5 text-xs text-white focus:outline-none focus:border-brand/50 transition-all placeholder:text-slate-500"
                  />
                  <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors">
                    {searchLoading ? (
                      <div className="w-3.5 h-3.5 border-2 border-brand border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <circle cx="11" cy="11" r="8"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="m21 21-4.35-4.35"/>
                      </svg>
                    )}
                  </button>
                </form>

                {/* Desktop Suggestions */}
                {renderSuggestions()}
              </div>
            )}

            {/* Desktop links */}
            <div className="hidden md:flex items-center gap-1 flex-shrink-0">
              {isAdmin() ? (
                navLink('/admin', '⚙️ Admin Dashboard')
              ) : (
                <>
                  {navLink('/', 'Home')}
                  {navLink('/catalog', 'Shop')}
                  {isLoggedIn() && navLink('/orders', 'My Orders')}
                </>
              )}
            </div>

            {/* Desktop right actions */}
            <div className="hidden md:flex items-center gap-3 flex-shrink-0">
              <AnimatedThemeToggler />
              {!isAdmin() && (
                <Link
                  to="/cart"
                  className="relative p-2 text-slate-400 hover:text-white transition-colors rounded-lg hover:bg-white/5"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13l-1.5 6M7 13l-1-4M17 13l1.5 6M9 21a1 1 0 100-2 1 1 0 000 2zm8 0a1 1 0 100-2 1 1 0 000 2z" />
                  </svg>
                  {cartCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-brand text-white text-[10px] font-bold
                      w-4 h-4 rounded-full flex items-center justify-center">
                      {cartCount > 9 ? '9+' : cartCount}
                    </span>
                  )}
                </Link>
              )}

              {isLoggedIn() ? (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-slate-400 hidden lg:block">
                    Hi, {user?.name?.split(' ')[0]}
                  </span>
                  <button
                    onClick={handleLogout}
                    className="px-4 py-1.5 text-sm font-medium text-slate-400 border border-white/10
                      rounded-lg hover:border-red-500/50 hover:text-red-400 transition-all"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <Link
                  to="/login"
                  className="px-4 py-1.5 text-sm font-semibold bg-gradient-btn text-white
                    rounded-lg hover:shadow-glow transition-all"
                >
                  Sign In
                </Link>
              )}
            </div>

            {/* Mobile: cart + hamburger */}
            <div className="flex md:hidden items-center gap-1 flex-shrink-0">
              <AnimatedThemeToggler />
              {!isAdmin() && (
                <Link to="/cart" className="relative p-2.5 text-slate-400 hover:text-white rounded-xl hover:bg-white/5 transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13l-1.5 6M17 13l1.5 6M9 21a1 1 0 100-2 1 1 0 000 2zm8 0a1 1 0 100-2 1 1 0 000 2z" />
                  </svg>
                  {cartCount > 0 && (
                    <span className="absolute top-0.5 right-0.5 bg-brand text-white text-[9px] font-bold
                      w-4 h-4 rounded-full flex items-center justify-center">
                      {cartCount > 9 ? '9+' : cartCount}
                    </span>
                  )}
                </Link>
              )}
              {/* Hamburger Toggle Button */}
              <button
                type="button"
                onClick={() => setOpen(o => !o)}
                className={`p-2.5 rounded-xl transition-all duration-200 min-w-[44px] min-h-[44px] flex items-center justify-center border
                  ${open 
                    ? 'text-white bg-brand/20 border-brand/40 shadow-glow' 
                    : 'text-slate-300 hover:text-white bg-white/5 border-white/10 hover:bg-white/10'}`}
                aria-label={open ? 'Close navigation menu' : 'Open navigation menu'}
                aria-expanded={open}
              >
                {open ? (
                  <svg className="w-6 h-6 text-brand" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : (
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Mobile Search — shown on ALL pages (not just homepage) */}
          {!isAdmin() && (
            <div ref={mobileSearchContainerRef} className="md:hidden pb-3 relative">
              <form onSubmit={handleSearchSubmit} className="relative">
                <input
                  type="text"
                  placeholder="Search products, brands... ⚡"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setShowSuggestions(true)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-4 pr-10 py-2 text-sm text-white focus:outline-none focus:border-brand/50 focus:ring-1 focus:ring-brand/30 transition-all placeholder:text-slate-500"
                />
                <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors">
                  {searchLoading ? (
                    <div className="w-3.5 h-3.5 border-2 border-brand border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <circle cx="11" cy="11" r="8"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="m21 21-4.35-4.35"/>
                    </svg>
                  )}
                </button>
              </form>
              {renderSuggestions()}
            </div>
          )}

          {/* Mobile drawer */}
          <div className={`md:hidden nav-drawer ${open ? 'open' : 'closed'}
            absolute top-full left-0 right-0 mt-2 bg-surface/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-[1100]`}
          >
            <div className="px-3 pt-3 pb-4 flex flex-col gap-0.5">
              {isAdmin() ? (
                <MobileLink to="/admin" label="⚙️ Admin Dashboard" active={location.pathname === '/admin'} />
              ) : (
                <>
                  <MobileLink to="/"        label="🏠 Home"      active={location.pathname === '/'} />
                  <MobileLink to="/catalog" label="🛍️ Shop"      active={location.pathname === '/catalog'} />
                  {isLoggedIn() && <MobileLink to="/orders" label="📦 My Orders" active={location.pathname === '/orders'} />}
                  {isLoggedIn() && <MobileLink to="/cart"   label="🛒 Cart" active={location.pathname === '/cart'} />}
                </>
              )}

              <div className="border-t border-white/[0.06] mt-3 pt-3">
                {isLoggedIn() ? (
                  <div className="flex items-center justify-between px-1">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-brand/20 flex items-center justify-center text-sm">
                        {user?.name?.charAt(0).toUpperCase()}
                      </div>
                      <span className="text-sm text-slate-300 font-medium">{user?.name}</span>
                    </div>
                    <button onClick={handleLogout}
                      className="text-sm text-red-400 border border-red-500/30 px-3 py-1.5 rounded-lg hover:bg-red-500/10 transition-colors">
                      Logout
                    </button>
                  </div>
                ) : (
                  <Link to="/login" className="block w-full text-center py-3 bg-gradient-btn text-white font-semibold rounded-xl text-sm">
                    Sign In →
                  </Link>
                )}
              </div>
            </div>
          </div>
        </nav>
      </div>

      {/* Blurred Backdrop Overlays */}
      
      {/* 1. Search Suggestions Overlay (dims and blurs main content when search focuses) */}
      {showSuggestions && !isAdmin() && (
        <div 
          onClick={() => setShowSuggestions(false)}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[900] animate-fade"
        />
      )}

      {/* 2. Mobile Drawer Overlay (dims and blurs main content when hamburger is open) */}
      {open && (
        <div 
          onClick={() => setOpen(false)}
          className="fixed inset-0 bg-black/40 backdrop-blur-md z-[900] md:hidden animate-fade"
        />
      )}

      {/* Spacer - accounts for navbar height + mobile search bar */}
      <div className={`transition-all duration-500 ${!isAdmin() ? 'h-[110px] md:h-20' : 'h-20'}`} />
    </>
  );
};

const MobileLink = ({ to, label, active }) => (
  <Link to={to}
    className={`flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all duration-200 min-h-[48px]
      ${active
        ? 'text-brand bg-brand/10 border border-brand/20'
        : 'text-slate-300 hover:text-white hover:bg-white/5'}`}>
    {label}
  </Link>
);

export default Navbar;
