import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import GlassPanel from '../ui/GlassPanel';
import Badge, { ConfidenceDot } from '../ui/Badge';
import Button from '../ui/Button';
import './FindingCard.css';

const WhyThis = ({ reasoning }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="why-this-container">
      <button 
        className="why-this-toggle" 
        onClick={() => setIsOpen(!isOpen)}
      >
        <span>Why did the system surface this?</span>
        <span className={`chevron ${isOpen ? 'open' : ''}`}>▼</span>
      </button>
      
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            style={{ overflow: 'hidden' }}
          >
            <div className="why-this-content">
              {reasoning}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const FindingCard = ({ finding, onApprove, onDismiss }) => {
  const { category, confidence, title, summary, sourceCount, timestamp, reasoning } = finding;

  return (
    <motion.div
      layout
      initial={{ x: 50, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: -50, opacity: 0 }}
      transition={{ type: 'spring', damping: 20, stiffness: 100 }}
    >
      <GlassPanel className={`finding-card ${category.toLowerCase()}`}>
        <div className="card-header">
          <div className="header-left">
            <Badge category={category}>{category}</Badge>
            <div className="confidence-wrapper">
              <ConfidenceDot level={confidence} />
              <span className="confidence-label">{confidence}</span>
            </div>
          </div>
          <div className="timestamp">{timestamp}</div>
        </div>

        <div className="card-body">
          <h3 className="finding-title">{title}</h3>
          <p className="finding-summary">{summary}</p>
        </div>

        <div className="card-footer">
          <div className="sources">
            <span className="source-icon">📄</span>
            {sourceCount} sources
          </div>
          <div className="card-actions">
            <button className="action-btn dismiss" onClick={() => onDismiss(finding.id)}>✕</button>
            <button className="action-btn approve" onClick={() => onApprove(finding.id)}>✓</button>
          </div>
        </div>

        <WhyThis reasoning={reasoning} />
      </GlassPanel>
    </motion.div>
  );
};

export default FindingCard;
