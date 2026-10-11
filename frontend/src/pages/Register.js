import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import ErrorMessage from '../components/ErrorMessage';

export const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [role, setRole] = useState(searchParams.get('role') === 'farmer' ? 'farmer' : 'consumer');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    address: '',
    farm_name: '',
    farm_location: '',
    farm_description: '',
  });

  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const roleParam = searchParams.get('role');
    if (roleParam === 'farmer' || roleParam === 'consumer') {
      setRole(roleParam);
    }
  }, [searchParams]);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
    if (error) setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password.length < 6) {
      setError('Password must contain at least 6 characters.');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match. Please re-enter.');
      return;
    }

    if (role === 'farmer') {
      if (!formData.farm_name || !formData.farm_location) {
        setError('Please provide your Farm Name and Farm Location.');
        return;
      }
    }

    try {
      setIsSubmitting(true);
      setError(null);

      const payload = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        phone: formData.phone || null,
        address: formData.address || null,
        role: role,
        farm_name: role === 'farmer' ? formData.farm_name : null,
        farm_location: role === 'farmer' ? formData.farm_location : null,
        farm_description: role === 'farmer' ? formData.farm_description : null,
      };

      const res = await register(payload);
      if (res.user.role === 'farmer') {
        navigate('/farmer/dashboard', { replace: true });
      } else {
        navigate('/consumer/dashboard', { replace: true });
      }
    } catch (err) {
      setError(
        err.response?.data?.detail || 'Registration failed. Please check the form fields.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="page-wrapper container" style={{ maxWidth: '580px', margin: '1.5rem auto' }}>
      <div className="card" style={{ padding: '2.5rem 2rem', boxShadow: 'var(--shadow-lg)' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ fontSize: '2.25rem', marginBottom: '0.4rem' }}>🌱</div>
          <h2 style={{ fontSize: '1.75rem', color: '#0f172a' }}>Join KisanBazar</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
            Direct agricultural connection between farm and family
          </p>

          {/* Role Toggle Selector */}
          <div
            style={{
              display: 'flex',
              backgroundColor: '#f1f5f9',
              borderRadius: 'var(--radius-md)',
              padding: '0.35rem',
              marginTop: '1.5rem',
              gap: '0.25rem',
            }}
          >
            <button
              type="button"
              onClick={() => setRole('consumer')}
              style={{
                flex: 1,
                padding: '0.65rem 1rem',
                borderRadius: 'var(--radius-sm)',
                border: 'none',
                fontWeight: 700,
                fontSize: '0.9rem',
                cursor: 'pointer',
                backgroundColor: role === 'consumer' ? '#ffffff' : 'transparent',
                color: role === 'consumer' ? 'var(--primary-800)' : 'var(--text-muted)',
                boxShadow: role === 'consumer' ? 'var(--shadow-sm)' : 'none',
                transition: 'all 0.2s ease',
              }}
            >
              🛒 Consumer (Buyer)
            </button>
            <button
              type="button"
              onClick={() => setRole('farmer')}
              style={{
                flex: 1,
                padding: '0.65rem 1rem',
                borderRadius: 'var(--radius-sm)',
                border: 'none',
                fontWeight: 700,
                fontSize: '0.9rem',
                cursor: 'pointer',
                backgroundColor: role === 'farmer' ? '#ffffff' : 'transparent',
                color: role === 'farmer' ? '#d97706' : 'var(--text-muted)',
                boxShadow: role === 'farmer' ? 'var(--shadow-sm)' : 'none',
                transition: 'all 0.2s ease',
              }}
            >
              🚜 Farmer (Seller)
            </button>
          </div>
        </div>

        {error && <ErrorMessage message={error} />}

        <form onSubmit={handleSubmit}>
          {/* Common Fields */}
          <div className="form-group">
            <label className="form-label" htmlFor="name">
              Full Name *
            </label>
            <input
              id="name"
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g. Ramesh Patil"
              required
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="email">
              Email Address *
            </label>
            <input
              id="email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="e.g. ramesh@kisanbazar.com"
              required
              className="form-input"
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label" htmlFor="password">
                Password *
              </label>
              <input
                id="password"
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="At least 6 chars"
                required
                className="form-input"
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="confirmPassword">
                Confirm Password *
              </label>
              <input
                id="confirmPassword"
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Re-type password"
                required
                className="form-input"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="phone">
              Phone Number
            </label>
            <input
              id="phone"
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="e.g. +91 9822012345"
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="address">
              {role === 'farmer' ? 'Residential / Office Address' : 'Delivery Address *'}
            </label>
            <textarea
              id="address"
              name="address"
              rows={2}
              value={formData.address}
              onChange={handleChange}
              placeholder={role === 'farmer' ? 'Village or town address' : 'Street address, apartment, city, pincode'}
              required={role === 'consumer'}
              className="form-textarea"
            />
          </div>

          {/* Farmer Specific Fields */}
          {role === 'farmer' && (
            <div
              style={{
                backgroundColor: '#fefce8',
                border: '1px solid #fef08a',
                borderRadius: 'var(--radius-md)',
                padding: '1.25rem',
                margin: '1.25rem 0',
              }}
            >
              <h4 style={{ color: '#854d0e', marginBottom: '0.75rem', fontSize: '0.95rem' }}>
                🚜 Farm Details
              </h4>
              <div className="form-group">
                <label className="form-label" htmlFor="farm_name">
                  Farm Name *
                </label>
                <input
                  id="farm_name"
                  type="text"
                  name="farm_name"
                  value={formData.farm_name}
                  onChange={handleChange}
                  placeholder="e.g. Sahyadri Organic Orchards"
                  required
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="farm_location">
                  Farm Location / District *
                </label>
                <input
                  id="farm_location"
                  type="text"
                  name="farm_location"
                  value={formData.farm_location}
                  onChange={handleChange}
                  placeholder="e.g. Shirwal, Satara, Maharashtra"
                  required
                  className="form-input"
                />
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" htmlFor="farm_description">
                  Farm Practices & Bio
                </label>
                <textarea
                  id="farm_description"
                  name="farm_description"
                  rows={2}
                  value={formData.farm_description}
                  onChange={handleChange}
                  placeholder="Tell buyers about your crops, organic farming practices, or heritage seeds..."
                  className="form-textarea"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="btn btn-primary btn-lg"
            style={{ width: '100%', marginTop: '1.25rem' }}
          >
            {isSubmitting ? 'Registering Account...' : `Register as ${role === 'farmer' ? 'Farmer Partner' : 'Consumer'}`}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '1.75rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: 'var(--primary-700)', fontWeight: 700 }}>
            Sign In Here
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
