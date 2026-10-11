import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import farmerService from '../services/farmerService';
import Loading from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';

export const Farmers = () => {
  const [farmers, setFarmers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFarmersList = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await farmerService.getFarmers();
        setFarmers(data);
      } catch (err) {
        setError(err.response?.data?.detail || 'Failed to load farmers directory.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchFarmersList();
  }, []);

  const filteredFarmers = farmers.filter((f) => {
    const term = searchTerm.toLowerCase();
    const farmName = f.farmer_profile?.farm_name?.toLowerCase() || '';
    const location = f.farmer_profile?.farm_location?.toLowerCase() || '';
    const farmerName = f.name.toLowerCase();
    return farmName.includes(term) || location.includes(term) || farmerName.includes(term);
  });

  return (
    <div className="page-wrapper container">
      {/* Header */}
      <div style={{ textAlign: 'center', maxWidth: '720px', margin: '0 auto 2.5rem' }}>
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            backgroundColor: '#dcfce7',
            color: '#166534',
            padding: '0.35rem 0.85rem',
            borderRadius: 'var(--radius-full)',
            fontSize: '0.85rem',
            fontWeight: 700,
            marginBottom: '0.75rem',
          }}
        >
          🚜 Direct Farm Partnerships
        </span>
        <h1 style={{ fontSize: '2.5rem', color: '#0f172a', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '0.75rem' }}>
          Meet Our Organic Farmers
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem', lineHeight: 1.6 }}>
          Discover the passionate farming families across India cultivating chemical-free, heirloom harvests with 100% direct fair trade pricing.
        </p>
      </div>

      {error && <ErrorMessage message={error} />}

      {/* Search Bar */}
      <div style={{ maxWidth: '480px', margin: '0 auto 2.5rem' }}>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search by farm estate, district, or farmer name..."
          className="form-input"
          style={{ textAlign: 'center', height: '48px', borderRadius: 'var(--radius-full)' }}
        />
      </div>

      {/* Farmers Grid */}
      {isLoading ? (
        <Loading message="Loading verified farm partners..." />
      ) : filteredFarmers.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">🏡</div>
          <h4 className="empty-state-title">No farmers found</h4>
          <p className="empty-state-text">No farming partners matched your search query.</p>
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '2rem',
          }}
        >
          {filteredFarmers.map((f) => {
            const profile = f.farmer_profile;
            return (
              <div
                key={f.id}
                className="card"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  padding: '2rem',
                  position: 'relative',
                  borderTop: '4px solid var(--primary-600)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', marginBottom: '1rem' }}>
                  <div
                    style={{
                      width: '52px',
                      height: '52px',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: 'var(--primary-100)',
                      color: 'var(--primary-800)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1.65rem',
                    }}
                  >
                    🚜
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.25rem', color: '#0f172a', lineHeight: 1.25 }}>
                      {profile?.farm_name || f.name}
                    </h3>
                    <div style={{ fontSize: '0.85rem', color: 'var(--primary-800)', fontWeight: 600 }}>
                      Farmer Partner: {f.name}
                    </div>
                  </div>
                </div>

                {profile?.farm_location && (
                  <div
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      fontSize: '0.825rem',
                      color: 'var(--text-muted)',
                      backgroundColor: '#f1f5f9',
                      padding: '0.3rem 0.75rem',
                      borderRadius: 'var(--radius-full)',
                      width: 'fit-content',
                      marginBottom: '1rem',
                    }}
                  >
                    <span>📍</span>
                    <span>{profile.farm_location}</span>
                  </div>
                )}

                <p
                  style={{
                    color: 'var(--text-muted)',
                    fontSize: '0.9rem',
                    lineHeight: 1.6,
                    marginBottom: '1.5rem',
                    flex: 1,
                  }}
                >
                  {profile?.description ||
                    'Committed to chemical-free sustainable cultivation, heritage seed conservation, and pure harvest freshness.'}
                </p>

                <div style={{ marginTop: 'auto', paddingTop: '1.25rem', borderTop: '1px solid var(--border-light)' }}>
                  <Link
                    to={`/products?farmer_id=${f.id}`}
                    className="btn btn-primary"
                    style={{ width: '100%', textAlign: 'center', justifyContent: 'center' }}
                  >
                    Browse Harvests from this Farm →
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Farmers;
