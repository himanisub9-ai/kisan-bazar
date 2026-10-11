import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useCart } from '../hooks/useCart';

export const Navbar = () => {
  const { user, isAuthenticated, isConsumer, isFarmer, isAdmin, logout } = useAuth();
  const { cartCount } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setMobileMenuOpen(false);
  };

  const isActive = (path) => location.pathname === path;

  return (
    <header
      style={{
        backgroundColor: '#ffffff',
        borderBottom: '1px solid var(--border-light)',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
      }}
    >
      <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '72px' }}>
        {/* Brand Logo */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #15803d 0%, #166534 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              fontSize: '1.35rem',
              boxShadow: '0 3px 8px rgba(21, 128, 61, 0.3)',
            }}
          >
            🌾
          </div>
          <div>
            <span style={{ fontSize: '1.35rem', fontWeight: 800, fontFamily: 'var(--font-display)', color: '#14532d', letterSpacing: '-0.02em' }}>
              Kisan<span style={{ color: '#d97706' }}>Bazar</span>
            </span>
            <div style={{ fontSize: '0.68rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginTop: '-4px' }}>
              Farmer Marketplace
            </div>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <Link
            to="/"
            style={{
              fontWeight: 600,
              fontSize: '0.925rem',
              color: isActive('/') ? 'var(--primary-700)' : 'var(--text-main)',
              padding: '0.5rem 0.25rem',
            }}
          >
            Home
          </Link>
          <Link
            to="/products"
            style={{
              fontWeight: 600,
              fontSize: '0.925rem',
              color: isActive('/products') ? 'var(--primary-700)' : 'var(--text-main)',
              padding: '0.5rem 0.25rem',
            }}
          >
            Marketplace
          </Link>
          <Link
            to="/farmers"
            style={{
              fontWeight: 600,
              fontSize: '0.925rem',
              color: isActive('/farmers') ? 'var(--primary-700)' : 'var(--text-main)',
              padding: '0.5rem 0.25rem',
            }}
          >
            Our Farmers
          </Link>

          {/* Consumer Links */}
          {isAuthenticated && isConsumer && (
            <>
              <Link
                to="/consumer/dashboard"
                style={{
                  fontWeight: 600,
                  fontSize: '0.925rem',
                  color: isActive('/consumer/dashboard') ? 'var(--primary-700)' : 'var(--text-main)',
                }}
              >
                Dashboard
              </Link>
              <Link
                to="/consumer/orders"
                style={{
                  fontWeight: 600,
                  fontSize: '0.925rem',
                  color: isActive('/consumer/orders') ? 'var(--primary-700)' : 'var(--text-main)',
                }}
              >
                My Orders
              </Link>
            </>
          )}

          {/* Farmer Links */}
          {isAuthenticated && isFarmer && (
            <>
              <Link
                to="/farmer/dashboard"
                style={{
                  fontWeight: 600,
                  fontSize: '0.925rem',
                  color: isActive('/farmer/dashboard') ? 'var(--primary-700)' : 'var(--text-main)',
                }}
              >
                Dashboard
              </Link>
              <Link
                to="/farmer/products"
                style={{
                  fontWeight: 600,
                  fontSize: '0.925rem',
                  color: isActive('/farmer/products') ? 'var(--primary-700)' : 'var(--text-main)',
                }}
              >
                My Produce
              </Link>
              <Link
                to="/farmer/orders"
                style={{
                  fontWeight: 600,
                  fontSize: '0.925rem',
                  color: isActive('/farmer/orders') ? 'var(--primary-700)' : 'var(--text-main)',
                }}
              >
                Farm Orders
              </Link>
            </>
          )}

          {/* Admin Links */}
          {isAuthenticated && isAdmin && (
            <>
              <Link
                to="/admin/dashboard"
                style={{
                  fontWeight: 600,
                  fontSize: '0.925rem',
                  color: isActive('/admin/dashboard') ? 'var(--primary-700)' : 'var(--text-main)',
                }}
              >
                Admin Panel
              </Link>
              <Link
                to="/admin/users"
                style={{
                  fontWeight: 600,
                  fontSize: '0.925rem',
                  color: isActive('/admin/users') ? 'var(--primary-700)' : 'var(--text-main)',
                }}
              >
                Users
              </Link>
              <Link
                to="/admin/orders"
                style={{
                  fontWeight: 600,
                  fontSize: '0.925rem',
                  color: isActive('/admin/orders') ? 'var(--primary-700)' : 'var(--text-main)',
                }}
              >
                All Orders
              </Link>
            </>
          )}
        </nav>

        {/* Right Section: Cart + User Profile / Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {/* Cart Icon for Consumers or Guests */}
          {(!isAuthenticated || isConsumer) && (
            <Link
              to="/consumer/cart"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                padding: '0.55rem',
                borderRadius: 'var(--radius-md)',
                background: 'var(--primary-50)',
                color: 'var(--primary-800)',
                border: '1px solid var(--primary-200)',
              }}
              title="Shopping Cart"
            >
              <span style={{ fontSize: '1.25rem' }}>🛒</span>
              {cartCount > 0 && (
                <span
                  style={{
                    position: 'absolute',
                    top: '-6px',
                    right: '-6px',
                    backgroundColor: '#dc2626',
                    color: '#ffffff',
                    fontSize: '0.75rem',
                    fontWeight: 800,
                    width: '20px',
                    height: '20px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 2px 4px rgba(220, 38, 38, 0.4)',
                  }}
                >
                  {cartCount}
                </span>
              )}
            </Link>
          )}

          {/* User profile dropdown or Sign In */}
          {isAuthenticated ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', lineHeight: 1.2 }}>
                <span style={{ fontWeight: 700, fontSize: '0.9rem', color: '#0f172a' }}>
                  {user.name}
                </span>
                <span
                  className="badge badge-role"
                  style={{
                    textTransform: 'capitalize',
                    fontSize: '0.7rem',
                    padding: '0.1rem 0.45rem',
                    marginTop: '2px',
                  }}
                >
                  {user.role}
                </span>
              </div>
              <button
                type="button"
                onClick={handleLogout}
                className="btn btn-secondary btn-sm"
                title="Log out from session"
              >
                Logout
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Link to="/login" className="btn btn-secondary btn-sm">
                Login
              </Link>
              <Link to="/register" className="btn btn-primary btn-sm">
                Register
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
