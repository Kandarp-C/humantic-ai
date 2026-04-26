import React from 'react';
import './Input.css';

export const Input = ({ label, error, className = '', ...props }) => {
  return (
    <div className={`input-container ${className}`}>
      {label && <label className="input-label">{label}</label>}
      <input 
        className={`input-field ${error ? 'input-error' : ''}`}
        {...props}
      />
      {error && <span className="error-text">{error}</span>}
    </div>
  );
};

export const TextArea = ({ label, error, className = '', ...props }) => {
  return (
    <div className={`input-container ${className}`}>
      {label && <label className="input-label">{label}</label>}
      <textarea 
        className={`textarea-field ${error ? 'input-error' : ''}`}
        {...props}
      />
      {error && <span className="error-text">{error}</span>}
    </div>
  );
};

export default Input;
