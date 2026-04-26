import React, { useMemo } from 'react';
import { motion } from 'framer-motion';

const DataCableAnimation = () => {
  // Generate random rectilinear paths
  const paths = useMemo(() => {
    const generatedPaths = [];
    const step = 60;
    const width = 300;
    const height = 1200;

    for (let i = 0; i < 4; i++) {
      let x = Math.random() * width;
      let y = 0;
      let path = `M ${x} ${y}`;
      
      while (y < height) {
        const nextY = y + Math.random() * 100 + 50;
        const nextX = x + (Math.random() > 0.5 ? step : -step);
        
        // Vertical step
        path += ` L ${x} ${nextY}`;
        // Horizontal step
        path += ` L ${nextX} ${nextY}`;
        
        x = nextX;
        y = nextY;
      }
      generatedPaths.push(path);
    }
    return generatedPaths;
  }, []);

  return (
    <div className="data-cable-container" style={{ width: '100%', height: '100%', opacity: 0.8 }}>
      <svg viewBox="0 0 300 1200" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice">
        {/* Background Cables */}
        {paths.map((path, i) => (
          <path 
            key={`cable-${i}`}
            d={path}
            stroke="rgba(128, 128, 128, 0.3)"
            strokeWidth="1"
            opacity="0.5"
          />
        ))}

        {/* Data Packets */}
        {paths.map((path, i) => (
          <motion.path
            key={`packet-${i}`}
            d={path}
            stroke="var(--accent-pink)"
            strokeWidth="2"
            strokeDasharray="10, 1000"
            initial={{ strokeDashoffset: 1000 }}
            animate={{ strokeDashoffset: 0 }}
            transition={{
              duration: Math.random() * 5 + 5,
              repeat: Infinity,
              delay: Math.random() * 5,
              ease: "linear"
            }}
            style={{ filter: 'drop-shadow(0 0 5px var(--accent-pink))' }}
          />
        ))}
      </svg>
    </div>
  );
};

export default DataCableAnimation;
