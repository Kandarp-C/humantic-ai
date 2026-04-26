import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('humantic_token');
      if (token) {
        try {
          // In a real app, you might have a /me endpoint to verify the token
          // const response = await api.get('/api/auth/me');
          // setUser(response.data.user);
          
          // For now, we'll assume it's valid if present (MVP logic)
          setIsAuthenticated(true);
        } catch (error) {
          localStorage.removeItem('humantic_token');
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (email, password) => {
    try {
      // Real API call
      // const response = await api.post('/api/auth/login', { email, password });
      // const { token, user } = response.data;
      
      // Mock Login for now
      const mockToken = 'mock_jwt_token_123';
      const mockUser = { email, id: 'u1' };
      
      localStorage.setItem('humantic_token', mockToken);
      setUser(mockUser);
      setIsAuthenticated(true);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Login failed' };
    }
  };

  const logout = () => {
    localStorage.removeItem('humantic_token');
    setUser(null);
    setIsAuthenticated(false);
  };

  const signup = async (email, password) => {
    try {
      // const response = await api.post('/api/auth/signup', { email, password });
      // Mock Signup
      return login(email, password);
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Signup failed' };
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, isAuthenticated, login, logout, signup }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
