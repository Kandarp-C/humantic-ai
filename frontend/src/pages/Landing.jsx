import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Button from '../components/ui/Button';
import GlassPanel from '../components/ui/GlassPanel';
import './Landing.css';

const Landing = () => {
  const navigate = useNavigate();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.3
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { duration: 0.6, ease: [0.4, 0, 0.2, 1] }
    }
  };

  const featureVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { duration: 0.8, ease: "easeOut" }
    }
  };

  return (
    <div className="landing-page">
      {/* HERO SECTION */}
      <section className="hero">
        <motion.div 
          className="hero-content"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.span className="eyebrow" variants={itemVariants}>
            AI Research Companion
          </motion.span>
          
          <motion.h1 className="hero-title" variants={itemVariants}>
            Your AI Research Buddy <br /> That Never Sleeps.
          </motion.h1>
          
          <motion.p className="hero-subtitle" variants={itemVariants}>
            Submit a research topic. Walk away. Wake up to structured findings, 
            sourced insights, and clear reasoning — all done overnight.
          </motion.p>
          
          <motion.div className="hero-ctas" variants={itemVariants}>
            <Button size="large" onClick={() => navigate('/signup')}>
              Get Started Free
            </Button>
            <Button variant="ghost" size="large" onClick={() => document.getElementById('features').scrollIntoView({ behavior: 'smooth' })}>
              See How It Works
            </Button>
          </motion.div>

          <motion.div variants={itemVariants} style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
            <GlassPanel className="dashboard-mockup">
              <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
                <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: 'var(--border-glass)' }}></div>
                <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: 'var(--border-glass)' }}></div>
                <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: 'var(--border-glass)' }}></div>
              </div>
              <div style={{ width: '60%', height: '20px', background: 'var(--glass-light)', borderRadius: '4px', marginBottom: '32px' }}></div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
                {[1, 2, 3].map(i => (
                  <div key={i} style={{ height: '120px', background: 'var(--glass-light)', borderRadius: 'var(--radius-card)', border: '1px solid var(--border-glass)' }}></div>
                ))}
              </div>
            </GlassPanel>
          </motion.div>
        </motion.div>
      </section>

      {/* FEATURES SECTION */}
      <section id="features" className="features-section">
        <div className="section-header">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            Everything a great research colleague would do.
          </motion.h2>
        </div>

        <motion.div 
          className="bento-grid"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={{
            visible: { transition: { staggerChildren: 0.1 } }
          }}
        >
          <motion.div variants={featureVariants}>
            <GlassPanel className="feature-card">
              <div className="feature-icon">🌙</div>
              <h3 className="feature-title">Researches While You Sleep</h3>
              <p className="feature-description">
                Autonomous overnight research that runs on your topics without any action needed from you.
              </p>
            </GlassPanel>
          </motion.div>

          <motion.div variants={featureVariants}>
            <GlassPanel className="feature-card alt">
              <div className="feature-icon">📊</div>
              <h3 className="feature-title">Structured, Trustworthy Findings</h3>
              <p className="feature-description">
                Every result comes with sources, confidence levels, and a plain-language explanation of why it was surfaced.
              </p>
            </GlassPanel>
          </motion.div>

          <motion.div variants={featureVariants}>
            <GlassPanel className="feature-card alt">
              <div className="feature-icon">🧠</div>
              <h3 className="feature-title">Gets Smarter Over Time</h3>
              <p className="feature-description">
                The more you use it, the better it understands your domain, priorities, and research style.
              </p>
            </GlassPanel>
          </motion.div>

          <motion.div variants={featureVariants}>
            <GlassPanel className="feature-card">
              <div className="feature-icon">📌</div>
              <h3 className="feature-title">Pinned Interests Always Watched</h3>
              <p className="feature-description">
                Tell it what you care about most. It monitors those topics continuously and alerts you when something changes.
              </p>
            </GlassPanel>
          </motion.div>
        </motion.div>
      </section>

      {/* CTA SECTION */}
      <section className="cta-section">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2>Start waking up to better research.</h2>
          <Button size="large" onClick={() => navigate('/signup')}>
            Get Started Free
          </Button>
        </motion.div>
      </section>
    </div>
  );
};

export default Landing;
