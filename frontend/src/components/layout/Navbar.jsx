import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import GlassPanel from '../ui/GlassPanel';
import Button from '../ui/Button';
import './Navbar.css';

const Navbar = () => {
  const { isAuthenticated, logout, user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  
  const isMarketing = location.pathname === '/';
  
  // Don't show navbar on onboarding
  if (location.pathname === '/onboarding') return null;

  return (
    <GlassPanel className="navbar" style={{ borderRadius: 0, borderTop: 'none', borderLeft: 'none', borderRight: 'none' }}>
      <div className="navbar-inner">
        <Link to={isAuthenticated ? "/dashboard" : "/"} className="nav-brand">
          Humantic <span className="brand-dot"></span>
        </Link>

        <div className="nav-links">
          {isAuthenticated ? (
            <>
              <Link to="/dashboard" className={`nav-link ${location.pathname === '/dashboard' ? 'active' : ''}`}>Dashboard</Link>
              <Link to="/pinned" className={`nav-link ${location.pathname === '/pinned' ? 'active' : ''}`}>Pinned Interests</Link>
            </>
          ) : (
            <>
              <a href="#features" className="nav-link">Features</a>
              <a href="#how-it-works" className="nav-link">How It Works</a>
              <a href="#pricing" className="nav-link">Pricing</a>
            </>
          )}
        </div>

        <div className="nav-actions">
          {isAuthenticated ? (
            <div className="user-profile">
              <div className="avatar">{user?.email?.[0].toUpperCase() || 'U'}</div>
              <Button variant="ghost" size="small" onClick={logout}>Logout</Button>
            </div>
          ) : (
            <>
              <Button variant="ghost" onClick={() => navigate('/login')}>Login</Button>
              <Button onClick={() => navigate('/signup')}>Get Started</Button>
            </>
          )}
        </div>
      </div>
    </GlassPanel>
  );
};

export default Navbar;
