import React from 'react';
import './Button.css';

const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'medium', 
  pill = false,
  className = '', 
  ...props 
}) => {
  const variantClass = `btn-${variant}`;
  const sizeClass = size === 'large' ? 'btn-large' : '';
  const pillClass = pill ? 'btn-pill' : '';
  
  return (
    <button 
      className={`btn ${variantClass} ${sizeClass} ${pillClass} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
