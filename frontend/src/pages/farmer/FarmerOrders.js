import React, { useState, useEffect } from 'react';
import orderService from '../../services/orderService';
import OrderCard from '../../components/OrderCard';
import Loading from '../../components/Loading';
import ErrorMessage from '../../components/ErrorMessage';

export const FarmerOrders = () => {
  const [orders, setOrders] = useState([]);
  const [activeFilter, setActiveFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);

  const fetchOrders = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await orderService.getOrders();
      setOrders(data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to load farm customer orders.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      setUpdatingId(orderId);
      await orderService.updateOrderStatus(orderId, newStatus);
      await fetchOrders();
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to update order status.');
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredOrders = orders.filter((order) => {
    if (activeFilter === 'pending') {
      return order.order_status === 'Pending';
    }
    if (activeFilter === 'in_transit') {
      return ['Confirmed', 'Packed', 'Shipped'].includes(order.order_status);
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
          <h2 style={{ fontSize: '1.5rem', color: '#0f172a' }}>Customer Orders for Your Harvests</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            Pack, fulfill, and update fulfillment milestones for buyers.
          </p>
        </div>

        {/* Status Filter Tabs */}
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {[
            { id: 'all', label: 'All Orders' },
            { id: 'pending', label: 'Pending' },
            { id: 'in_transit', label: 'In Progress (Packed/Shipped)' },
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
        <Loading message="Loading customer orders..." />
      ) : filteredOrders.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📋</div>
          <h4 className="empty-state-title">
            {activeFilter === 'all'
              ? 'No orders received yet'
              : `No ${activeFilter.replace('_', ' ')} orders`}
          </h4>
          <p className="empty-state-text">
            When consumers order your harvests, you will manage packing and delivery dispatch here.
          </p>
        </div>
      ) : (
        <div>
          {filteredOrders.map((order) => (
            <OrderCard
              key={order.id}
              order={order}
              isFarmer
              onStatusUpdate={handleStatusUpdate}
              isProcessing={updatingId === order.id}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default FarmerOrders;
