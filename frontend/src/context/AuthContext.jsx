import React, { createContext, useContext, useState, useEffect } from 'react';
import api, { login as apiLogin, signup as apiSignup } from '../services/api';

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
          // Verify token/session if possible, or just trust it for MVP
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
      const response = await apiLogin(email, password);
      const { session, user: userData } = response.data;
      
      if (session?.access_token) {
        localStorage.setItem('humantic_token', session.access_token);
        setUser(userData);
        setIsAuthenticated(true);
        return { success: true };
      }
      throw new Error('No session returned');
    } catch (error) {
      return { success: false, error: error.response?.data?.detail || error.message || 'Login failed' };
    }
  };

  const logout = () => {
    localStorage.removeItem('humantic_token');
    setUser(null);
    setIsAuthenticated(false);
  };

  const signup = async (email, password) => {
    try {
      const response = await apiSignup(email, password);
      const { session, user: userData } = response.data;
      
      if (session?.access_token) {
        localStorage.setItem('humantic_token', session.access_token);
        setUser(userData);
        setIsAuthenticated(true);
        return { success: true };
      }
      return { success: true }; // Signup successful but maybe needs email verify
    } catch (error) {
      return { success: false, error: error.response?.data?.detail || error.message || 'Signup failed' };
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
