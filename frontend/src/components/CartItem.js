import React from 'react';
import { Link } from 'react-router-dom';

export const CartItem = ({ item, onUpdateQuantity, onRemove, isUpdating }) => {
  const { product, quantity, subtotal } = item;
  const isMaxStock = quantity >= (product.quantity_available || 0);

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '1.25rem 0',
        borderBottom: '1px solid var(--border-subtle)',
        gap: '1rem',
        flexWrap: 'wrap',
      }}
    >
      {/* Product Image & Info */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', minWidth: '240px', flex: 2 }}>
        <img
          src={product.image_url || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=300&q=80'}
          alt={product.name}
          style={{
            width: '72px',
            height: '72px',
            borderRadius: 'var(--radius-md)',
            objectFit: 'cover',
            border: '1px solid var(--border-light)',
          }}
        />
        <div>
          <Link
            to={`/products/${product.id}`}
            style={{ fontWeight: 700, fontSize: '1rem', color: '#0f172a' }}
          >
            {product.name}
          </Link>
          <div style={{ fontSize: '0.825rem', color: 'var(--text-muted)', marginTop: '2px' }}>
            ₹{product.price} / {product.unit}
            {product.farmer && (
              <span style={{ color: 'var(--primary-700)' }}> • {product.farmer.farm_name || product.farmer.name}</span>
            )}
          </div>
          <div style={{ fontSize: '0.75rem', color: isMaxStock ? '#b91c1c' : '#166534', fontWeight: 600 }}>
            {isMaxStock
              ? `Max available stock reached (${product.quantity_available} ${product.unit})`
              : `Available: ${product.quantity_available} ${product.unit}`}
          </div>
        </div>
      </div>

      {/* Quantity Selector */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1, justifyContent: 'center' }}>
        <button
          type="button"
          onClick={() => onUpdateQuantity(item.id, quantity - 1)}
          disabled={isUpdating}
          className="btn btn-secondary btn-sm"
          style={{ width: '32px', height: '32px', padding: 0 }}
          title="Decrease quantity"
        >
          -
        </button>
        <span
          style={{
            minWidth: '40px',
            textAlign: 'center',
            fontWeight: 700,
            fontSize: '0.95rem',
          }}
        >
          {quantity}
        </span>
        <button
          type="button"
          onClick={() => onUpdateQuantity(item.id, quantity + 1)}
          disabled={isUpdating || isMaxStock}
          className="btn btn-secondary btn-sm"
          style={{ width: '32px', height: '32px', padding: 0 }}
          title={isMaxStock ? 'Cannot exceed stock' : 'Increase quantity'}
        >
          +
        </button>
      </div>

      {/* Subtotal & Remove Button */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '1.25rem', minWidth: '130px', flex: 1 }}>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#15803d', fontFamily: 'var(--font-display)' }}>
            ₹{subtotal.toFixed(2)}
          </div>
        </div>
        <button
          type="button"
          onClick={() => onRemove(item.id)}
          disabled={isUpdating}
          style={{
            background: 'none',
            border: 'none',
            color: '#ef4444',
            cursor: 'pointer',
            fontSize: '1.1rem',
            padding: '0.4rem',
            borderRadius: 'var(--radius-sm)',
          }}
          title="Remove item"
        >
          🗑️
        </button>
      </div>
    </div>
  );
};

export default CartItem;
