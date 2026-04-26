import React from 'react';
import './Loader.css';

const Loader = ({ size = 'medium', type = 'spinner', className = '' }) => {
  if (type === 'pulse') {
    return (
      <div className={`loader-container ${className}`}>
        <div className="pulse-loader">
          <div className="pulse-dot"></div>
          <div className="pulse-dot"></div>
          <div className="pulse-dot"></div>
        </div>
      </div>
    );
  }

  return (
    <div className={`loader-container ${className}`}>
      <div className={`spinner ${size === 'small' ? 'spinner-small' : ''}`}></div>
    </div>
  );
};

export default Loader;
