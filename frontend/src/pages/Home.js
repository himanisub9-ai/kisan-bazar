import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import productService from '../services/productService';
import SearchBar from '../components/SearchBar';
import ProductGrid from '../components/ProductGrid';
import CategoryFilter from '../components/CategoryFilter';
import Loading from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';

export const Home = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [cats, prods] = await Promise.all([
          productService.getCategories(),
          productService.getProducts({ sort: 'newest' }),
        ]);
        setCategories(cats);
        setFeaturedProducts(prods.slice(0, 8)); // Top 8 featured harvests
      } catch (err) {
        setError('Failed to load marketplace harvests. Please ensure the backend is running.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleSearch = (term) => {
    navigate(`/products?search=${encodeURIComponent(term)}`);
  };

  const handleSelectCategory = (categoryName) => {
    if (categoryName) {
      navigate(`/products?category=${encodeURIComponent(categoryName)}`);
    } else {
      navigate('/products');
    }
  };

  return (
    <div>
      {/* Hero Section */}
      <section
        style={{
          background: 'radial-gradient(circle at 10% 20%, rgb(20, 83, 45) 0%, rgb(5, 46, 22) 90.1%)',
          color: '#ffffff',
          padding: '4.5rem 0 5rem',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Subtle decorative background pattern */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: 'radial-gradient(rgba(255, 255, 255, 0.08) 1px, transparent 1px)',
            backgroundSize: '24px 24px',
            pointerEvents: 'none',
          }}
        />

        <div className="container" style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              backgroundColor: 'rgba(255, 255, 255, 0.12)',
              backdropFilter: 'blur(8px)',
              padding: '0.4rem 1rem',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.85rem',
              fontWeight: 600,
              color: '#86efac',
              marginBottom: '1.5rem',
              border: '1px solid rgba(134, 239, 172, 0.25)',
            }}
          >
            <span>🌿</span> Direct From Local Organic Farms • 0% Middlemen Commission
          </div>

          <h1
            style={{
              fontSize: '3.25rem',
              fontWeight: 800,
              letterSpacing: '-0.03em',
              maxWidth: '820px',
              margin: '0 auto 1.25rem',
              lineHeight: 1.15,
              color: '#ffffff',
            }}
          >
            Fresh Agricultural Harvests, <span style={{ color: '#f59e0b' }}>Direct to Your Kitchen</span>
          </h1>

          <p
            style={{
              fontSize: '1.15rem',
              color: '#bbf7d0',
              maxWidth: '640px',
              margin: '0 auto 2.25rem',
              lineHeight: 1.6,
            }}
          >
            Connect directly with verified local farmers. Enjoy freshly harvested chemical-free 
            vegetables, seasonal orchard fruits, indigenous dairy, and stone-ground grains.
          </p>

          {/* Search Box in Hero */}
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '2rem' }}>
            <SearchBar onSearch={handleSearch} />
          </div>

          {/* Quick Category Badges */}
          <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '0.5rem', alignItems: 'center' }}>
            <span style={{ fontSize: '0.85rem', color: '#86efac', fontWeight: 600 }}>Popular:</span>
            {['Vegetables', 'Fruits', 'Dairy', 'Grains', 'Spices'].map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => handleSelectCategory(cat)}
                style={{
                  background: 'rgba(255, 255, 255, 0.15)',
                  border: '1px solid rgba(255, 255, 255, 0.25)',
                  color: '#ffffff',
                  padding: '0.3rem 0.8rem',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '0.825rem',
                  cursor: 'pointer',
                  transition: 'background 0.2s',
                }}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Categories Carousel / Bar */}
      <section style={{ padding: '2.5rem 0', backgroundColor: '#ffffff', borderBottom: '1px solid var(--border-light)' }}>
        <div className="container">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1.25rem', color: '#0f172a' }}>Marketplace Categories</h3>
            <Link to="/products" style={{ color: 'var(--primary-700)', fontWeight: 600, fontSize: '0.9rem' }}>
              View All Categories →
            </Link>
          </div>
          <CategoryFilter
            categories={categories}
            selectedCategory={selectedCategory}
            onSelectCategory={handleSelectCategory}
          />
        </div>
      </section>

      {/* Featured Harvests Grid */}
      <section className="page-wrapper container">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.75rem' }}>
          <div>
            <h2 style={{ color: '#0f172a', marginBottom: '0.25rem' }}>Today's Fresh Harvests</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.925rem' }}>
              Handpicked chemical-free produce harvested this morning by our farming partners
            </p>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <Link to="/farmers" className="btn btn-secondary btn-sm">
              🚜 Meet Our Farmers
            </Link>
            <Link to="/products" className="btn btn-primary btn-sm">
              Explore All Produce ({featuredProducts.length}+) →
            </Link>
          </div>
        </div>

        {error && <ErrorMessage message={error} />}
        {isLoading ? (
          <Loading message="Fetching fresh farm harvests..." />
        ) : (
          <ProductGrid products={featuredProducts} />
        )}
      </section>

      {/* How KisanBazar Works */}
      <section style={{ backgroundColor: '#ffffff', padding: '4.5rem 0', borderTop: '1px solid var(--border-light)', borderBottom: '1px solid var(--border-light)' }}>
        <div className="container" style={{ textAlign: 'center' }}>
          <div style={{ maxWidth: '600px', margin: '0 auto 3rem' }}>
            <h2 style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>How KisanBazar Empowers You</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '1rem' }}>
              A transparent, short-chain digital ecosystem bringing farmers and consumers together.
            </p>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '2rem',
              textAlign: 'left',
            }}
          >
            {/* Step 1 */}
            <div className="card" style={{ padding: '2rem', borderTop: '4px solid #16a34a' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>🚜</div>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>1. Farmers Harvest & List</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.6 }}>
                Farmers register, detail their farm practices, and list agricultural produce directly at fair, transparent prices without middleman exploitation.
              </p>
            </div>

            {/* Step 2 */}
            <div className="card" style={{ padding: '2rem', borderTop: '4px solid #d97706' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>🛒</div>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>2. Consumers Order Direct</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.6 }}>
                Browse verified farm harvests, view exact farmer and soil details, add items to cart, and checkout with Cash on Delivery or Instant Online Mock Payment.
              </p>
            </div>

            {/* Step 3 */}
            <div className="card" style={{ padding: '2rem', borderTop: '4px solid #0ea5e9' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>📦</div>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>3. Farm-Fresh Fulfillment</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.6 }}>
                Orders are packed directly at the source farm and delivered to your doorstep. Both farmer and consumer track status step-by-step from harvest to delivery.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Farmer Join Callout Section */}
      <section style={{ padding: '4rem 0', backgroundColor: '#f0fdf4' }}>
        <div className="container">
          <div
            style={{
              backgroundColor: '#14532d',
              borderRadius: 'var(--radius-lg)',
              padding: '3rem 2.5rem',
              color: '#ffffff',
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '2rem',
              backgroundImage: 'radial-gradient(circle at 90% 10%, rgba(245, 158, 11, 0.25) 0%, transparent 60%)',
            }}
          >
            <div style={{ maxWidth: '600px' }}>
              <span style={{ color: '#86efac', fontWeight: 700, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                For Agricultural Producers
              </span>
              <h2 style={{ color: '#ffffff', fontSize: '2rem', marginTop: '0.4rem', marginBottom: '0.85rem' }}>
                Are You a Farmer? Sell Directly to Thousands of Conscious Consumers
              </h2>
              <p style={{ color: '#bbf7d0', fontSize: '0.975rem', lineHeight: 1.6 }}>
                Set your own product prices, maintain complete control over your inventory, and receive 
                transparent, prompt payouts without paying broker fees.
              </p>
            </div>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <Link to="/register?role=farmer" className="btn btn-accent btn-lg">
                Register as Farmer Partner →
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
