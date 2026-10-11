import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import orderService from '../../services/orderService';
import Loading from '../../components/Loading';
import ErrorMessage from '../../components/ErrorMessage';

const TIMELINE_STEPS = [
  { key: 'Pending', label: 'Order Placed', icon: '📝', desc: 'Received by farmer' },
  { key: 'Confirmed', label: 'Confirmed', icon: '✓', desc: 'Harvest reserved' },
  { key: 'Packed', label: 'Packed', icon: '📦', desc: 'Freshly crated' },
  { key: 'Shipped', label: 'In Transit', icon: '🚚', desc: 'Dispatched to address' },
  { key: 'Delivered', label: 'Delivered', icon: '🎉', desc: 'Reached doorstep' },
];

export const ConsumerOrderDetails = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isCancelling, setIsCancelling] = useState(false);

  const fetchOrder = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await orderService.getOrderById(id);
      setOrder(data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to retrieve order details.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const handleCancel = async () => {
    if (!window.confirm('Are you sure you want to cancel this order?')) return;
    try {
      setIsCancelling(true);
      await orderService.cancelOrder(order.id);
      await fetchOrder();
    } catch (err) {
      alert(err.response?.data?.detail || 'Cancellation failed.');
    } finally {
      setIsCancelling(false);
    }
  };

  if (isLoading) {
    return <Loading message="Loading order details..." />;
  }

  if (error || !order) {
    return (
      <div style={{ maxWidth: '600px', margin: '2rem auto' }}>
        <ErrorMessage message={error || 'Order not found'} />
        <Link to="/consumer/orders" className="btn btn-secondary">
          ← Back to Orders
        </Link>
      </div>
    );
  }

  const isCancelled = order.order_status === 'Cancelled';
  const currentStepIndex = TIMELINE_STEPS.findIndex((s) => s.key === order.order_status);
  const canCancel = order.order_status === 'Pending';

  return (
    <div>
      {/* Top Breadcrumb & Header */}
      <div style={{ marginBottom: '1.5rem' }}>
        <Link to="/consumer/orders" style={{ fontSize: '0.875rem', color: 'var(--primary-700)', fontWeight: 600 }}>
          ← Back to All Orders
        </Link>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginTop: '0.5rem' }}>
          <div>
            <h2 style={{ fontSize: '1.65rem', color: '#0f172a' }}>
              Order #KB-{order.id}
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              Placed on {new Date(order.created_at).toLocaleString('en-IN')}
            </p>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <span
              className={`badge badge-${order.order_status.toLowerCase()}`}
              style={{ fontSize: '0.9rem', padding: '0.4rem 0.9rem' }}
            >
              {order.order_status}
            </span>
            {canCancel && (
              <button
                type="button"
                onClick={handleCancel}
                disabled={isCancelling}
                className="btn btn-danger btn-sm"
              >
                {isCancelling ? 'Cancelling...' : 'Cancel Order'}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Progress Timeline Tracker */}
      <div
        className="card"
        style={{
          padding: '2rem 1.5rem',
          marginBottom: '2rem',
          backgroundColor: '#ffffff',
        }}
      >
        <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#334155', marginBottom: '1.5rem' }}>
          Live Delivery Status
        </h4>

        {isCancelled ? (
          <div style={{ backgroundColor: '#fef2f2', padding: '1rem', borderRadius: 'var(--radius-md)', color: '#991b1b', fontWeight: 600 }}>
            ❌ This order was cancelled. Any reserved crop inventory has been restored to the farmers.
          </div>
        ) : (
          <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative', overflowX: 'auto', paddingBottom: '0.5rem' }}>
            {TIMELINE_STEPS.map((step, idx) => {
              const isPastOrCurrent = currentStepIndex >= idx;
              const isCurrent = currentStepIndex === idx;

              return (
                <div
                  key={step.key}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    textAlign: 'center',
                    flex: 1,
                    minWidth: '90px',
                    position: 'relative',
                  }}
                >
                  <div
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      backgroundColor: isPastOrCurrent ? 'var(--primary-700)' : '#f1f5f9',
                      color: isPastOrCurrent ? '#ffffff' : 'var(--text-muted)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 700,
                      fontSize: '1rem',
                      marginBottom: '0.5rem',
                      boxShadow: isCurrent ? '0 0 0 4px #bbf7d0' : 'none',
                      transition: 'all 0.3s ease',
                    }}
                  >
                    {step.icon}
                  </div>
                  <div style={{ fontSize: '0.85rem', fontWeight: isPastOrCurrent ? 700 : 500, color: isPastOrCurrent ? '#0f172a' : 'var(--text-muted)' }}>
                    {step.label}
                  </div>
                  <div style={{ fontSize: '0.725rem', color: 'var(--text-light)', marginTop: '2px' }}>
                    {step.desc}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Main Details Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        {/* Ordered Items List */}
        <div className="card" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1.15rem', color: '#0f172a', marginBottom: '1rem' }}>
            Produce Purchased ({order.items.length})
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {order.items.map((item) => (
              <div
                key={item.id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '0.75rem',
                  backgroundColor: '#f8fafc',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                <div>
                  <div style={{ fontWeight: 700, color: '#0f172a' }}>{item.product_name}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    Quantity: {item.quantity} {item.product_unit} × ₹{item.price}
                  </div>
                  {item.farmer_name && (
                    <div style={{ fontSize: '0.75rem', color: 'var(--primary-700)', fontWeight: 600, marginTop: '2px' }}>
                      🚜 Farm: {item.farmer_name}
                    </div>
                  )}
                </div>
                <div style={{ fontWeight: 800, color: '#15803d', fontSize: '1.05rem' }}>
                  ₹{item.subtotal.toFixed(2)}
                </div>
              </div>
            ))}
          </div>

          <div
            style={{
              marginTop: '1.5rem',
              paddingTop: '1rem',
              borderTop: '2px dashed var(--border-light)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <span style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a' }}>Total Amount:</span>
            <span style={{ fontSize: '1.65rem', fontWeight: 800, color: '#15803d', fontFamily: 'var(--font-display)' }}>
              ₹{order.total_amount.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Shipping & Payment Meta */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Delivery Card */}
          <div className="card" style={{ padding: '1.5rem' }}>
            <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#334155', marginBottom: '0.75rem' }}>
              📍 Delivery Details
            </h4>
            <div style={{ fontSize: '0.9rem', color: '#1e293b', lineHeight: 1.6 }}>
              <strong>Address:</strong>
              <div>{order.delivery_address}</div>
            </div>
            {order.consumer_name && (
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                Contact: {order.consumer_name} {order.consumer_phone ? `(${order.consumer_phone})` : ''}
              </div>
            )}
          </div>

          {/* Payment Card */}
          <div className="card" style={{ padding: '1.5rem' }}>
            <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#334155', marginBottom: '0.75rem' }}>
              💳 Payment Information
            </h4>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>Payment Method:</span>
              <strong>{order.payment_method}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>Payment Status:</span>
              <span style={{ fontWeight: 700, color: order.payment_status === 'Paid' ? '#15803d' : '#d97706' }}>
                {order.payment_status}
              </span>
            </div>
            {order.payment?.transaction_reference && (
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Transaction Ref:</span>
                <span style={{ fontFamily: 'monospace', fontWeight: 600 }}>{order.payment.transaction_reference}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConsumerOrderDetails;
