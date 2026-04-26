import React from 'react';
import GlassPanel from '../ui/GlassPanel';
import './TopicCard.css';

const TopicCard = ({ topic: topicData }) => {
  const { topic, status, cycles_completed, created_at } = topicData;
  
  const statusColors = {
    queued: 'var(--text-secondary)',
    researching: 'var(--accent-primary)',
    completed: 'var(--accent-secondary)',
    failed: 'var(--accent-warning)'
  };

  const formattedDate = new Date(created_at).toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric', 
    year: 'numeric' 
  });

  return (
    <GlassPanel className="topic-card">
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '-8px' }}>
        <span 
          className={`status-indicator ${status === 'researching' ? 'pulsing' : ''}`}
          style={{ background: statusColors[status] || 'var(--text-secondary)' }}
        />
      </div>
      
      <h4 className="topic-title" style={{ color: 'white' }}>{topic}</h4>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span className="meta-item">{cycles_completed || 0} cycles</span>
        <span className="meta-item">{formattedDate}</span>
      </div>
      
      <div className="status-label" style={{ color: statusColors[status] || 'var(--text-secondary)', marginTop: '4px' }}>
        {status?.toUpperCase()}
      </div>
    </GlassPanel>
  );
};

export default TopicCard;
