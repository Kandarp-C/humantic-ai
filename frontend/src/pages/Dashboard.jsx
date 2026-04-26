import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ResearchInput from '../components/research/ResearchInput';
import TopicCard from '../components/research/TopicCard';
import CategoryFilter from '../components/findings/CategoryFilter';
import FindingCard from '../components/findings/FindingCard';
import { 
  getResearch, 
  getFindings, 
  submitResearch, 
  updateFinding 
} from '../services/api';
import BookShelfAnimation from '../components/ui/BookShelfAnimation';
import DataCableAnimation from '../components/ui/DataCableAnimation';
import './Dashboard.css';

import useWebSocket from '../hooks/useWebSocket';

const Dashboard = () => {
  const [topics, setTopics] = useState([]);
  const [findings, setFindings] = useState([]);
  const [activeCategory, setActiveCategory] = useState('All');
  const [isLoading, setIsLoading] = useState(true);

  const { lastMessage } = useWebSocket('ws://localhost:8000/ws/findings');

  useEffect(() => {
    if (lastMessage && lastMessage.type === 'new_finding') {
      setFindings(prev => [lastMessage.data, ...prev]);
    }
  }, [lastMessage]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [topicsRes, findingsRes] = await Promise.all([
          getResearch(),
          getFindings()
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
      const response = await submitResearch(data.topic, data.goal);
      setTopics([response.data, ...topics]);
    } catch (error) {
      console.error('Failed to submit research', error);
    }
  };

  const handleApproveFinding = async (id) => {
    try {
      await updateFinding(id, 'approved');
      setFindings(findings.filter(f => f.id !== id));
    } catch (error) {
      console.error('Failed to approve finding', error);
    }
  };

  const handleDismissFinding = async (id) => {
    try {
      await updateFinding(id, 'dismissed');
      setFindings(findings.filter(f => f.id !== id));
    } catch (error) {
      console.error('Failed to dismiss finding', error);
    }
  };

  const filteredFindings = activeCategory === 'All' 
    ? findings 
    : findings.filter(f => f.category === activeCategory);

  return (
    <div className="dashboard-page">
      <section className="input-section-container">
        <div className="input-with-animations">
          <div className="side-animation hide-mobile">
            <BookShelfAnimation />
          </div>
          
          <div className="main-input-wrapper">
            <ResearchInput onSubmit={handleResearchSubmit} />
          </div>
          
          <div className="side-animation hide-mobile">
            <BookShelfAnimation />
          </div>
        </div>
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

      <section className="findings-section-container">
        <div className="feed-with-animations">
          <div className="side-animation hide-mobile">
            <DataCableAnimation />
          </div>

          <div className="findings-feed-wrapper">
            <h2 className="section-title">Recent Findings</h2>
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
          </div>

          <div className="side-animation hide-mobile">
            <DataCableAnimation />
          </div>
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
