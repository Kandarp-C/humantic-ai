import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ResearchInput from '../components/research/ResearchInput';
import TopicCard from '../components/research/TopicCard';
import CategoryFilter from '../components/findings/CategoryFilter';
import FindingCard from '../components/findings/FindingCard';
import api from '../services/api';
import './Dashboard.css';

import useWebSocket from '../hooks/useWebSocket';

const Dashboard = () => {
  const [topics, setTopics] = useState([]);
  const [findings, setFindings] = useState([]);
  const [activeCategory, setActiveCategory] = useState('All');
  const [isLoading, setIsLoading] = useState(true);

  const { lastMessage } = useWebSocket('ws://localhost:8000/ws/findings');

  useEffect(() => {
    if (lastMessage && lastMessage.type === 'NEW_FINDING') {
      setFindings(prev => [lastMessage.data, ...prev]);
    }
  }, [lastMessage]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [topicsRes, findingsRes] = await Promise.all([
          api.get('/api/research'),
          api.get('/api/findings')
        ]);
        setTopics(topicsRes.data);
        setFindings(findingsRes.data);
      } catch (error) {
        console.error('Failed to fetch dashboard data', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleResearchSubmit = async (data) => {
    try {
      const response = await api.post('/api/research', data);
      setTopics([response.data, ...topics]);
    } catch (error) {
      // Mock update for demo
      const newTopic = {
        id: Date.now().toString(),
        title: data.topic,
        status: 'pending',
        cycles: 0,
        createdAt: new Date().toISOString()
      };
      setTopics([newTopic, ...topics]);
    }
  };

  const handleApproveFinding = async (id) => {
    try {
      await api.patch(`/api/findings/${id}`, { status: 'approved' });
      setFindings(findings.filter(f => f.id !== id));
    } catch (error) {
      // Mock update
      setFindings(findings.filter(f => f.id !== id));
    }
  };

  const handleDismissFinding = async (id) => {
    try {
      await api.patch(`/api/findings/${id}`, { status: 'dismissed' });
      setFindings(findings.filter(f => f.id !== id));
    } catch (error) {
      // Mock update
      setFindings(findings.filter(f => f.id !== id));
    }
  };

  const filteredFindings = activeCategory === 'All' 
    ? findings 
    : findings.filter(f => f.category === activeCategory);

  return (
    <div className="dashboard-page">
      <section className="input-section">
        <ResearchInput onSubmit={handleResearchSubmit} />
      </section>

      <section className="active-research-section">
        <h2>Active Research</h2>
        <div className="topics-row">
          {topics.map(topic => (
            <TopicCard key={topic.id} topic={topic} />
          ))}
          {topics.length === 0 && !isLoading && (
            <div className="empty-state">No active topics. Start one above.</div>
          )}
        </div>
      </section>

      <section className="findings-feed-section">
        <h2>Recent Findings</h2>
        <CategoryFilter 
          activeCategory={activeCategory} 
          onCategoryChange={setActiveCategory} 
        />
        
        <div className="findings-feed">
          <AnimatePresence mode="popLayout">
            {filteredFindings.map(finding => (
              <FindingCard 
                key={finding.id} 
                finding={finding} 
                onApprove={handleApproveFinding}
                onDismiss={handleDismissFinding}
              />
            ))}
          </AnimatePresence>
          
          {filteredFindings.length === 0 && !isLoading && (
            <div className="empty-state">
              No {activeCategory !== 'All' ? activeCategory.toLowerCase() : ''} findings yet. 
              Research runs overnight.
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
