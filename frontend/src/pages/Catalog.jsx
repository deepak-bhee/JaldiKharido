import { useState, useEffect, useRef, Fragment } from 'react';
import { useSearchParams } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import { apiFetch } from '../api';

const CATEGORIES = ['All','Electronics','Clothing','Books','Home & Garden','Sports','Beauty'];

const SkeletonCard = () => (
  <div className="glass border border-white/[0.07] rounded-2xl overflow-hidden">
    <div className="skeleton aspect-square" />
    <div className="p-4 space-y-2">
      <div className="skeleton h-3 w-1/4 rounded" />
      <div className="skeleton h-4 w-3/4 rounded" />
      <div className="skeleton h-3 w-1/2 rounded" />
      <div className="skeleton h-8 w-2/5 rounded mt-2" />
      <div className="skeleton h-9 rounded-xl mt-2" />
    </div>
  </div>
);

const Catalog = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts]  = useState([]);
  const [loading,  setLoading]   = useState(true);
  const [total,    setTotal]     = useState(0);
  const [pages,    setPages]     = useState(1);
  const [page,     setPage]      = useState(1);

  const [search,   setSearch]    = useState('');
  const [category, setCategory]  = useState(searchParams.get('category') || 'All');
  const [sort,     setSort]      = useState('createdAt');

  const searchTimer = useRef(null);

  const load = async (pg = 1, cat = category, q = search, s = sort) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: pg, limit: 12, sort: s });
      if (q)           params.append('search', q);
      if (cat !== 'All') params.append('category', cat);
      const data = await apiFetch(`/products?${params}`);
      setProducts(data.products || []);
      setTotal(data.total || 0);
      setPages(data.pages || 1);
      setPage(pg);
    } catch (err) {
      console.error('Failed to load products:', err);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const cat = searchParams.get('category');
    if (cat) setCategory(cat);
    load(1, cat || category);
  }, []); // eslint-disable-line

  const handleSearch = (val) => {
    setSearch(val);
    clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => load(1, category, val, sort), 400);
  };

  const handleCategory = (c) => {
    setCategory(c);
    setSearchParams(c !== 'All' ? { category: c } : {});
    load(1, c, search, sort);
  };

  const handleSort = (s) => {
    setSort(s);
    load(1, category, search, s);
  };

  const Pagination = () => {
    if (pages <= 1) return null;
    return (
      <div className="flex flex-wrap justify-center gap-2 mt-8">
        {page > 1 && (
          <button onClick={() => load(page - 1)}
            className="px-3 py-1.5 glass border border-white/10 rounded-lg text-sm hover:border-brand/40">‹</button>
        )}
        {Array.from({ length: pages }, (_, i) => i + 1)
          .filter(p => p === 1 || p === pages || Math.abs(p - page) <= 2)
          .map((p, idx, arr) => (
            <Fragment key={p}>
              {idx > 0 && arr[idx - 1] !== p - 1 && (
                <span className="px-3 py-1.5 text-slate-600">…</span>
              )}
              <button onClick={() => load(p)}
                className={`px-3 py-1.5 rounded-lg text-sm border transition-all ${p === page
                  ? 'bg-brand border-brand text-white'
                  : 'glass border-white/10 hover:border-brand/40'}`}>
                {p}
              </button>
            </Fragment>
          ))}
        {page < pages && (
          <button onClick={() => load(page + 1)}
            className="px-3 py-1.5 glass border border-white/10 rounded-lg text-sm hover:border-brand/40">›</button>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-surface">
      {/* Header */}
      <div className="border-b border-white/[0.06] py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="font-display font-black text-3xl text-white">
            {category === 'All' ? '🛍️ All Products' : `${category}`}
          </h1>
          <p className="text-slate-500 mt-1 text-sm">{total} products found</p>
        </div>
      </div>

      {/* Filters */}
      <div className="sticky top-16 z-30 bg-surface/95 backdrop-blur-xl border-b border-white/[0.04]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search */}
            <div className="relative flex-1">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600"
                fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <circle cx="11" cy="11" r="8"/><path strokeLinecap="round" strokeLinejoin="round" d="m21 21-4.35-4.35"/>
              </svg>
              <input
                type="text"
                placeholder="Search products…"
                value={search}
                onChange={e => handleSearch(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 py-2 text-sm
                  text-white placeholder-slate-600 focus:outline-none focus:border-brand/50 transition"
              />
            </div>
            {/* Sort */}
            <select
              value={sort}
              onChange={e => handleSort(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm text-slate-400
                focus:outline-none focus:border-brand/50 transition min-w-[160px]"
            >
              <option value="createdAt">Newest First</option>
              <option value="price-asc">Price: Low → High</option>
              <option value="price-desc">Price: High → Low</option>
              <option value="rating">Top Rated</option>
              <option value="name">Name A–Z</option>
            </select>
          </div>

          {/* Category pills */}
          <div className="flex gap-2 mt-3 overflow-x-auto pb-1 scrollbar-hide">
            {CATEGORIES.map(c => (
              <button
                key={c}
                onClick={() => handleCategory(c)}
                className={`flex-shrink-0 px-4 py-1.5 rounded-full text-xs font-semibold transition-all
                  ${category === c
                    ? 'bg-brand text-white'
                    : 'glass border border-white/10 text-slate-400 hover:border-brand/40 hover:text-white'}`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array(8).fill(0).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : products.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-bold text-white mb-2">No products found</h3>
            <p className="text-slate-500 mb-6">Try adjusting your search or filters</p>
            <button onClick={() => { setSearch(''); handleCategory('All'); }}
              className="px-6 py-2 glass border border-white/10 rounded-xl text-sm hover:border-brand/40 transition">
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {products.map(p => <ProductCard key={p._id} product={p} />)}
          </div>
        )}
        <Pagination />
      </div>
    </div>
  );
};

export default Catalog;
