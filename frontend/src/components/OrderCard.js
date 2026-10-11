import React from 'react';
import { Link } from 'react-router-dom';

const STATUS_BADGE_CLASSES = {
  Pending: 'badge-pending',
  Confirmed: 'badge-confirmed',
  Packed: 'badge-packed',
  Shipped: 'badge-shipped',
  Delivered: 'badge-delivered',
  Cancelled: 'badge-cancelled',
};

export const OrderCard = ({
  order,
  isFarmer = false,
  isAdmin = false,
  onStatusUpdate,
  onCancel,
  isProcessing = false,
}) => {
  const badgeClass = STATUS_BADGE_CLASSES[order.order_status] || 'badge-pending';
  const orderDate = new Date(order.created_at).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const canCancel = order.order_status === 'Pending';

  return (
    <div className="card" style={{ padding: '1.5rem', marginBottom: '1.25rem' }}>
      {/* Top Header */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '0.75rem',
          paddingBottom: '1rem',
          borderBottom: '1px solid var(--border-subtle)',
          marginBottom: '1rem',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span style={{ fontWeight: 800, fontSize: '1.1rem', color: '#0f172a' }}>
              Order #KB-{order.id}
            </span>
            <span className={`badge ${badgeClass}`}>{order.order_status}</span>
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>
            Placed on {orderDate}
          </div>
        </div>

        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Order Total</div>
          <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#15803d', fontFamily: 'var(--font-display)' }}>
            ₹{order.total_amount.toFixed(2)}
          </div>
        </div>
      </div>

      {/* Items Preview */}
      <div style={{ marginBottom: '1rem' }}>
        <h4 style={{ fontSize: '0.875rem', fontWeight: 700, color: '#475569', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
          Ordered Produce ({order.items.length} {order.items.length === 1 ? 'item' : 'items'})
        </h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {order.items.map((item) => (
            <div
              key={item.id}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '0.9rem',
                backgroundColor: '#f8fafc',
                padding: '0.5rem 0.75rem',
                borderRadius: 'var(--radius-sm)',
              }}
            >
              <div>
                <span style={{ fontWeight: 600, color: '#1e293b' }}>{item.product_name}</span>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.825rem', marginLeft: '0.5rem' }}>
                  ({item.quantity} {item.product_unit} × ₹{item.price})
                </span>
                {item.farmer_name && (
                  <div style={{ fontSize: '0.75rem', color: 'var(--primary-700)' }}>
                    Farm: {item.farmer_name}
                  </div>
                )}
              </div>
              <span style={{ fontWeight: 700, color: '#0f172a' }}>₹{item.subtotal.toFixed(2)}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Delivery & Payment Summary */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem',
          backgroundColor: '#fcfdfa',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-md)',
          padding: '0.85rem 1rem',
          fontSize: '0.85rem',
          marginBottom: '1.25rem',
        }}
      >
        <div>
          <div style={{ fontWeight: 600, color: '#475569' }}>📍 Delivery Address:</div>
          <div style={{ color: '#1e293b', marginTop: '2px' }}>{order.delivery_address}</div>
          {order.consumer_name && (
            <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '2px' }}>
              Recipient: {order.consumer_name} ({order.consumer_phone || 'No phone'})
            </div>
          )}
        </div>
        <div>
          <div style={{ fontWeight: 600, color: '#475569' }}>💳 Payment Method:</div>
          <div style={{ color: '#1e293b', marginTop: '2px' }}>
            {order.payment_method} •{' '}
            <span
              style={{
                fontWeight: 700,
                color: order.payment_status === 'Paid' ? '#15803d' : '#d97706',
              }}
            >
              {order.payment_status}
            </span>
          </div>
          {order.payment?.transaction_reference && (
            <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '2px', fontFamily: 'monospace' }}>
              Ref: {order.payment.transaction_reference}
            </div>
          )}
        </div>
      </div>

      {/* Action Footer */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '0.75rem',
          paddingTop: '0.75rem',
          borderTop: '1px solid var(--border-subtle)',
        }}
      >
        {/* Status update selector for Farmers and Admins */}
        {(isFarmer || isAdmin) && onStatusUpdate && order.order_status !== 'Cancelled' ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#475569' }}>Update Status:</span>
            <select
              value={order.order_status}
              onChange={(e) => onStatusUpdate(order.id, e.target.value)}
              disabled={isProcessing}
              className="form-select"
              style={{ padding: '0.35rem 0.65rem', fontSize: '0.85rem', width: 'auto' }}
            >
              <option value="Pending">Pending</option>
              <option value="Confirmed">Confirmed</option>
              <option value="Packed">Packed</option>
              <option value="Shipped">Shipped</option>
              <option value="Delivered">Delivered</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>
        ) : (
          <div />
        )}

        {/* Consumer Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginLeft: 'auto' }}>
          {canCancel && onCancel && (
            <button
              type="button"
              onClick={() => onCancel(order.id)}
              disabled={isProcessing}
              className="btn btn-sm btn-danger"
            >
              Cancel Order
            </button>
          )}

          <Link
            to={isAdmin ? `/admin/orders` : isFarmer ? `/farmer/orders` : `/consumer/orders/${order.id}`}
            className="btn btn-sm btn-secondary"
          >
            Track & View Details →
          </Link>
        </div>
      </div>
    </div>
  );
};

export default OrderCard;
