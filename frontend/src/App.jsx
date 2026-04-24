import React, { createContext, useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Landing from './pages/Landing';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import Marketplace from './pages/Marketplace';
import Analytics from './pages/Analytics';
import Crops from './pages/Crops';
import Contracts from './pages/Contracts';
import Payments from './pages/Payments';
import Layout from './components/Layout';
import { LanguageProvider } from './context/LanguageContext';

export const AuthContext = createContext();

export default function App() {
  const [session, setSession] = useState(() => JSON.parse(localStorage.getItem('agri_session')));

  useEffect(() => {
    if (session) {
      localStorage.setItem('agri_session', JSON.stringify(session));
    } else {
      localStorage.removeItem('agri_session');
    }
  }, [session]);

  const logout = () => {
    setSession(null);
  };

  const ProtectedRoute = ({ children }) => {
    return session ? <Layout>{children}</Layout> : <Navigate to="/login" />;
  };

  return (
    <AuthContext.Provider value={{ session, setSession, logout }}>
      <LanguageProvider>
        <Router>
          <Routes>
            <Route path="/" element={session ? <Navigate to="/dashboard" /> : <Landing />} />
            <Route path="/login" element={session ? <Navigate to="/dashboard" /> : <Auth />} />
            
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/marketplace" element={<ProtectedRoute><Marketplace /></ProtectedRoute>} />
            <Route path="/analytics" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
            <Route path="/crops" element={<ProtectedRoute><Crops /></ProtectedRoute>} />
            <Route path="/contracts" element={<ProtectedRoute><Contracts /></ProtectedRoute>} />
            <Route path="/payments" element={<ProtectedRoute><Payments /></ProtectedRoute>} />
          </Routes>
        </Router>
      </LanguageProvider>
    </AuthContext.Provider>
  );
}
