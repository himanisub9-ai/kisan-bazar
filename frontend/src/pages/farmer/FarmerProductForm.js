import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import productService from '../../services/productService';
import Loading from '../../components/Loading';
import ErrorMessage from '../../components/ErrorMessage';

const COMMON_UNITS = ['kg', 'quintal', 'litre', 'dozen', 'bunch', 'box', 'piece', 'gram'];

export const FarmerProductForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = !!id;

  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    category_id: '',
    price: '',
    unit: 'kg',
    quantity_available: '',
    image_url: '',
    description: '',
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const initData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const cats = await productService.getCategories();
        setCategories(cats);

        if (isEditing) {
          const product = await productService.getProductById(id);
          setFormData({
            name: product.name || '',
            category_id: product.category_id || (product.category ? product.category.id : ''),
            price: product.price || '',
            unit: product.unit || 'kg',
            quantity_available: product.quantity_available || '',
            image_url: product.image_url || '',
            description: product.description || '',
          });
        } else if (cats.length > 0) {
          setFormData((prev) => ({
            ...prev,
            category_id: cats[0].id,
          }));
        }
      } catch (err) {
        setError(err.response?.data?.detail || 'Failed to initialize form data.');
      } finally {
        setIsLoading(false);
      }
    };

    initData();
  }, [id, isEditing]);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
    if (error) setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      setError('Please provide a name for the agricultural produce.');
      return;
    }

    if (!formData.category_id) {
      setError('Please select an agricultural category.');
      return;
    }

    const priceNum = parseFloat(formData.price);
    if (isNaN(priceNum) || priceNum <= 0) {
      setError('Please specify a valid positive price per unit.');
      return;
    }

    const qtyNum = parseFloat(formData.quantity_available);
    if (isNaN(qtyNum) || qtyNum < 0) {
      setError('Available quantity must be 0 or greater.');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      const payload = {
        name: formData.name.trim(),
        category_id: parseInt(formData.category_id, 10),
        price: priceNum,
        unit: formData.unit,
        quantity_available: qtyNum,
        image_url: formData.image_url.trim() || null,
        description: formData.description.trim() || null,
      };

      if (isEditing) {
        await productService.updateProduct(id, payload);
      } else {
        await productService.createProduct(payload);
      }

      navigate('/farmer/products');
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to save product. Please check input values.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <Loading message="Loading product form..." />;
  }

  return (
    <div style={{ maxWidth: '720px', margin: '0 auto' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <Link to="/farmer/products" style={{ fontSize: '0.875rem', color: 'var(--primary-700)', fontWeight: 600 }}>
          ← Back to My Products
        </Link>
        <h2 style={{ fontSize: '1.65rem', color: '#0f172a', marginTop: '0.5rem' }}>
          {isEditing ? `Edit Harvest: ${formData.name || `#${id}`}` : 'List New Farm Harvest'}
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
          Directly showcase your crops to consumers with transparent fair pricing.
        </p>
      </div>

      {error && <ErrorMessage message={error} />}

      <div className="card" style={{ padding: '2rem' }}>
        <form onSubmit={handleSubmit}>
          {/* Crop Name */}
          <div className="form-group">
            <label className="form-label" htmlFor="name">
              Produce / Crop Name *
            </label>
            <input
              id="name"
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g. Organic Kashmiri Apples, Desi A2 Cow Ghee, Sharbati Wheat"
              required
              className="form-input"
            />
          </div>

          {/* Category & Unit Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label" htmlFor="category_id">
                Agricultural Category *
              </label>
              <select
                id="category_id"
                name="category_id"
                value={formData.category_id}
                onChange={handleChange}
                required
                className="form-select"
              >
                <option value="">Select Category</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="unit">
                Selling Unit *
              </label>
              <select
                id="unit"
                name="unit"
                value={formData.unit}
                onChange={handleChange}
                required
                className="form-select"
              >
                {COMMON_UNITS.map((u) => (
                  <option key={u} value={u}>
                    {u}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Pricing & Stock Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label" htmlFor="price">
                Price (₹ per {formData.unit}) *
              </label>
              <input
                id="price"
                type="number"
                step="0.01"
                min="0.1"
                name="price"
                value={formData.price}
                onChange={handleChange}
                placeholder="e.g. 60.00"
                required
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="quantity_available">
                Available Stock ({formData.unit}) *
              </label>
              <input
                id="quantity_available"
                type="number"
                step="0.1"
                min="0"
                name="quantity_available"
                value={formData.quantity_available}
                onChange={handleChange}
                placeholder="e.g. 150"
                required
                className="form-input"
              />
            </div>
          </div>

          {/* Image URL & Preview */}
          <div className="form-group">
            <label className="form-label" htmlFor="image_url">
              Produce Image URL (Direct photo link)
            </label>
            <input
              id="image_url"
              type="url"
              name="image_url"
              value={formData.image_url}
              onChange={handleChange}
              placeholder="https://images.unsplash.com/... or similar web image"
              className="form-input"
            />
            {formData.image_url && (
              <div style={{ marginTop: '0.75rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <img
                  src={formData.image_url}
                  alt="Preview"
                  onError={(e) => { e.target.style.display = 'none'; }}
                  style={{ width: '80px', height: '80px', borderRadius: 'var(--radius-md)', objectFit: 'cover', border: '1px solid var(--border-light)' }}
                />
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Image preview confirmation</span>
              </div>
            )}
          </div>

          {/* Description */}
          <div className="form-group">
            <label className="form-label" htmlFor="description">
              Crop Details & Organic Farming Notes
            </label>
            <textarea
              id="description"
              name="description"
              rows={4}
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe variety, soil type, chemical-free practices, harvest freshness, or usage recommendations..."
              className="form-textarea"
            />
          </div>

          {/* Submit Actions */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1.5rem' }}>
            <Link to="/farmer/products" className="btn btn-secondary">
              Cancel
            </Link>
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn btn-primary"
            >
              {isSubmitting
                ? 'Saving Produce...'
                : isEditing
                ? 'Update Produce'
                : 'Publish to Marketplace'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FarmerProductForm;
