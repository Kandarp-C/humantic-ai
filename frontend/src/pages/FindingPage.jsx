import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import GlassPanel from '../components/ui/GlassPanel';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { getFindingById, submitResearch } from '../services/api';
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
        const response = await getFindingById(id);
        setFinding(response.data);
      } catch (error) {
        console.error('Failed to fetch finding', error);
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
      await submitResearch(`Follow up on "${finding.title}": ${followUp}`, null);
      navigate('/dashboard');
    } catch (error) {
      console.error('Failed to send follow up', error);
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
