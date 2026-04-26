import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Navbar from './components/layout/Navbar';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Onboarding from './pages/Onboarding';
import Dashboard from './pages/Dashboard';
import FindingPage from './pages/FindingPage';
import PinnedInterests from './pages/PinnedInterests';
import MeshGradient from './components/ui/MeshGradient';
import InteractiveNodes from './components/ui/InteractiveNodes';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) return null; // Or a loader component
  if (!isAuthenticated) return <Navigate to="/login" />;
  
  return children;
};

function App() {
  return (
    <Router>
      <MeshGradient />
      <InteractiveNodes />
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/onboarding" 
            element={
              <ProtectedRoute>
                <Onboarding />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/finding/:id" 
            element={
              <ProtectedRoute>
                <FindingPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/pinned" 
            element={
              <ProtectedRoute>
                <PinnedInterests />
              </ProtectedRoute>
            } 
          />
        </Routes>
      </main>
    </Router>
  );
}

export default App;
