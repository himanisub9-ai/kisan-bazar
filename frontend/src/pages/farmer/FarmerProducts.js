import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import productService from '../../services/productService';
import Loading from '../../components/Loading';
import ErrorMessage from '../../components/ErrorMessage';

export const FarmerProducts = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const fetchFarmerProducts = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await productService.getProducts({ farmer_id: user?.id });
      setProducts(data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to load your agricultural products.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user?.id) {
      fetchFarmerProducts();
    }
  }, [user?.id]);

  const handleDelete = async (productId, productName) => {
    if (!window.confirm(`Are you sure you want to remove "${productName}" from the marketplace?`)) {
      return;
    }

    try {
      setDeletingId(productId);
      await productService.deleteProduct(productId);
      setProducts((prev) => prev.filter((p) => p.id !== productId));
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to delete product.');
    } finally {
      setDeletingId(null);
    }
  };

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    (p.category && p.category.name.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div>
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
          marginBottom: '1.75rem',
        }}
      >
        <div>
          <h2 style={{ fontSize: '1.5rem', color: '#0f172a' }}>My Farm Harvests & Catalog</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            Manage crop listings, adjust available inventory, and update unit pricing.
          </p>
        </div>

        <Link to="/farmer/products/new" className="btn btn-primary">
          + Add New Produce
        </Link>
      </div>

      {error && <ErrorMessage message={error} onRetry={fetchFarmerProducts} />}

      {/* Search Filter Bar */}
      <div style={{ marginBottom: '1.5rem' }}>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Filter crops by name or category..."
          className="form-input"
          style={{ maxWidth: '400px' }}
        />
      </div>

      {isLoading ? (
        <Loading message="Loading your crops..." />
      ) : filteredProducts.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">🌱</div>
          <h4 className="empty-state-title">No farm products found</h4>
          <p className="empty-state-text">
            {search
              ? 'No products matched your search keyword.'
              : 'You have not listed any agricultural harvests yet.'}
          </p>
          <Link to="/farmer/products/new" className="btn btn-primary" style={{ marginTop: '0.75rem' }}>
            Add Your First Harvest
          </Link>
        </div>
      ) : (
        <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table className="table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid var(--border-light)' }}>
                  <th style={{ padding: '1rem 1.25rem' }}>Produce Details</th>
                  <th style={{ padding: '1rem 1.25rem' }}>Category</th>
                  <th style={{ padding: '1rem 1.25rem' }}>Price / Unit</th>
                  <th style={{ padding: '1rem 1.25rem' }}>Available Stock</th>
                  <th style={{ padding: '1rem 1.25rem', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((p) => {
                  const isOutOfStock = p.quantity_available <= 0;
                  return (
                    <tr
                      key={p.id}
                      style={{
                        borderBottom: '1px solid var(--border-subtle)',
                        transition: 'background-color 0.15s ease',
                      }}
                    >
                      {/* Product Thumbnail + Name */}
                      <td style={{ padding: '1rem 1.25rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                          <img
                            src={p.image_url || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=200&q=80'}
                            alt={p.name}
                            style={{
                              width: '48px',
                              height: '48px',
                              borderRadius: 'var(--radius-sm)',
                              objectFit: 'cover',
                              border: '1px solid var(--border-light)',
                            }}
                          />
                          <div>
                            <Link
                              to={`/products/${p.id}`}
                              style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.95rem' }}
                            >
                              {p.name}
                            </Link>
                            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                              ID: #{p.id}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td style={{ padding: '1rem 1.25rem' }}>
                        <span className="badge badge-role" style={{ fontSize: '0.78rem' }}>
                          {p.category?.name || 'Uncategorized'}
                        </span>
                      </td>

                      {/* Price */}
                      <td style={{ padding: '1rem 1.25rem' }}>
                        <div style={{ fontWeight: 800, color: '#15803d', fontSize: '1rem' }}>
                          ₹{p.price.toFixed(2)}
                        </div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                          per {p.unit}
                        </div>
                      </td>

                      {/* Stock */}
                      <td style={{ padding: '1rem 1.25rem' }}>
                        {isOutOfStock ? (
                          <span className="badge badge-cancelled">Sold Out</span>
                        ) : (
                          <span className="badge badge-delivered">
                            {p.quantity_available} {p.unit} in stock
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td style={{ padding: '1rem 1.25rem', textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: '0.5rem' }}>
                          <button
                            type="button"
                            onClick={() => navigate(`/farmer/products/edit/${p.id}`)}
                            className="btn btn-secondary btn-sm"
                            style={{ padding: '0.35rem 0.65rem', fontSize: '0.8rem' }}
                          >
                            ✏️ Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(p.id, p.name)}
                            disabled={deletingId === p.id}
                            className="btn btn-danger btn-sm"
                            style={{ padding: '0.35rem 0.65rem', fontSize: '0.8rem' }}
                          >
                            {deletingId === p.id ? '...' : '🗑️ Delete'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default FarmerProducts;
