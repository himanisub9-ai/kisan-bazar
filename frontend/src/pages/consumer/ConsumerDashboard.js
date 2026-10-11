import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useCart } from '../../hooks/useCart';
import orderService from '../../services/orderService';
import OrderCard from '../../components/OrderCard';
import Loading from '../../components/Loading';
import ErrorMessage from '../../components/ErrorMessage';

export const ConsumerDashboard = () => {
  const { user } = useAuth();
  const { cartCount, totalAmount: cartTotal } = useCart();

  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setIsLoading(true);
        const data = await orderService.getOrders();
        setOrders(data);
      } catch (err) {
        setError('Failed to load your order history.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const totalOrders = orders.length;
  const pendingOrders = orders.filter((o) => ['Pending', 'Confirmed', 'Packed', 'Shipped'].includes(o.order_status)).length;
  const completedOrders = orders.filter((o) => o.order_status === 'Delivered').length;

  return (
    <div>
      {/* Consumer Welcome Cards / Stats */}
      <div className="stat-grid">
        <div className="stat-card">
          <span className="stat-label">Total Orders</span>
          <span className="stat-value">{totalOrders}</span>
        </div>
        <div className="stat-card" style={{ '--primary-600': '#f59e0b' }}>
          <span className="stat-label">Active & In-Transit</span>
          <span className="stat-value" style={{ color: '#d97706' }}>{pendingOrders}</span>
        </div>
        <div className="stat-card" style={{ '--primary-600': '#10b981' }}>
          <span className="stat-label">Delivered Orders</span>
          <span className="stat-value" style={{ color: '#16a34a' }}>{completedOrders}</span>
        </div>
        <div className="stat-card" style={{ '--primary-600': '#3b82f6' }}>
          <span className="stat-label">Cart Items</span>
          <span className="stat-value" style={{ color: '#2563eb' }}>
            {cartCount} <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>(₹{cartTotal.toFixed(2)})</span>
          </span>
        </div>
      </div>

      {/* Quick Access Action Bar */}
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
          <h3 style={{ fontSize: '1.15rem', color: '#0f172a' }}>Need farm-fresh produce today?</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            Direct seasonal harvests from local organic farms are updated daily.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Link to="/consumer/cart" className="btn btn-secondary btn-sm">
            View Cart ({cartCount})
          </Link>
          <Link to="/products" className="btn btn-primary btn-sm">
            Browse Marketplace →
          </Link>
        </div>
      </div>

      {/* Recent Orders Overview */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <h2 style={{ fontSize: '1.35rem', color: '#0f172a' }}>Recent Orders</h2>
          {orders.length > 0 && (
            <Link to="/consumer/orders" style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--primary-700)' }}>
              View All Orders ({orders.length}) →
            </Link>
          )}
        </div>

        {error && <ErrorMessage message={error} />}

        {isLoading ? (
          <Loading message="Loading order history..." />
        ) : orders.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">🛒</div>
            <h4 className="empty-state-title">No orders placed yet</h4>
            <p className="empty-state-text">
              Support local farming families and enjoy chemical-free produce delivered to your doorstep.
            </p>
            <Link to="/products" className="btn btn-primary">
              Start Shopping Now
            </Link>
          </div>
        ) : (
          <div>
            {orders.slice(0, 3).map((order) => (
              <OrderCard key={order.id} order={order} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ConsumerDashboard;
