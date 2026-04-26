import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import GlassPanel from '../components/ui/GlassPanel';
import { TextArea } from '../components/ui/Input';
import Button from '../components/ui/Button';
import { completeOnboarding } from '../services/api';
import './Onboarding.css';

const Onboarding = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    answer1: '',
    answer2: '',
    depth_preference: ''
  });
  const navigate = useNavigate();

  const handleNext = () => {
    if (step < 3) setStep(step + 1);
    else handleSubmit();
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = async () => {
    try {
      await completeOnboarding(formData.answer1, formData.answer2, formData.depth_preference);
      navigate('/dashboard');
    } catch (error) {
      console.error('Onboarding failed', error);
    }
  };

  const stepVariants = {
    enter: (direction) => ({
      x: direction > 0 ? 100 : -100,
      opacity: 0
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1
    },
    exit: (direction) => ({
      zIndex: 0,
      x: direction < 0 ? 100 : -100,
      opacity: 0
    })
  };

  return (
    <div className="onboarding-page">
      <GlassPanel className="onboarding-card">
        <AnimatePresence mode="wait" custom={step}>
          {step === 1 && (
            <motion.div 
              key="step1"
              className="step-content"
              custom={1}
              variants={stepVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3 }}
            >
              <h2>What are you working on right now?</h2>
              <TextArea 
                placeholder="E.g. Investigating the impact of Llama 3 on open-source AI adoption..."
                value={formData.answer1}
                onChange={(e) => setFormData({...formData, answer1: e.target.value})}
              />
            </motion.div>
          )}

          {step === 2 && (
            <motion.div 
              key="step2"
              className="step-content"
              custom={1}
              variants={stepVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3 }}
            >
              <h2>What is your biggest knowledge gap?</h2>
              <TextArea 
                placeholder="E.g. I need to understand the supply chain constraints for H100 GPUs in the next 12 months..."
                value={formData.answer2}
                onChange={(e) => setFormData({...formData, answer2: e.target.value})}
              />
            </motion.div>
          )}

          {step === 3 && (
            <motion.div 
              key="step3"
              className="step-content"
              custom={1}
              variants={stepVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3 }}
            >
              <h2>How do you prefer your results?</h2>
              <div className="preference-cards">
                <div 
                  className={`pref-card ${formData.depth_preference === 'quick_summaries' ? 'selected' : ''}`}
                  onClick={() => setFormData({...formData, depth_preference: 'quick_summaries'})}
                >
                  <h3>Quick Summaries</h3>
                  <p>Concise, bulleted insights for fast scanning.</p>
                </div>
                <div 
                  className={`pref-card ${formData.depth_preference === 'deep_dives' ? 'selected' : ''}`}
                  onClick={() => setFormData({...formData, depth_preference: 'deep_dives'})}
                >
                  <h3>Deep Dives</h3>
                  <p>Comprehensive reports with detailed source analysis.</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="onboarding-footer">
          <div className="progress-dots">
            {[1, 2, 3].map(i => (
              <div key={i} className={`dot ${step === i ? 'active' : ''}`} />
            ))}
          </div>
          
          <div style={{ display: 'flex', gap: '12px' }}>
            {step > 1 && (
              <Button variant="ghost" onClick={handleBack}>Back</Button>
            )}
            <Button 
              onClick={handleNext}
              disabled={(step === 1 && !formData.answer1) || (step === 2 && !formData.answer2) || (step === 3 && !formData.depth_preference)}
            >
              {step === 3 ? 'Finish' : 'Next'}
            </Button>
          </div>
        </div>
      </GlassPanel>
    </div>
  );
};

export default Onboarding;
