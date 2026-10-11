import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import authService from '../../services/authService';
import ErrorMessage from '../../components/ErrorMessage';

export const FarmerProfile = () => {
  const { user, refreshUser } = useAuth();

  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    address: user?.address || '',
    farm_name: user?.farmer_profile?.farm_name || '',
    farm_location: user?.farmer_profile?.farm_location || '',
    farm_description: user?.farmer_profile?.description || '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState(null);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        phone: user.phone || '',
        address: user.address || '',
        farm_name: user.farmer_profile?.farm_name || '',
        farm_location: user.farmer_profile?.farm_location || '',
        farm_description: user.farmer_profile?.description || '',
      });
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
    if (feedback) setFeedback(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.farm_name.trim() || !formData.farm_location.trim()) {
      setFeedback({ type: 'error', message: 'Farm Name and Farm Location are required.' });
      return;
    }

    try {
      setIsSubmitting(true);
      setFeedback(null);

      await authService.updateProfile({
        name: formData.name.trim(),
        phone: formData.phone.trim() || null,
        address: formData.address.trim() || null,
        farm_name: formData.farm_name.trim(),
        farm_location: formData.farm_location.trim(),
        farm_description: formData.farm_description.trim() || null,
      });

      await refreshUser();
      setFeedback({ type: 'success', message: 'Farm and personal profile updated successfully!' });
    } catch (err) {
      setFeedback({
        type: 'error',
        message: err.response?.data?.detail || 'Failed to update farm profile.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ maxWidth: '720px', margin: '0 auto' }}>
      <div className="card" style={{ padding: '2rem' }}>
        <div style={{ marginBottom: '1.5rem', borderBottom: '1px solid var(--border-light)', paddingBottom: '1rem' }}>
          <h2 style={{ fontSize: '1.5rem', color: '#0f172a' }}>Farm Estate Profile</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            This information is showcased to buyers on product pages and farm attribution tags.
          </p>
        </div>

        {feedback && feedback.type === 'error' && (
          <ErrorMessage message={feedback.message} />
        )}
        {feedback && feedback.type === 'success' && (
          <div
            style={{
              padding: '0.75rem 1.25rem',
              backgroundColor: '#ecfdf5',
              border: '1px solid #a7f3d0',
              borderRadius: 'var(--radius-md)',
              color: '#065f46',
              marginBottom: '1.25rem',
              fontWeight: 600,
              fontSize: '0.9rem',
            }}
          >
            ✓ {feedback.message}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Farm Details */}
          <div
            style={{
              backgroundColor: '#fefce8',
              border: '1px solid #fef08a',
              borderRadius: 'var(--radius-md)',
              padding: '1.25rem',
              marginBottom: '1.5rem',
            }}
          >
            <h4 style={{ color: '#854d0e', marginBottom: '0.75rem', fontSize: '1rem' }}>
              🌾 Farm Identity
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
                Farming Practices & Story
              </label>
              <textarea
                id="farm_description"
                name="farm_description"
                rows={3}
                value={formData.farm_description}
                onChange={handleChange}
                placeholder="Describe your organic certification, drip irrigation, heirloom seeds, or natural soil enrichment..."
                className="form-textarea"
              />
            </div>
          </div>

          {/* Farmer Contact Info */}
          <div className="form-group">
            <label className="form-label" htmlFor="name">
              Farmer Partner Name *
            </label>
            <input
              id="name"
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="email">
              Registered Email (Login ID)
            </label>
            <input
              id="email"
              type="email"
              value={user?.email || ''}
              disabled
              className="form-input"
              style={{ backgroundColor: '#f1f5f9', cursor: 'not-allowed', color: '#64748b' }}
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="phone">
              Contact Phone
            </label>
            <input
              id="phone"
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="address">
              Mailing / Village Address
            </label>
            <textarea
              id="address"
              name="address"
              rows={2}
              value={formData.address}
              onChange={handleChange}
              className="form-textarea"
            />
          </div>

          <div style={{ marginTop: '1.75rem', display: 'flex', justifyContent: 'flex-end' }}>
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn btn-primary btn-md"
            >
              {isSubmitting ? 'Saving Farm Profile...' : 'Save Profile Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FarmerProfile;
