import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import GlassPanel from '../ui/GlassPanel';
import { TextArea, Input } from '../ui/Input';
import Button from '../ui/Button';
import './ResearchInput.css';

const ResearchInput = ({ onSubmit }) => {
  const [topic, setTopic] = useState('');
  const [goal, setGoal] = useState('');
  const [showGoal, setShowGoal] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!topic) return;
    onSubmit({ topic, goal });
    setTopic('');
    setGoal('');
    setShowGoal(false);
  };

  return (
    <GlassPanel className="research-input-container">
      <form onSubmit={handleSubmit}>
        <TextArea 
          placeholder="What should I research next?" 
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          className="main-input"
        />
        
        <AnimatePresence>
          {showGoal && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              style={{ overflow: 'hidden' }}
            >
              <Input 
                placeholder="Add a specific goal (optional)..." 
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                className="goal-input"
              />
            </motion.div>
          )}
        </AnimatePresence>

        <div className="input-actions">
          <button 
            type="button" 
            className="add-goal-link"
            onClick={() => setShowGoal(!showGoal)}
          >
            {showGoal ? '− Remove goal' : '+ Add a goal'}
          </button>
          <Button type="submit" disabled={!topic}>
            Start Research
          </Button>
        </div>
      </form>
    </GlassPanel>
  );
};

export default ResearchInput;
