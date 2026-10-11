import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../../hooks/useCart';
import { useAuth } from '../../hooks/useAuth';
import orderService from '../../services/orderService';
import CartItem from '../../components/CartItem';
import Loading from '../../components/Loading';
import ErrorMessage from '../../components/ErrorMessage';

export const ConsumerCart = () => {
  const { cartItems, totalAmount, updateQuantity, removeFromCart, clearCart, isLoading, refreshCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [deliveryAddress, setDeliveryAddress] = useState(user?.address || '');
  const [paymentMethod, setPaymentMethod] = useState('Cash on Delivery');
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [error, setError] = useState(null);
  const [updatingItemId, setUpdatingItemId] = useState(null);

  const handleUpdateQty = async (itemId, newQty) => {
    setUpdatingItemId(itemId);
    await updateQuantity(itemId, newQty);
    setUpdatingItemId(null);
  };

  const handleRemove = async (itemId) => {
    setUpdatingItemId(itemId);
    await removeFromCart(itemId);
    setUpdatingItemId(null);
  };

  const handleCheckout = async (e) => {
    e.preventDefault();

    if (deliveryAddress.trim().length < 5) {
      setError('Please provide a complete delivery street, city, and pincode (at least 5 characters).');
      return;
    }

    if (cartItems.length === 0) {
      setError('Your shopping cart is currently empty.');
      return;
    }

    try {
      setIsCheckingOut(true);
      setError(null);

      const orderPayload = {
        delivery_address: deliveryAddress.trim(),
        payment_method: paymentMethod,
        customer_name: user?.name || null,
        phone: user?.phone || null,
      };

      const placedOrder = await orderService.placeOrder(orderPayload);
      // Refresh cart state
      await refreshCart();
      // Redirect to the new order's tracking details page
      navigate(`/consumer/orders/${placedOrder.id}`);
    } catch (err) {
      setError(
        err.response?.data?.detail || 'Failed to place order. Please review your cart items and stock availability.'
      );
    } finally {
      setIsCheckingOut(false);
    }
  };

  if (isLoading && cartItems.length === 0) {
    return <Loading message="Loading cart items..." />;
  }

  return (
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.65rem', color: '#0f172a' }}>My Shopping Cart</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          Farm fresh items reserved directly from registered organic producers.
        </p>
      </div>

      {error && <ErrorMessage message={error} />}

      {cartItems.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">🛒</div>
          <h4 className="empty-state-title">Your cart is empty</h4>
          <p className="empty-state-text">
            Explore seasonal organic vegetables, fruits, heritage grains, and fresh dairy directly from farmers.
          </p>
          <Link to="/products" className="btn btn-primary" style={{ marginTop: '0.75rem' }}>
            Start Shopping Now →
          </Link>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
          {/* Left Column: Cart Items */}
          <div className="card" style={{ padding: '1.5rem' }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                paddingBottom: '1rem',
                borderBottom: '1px solid var(--border-light)',
              }}
            >
              <h3 style={{ fontSize: '1.15rem', color: '#0f172a' }}>
                Cart Produce ({cartItems.length} {cartItems.length === 1 ? 'item' : 'items'})
              </h3>
              <button
                type="button"
                onClick={clearCart}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#dc2626',
                  cursor: 'pointer',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  textDecoration: 'underline',
                }}
              >
                Clear Cart
              </button>
            </div>

            <div>
              {cartItems.map((item) => (
                <CartItem
                  key={item.id}
                  item={item}
                  onUpdateQuantity={handleUpdateQty}
                  onRemove={handleRemove}
                  isUpdating={updatingItemId === item.id}
                />
              ))}
            </div>

            <div style={{ marginTop: '1.5rem', textAlign: 'right' }}>
              <Link to="/products" style={{ color: 'var(--primary-700)', fontWeight: 600, fontSize: '0.9rem' }}>
                + Add more farm harvests
              </Link>
            </div>
          </div>

          {/* Right Column: Order Checkout & Delivery */}
          <div>
            <div className="card" style={{ padding: '1.75rem' }}>
              <h3 style={{ fontSize: '1.25rem', color: '#0f172a', marginBottom: '1.25rem' }}>
                Order Summary & Checkout
              </h3>

              <form onSubmit={handleCheckout}>
                {/* Delivery Address */}
                <div className="form-group">
                  <label className="form-label" htmlFor="delivery_address">
                    Delivery Address *
                  </label>
                  <textarea
                    id="delivery_address"
                    rows={3}
                    value={deliveryAddress}
                    onChange={(e) => setDeliveryAddress(e.target.value)}
                    placeholder="Enter complete delivery street, landmark, city, and pincode"
                    required
                    className="form-textarea"
                  />
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    Dispatched directly from the farmer's region to your doorstep.
                  </span>
                </div>

                {/* Payment Method */}
                <div className="form-group">
                  <label className="form-label">Select Payment Method</label>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <label
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.65rem',
                        padding: '0.75rem 1rem',
                        borderRadius: 'var(--radius-md)',
                        border: `1.5px solid ${paymentMethod === 'Cash on Delivery' ? 'var(--primary-700)' : 'var(--border-light)'}`,
                        backgroundColor: paymentMethod === 'Cash on Delivery' ? 'var(--primary-50)' : '#ffffff',
                        cursor: 'pointer',
                      }}
                    >
                      <input
                        type="radio"
                        name="payment_method"
                        value="Cash on Delivery"
                        checked={paymentMethod === 'Cash on Delivery'}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                      />
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>💵 Cash on Delivery (COD)</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Pay upon physical delivery</div>
                      </div>
                    </label>

                    <label
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.65rem',
                        padding: '0.75rem 1rem',
                        borderRadius: 'var(--radius-md)',
                        border: `1.5px solid ${paymentMethod === 'Online Payment' ? 'var(--primary-700)' : 'var(--border-light)'}`,
                        backgroundColor: paymentMethod === 'Online Payment' ? 'var(--primary-50)' : '#ffffff',
                        cursor: 'pointer',
                      }}
                    >
                      <input
                        type="radio"
                        name="payment_method"
                        value="Online Payment"
                        checked={paymentMethod === 'Online Payment'}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                      />
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>💳 Online Instant Payment (UPI / NetBanking)</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Instant confirmation & digital receipt</div>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Pricing Breakdown */}
                <div
                  style={{
                    backgroundColor: '#f8fafc',
                    padding: '1rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-light)',
                    marginBottom: '1.5rem',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', marginBottom: '0.4rem' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Items Subtotal:</span>
                    <span style={{ fontWeight: 600 }}>₹{totalAmount.toFixed(2)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', marginBottom: '0.4rem' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Direct Farm Logistics:</span>
                    <span style={{ color: '#16a34a', fontWeight: 600 }}>FREE</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', marginBottom: '0.4rem' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Platform Commission:</span>
                    <span style={{ color: '#16a34a', fontWeight: 600 }}>₹0 (0% Middlemen)</span>
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      borderTop: '1px dashed var(--border-light)',
                      paddingTop: '0.75rem',
                      marginTop: '0.5rem',
                    }}
                  >
                    <span style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a' }}>Total Payable:</span>
                    <span style={{ fontSize: '1.45rem', fontWeight: 800, color: '#15803d', fontFamily: 'var(--font-display)' }}>
                      ₹{totalAmount.toFixed(2)}
                    </span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isCheckingOut || cartItems.length === 0}
                  className="btn btn-primary btn-lg"
                  style={{ width: '100%', fontSize: '1rem' }}
                >
                  {isCheckingOut ? 'Processing Harvest Order...' : '🛍️ Place Farm Order Now'}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConsumerCart;
