import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../hooks/useCart';
import { useAuth } from '../hooks/useAuth';

export const ProductCard = ({ product }) => {
  const { addToCart } = useCart();
  const { isAuthenticated, isConsumer } = useAuth();
  const navigate = useNavigate();
  const [isAdding, setIsAdding] = useState(false);
  const [addFeedback, setAddFeedback] = useState(null);

  const isOutOfStock = product.quantity_available <= 0;

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      navigate('/login', { state: { from: { pathname: `/products/${product.id}` } } });
      return;
    }

    if (!isConsumer) {
      setAddFeedback('Consumers only');
      setTimeout(() => setAddFeedback(null), 2500);
      return;
    }

    if (isOutOfStock) return;

    setIsAdding(true);
    const res = await addToCart(product.id, 1);
    setIsAdding(false);

    if (res.success) {
      setAddFeedback('Added! ✓');
    } else {
      setAddFeedback(res.error || 'Failed');
    }

    setTimeout(() => {
      setAddFeedback(null);
    }, 2000);
  };

  const defaultImage = 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80';

  return (
    <div
      className="card"
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        position: 'relative',
        cursor: 'pointer',
      }}
      onClick={() => navigate(`/products/${product.id}`)}
    >
      {/* Product Image & Badges */}
      <div style={{ position: 'relative', width: '100%', paddingTop: '68%', overflow: 'hidden', backgroundColor: '#f1f5f9' }}>
        <img
          src={product.image_url || defaultImage}
          alt={product.name}
          onError={(e) => { e.target.src = defaultImage; }}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transition: 'transform 0.3s ease',
          }}
          onMouseOver={(e) => (e.currentTarget.style.transform = 'scale(1.05)')}
          onMouseOut={(e) => (e.currentTarget.style.transform = 'scale(1)')}
        />
        {/* Category tag */}
        {product.category && (
          <span
            style={{
              position: 'absolute',
              top: '10px',
              left: '10px',
              backgroundColor: 'rgba(21, 128, 61, 0.9)',
              color: '#ffffff',
              fontSize: '0.725rem',
              fontWeight: 700,
              padding: '0.2rem 0.6rem',
              borderRadius: 'var(--radius-full)',
              backdropFilter: 'blur(4px)',
            }}
          >
            {product.category.name}
          </span>
        )}
        {/* Stock tag */}
        <span
          style={{
            position: 'absolute',
            top: '10px',
            right: '10px',
            backgroundColor: isOutOfStock ? 'rgba(239, 68, 68, 0.95)' : 'rgba(255, 255, 255, 0.92)',
            color: isOutOfStock ? '#ffffff' : '#15803d',
            fontSize: '0.725rem',
            fontWeight: 700,
            padding: '0.2rem 0.55rem',
            borderRadius: 'var(--radius-full)',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          }}
        >
          {isOutOfStock ? 'Out of Stock' : `${product.quantity_available} ${product.unit} left`}
        </span>
      </div>

      {/* Card Content */}
      <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
        {/* Product Title */}
        <h3
          style={{
            fontSize: '1.05rem',
            fontWeight: 700,
            color: '#0f172a',
            marginBottom: '0.35rem',
            lineHeight: 1.3,
          }}
        >
          {product.name}
        </h3>

        {/* Farmer & Farm Location */}
        {product.farmer && (
          <div
            style={{ fontSize: '0.825rem', color: 'var(--text-muted)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
            onClick={(e) => {
              if (product.farmer.id) {
                e.stopPropagation();
                navigate(`/products?farmer_id=${product.farmer.id}`);
              }
            }}
            title={`View all harvests from ${product.farmer.farm_name || product.farmer.name}`}
          >
            <span>🌱</span>
            <span style={{ fontWeight: 600, color: '#166534', textDecoration: 'underline', textUnderlineOffset: '2px' }}>
              {product.farmer.farm_name || product.farmer.name}
            </span>
            {product.farmer.farm_location && (
              <span style={{ color: 'var(--text-light)' }}>• {product.farmer.farm_location.split(',')[0]}</span>
            )}
          </div>
        )}

        {/* Price & Action */}
        <div style={{ marginTop: 'auto', paddingTop: '0.75rem', borderTop: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#15803d', fontFamily: 'var(--font-display)' }}>
              ₹{product.price}
            </span>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 500 }}>
              {' '}/ {product.unit}
            </span>
          </div>

          <button
            type="button"
            onClick={handleAddToCart}
            disabled={isOutOfStock || isAdding}
            className={`btn btn-sm ${isOutOfStock ? 'btn-secondary' : 'btn-primary'}`}
            style={{
              padding: '0.45rem 0.85rem',
              fontSize: '0.825rem',
            }}
          >
            {addFeedback ? (
              <span>{addFeedback}</span>
            ) : isOutOfStock ? (
              'Sold Out'
            ) : (
              '+ Add to Cart'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
