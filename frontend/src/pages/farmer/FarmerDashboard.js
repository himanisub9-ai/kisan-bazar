import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import farmerService from '../../services/farmerService';
import orderService from '../../services/orderService';
import OrderCard from '../../components/OrderCard';
import Loading from '../../components/Loading';
import ErrorMessage from '../../components/ErrorMessage';

export const FarmerDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const [statsData, ordersData] = await Promise.all([
        farmerService.getFarmerDashboardStats(),
        orderService.getOrders(),
      ]);
      setStats(statsData);
      setRecentOrders(ordersData.slice(0, 3));
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to load farm dashboard information.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      await orderService.updateOrderStatus(orderId, newStatus);
      await fetchDashboardData();
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to update order status');
    }
  };

  if (isLoading) {
    return <Loading message="Loading your farm analytics..." />;
  }

  return (
    <div>
      {error && <ErrorMessage message={error} onRetry={fetchDashboardData} />}

      {/* Farm Overview Stats Grid */}
      <div className="stat-grid">
        <div className="stat-card">
          <span className="stat-label">Total Listed Produce</span>
          <span className="stat-value">{stats?.total_products || 0}</span>
        </div>
        <div className="stat-card" style={{ '--primary-600': '#10b981' }}>
          <span className="stat-label">Active In-Stock Crops</span>
          <span className="stat-value" style={{ color: '#16a34a' }}>
            {stats?.active_products || 0}
          </span>
        </div>
        <div className="stat-card" style={{ '--primary-600': '#f59e0b' }}>
          <span className="stat-label">Total Farm Orders</span>
          <span className="stat-value" style={{ color: '#d97706' }}>
            {stats?.total_orders || 0}
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginLeft: '0.4rem' }}>
              ({stats?.pending_orders || 0} active)
            </span>
          </span>
        </div>
        <div className="stat-card" style={{ '--primary-600': '#3b82f6' }}>
          <span className="stat-label">Total Farm Revenue</span>
          <span className="stat-value" style={{ color: '#15803d' }}>
            ₹{(stats?.total_sales || 0).toFixed(2)}
          </span>
        </div>
      </div>

      {/* Quick Action Banner */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: '#ffffff',
          borderRadius: 'var(--radius-md)',
          padding: '1.25rem 1.5rem',
          border: '1px solid var(--border-light)',
          marginBottom: '2rem',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div>
          <h3 style={{ fontSize: '1.15rem', color: '#0f172a' }}>Ready to list your fresh morning harvest?</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            Direct consumers across the region are browsing active agricultural listings.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Link to="/farmer/products/new" className="btn btn-primary btn-sm">
            + Add New Harvest
          </Link>
          <Link to="/farmer/orders" className="btn btn-secondary btn-sm">
            Manage Orders ({stats?.pending_orders || 0})
          </Link>
        </div>
      </div>

      {/* Recent Farm Orders */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <h2 style={{ fontSize: '1.35rem', color: '#0f172a' }}>Recent Consumer Orders</h2>
          {recentOrders.length > 0 && (
            <Link to="/farmer/orders" style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--primary-700)' }}>
              View All Farm Orders →
            </Link>
          )}
        </div>

        {recentOrders.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">🌾</div>
            <h4 className="empty-state-title">No customer orders yet</h4>
            <p className="empty-state-text">
              Ensure your crops are in stock and attractively described to start receiving direct orders.
            </p>
            <Link to="/farmer/products/new" className="btn btn-primary" style={{ marginTop: '0.5rem' }}>
              Add Your Harvests
            </Link>
          </div>
        ) : (
          <div>
            {recentOrders.map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                isFarmer
                onStatusUpdate={handleStatusUpdate}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FarmerDashboard;
