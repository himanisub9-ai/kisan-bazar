import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import productService from '../services/productService';
import { useCart } from '../hooks/useCart';
import { useAuth } from '../hooks/useAuth';
import Loading from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';

export const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { isAuthenticated, isConsumer } = useAuth();

  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionFeedback, setActionFeedback] = useState(null);
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await productService.getProductById(id);
        setProduct(data);
      } catch (err) {
        setError(err.response?.data?.detail || 'Produce not found or failed to load.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  if (isLoading) {
    return <Loading fullScreen message="Loading produce details..." />;
  }

  if (error || !product) {
    return (
      <div className="page-wrapper container" style={{ maxWidth: '600px' }}>
        <ErrorMessage message={error || 'Product not found'} />
        <Link to="/products" className="btn btn-primary">
          ← Back to Marketplace
        </Link>
      </div>
    );
  }

  const isOutOfStock = product.quantity_available <= 0;
  const maxAvailable = product.quantity_available;

  const handleQuantityChange = (newQty) => {
    if (newQty < 1) return;
    if (newQty > maxAvailable) return;
    setQuantity(newQty);
  };

  const handleAddToCart = async (goToCart = false) => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: { pathname: `/products/${product.id}` } } });
      return;
    }

    if (!isConsumer) {
      setActionFeedback({ type: 'error', message: 'Only consumers can add products to cart.' });
      return;
    }

    if (isOutOfStock) return;

    try {
      setIsAdding(true);
      const res = await addToCart(product.id, quantity);
      if (res.success) {
        setActionFeedback({ type: 'success', message: `Added ${quantity} ${product.unit} to your cart!` });
        if (goToCart) {
          navigate('/consumer/cart');
        }
      } else {
        setActionFeedback({ type: 'error', message: res.error || 'Failed to add item.' });
      }
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <div className="page-wrapper container">
      {/* Breadcrumbs */}
      <nav style={{ display: 'flex', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
        <Link to="/" style={{ color: 'var(--text-muted)' }}>Home</Link>
        <span>/</span>
        <Link to="/products" style={{ color: 'var(--text-muted)' }}>Marketplace</Link>
        <span>/</span>
        {product.category && (
          <>
            <Link to={`/products?category=${encodeURIComponent(product.category.name)}`} style={{ color: 'var(--text-muted)' }}>
              {product.category.name}
            </Link>
            <span>/</span>
          </>
        )}
        <span style={{ color: '#0f172a', fontWeight: 600 }}>{product.name}</span>
      </nav>

      {/* Main Details Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '3rem',
          backgroundColor: '#ffffff',
          borderRadius: 'var(--radius-lg)',
          padding: '2.5rem',
          border: '1px solid var(--border-subtle)',
          boxShadow: 'var(--shadow-sm)',
          marginBottom: '3rem',
        }}
      >
        {/* Left: Product Image */}
        <div style={{ position: 'relative', borderRadius: 'var(--radius-lg)', overflow: 'hidden', backgroundColor: '#f8fafc', height: '440px' }}>
          <img
            src={product.image_url || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80'}
            alt={product.name}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
          {product.category && (
            <span
              style={{
                position: 'absolute',
                top: '16px',
                left: '16px',
                backgroundColor: 'rgba(21, 128, 61, 0.95)',
                color: '#ffffff',
                fontSize: '0.825rem',
                fontWeight: 700,
                padding: '0.35rem 0.85rem',
                borderRadius: 'var(--radius-full)',
                backdropFilter: 'blur(4px)',
              }}
            >
              {product.category.name}
            </span>
          )}
        </div>

        {/* Right: Product Info & Purchase Controls */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <h1 style={{ fontSize: '2.25rem', color: '#0f172a', marginBottom: '0.5rem', lineHeight: 1.2 }}>
            {product.name}
          </h1>

          {/* Farmer Attribution */}
          {product.farmer && (
            <Link
              to={`/products?farmer_id=${product.farmer.id}`}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.75rem 1rem',
                backgroundColor: '#f0fdf4',
                borderRadius: 'var(--radius-md)',
                border: '1px solid #dcfce7',
                marginBottom: '1.5rem',
                transition: 'border-color 0.2s, background-color 0.2s',
              }}
              title={`Browse all harvests from ${product.farmer.farm_name || product.farmer.name}`}
            >
              <span style={{ fontSize: '1.25rem' }}>🚜</span>
              <div style={{ flex: 1 }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--primary-800)', fontWeight: 700 }}>
                  Grown by {product.farmer.farm_name || product.farmer.name} →
                </span>
                {product.farmer.farm_location && (
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    📍 {product.farmer.farm_location}
                  </div>
                )}
              </div>
            </Link>
          )}

          {/* Price Bar */}
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginBottom: '1.25rem' }}>
            <span style={{ fontSize: '2.4rem', fontWeight: 800, color: '#15803d', fontFamily: 'var(--font-display)' }}>
              ₹{product.price}
            </span>
            <span style={{ fontSize: '1.1rem', color: 'var(--text-muted)', fontWeight: 600 }}>
              per {product.unit}
            </span>
          </div>

          {/* Stock Availability */}
          <div style={{ marginBottom: '1.5rem' }}>
            {isOutOfStock ? (
              <span className="badge badge-cancelled" style={{ fontSize: '0.85rem', padding: '0.4rem 0.8rem' }}>
                ❌ Currently Out of Stock
              </span>
            ) : (
              <span className="badge badge-delivered" style={{ fontSize: '0.85rem', padding: '0.4rem 0.8rem' }}>
                ✓ In Stock: {product.quantity_available} {product.unit} available
              </span>
            )}
          </div>

          {/* Description */}
          <div style={{ marginBottom: '2rem' }}>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#334155', marginBottom: '0.5rem' }}>
              Produce Information
            </h4>
            <p style={{ color: 'var(--text-muted)', lineHeight: 1.7, fontSize: '0.95rem' }}>
              {product.description || 'Freshly harvested agricultural produce cultivated under natural farming practices.'}
            </p>
          </div>

          {/* Action Feedback message */}
          {actionFeedback && (
            <div
              style={{
                padding: '0.75rem 1rem',
                borderRadius: 'var(--radius-md)',
                backgroundColor: actionFeedback.type === 'success' ? '#ecfdf5' : '#fef2f2',
                color: actionFeedback.type === 'success' ? '#065f46' : '#991b1b',
                border: `1px solid ${actionFeedback.type === 'success' ? '#a7f3d0' : '#fecaca'}`,
                marginBottom: '1.25rem',
                fontSize: '0.9rem',
                fontWeight: 600,
              }}
            >
              {actionFeedback.message}
            </div>
          )}

          {/* Quantity Selector & Add to Cart */}
          {!isOutOfStock ? (
            <div style={{ marginTop: 'auto', paddingTop: '1.5rem', borderTop: '1px solid var(--border-light)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem' }}>
                <span style={{ fontWeight: 600, fontSize: '0.9rem', color: '#1e293b' }}>Select Quantity:</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <button
                    type="button"
                    onClick={() => handleQuantityChange(quantity - 1)}
                    disabled={quantity <= 1 || isAdding}
                    className="btn btn-secondary btn-sm"
                    style={{ width: '36px', height: '36px', padding: 0, fontSize: '1rem' }}
                  >
                    -
                  </button>
                  <input
                    type="number"
                    min="1"
                    max={maxAvailable}
                    value={quantity}
                    onChange={(e) => handleQuantityChange(parseFloat(e.target.value) || 1)}
                    style={{
                      width: '60px',
                      height: '36px',
                      textAlign: 'center',
                      fontWeight: 700,
                      borderRadius: 'var(--radius-sm)',
                      border: '1.5px solid var(--border-light)',
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => handleQuantityChange(quantity + 1)}
                    disabled={quantity >= maxAvailable || isAdding}
                    className="btn btn-secondary btn-sm"
                    style={{ width: '36px', height: '36px', padding: 0, fontSize: '1rem' }}
                  >
                    +
                  </button>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginLeft: '0.25rem' }}>
                    {product.unit} (Subtotal: <strong>₹{(product.price * quantity).toFixed(2)}</strong>)
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  onClick={() => handleAddToCart(false)}
                  disabled={isAdding}
                  className="btn btn-primary btn-lg"
                  style={{ flex: 1 }}
                >
                  {isAdding ? 'Adding...' : '🛒 Add to Cart'}
                </button>
                <button
                  type="button"
                  onClick={() => handleAddToCart(true)}
                  disabled={isAdding}
                  className="btn btn-accent btn-lg"
                  style={{ flex: 1 }}
                >
                  ⚡ Buy Now
                </button>
              </div>
            </div>
          ) : (
            <div style={{ marginTop: 'auto', padding: '1.5rem', backgroundColor: '#f8fafc', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
              <p style={{ color: '#dc2626', fontWeight: 600 }}>This harvest is currently sold out.</p>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '4px' }}>
                The farmer will replenish inventory after the next morning harvest.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Farm & Origin Profile Card */}
      {product.farmer && (
        <div className="card" style={{ padding: '2rem', marginBottom: '3rem' }}>
          <h3 style={{ fontSize: '1.35rem', marginBottom: '1rem', color: '#0f172a' }}>
            About the Origin Farm: {product.farmer.farm_name || product.farmer.name}
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.5rem' }}>
            <div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>FARM LOCATION</div>
              <div style={{ fontSize: '1rem', fontWeight: 600, color: '#1e293b', marginTop: '2px' }}>
                📍 {product.farmer.farm_location || 'Rural India'}
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600, marginTop: '1rem' }}>FARMER PARTNER</div>
              <div style={{ fontSize: '1rem', fontWeight: 600, color: '#1e293b', marginTop: '2px' }}>
                👤 {product.farmer.name}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>AGRICULTURAL PRACTICES</div>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: 1.6, marginTop: '2px' }}>
                {product.farmer.farm_description || 'Committed to organic manure enrichment, indigenous pest management, and pure natural soil rejuvenation.'}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetails;
