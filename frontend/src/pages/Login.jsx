import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import GlassPanel from '../components/ui/GlassPanel';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import './Auth.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    const result = await login(email, password);
    if (result.success) {
      // In a real app, check onboarding status
      navigate('/dashboard');
    } else {
      setError(result.error);
    }
    setIsLoading(false);
  };

  return (
    <div className="auth-page">
      <GlassPanel className="auth-card">
        <div className="auth-header">
          <h1>Welcome back</h1>
          <p>Enter your details to access your insights.</p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <Input 
            label="Email" 
            type="email" 
            placeholder="name@company.com" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Input 
            label="Password" 
            type="password" 
            placeholder="••••••••" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          
          {error && <p className="error-text" style={{ textAlign: 'center' }}>{error}</p>}
          
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Signing in...' : 'Sign in'}
          </Button>
        </form>

        <div className="auth-footer">
          Don't have an account? <Link to="/signup">Sign up</Link>
        </div>
      </GlassPanel>
    </div>
  );
};

export default Login;
