import React, { useState } from 'react';

export const SearchBar = ({ onSearch, placeholder = 'Search farm fresh tomatoes, wheat, pure ghee, spices...' }) => {
  const [query, setQuery] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch(query.trim());
  };

  const handleClear = () => {
    setQuery('');
    onSearch('');
  };

  return (
    <form onSubmit={handleSubmit} style={{ position: 'relative', width: '100%', maxWidth: '640px' }}>
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
        <span
          style={{
            position: 'absolute',
            left: '1rem',
            color: 'var(--text-muted)',
            fontSize: '1.1rem',
            pointerEvents: 'none',
          }}
        >
          🔍
        </span>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          className="form-input"
          style={{
            paddingLeft: '2.75rem',
            paddingRight: query ? '5.5rem' : '4rem',
            height: '50px',
            borderRadius: 'var(--radius-full)',
            boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
            border: '1.5px solid var(--border-light)',
            fontSize: '0.95rem',
          }}
        />
        {query && (
          <button
            type="button"
            onClick={handleClear}
            style={{
              position: 'absolute',
              right: '3.75rem',
              background: 'none',
              border: 'none',
              color: 'var(--text-light)',
              cursor: 'pointer',
              fontSize: '1rem',
              padding: '0.25rem',
            }}
            title="Clear search"
          >
            ✕
          </button>
        )}
        <button
          type="submit"
          className="btn btn-primary"
          style={{
            position: 'absolute',
            right: '5px',
            height: '40px',
            borderRadius: 'var(--radius-full)',
            padding: '0 1.25rem',
            fontSize: '0.85rem',
          }}
        >
          Search
        </button>
      </div>
    </form>
  );
};

export default SearchBar;
