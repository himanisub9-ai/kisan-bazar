import React from 'react';

const CATEGORY_ICONS = {
  All: '🌾',
  Vegetables: '🥦',
  Fruits: '🍎',
  Grains: '🌾',
  Pulses: '🫘',
  Dairy: '🥛',
  Spices: '🌶️',
  'Organic Products': '🌿',
};

export const CategoryFilter = ({ categories = [], selectedCategory = null, onSelectCategory }) => {
  const allCategories = [{ id: null, name: 'All' }, ...categories];

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.65rem',
        overflowX: 'auto',
        padding: '0.5rem 0',
        scrollbarWidth: 'none',
        msOverflowStyle: 'none',
      }}
    >
      {allCategories.map((cat) => {
        const isSelected = selectedCategory === (cat.id === null ? null : cat.name);
        const icon = CATEGORY_ICONS[cat.name] || '🌱';

        return (
          <button
            key={cat.id ?? 'all'}
            type="button"
            onClick={() => onSelectCategory(cat.id === null ? null : cat.name)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.45rem',
              padding: '0.5rem 1rem',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.875rem',
              fontWeight: 600,
              cursor: 'pointer',
              border: '1.5px solid',
              borderColor: isSelected ? 'var(--primary-700)' : 'var(--border-light)',
              backgroundColor: isSelected ? 'var(--primary-700)' : '#ffffff',
              color: isSelected ? '#ffffff' : 'var(--text-main)',
              transition: 'all 0.15s ease',
              whiteSpace: 'nowrap',
              boxShadow: isSelected ? '0 4px 10px rgba(21, 128, 61, 0.2)' : 'var(--shadow-sm)',
            }}
          >
            <span>{icon}</span>
            <span>{cat.name}</span>
          </button>
        );
      })}
    </div>
  );
};

export default CategoryFilter;
