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

const FindingCard = ({ finding, isAutoRefresh, onApprove, onDismiss }) => {
  const { category, confidence, title, summary, sources, sourceCount, timestamp, reasoning, why_this } = finding;
  const displaySourceCount = sourceCount ?? sources?.length ?? 0;
  const displayReasoning = reasoning || why_this;

  return (
    <motion.div
      layout
      initial={{ x: 50, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: -50, opacity: 0 }}
      transition={{ type: 'spring', damping: 20, stiffness: 100 }}
    >
      <GlassPanel className={`finding-card ${category?.toLowerCase() || 'deep_insight'}`}>
        <div className="card-header">
          <div className="header-left">
            <Badge category={category || 'deep_insight'}>{category || 'deep_insight'}</Badge>
            <div className="confidence-wrapper">
              <ConfidenceDot level={confidence || 'medium'} />
              <span className="confidence-label">{confidence || 'medium'}</span>
            </div>
            {isAutoRefresh && (
              <span style={{ fontSize: '0.75rem', background: 'rgba(255,255,255,0.1)', padding: '2px 8px', borderRadius: '12px', marginLeft: '8px' }}>
                🔄 Auto-refreshed
              </span>
            )}
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
            {displaySourceCount} sources
          </div>
          <div className="card-actions">
            <button className="action-btn dismiss" onClick={() => onDismiss(finding.id)}>✕</button>
            <button className="action-btn approve" onClick={() => onApprove(finding.id)}>✓</button>
          </div>
        </div>

        <WhyThis reasoning={displayReasoning} />
      </GlassPanel>
    </motion.div>
  );
};

export default FindingCard;
