import React from 'react';
import { Link } from 'react-router-dom';

export const Footer = () => {
  return (
    <footer
      style={{
        backgroundColor: '#052e16',
        color: '#dcfce7',
        padding: '3.5rem 0 2rem',
        marginTop: 'auto',
        borderTop: '4px solid #16a34a',
      }}
    >
      <div className="container">
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '2.5rem',
            marginBottom: '3rem',
          }}
        >
          {/* Brand Info */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1rem' }}>
              <span style={{ fontSize: '1.5rem' }}>🌾</span>
              <span style={{ fontSize: '1.4rem', fontWeight: 800, color: '#ffffff', fontFamily: 'var(--font-display)' }}>
                Kisan<span style={{ color: '#f59e0b' }}>Bazar</span>
              </span>
            </div>
            <p style={{ fontSize: '0.875rem', lineHeight: 1.6, color: '#bbf7d0', marginBottom: '1.25rem' }}>
              Direct agricultural marketplace empowering Indian farmers with fair prices while delivering 
              fresh, chemical-free farm produce straight to consumers.
            </p>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', backgroundColor: 'rgba(255,255,255,0.1)', padding: '0.4rem 0.8rem', borderRadius: 'var(--radius-sm)', fontSize: '0.78rem', color: '#f0fdf4' }}>
              <span>🛡️</span> Pure Full-Stack • FastAPI • PostgreSQL
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 style={{ color: '#ffffff', marginBottom: '1rem', fontSize: '1.05rem' }}>Marketplace</h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.9rem' }}>
              <li>
                <Link to="/products" style={{ color: '#bbf7d0', transition: 'color 0.2s' }}>
                  Browse All Harvests
                </Link>
              </li>
              <li>
                <Link to="/products?category=Vegetables" style={{ color: '#bbf7d0' }}>
                  Farm Fresh Vegetables
                </Link>
              </li>
              <li>
                <Link to="/products?category=Fruits" style={{ color: '#bbf7d0' }}>
                  Seasonal Orchard Fruits
                </Link>
              </li>
              <li>
                <Link to="/products?category=Dairy" style={{ color: '#bbf7d0' }}>
                  A2 Cow Milk & Desi Ghee
                </Link>
              </li>
              <li>
                <Link to="/products?category=Organic+Products" style={{ color: '#bbf7d0' }}>
                  Certified Organic Produce
                </Link>
              </li>
            </ul>
          </div>

          {/* User Portals */}
          <div>
            <h4 style={{ color: '#ffffff', marginBottom: '1rem', fontSize: '1.05rem' }}>Portals</h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.9rem' }}>
              <li>
                <Link to="/register?role=farmer" style={{ color: '#fef3c7', fontWeight: 600 }}>
                  🚜 Farmer Partner Registration
                </Link>
              </li>
              <li>
                <Link to="/register?role=consumer" style={{ color: '#bbf7d0' }}>
                  🛒 Consumer Sign Up
                </Link>
              </li>
              <li>
                <Link to="/login" style={{ color: '#bbf7d0' }}>
                  🔑 Account Sign In
                </Link>
              </li>
              <li>
                <Link to="/consumer/orders" style={{ color: '#bbf7d0' }}>
                  📦 Order Tracking
                </Link>
              </li>
            </ul>
          </div>

          {/* Demo Accounts & Support */}
          <div>
            <h4 style={{ color: '#ffffff', marginBottom: '1rem', fontSize: '1.05rem' }}>Demo Credentials</h4>
            <div style={{ backgroundColor: 'rgba(0,0,0,0.25)', padding: '0.85rem', borderRadius: 'var(--radius-md)', fontSize: '0.8rem', lineHeight: 1.5 }}>
              <div style={{ color: '#fef08a', fontWeight: 700, marginBottom: '0.3rem' }}>Quick Test Logins:</div>
              <div>• <strong>Admin:</strong> admin@kisanbazar.com / admin123</div>
              <div>• <strong>Farmer:</strong> ramesh@kisanbazar.com / farmer123</div>
              <div>• <strong>Consumer:</strong> priya@gmail.com / consumer123</div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div
          style={{
            paddingTop: '1.5rem',
            borderTop: '1px solid rgba(255, 255, 255, 0.1)',
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '1rem',
            fontSize: '0.825rem',
            color: '#86efac',
          }}
        >
          <div>
            © {new Date().getFullYear()} KisanBazar Marketplace. Direct Farm-to-Kitchen Agricultural Platform.
          </div>
          <div style={{ display: 'flex', gap: '1.25rem' }}>
            <span>🌱 100% Direct Farmer Compensation</span>
            <span>⚖️ Zero Middleman Commission</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
