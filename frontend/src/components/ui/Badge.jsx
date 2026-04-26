import React from 'react';
import './Badge.css';

const Badge = ({ children, category = 'insights', className = '', ...props }) => {
  const categoryClass = `badge-${category.toLowerCase()}`;
  
  return (
    <span className={`badge ${categoryClass} ${className}`} {...props}>
      {children}
    </span>
  );
};

export const ConfidenceDot = ({ level = 'high', className = '' }) => {
  const levelClass = `dot-${level.toLowerCase()}`;
  return <span className={`dot ${levelClass} ${className}`} />;
};

export default Badge;
