import React from 'react';
import ProductCard from './ProductCard';

export const ProductGrid = ({ products = [], emptyMessage = "No agricultural harvests match your criteria." }) => {
  if (products.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon">🌾</div>
        <h4 className="empty-state-title">No Harvests Found</h4>
        <p className="empty-state-text">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="grid-products">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
};

export default ProductGrid;
