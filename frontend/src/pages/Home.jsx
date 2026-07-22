import { useState, useEffect } from 'react';
import IntroLoader from '../components/IntroLoader';
import HeroSection from '../components/HeroSection';
import MarqueeStrip from '../components/MarqueeStrip';
import CategoryGrid from '../components/CategoryGrid';
import ProductCard from '../components/ProductCard';
import FeaturesSection from '../components/FeaturesSection';
import DecayCategorySection from '../components/DecayCategorySection';
import { apiFetch } from '../api';

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

const Home = () => {
  const [loadingApp, setLoadingApp] = useState(() => !sessionStorage.getItem('jk_loaded'));
  const [featured, setFeatured] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const data = await apiFetch('/products?limit=8'); // Just fetch top 8 for home
        setFeatured(data.products || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchFeatured();
  }, []);

  const handleLoaderDone = () => {
    setLoadingApp(false);
    sessionStorage.setItem('jk_loaded', 'true');
  };

  return (
    <div className="bg-surface">
      {loadingApp && <IntroLoader onDone={handleLoaderDone} />}

      <HeroSection />
      <MarqueeStrip />
      <CategoryGrid />

      {/* Featured Products */}
      <section id="catalog" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex items-end justify-between mb-10">
          <div>
            <span className="text-brand text-sm font-semibold tracking-widest uppercase">Trending</span>
            <h2 className="font-display font-black text-3xl sm:text-4xl text-white mt-2">
              Featured Products
            </h2>
          </div>
          <a href="/catalog" className="text-sm font-semibold text-brand hover:text-white transition-colors">
            View All →
          </a>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {Array(8).fill(0).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {featured.map(p => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>
        )}
      </section>

      <FeaturesSection />
      <DecayCategorySection />
    </div>
  );
};

export default Home;
