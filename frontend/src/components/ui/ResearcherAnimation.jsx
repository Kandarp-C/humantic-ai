import React from 'react';
import { motion } from 'framer-motion';

const ResearcherAnimation = () => {
  return (
    <div className="researcher-svg-container" style={{ width: '180px', height: '180px' }}>
      <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Glasses - Pulsing slightly */}
        <motion.g
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        >
          <circle cx="85" cy="70" r="8" stroke="var(--accent-pink)" strokeWidth="2" opacity="0.8" />
          <circle cx="115" cy="70" r="8" stroke="var(--accent-pink)" strokeWidth="2" opacity="0.8" />
          <line x1="93" y1="70" x2="107" y2="70" stroke="var(--accent-pink)" strokeWidth="2" />
        </motion.g>

        {/* Head */}
        <motion.circle 
          cx="100" cy="70" r="30" 
          stroke="var(--text-primary)" 
          strokeWidth="3"
          animate={{ y: [0, -2, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* Body */}
        <motion.line 
          x1="100" y1="100" x2="100" y2="160" 
          stroke="var(--text-primary)" 
          strokeWidth="3" 
        />

        {/* Chair/Sitting shadow */}
        <ellipse cx="100" cy="180" rx="40" ry="10" fill="var(--glow-primary)" opacity="0.2" />

        {/* Book */}
        <motion.g
          animate={{ 
            rotate: [-2, 2, -2],
            y: [0, -3, 0]
          }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        >
          <path d="M70 110 L130 110 L135 150 L65 150 Z" fill="var(--bg-elevated)" stroke="var(--accent-primary)" strokeWidth="2" />
          {/* Pages */}
          <line x1="80" y1="120" x2="120" y2="120" stroke="var(--text-secondary)" strokeWidth="1" opacity="0.5" />
          <line x1="80" y1="130" x2="120" y2="130" stroke="var(--text-secondary)" strokeWidth="1" opacity="0.5" />
          <line x1="80" y1="140" x2="110" y2="140" stroke="var(--text-secondary)" strokeWidth="1" opacity="0.5" />
          
          {/* Page Flip Animation */}
          <motion.path 
            d="M100 110 L100 150" 
            stroke="var(--accent-primary)" 
            strokeWidth="1"
            animate={{ x: [0, 20, 0], opacity: [0, 1, 0] }}
            transition={{ duration: 2, repeat: Infinity, delay: 1 }}
          />
        </motion.g>

        {/* Arms */}
        <path d="M100 110 L75 130 L85 135" stroke="var(--text-primary)" strokeWidth="3" strokeLinecap="round" />
        <path d="M100 110 L125 130 L115 135" stroke="var(--text-primary)" strokeWidth="3" strokeLinecap="round" />
      </svg>
    </div>
  );
};

export default ResearcherAnimation;
