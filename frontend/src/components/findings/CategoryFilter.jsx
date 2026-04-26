import React from 'react';
import './CategoryFilter.css';

const categories = ['All', 'Insights', 'Trends', 'Opportunities', 'Experimental'];

const CategoryFilter = ({ activeCategory, onCategoryChange }) => {
  return (
    <div className="category-filter">
      {categories.map((cat) => (
        <button
          key={cat}
          className={`filter-pill ${activeCategory === cat ? 'active' : ''} ${cat.toLowerCase()}`}
          onClick={() => onCategoryChange(cat)}
        >
          {cat}
        </button>
      ))}
    </div>
  );
};

export default CategoryFilter;
