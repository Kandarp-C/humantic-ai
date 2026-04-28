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
  updateFinding,
  getChatSessions,
  createChatSession,
  sendChatMessage 
} from '../services/api';
import BookShelfAnimation from '../components/ui/BookShelfAnimation';
import DataCableAnimation from '../components/ui/DataCableAnimation';
import ChatPanel from '../components/chat/ChatPanel';
import './Dashboard.css';

import useWebSocket from '../hooks/useWebSocket';

const Dashboard = () => {
  const [view, setView] = useState('research'); // 'research' or 'chat'
  const [topics, setTopics] = useState([]);
  const [findings, setFindings] = useState([]);
  const [activeCategory, setActiveCategory] = useState('All');
  const [isLoading, setIsLoading] = useState(true);
  const [toast, setToast] = useState(null);

  const { lastMessage } = useWebSocket('ws://localhost:8000/ws/findings');

  useEffect(() => {
    if (lastMessage) {
      if (lastMessage.type === 'new_finding') {
        setFindings(prev => [lastMessage.data, ...prev]);
      } else if (lastMessage.type === 'new_topic') {
        setTopics(prev => [lastMessage.data, ...prev]);
      } else if (lastMessage.type === 'topic_updated') {
        setTopics(prev => prev.map(t => t.id === lastMessage.data.id ? lastMessage.data : t));
      } else if (lastMessage.type === 'auto_pin_created') {
        setToast({ message: lastMessage.message });
        setTimeout(() => setToast(null), 5000);
      }
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

  // Fallback Polling
  const [pollingActive, setPollingActive] = useState(false);
  const [pollingTimeLeft, setPollingTimeLeft] = useState(120);

  useEffect(() => {
    let interval;
    if (pollingActive && pollingTimeLeft > 0) {
      interval = setInterval(async () => {
        setPollingTimeLeft(prev => prev - 5);
        try {
          const findingsRes = await getFindings();
          const newFindings = findingsRes.data;
          if (newFindings.length > findings.length) {
            setFindings(newFindings);
            setPollingActive(false); // Stop when findings appear
          }
        } catch (e) {
          console.error(e);
        }
      }, 5000);
    } else if (pollingTimeLeft <= 0) {
      setPollingActive(false);
    }
    return () => clearInterval(interval);
  }, [pollingActive, pollingTimeLeft, findings.length]);

  const handleResearchSubmit = async (data) => {
    try {
      // 1. Submit the actual research task
      const response = await submitResearch(data.topic, data.goal);
      setTopics([response.data, ...topics]);

      // 2. Also send a message to the chat to keep history in sync
      const sessionsRes = await getChatSessions();
      let sessionId;
      if (sessionsRes.data.length > 0) {
        sessionId = sessionsRes.data[0].id;
      } else {
        const newSession = await createChatSession();
        sessionId = newSession.data.id;
      }
      
      const chatContent = `[SYSTEM]: New research task started.\nTopic: ${data.topic}\nGoal: ${data.goal || 'N/A'}`;
      await sendChatMessage(sessionId, chatContent);
      
      // Start fallback polling
      setPollingActive(true);
      setPollingTimeLeft(120);
      
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
      <div className="view-toggle">
        <button 
          className={view === 'research' ? 'active' : ''} 
          onClick={() => setView('research')}
        >
          Research Hub
        </button>
        <button 
          className={view === 'chat' ? 'active' : ''} 
          onClick={() => setView('chat')}
        >
          AI Research Chat
        </button>
      </div>

      {view === 'research' ? (
        <>
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
                        isAutoRefresh={topics.find(t => t.id === finding.topic_id)?.is_auto_refresh}
                        onApprove={handleApproveFinding}
                        onDismiss={handleDismissFinding}
                      />
                    ))}
                  </AnimatePresence>
                  
                  {filteredFindings.length === 0 && !isLoading && (
                    <div className="empty-state">
                      Your research companion is working on it... findings will appear here shortly 🌙
                    </div>
                  )}
                </div>
              </div>

              <div className="side-animation hide-mobile">
                <DataCableAnimation />
              </div>
            </div>
          </section>
        </>
      ) : (
        <section className="chat-section-container">
          <ChatPanel />
        </section>
      )}

      <AnimatePresence>
        {toast && (
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            style={{ 
              position: 'fixed', bottom: '20px', right: '20px', 
              background: 'var(--accent-primary)', color: 'white', 
              padding: '16px 24px', borderRadius: '8px', zIndex: 1000, 
              boxShadow: '0 4px 12px rgba(0,0,0,0.3)', maxWidth: '400px' 
            }}
          >
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Dashboard;
