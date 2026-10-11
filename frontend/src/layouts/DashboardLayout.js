import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export const DashboardLayout = () => {
  const { user, role, isConsumer, isFarmer, isAdmin } = useAuth();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: '#f8faf6' }}>
      <Navbar />
      <div className="container" style={{ flex: 1, padding: '2rem 1.25rem 4rem' }}>
        {/* Header Banner */}
        <div
          style={{
            backgroundColor: '#ffffff',
            borderRadius: 'var(--radius-lg)',
            padding: '1.5rem 2rem',
            border: '1px solid var(--border-subtle)',
            boxShadow: 'var(--shadow-sm)',
            marginBottom: '2rem',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <h1 style={{ fontSize: '1.65rem', color: '#0f172a' }}>
                Welcome, {user?.name}
              </h1>
              <span className="badge badge-role" style={{ textTransform: 'capitalize' }}>
                {role} Portal
              </span>
            </div>
            {isFarmer && user?.farmer_profile && (
              <p style={{ color: 'var(--primary-800)', fontWeight: 600, fontSize: '0.9rem', marginTop: '4px' }}>
                🏡 {user.farmer_profile.farm_name} • {user.farmer_profile.farm_location}
              </p>
            )}
            {isConsumer && (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: '4px' }}>
                Support local organic farming with transparent, farm-direct harvests.
              </p>
            )}
            {isAdmin && (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: '4px' }}>
                Platform Governance & Marketplace Operations Console.
              </p>
            )}
          </div>

          {/* Quick Action Buttons */}
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            {isConsumer && (
              <>
                <Link to="/products" className="btn btn-primary btn-sm">
                  + Browse Marketplace
                </Link>
                <Link to="/consumer/cart" className="btn btn-secondary btn-sm">
                  View Cart
                </Link>
              </>
            )}
            {isFarmer && (
              <>
                <Link to="/farmer/products/new" className="btn btn-primary btn-sm">
                  + Add New Harvest
                </Link>
                <Link to="/farmer/products" className="btn btn-secondary btn-sm">
                  Manage Products
                </Link>
              </>
            )}
            {isAdmin && (
              <>
                <Link to="/admin/orders" className="btn btn-secondary btn-sm">
                  Monitor Orders
                </Link>
                <Link to="/admin/users" className="btn btn-secondary btn-sm">
                  Manage Users
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Dashboard Navigation Tabs */}
        <div
          style={{
            display: 'flex',
            gap: '0.5rem',
            borderBottom: '2px solid var(--border-light)',
            marginBottom: '2rem',
            overflowX: 'auto',
          }}
        >
          {isConsumer && (
            <>
              <Link
                to="/consumer/dashboard"
                style={{
                  padding: '0.75rem 1.25rem',
                  fontWeight: 700,
                  fontSize: '0.925rem',
                  color: isActive('/consumer/dashboard') ? 'var(--primary-700)' : 'var(--text-muted)',
                  borderBottom: isActive('/consumer/dashboard') ? '3px solid var(--primary-700)' : '3px solid transparent',
                  marginBottom: '-2px',
                }}
              >
                Overview
              </Link>
              <Link
                to="/consumer/orders"
                style={{
                  padding: '0.75rem 1.25rem',
                  fontWeight: 700,
                  fontSize: '0.925rem',
                  color: isActive('/consumer/orders') ? 'var(--primary-700)' : 'var(--text-muted)',
                  borderBottom: isActive('/consumer/orders') ? '3px solid var(--primary-700)' : '3px solid transparent',
                  marginBottom: '-2px',
                }}
              >
                My Orders
              </Link>
              <Link
                to="/consumer/cart"
                style={{
                  padding: '0.75rem 1.25rem',
                  fontWeight: 700,
                  fontSize: '0.925rem',
                  color: isActive('/consumer/cart') ? 'var(--primary-700)' : 'var(--text-muted)',
                  borderBottom: isActive('/consumer/cart') ? '3px solid var(--primary-700)' : '3px solid transparent',
                  marginBottom: '-2px',
                }}
              >
                My Cart
              </Link>
              <Link
                to="/consumer/profile"
                style={{
                  padding: '0.75rem 1.25rem',
                  fontWeight: 700,
                  fontSize: '0.925rem',
                  color: isActive('/consumer/profile') ? 'var(--primary-700)' : 'var(--text-muted)',
                  borderBottom: isActive('/consumer/profile') ? '3px solid var(--primary-700)' : '3px solid transparent',
                  marginBottom: '-2px',
                }}
              >
                My Profile
              </Link>
            </>
          )}

          {isFarmer && (
            <>
              <Link
                to="/farmer/dashboard"
                style={{
                  padding: '0.75rem 1.25rem',
                  fontWeight: 700,
                  fontSize: '0.925rem',
                  color: isActive('/farmer/dashboard') ? 'var(--primary-700)' : 'var(--text-muted)',
                  borderBottom: isActive('/farmer/dashboard') ? '3px solid var(--primary-700)' : '3px solid transparent',
                  marginBottom: '-2px',
                }}
              >
                Overview
              </Link>
              <Link
                to="/farmer/products"
                style={{
                  padding: '0.75rem 1.25rem',
                  fontWeight: 700,
                  fontSize: '0.925rem',
                  color: isActive('/farmer/products') ? 'var(--primary-700)' : 'var(--text-muted)',
                  borderBottom: isActive('/farmer/products') ? '3px solid var(--primary-700)' : '3px solid transparent',
                  marginBottom: '-2px',
                }}
              >
                My Products
              </Link>
              <Link
                to="/farmer/products/new"
                style={{
                  padding: '0.75rem 1.25rem',
                  fontWeight: 700,
                  fontSize: '0.925rem',
                  color: isActive('/farmer/products/new') ? 'var(--primary-700)' : 'var(--text-muted)',
                  borderBottom: isActive('/farmer/products/new') ? '3px solid var(--primary-700)' : '3px solid transparent',
                  marginBottom: '-2px',
                }}
              >
                + Add Product
              </Link>
              <Link
                to="/farmer/orders"
                style={{
                  padding: '0.75rem 1.25rem',
                  fontWeight: 700,
                  fontSize: '0.925rem',
                  color: isActive('/farmer/orders') ? 'var(--primary-700)' : 'var(--text-muted)',
                  borderBottom: isActive('/farmer/orders') ? '3px solid var(--primary-700)' : '3px solid transparent',
                  marginBottom: '-2px',
                }}
              >
                Customer Orders
              </Link>
              <Link
                to="/farmer/profile"
                style={{
                  padding: '0.75rem 1.25rem',
                  fontWeight: 700,
                  fontSize: '0.925rem',
                  color: isActive('/farmer/profile') ? 'var(--primary-700)' : 'var(--text-muted)',
                  borderBottom: isActive('/farmer/profile') ? '3px solid var(--primary-700)' : '3px solid transparent',
                  marginBottom: '-2px',
                }}
              >
                Farm Profile
              </Link>
            </>
          )}

          {isAdmin && (
            <>
              <Link
                to="/admin/dashboard"
                style={{
                  padding: '0.75rem 1.25rem',
                  fontWeight: 700,
                  fontSize: '0.925rem',
                  color: isActive('/admin/dashboard') ? 'var(--primary-700)' : 'var(--text-muted)',
                  borderBottom: isActive('/admin/dashboard') ? '3px solid var(--primary-700)' : '3px solid transparent',
                  marginBottom: '-2px',
                }}
              >
                Platform Stats
              </Link>
              <Link
                to="/admin/users"
                style={{
                  padding: '0.75rem 1.25rem',
                  fontWeight: 700,
                  fontSize: '0.925rem',
                  color: isActive('/admin/users') ? 'var(--primary-700)' : 'var(--text-muted)',
                  borderBottom: isActive('/admin/users') ? '3px solid var(--primary-700)' : '3px solid transparent',
                  marginBottom: '-2px',
                }}
              >
                User Registry
              </Link>
              <Link
                to="/admin/products"
                style={{
                  padding: '0.75rem 1.25rem',
                  fontWeight: 700,
                  fontSize: '0.925rem',
                  color: isActive('/admin/products') ? 'var(--primary-700)' : 'var(--text-muted)',
                  borderBottom: isActive('/admin/products') ? '3px solid var(--primary-700)' : '3px solid transparent',
                  marginBottom: '-2px',
                }}
              >
                All Products
              </Link>
              <Link
                to="/admin/orders"
                style={{
                  padding: '0.75rem 1.25rem',
                  fontWeight: 700,
                  fontSize: '0.925rem',
                  color: isActive('/admin/orders') ? 'var(--primary-700)' : 'var(--text-muted)',
                  borderBottom: isActive('/admin/orders') ? '3px solid var(--primary-700)' : '3px solid transparent',
                  marginBottom: '-2px',
                }}
              >
                Global Orders
              </Link>
            </>
          )}
        </div>

        {/* Child Views */}
        <Outlet />
      </div>
      <Footer />
    </div>
  );
};

export default DashboardLayout;
