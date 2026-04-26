import React from 'react';
import { motion } from 'framer-motion';

const BookShelfAnimation = () => {
  const shelfCount = 4;
  const booksPerShelf = 30;
  const neonColors = ['var(--accent-pink)', 'var(--accent-primary)', '#FF00FF', '#D400FF'];

  return (
    <div className="bookshelf-svg-container" style={{ width: '100%', height: '180px' }}>
      <svg viewBox="0 0 500 200" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice">
        {/* Shelves */}
        {[...Array(shelfCount)].map((_, i) => (
          <line 
            key={`shelf-${i}`}
            x1="-50" y1={40 + i * 45} x2="550" y2={40 + i * 45} 
            stroke="var(--border-glass)" 
            strokeWidth="2" 
          />
        ))}

        {/* Books */}
        {[...Array(shelfCount)].map((_, s) => (
          [...Array(booksPerShelf)].map((_, b) => {
            const width = Math.random() * 8 + 6;
            const height = Math.random() * 20 + 15;
            const x = -30 + b * 18;
            const y = 40 + s * 45 - height;
            const randomColor = neonColors[Math.floor(Math.random() * neonColors.length)];
            
            return (
              <motion.rect
                key={`book-${s}-${b}`}
                x={x}
                y={y}
                width={width}
                height={height}
                rx="1"
                fill="rgba(255, 255, 255, 0.05)"
                stroke="rgba(255, 255, 255, 0.1)"
                strokeWidth="1"
                initial={{ strokeOpacity: 0.1 }}
                animate={{ 
                  stroke: [null, randomColor, null],
                  strokeOpacity: [0.1, 1, 0.1],
                  fill: [null, `${randomColor}22`, null],
                  boxShadow: [null, `0 0 10px ${randomColor}`, null]
                }}
                transition={{ 
                  duration: Math.random() * 3 + 2, 
                  repeat: Infinity, 
                  delay: Math.random() * 5,
                  ease: "easeInOut"
                }}
              />
            );
          })
        ))}
        
        {/* Glow Effects */}
        <defs>
          <filter id="neonGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>
      </svg>
    </div>
  );
};

export default BookShelfAnimation;
