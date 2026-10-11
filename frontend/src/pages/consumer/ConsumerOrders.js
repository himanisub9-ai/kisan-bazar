import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import orderService from '../../services/orderService';
import OrderCard from '../../components/OrderCard';
import Loading from '../../components/Loading';
import ErrorMessage from '../../components/ErrorMessage';

export const ConsumerOrders = () => {
  const [orders, setOrders] = useState([]);
  const [activeFilter, setActiveFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cancellingId, setCancellingId] = useState(null);

  const fetchOrders = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await orderService.getOrders();
      setOrders(data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to load your orders.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm('Are you sure you want to cancel this order? Stock will be restored.')) {
      return;
    }

    try {
      setCancellingId(orderId);
      await orderService.cancelOrder(orderId);
      // Refresh order list
      await fetchOrders();
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to cancel order.');
    } finally {
      setCancellingId(null);
    }
  };

  const filteredOrders = orders.filter((order) => {
    if (activeFilter === 'active') {
      return ['Pending', 'Confirmed', 'Packed', 'Shipped'].includes(order.order_status);
    }
    if (activeFilter === 'delivered') {
      return order.order_status === 'Delivered';
    }
    if (activeFilter === 'cancelled') {
      return order.order_status === 'Cancelled';
    }
    return true;
  });

  return (
    <div>
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
          marginBottom: '1.5rem',
        }}
      >
        <div>
          <h2 style={{ fontSize: '1.5rem', color: '#0f172a' }}>My Orders</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            Track deliveries, view farm invoices, and manage past purchases.
          </p>
        </div>

        {/* Filter Pills */}
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {[
            { id: 'all', label: 'All Orders' },
            { id: 'active', label: 'Active & In-Transit' },
            { id: 'delivered', label: 'Delivered' },
            { id: 'cancelled', label: 'Cancelled' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveFilter(tab.id)}
              className={`btn btn-sm ${activeFilter === tab.id ? 'btn-primary' : 'btn-secondary'}`}
              style={{ fontSize: '0.825rem', padding: '0.35rem 0.85rem' }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {error && <ErrorMessage message={error} onRetry={fetchOrders} />}

      {isLoading ? (
        <Loading message="Loading orders..." />
      ) : filteredOrders.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📦</div>
          <h4 className="empty-state-title">
            {activeFilter === 'all'
              ? 'No orders found'
              : `No ${activeFilter} orders found`}
          </h4>
          <p className="empty-state-text">
            Explore seasonal produce directly from our organic farmers.
          </p>
          <Link to="/products" className="btn btn-primary" style={{ marginTop: '0.75rem' }}>
            Browse Marketplace
          </Link>
        </div>
      ) : (
        <div>
          {filteredOrders.map((order) => (
            <OrderCard
              key={order.id}
              order={order}
              onCancel={handleCancelOrder}
              isProcessing={cancellingId === order.id}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ConsumerOrders;
