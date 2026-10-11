import React, { useState, useEffect } from 'react';
import adminService from '../../services/adminService';
import orderService from '../../services/orderService';
import OrderCard from '../../components/OrderCard';
import Loading from '../../components/Loading';
import ErrorMessage from '../../components/ErrorMessage';

export const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);

  const fetchOrders = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await adminService.getOrders();
      setOrders(data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to load platform orders.');
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

  const filteredOrders = orders.filter((o) => {
    const matchesFilter =
      activeFilter === 'all' ||
      (activeFilter === 'active' && ['Pending', 'Confirmed', 'Packed', 'Shipped'].includes(o.order_status)) ||
      o.order_status.toLowerCase() === activeFilter.toLowerCase();

    const term = searchTerm.toLowerCase();
    const matchesSearch =
      !term ||
      `#kb-${o.id}`.includes(term) ||
      o.id.toString().includes(term) ||
      (o.consumer_name && o.consumer_name.toLowerCase().includes(term));

    return matchesFilter && matchesSearch;
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
          <h2 style={{ fontSize: '1.5rem', color: '#0f172a' }}>Global Platform Orders</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            Monitor end-to-end order fulfillments, logistics milestones, and consumer receipts.
          </p>
        </div>

        {/* Status Filter Pills */}
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {[
            { id: 'all', label: 'All Orders' },
            { id: 'active', label: 'Active (In Progress)' },
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

      {/* Search Input */}
      <div style={{ marginBottom: '1.5rem' }}>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search by Order ID (e.g. #KB-1) or Buyer Name..."
          className="form-input"
          style={{ maxWidth: '380px' }}
        />
      </div>

      {isLoading ? (
        <Loading message="Loading all platform orders..." />
      ) : filteredOrders.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📦</div>
          <h4 className="empty-state-title">No orders found</h4>
          <p className="empty-state-text">No orders match your filter criteria.</p>
        </div>
      ) : (
        <div>
          {filteredOrders.map((order) => (
            <OrderCard
              key={order.id}
              order={order}
              isAdmin
              onStatusUpdate={handleStatusUpdate}
              isProcessing={updatingId === order.id}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminOrders;
