import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import GlassPanel from '../components/ui/GlassPanel';
import Button from '../components/ui/Button';
import { TextArea } from '../components/ui/Input';
import api from '../services/api';
import './PinnedInterests.css';

const PinnedInterests = () => {
  const [pins, setPins] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newPinDesc, setNewPinDesc] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPins = async () => {
      try {
        const response = await api.get('/api/pins');
        setPins(response.data);
      } catch (error) {
        console.error('Failed to fetch pins', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPins();
  }, []);

  const handleAddPin = async (e) => {
    e.preventDefault();
    if (!newPinDesc) return;
    try {
      const response = await api.post('/api/pins', { description: newPinDesc });
      setPins([response.data, ...pins]);
      setNewPinDesc('');
      setIsModalOpen(false);
    } catch (error) {
      // Mock update
      const newPin = { id: Date.now().toString(), description: newPinDesc, lastChecked: 'Just now' };
      setPins([newPin, ...pins]);
      setNewPinDesc('');
      setIsModalOpen(false);
    }
  };

  const handleArchive = async (id) => {
    try {
      await api.delete(`/api/pins/${id}`);
      setPins(pins.filter(p => p.id !== id));
    } catch (error) {
      setPins(pins.filter(p => p.id !== id));
    }
  };

  return (
    <div className="pinned-page">
      <header className="pinned-header">
        <h1>Pinned Interests</h1>
        <Button onClick={() => setIsModalOpen(true)}>+ Add Interest</Button>
      </header>

      <div className="pins-grid">
        <AnimatePresence mode="popLayout">
          {pins.map(pin => (
            <motion.div
              key={pin.id}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              <GlassPanel className="pin-card">
                <div className="pin-info">
                  <span className="pin-description">{pin.description}</span>
                  <span className="pin-meta">Last checked {pin.lastChecked}</span>
                </div>
                <div className="pin-actions">
                  <Button variant="ghost" size="small" onClick={() => handleArchive(pin.id)}>Archive</Button>
                </div>
              </GlassPanel>
            </motion.div>
          ))}
        </AnimatePresence>
        
        {pins.length === 0 && !isLoading && (
          <div className="empty-state">No pinned interests yet. Add something you want to monitor continuously.</div>
        )}
      </div>

      {/* ADD PIN MODAL */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              onClick={(e) => e.stopPropagation()}
              style={{ width: '100%', maxWidth: '500px' }}
            >
              <GlassPanel className="modal-content">
                <div className="modal-header">
                  <h2>New Pinned Interest</h2>
                </div>
                <form onSubmit={handleAddPin} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <TextArea 
                    label="What topic should I monitor for you?" 
                    placeholder="E.g. Breakthroughs in room-temperature superconductors..." 
                    value={newPinDesc}
                    onChange={(e) => setNewPinDesc(e.target.value)}
                    required
                  />
                  <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                    <Button variant="ghost" type="button" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                    <Button type="submit">Create Pin</Button>
                  </div>
                </form>
              </GlassPanel>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PinnedInterests;
