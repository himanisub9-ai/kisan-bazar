import React from 'react';
import { Link } from 'react-router-dom';

export const NotFound = () => {
  return (
    <div
      className="container"
      style={{
        textAlign: 'center',
        padding: '5rem 1rem',
        maxWidth: '560px',
        margin: '0 auto',
      }}
    >
      <div style={{ fontSize: '4.5rem', marginBottom: '1rem' }}>🌾</div>
      <h1 style={{ fontSize: '2.5rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.75rem' }}>
        404 - Page Not Found
      </h1>
      <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem', lineHeight: 1.6, marginBottom: '2rem' }}>
        It looks like this agricultural harvest or page hasn't been planted yet, or may have been moved.
      </p>
      <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
        <Link to="/" className="btn btn-secondary btn-md">
          ← Return Home
        </Link>
        <Link to="/products" className="btn btn-primary btn-md">
          Browse Marketplace →
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
