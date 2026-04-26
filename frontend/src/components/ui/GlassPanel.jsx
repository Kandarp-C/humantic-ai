import React from 'react';

const GlassPanel = ({ children, className = '', style = {}, ...props }) => {
  return (
    <div 
      className={`glass-panel ${className}`} 
      style={{
        borderRadius: 'var(--radius-card)',
        ...style
      }}
      {...props}
    >
      {children}
    </div>
  );
};

export default GlassPanel;
