import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import GlassPanel from '../components/ui/GlassPanel';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import api from '../services/api';
import './FindingPage.css';

const FindingPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [finding, setFinding] = useState(null);
  const [followUp, setFollowUp] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchFinding = async () => {
      try {
        const response = await api.get(`/api/findings/${id}`);
        setFinding(response.data);
      } catch (error) {
        // Mock data fallback
        setFinding({
          id,
          title: 'Market Shift in Enterprise AI Adoption',
          category: 'Insights',
          confidence: 'HIGH',
          timestamp: '2h ago',
          content: `
# Analysis Report: Enterprise AI Shift

Large-scale enterprises are moving from experimentation to production-ready AI agents. This shift is characterized by three main pillars:

1. **ROI-Focused Procurement**: Companies are no longer buying "AI capabilities" but "AI outcomes".
2. **Security-First Architecture**: Deployment is happening in VPCs and on-premise rather than public clouds.
3. **Agentic Workflows**: Moving from simple chat to autonomous agents that can perform tasks.

### Key Drivers
* Decreasing cost of inference for high-reasoning models.
* Standardization of RAG (Retrieval-Augmented Generation) patterns.
* Regulatory clarity in major markets (EU AI Act).

### Strategic Recommendations
Consider focusing on specialized security layers for autonomous agents in the B2B sector.
          `,
          sources: [
            { title: 'Gartner 2026 AI Infrastructure Report', url: '#' },
            { title: 'Forrester Wave: Conversational AI', url: '#' },
            { title: 'TechCrunch: The Rise of the AI Agent', url: '#' }
          ]
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchFinding();
  }, [id]);

  const handleFollowUp = async (e) => {
    e.preventDefault();
    if (!followUp) return;
    try {
      await api.post('/api/research', { 
        topic: `Follow up on "${finding.title}": ${followUp}`,
        context_finding_id: id 
      });
      navigate('/dashboard');
    } catch (error) {
      navigate('/dashboard');
    }
  };

  if (isLoading || !finding) return null;

  return (
    <div className="finding-detail-page">
      <header className="finding-detail-header">
        <div className="header-top">
          <Badge category={finding.category}>{finding.category}</Badge>
          <span className="timestamp">{finding.timestamp}</span>
        </div>
        <h1 className="finding-detail-title">{finding.title}</h1>
      </header>

      <div className="analysis-content">
        <ReactMarkdown>{finding.content}</ReactMarkdown>
      </div>

      <GlassPanel className="sources-section">
        <h3>Primary Sources</h3>
        <div className="source-list">
          {finding.sources.map((source, idx) => (
            <a key={idx} href={source.url} className="source-item" target="_blank" rel="noopener noreferrer">
              <span>📄</span>
              {source.title}
            </a>
          ))}
        </div>
      </GlassPanel>

      <div className="follow-up-section">
        <GlassPanel style={{ padding: '16px' }}>
          <form onSubmit={handleFollowUp} style={{ display: 'flex', gap: '12px' }}>
            <Input 
              placeholder="Ask a follow-up about this finding..." 
              value={followUp}
              onChange={(e) => setFollowUp(e.target.value)}
              style={{ flex: 1 }}
            />
            <Button type="submit">Send</Button>
          </form>
        </GlassPanel>
      </div>
    </div>
  );
};

export default FindingPage;
