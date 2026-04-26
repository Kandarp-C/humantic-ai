import React from 'react';
import GlassPanel from '../ui/GlassPanel';
import './TopicCard.css';

const TopicCard = ({ topic }) => {
  const { title, status, cycles, createdAt } = topic;
  
  const statusColors = {
    pending: 'var(--text-secondary)',
    researching: 'var(--accent-primary)',
    completed: 'var(--accent-secondary)',
    failed: 'var(--accent-warning)'
  };

  return (
    <GlassPanel className="topic-card">
      <div className="topic-header">
        <h4 className="topic-title">{title}</h4>
        <span 
          className={`status-indicator ${status === 'researching' ? 'pulsing' : ''}`}
          style={{ background: statusColors[status] }}
        />
      </div>
      <div className="topic-meta">
        <span className="meta-item">{cycles} cycles completed</span>
        <span className="meta-item">{new Date(createdAt).toLocaleDateString()}</span>
      </div>
      <div className="status-label" style={{ color: statusColors[status] }}>
        {status.toUpperCase()}
      </div>
    </GlassPanel>
  );
};

export default TopicCard;
