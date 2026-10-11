import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import adminService from '../../services/adminService';
import productService from '../../services/productService';
import Loading from '../../components/Loading';
import ErrorMessage from '../../components/ErrorMessage';

export const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const [prods, cats] = await Promise.all([
        adminService.getProducts(),
        productService.getCategories(),
      ]);
      setProducts(prods);
      setCategories(cats);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to fetch platform products.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDelete = async (productId, productName) => {
    if (!window.confirm(`As administrator, are you sure you want to remove "${productName}" from the platform?`)) {
      return;
    }

    try {
      setDeletingId(productId);
      await adminService.deleteProduct(productId);
      setProducts((prev) => prev.filter((p) => p.id !== productId));
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to delete product.');
    } finally {
      setDeletingId(null);
    }
  };

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.farmer && (p.farmer.name.toLowerCase().includes(searchTerm.toLowerCase()) || (p.farmer.farm_name && p.farmer.farm_name.toLowerCase().includes(searchTerm.toLowerCase()))));
    const matchesCategory =
      selectedCategory === 'all' || (p.category && p.category.name === selectedCategory);
    return matchesSearch && matchesCategory;
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
          <h2 style={{ fontSize: '1.5rem', color: '#0f172a' }}>Global Agricultural Catalog</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            Inspect produce listings across all registered farmers and moderate content.
          </p>
        </div>

        <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
          Total Listed: <strong>{products.length}</strong> harvests
        </div>
      </div>

      {error && <ErrorMessage message={error} onRetry={fetchData} />}

      {/* Filter and Search Bar */}
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Filter by harvest or farmer name..."
          className="form-input"
          style={{ maxWidth: '360px' }}
        />

        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="form-select"
          style={{ width: 'auto' }}
        >
          <option value="all">All Categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.name}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      {isLoading ? (
        <Loading message="Loading product catalog..." />
      ) : filteredProducts.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">🌾</div>
          <h4 className="empty-state-title">No products found</h4>
          <p className="empty-state-text">No harvests matched your search or category filter.</p>
        </div>
      ) : (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table className="table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid var(--border-light)' }}>
                  <th style={{ padding: '1rem 1.25rem' }}>Harvest Details</th>
                  <th style={{ padding: '1rem 1.25rem' }}>Farmer / Farm Estate</th>
                  <th style={{ padding: '1rem 1.25rem' }}>Category</th>
                  <th style={{ padding: '1rem 1.25rem' }}>Price</th>
                  <th style={{ padding: '1rem 1.25rem' }}>Inventory Stock</th>
                  <th style={{ padding: '1rem 1.25rem', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((p) => (
                  <tr
                    key={p.id}
                    style={{
                      borderBottom: '1px solid var(--border-subtle)',
                      transition: 'background-color 0.15s ease',
                    }}
                  >
                    {/* Harvest Details */}
                    <td style={{ padding: '1rem 1.25rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <img
                          src={p.image_url || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=200&q=80'}
                          alt={p.name}
                          style={{
                            width: '42px',
                            height: '42px',
                            borderRadius: 'var(--radius-sm)',
                            objectFit: 'cover',
                            border: '1px solid var(--border-light)',
                          }}
                        />
                        <div>
                          <Link
                            to={`/products/${p.id}`}
                            style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.925rem' }}
                          >
                            {p.name}
                          </Link>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            Product #{p.id}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Farmer */}
                    <td style={{ padding: '1rem 1.25rem', fontSize: '0.875rem' }}>
                      {p.farmer ? (
                        <div>
                          <div style={{ fontWeight: 600, color: '#1e293b' }}>
                            {p.farmer.farm_name || p.farmer.name}
                          </div>
                          <div style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>
                            {p.farmer.farm_location || p.farmer.name}
                          </div>
                        </div>
                      ) : (
                        <span style={{ color: 'var(--text-muted)' }}>Unknown Farmer</span>
                      )}
                    </td>

                    {/* Category */}
                    <td style={{ padding: '1rem 1.25rem' }}>
                      <span className="badge badge-role" style={{ fontSize: '0.78rem' }}>
                        {p.category?.name || 'General'}
                      </span>
                    </td>

                    {/* Price */}
                    <td style={{ padding: '1rem 1.25rem' }}>
                      <div style={{ fontWeight: 700, color: '#15803d', fontSize: '0.95rem' }}>
                        ₹{p.price} / {p.unit}
                      </div>
                    </td>

                    {/* Stock */}
                    <td style={{ padding: '1rem 1.25rem' }}>
                      {p.quantity_available <= 0 ? (
                        <span className="badge badge-cancelled">Out of Stock</span>
                      ) : (
                        <span className="badge badge-delivered">
                          {p.quantity_available} {p.unit}
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td style={{ padding: '1rem 1.25rem', textAlign: 'right' }}>
                      <button
                        type="button"
                        onClick={() => handleDelete(p.id, p.name)}
                        disabled={deletingId === p.id}
                        className="btn btn-danger btn-sm"
                        style={{ padding: '0.35rem 0.65rem', fontSize: '0.8rem' }}
                      >
                        {deletingId === p.id ? 'Deleting...' : '🗑️ Remove'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProducts;
