import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import adminService from '../../services/adminService';
import Loading from '../../components/Loading';
import ErrorMessage from '../../components/ErrorMessage';

export const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStats = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await adminService.getDashboardStats();
      setStats(data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to fetch platform metrics.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (isLoading) {
    return <Loading message="Loading platform operations telemetry..." />;
  }

  return (
    <div>
      <div style={{ marginBottom: '1.75rem' }}>
        <h2 style={{ fontSize: '1.65rem', color: '#0f172a' }}>Platform Operations & Analytics</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          Real-time aggregated health metrics for KisanBazar Farmer Marketplace.
        </p>
      </div>

      {error && <ErrorMessage message={error} onRetry={fetchStats} />}

      {/* Main Aggregated Stats Cards */}
      <div className="stat-grid">
        <div className="stat-card">
          <span className="stat-label">Total Registered Users</span>
          <span className="stat-value">{stats?.total_users || 0}</span>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            🚜 {stats?.total_farmers || 0} Farmers • 🛒 {stats?.total_consumers || 0} Consumers
          </div>
        </div>

        <div className="stat-card" style={{ '--primary-600': '#10b981' }}>
          <span className="stat-label">Gross Marketplace GMV</span>
          <span className="stat-value" style={{ color: '#16a34a' }}>
            ₹{(stats?.total_sales || 0).toFixed(2)}
          </span>
          <div style={{ fontSize: '0.8rem', color: '#16a34a', marginTop: '0.25rem' }}>
            100% Direct Farmer Remittance
          </div>
        </div>

        <div className="stat-card" style={{ '--primary-600': '#3b82f6' }}>
          <span className="stat-label">Marketplace Harvests</span>
          <span className="stat-value" style={{ color: '#2563eb' }}>
            {stats?.total_products || 0}
          </span>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            Across all categories & farms
          </div>
        </div>

        <div className="stat-card" style={{ '--primary-600': '#f59e0b' }}>
          <span className="stat-label">Platform Orders</span>
          <span className="stat-value" style={{ color: '#d97706' }}>
            {stats?.total_orders || 0}
          </span>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            {stats?.pending_orders || 0} Active • {stats?.completed_orders || 0} Delivered
          </div>
        </div>
      </div>

      {/* Quick Operation Panels */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginTop: '2rem' }}>
        <div className="card" style={{ padding: '1.75rem' }}>
          <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>👥</div>
          <h3 style={{ fontSize: '1.2rem', color: '#0f172a', marginBottom: '0.5rem' }}>User Registry</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '1.25rem' }}>
            Audit farmers and consumer accounts, inspect farm locations, and manage account authorization status.
          </p>
          <Link to="/admin/users" className="btn btn-secondary btn-sm" style={{ width: '100%', textAlign: 'center' }}>
            Manage Users →
          </Link>
        </div>

        <div className="card" style={{ padding: '1.75rem' }}>
          <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🌾</div>
          <h3 style={{ fontSize: '1.2rem', color: '#0f172a', marginBottom: '0.5rem' }}>Product Moderation</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '1.25rem' }}>
            Monitor crop listings, price per unit standards, stock integrity, and remove non-compliant entries.
          </p>
          <Link to="/admin/products" className="btn btn-secondary btn-sm" style={{ width: '100%', textAlign: 'center' }}>
            Inspect Products →
          </Link>
        </div>

        <div className="card" style={{ padding: '1.75rem' }}>
          <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📦</div>
          <h3 style={{ fontSize: '1.2rem', color: '#0f172a', marginBottom: '0.5rem' }}>Global Orders Monitor</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '1.25rem' }}>
            Oversee fulfillment pipelines from harvest packing to final delivery and manage order statuses.
          </p>
          <Link to="/admin/orders" className="btn btn-secondary btn-sm" style={{ width: '100%', textAlign: 'center' }}>
            View Global Orders →
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
