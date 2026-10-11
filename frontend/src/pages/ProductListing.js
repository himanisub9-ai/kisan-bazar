import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import productService from '../services/productService';
import ProductGrid from '../components/ProductGrid';
import CategoryFilter from '../components/CategoryFilter';
import SearchBar from '../components/SearchBar';
import Loading from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';

export const ProductListing = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const currentCategory = searchParams.get('category') || null;
  const currentSearch = searchParams.get('search') || '';
  const currentSort = searchParams.get('sort') || 'newest';
  const currentFarmerId = searchParams.get('farmer_id') || null;

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchHarvests = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const params = {
        sort: currentSort,
      };
      if (currentCategory) params.category = currentCategory;
      if (currentSearch) params.search = currentSearch;
      if (currentFarmerId) params.farmer_id = currentFarmerId;

      const [prods, cats] = await Promise.all([
        productService.getProducts(params),
        categories.length === 0 ? productService.getCategories() : Promise.resolve(categories),
      ]);

      setProducts(prods);
      if (categories.length === 0) setCategories(cats);
    } catch (err) {
      setError('Failed to fetch agricultural produce. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [currentCategory, currentSearch, currentSort, currentFarmerId, categories]);

  useEffect(() => {
    fetchHarvests();
  }, [fetchHarvests]);

  const handleCategorySelect = (categoryName) => {
    const nextParams = new URLSearchParams(searchParams);
    if (categoryName) {
      nextParams.set('category', categoryName);
    } else {
      nextParams.delete('category');
    }
    setSearchParams(nextParams);
  };

  const handleSearch = (term) => {
    const nextParams = new URLSearchParams(searchParams);
    if (term) {
      nextParams.set('search', term);
    } else {
      nextParams.delete('search');
    }
    setSearchParams(nextParams);
  };

  const handleSortChange = (e) => {
    const nextParams = new URLSearchParams(searchParams);
    nextParams.set('sort', e.target.value);
    setSearchParams(nextParams);
  };

  const clearAllFilters = () => {
    setSearchParams({});
  };

  const hasFilters = !!currentCategory || !!currentSearch || !!currentFarmerId || currentSort !== 'newest';

  return (
    <div className="page-wrapper container">
      {/* Title & Search Header */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1.25rem',
          marginBottom: '2rem',
        }}
      >
        <div>
          <h1 style={{ fontSize: '2rem', color: '#0f172a' }}>
            {currentCategory
              ? `${currentCategory} Produce`
              : currentFarmerId && products[0]?.farmer
              ? `Harvests from ${products[0].farmer.farm_name || products[0].farmer.name}`
              : 'All Farm Harvests'}
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.925rem', marginTop: '4px' }}>
            {currentFarmerId && products[0]?.farmer?.farm_location
              ? `📍 ${products[0].farmer.farm_location}`
              : 'Direct from organic fields, orchards, and dairies'}
          </p>
        </div>

        <SearchBar onSearch={handleSearch} placeholder="Search by crop, variety, or farm..." />
      </div>

      {/* Category Pills Bar */}
      <div style={{ marginBottom: '1.5rem' }}>
        <CategoryFilter
          categories={categories}
          selectedCategory={currentCategory}
          onSelectCategory={handleCategorySelect}
        />
      </div>

      {/* Sort & Filter Controls Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
          backgroundColor: '#ffffff',
          padding: '0.85rem 1.25rem',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-light)',
          marginBottom: '1.75rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
          <span>Showing <strong>{products.length}</strong> available harvests</span>
          {hasFilters && (
            <button
              type="button"
              onClick={clearAllFilters}
              style={{
                background: 'none',
                border: 'none',
                color: '#dc2626',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: '0.85rem',
                textDecoration: 'underline',
              }}
            >
              Reset Filters ✕
            </button>
          )}
        </div>

        {/* Sort Select */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <label htmlFor="sort-select" style={{ fontSize: '0.875rem', fontWeight: 600, color: '#334155' }}>
            Sort By:
          </label>
          <select
            id="sort-select"
            value={currentSort}
            onChange={handleSortChange}
            className="form-select"
            style={{ width: 'auto', padding: '0.4rem 0.85rem', fontSize: '0.875rem' }}
          >
            <option value="newest">Fresh Harvests (Newest)</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
          </select>
        </div>
      </div>

      {/* Products Display */}
      {error && <ErrorMessage message={error} onRetry={fetchHarvests} />}
      {isLoading ? (
        <Loading message="Loading marketplace products..." />
      ) : (
        <ProductGrid
          products={products}
          emptyMessage={
            hasFilters
              ? 'No products matched your search or category filter. Try clearing filters to see all harvests.'
              : 'No agricultural products currently listed in the marketplace.'
          }
        />
      )}
    </div>
  );
};

export default ProductListing;
