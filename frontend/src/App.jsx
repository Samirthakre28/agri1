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
import ResetPassword from './pages/ResetPassword';
import Layout from './components/layout/Layout';
import { LanguageProvider } from './context/LanguageContext';
import { ToastProvider } from './context/ToastContext';
import { supabase } from './services/supabase';

export const AuthContext = createContext();

export default function App() {
  // Hardcode a mock session so the user never has to log in
  const mockUser = {
      id: "demo-123", 
      email: "demo@farmlink.com",
      name: "Demo Farmer",
      role: "Seller",
      contact: "9876543210"
  };
  
  const [session, setSession] = useState(mockUser);
  const [loading, setLoading] = useState(false);

  const logout = async () => {
    // Optional: just redirect to home on logout
    window.location.href = '/';
  };

  const ProtectedRoute = ({ children }) => {
    return <Layout>{children}</Layout>;
  };

  return (
    <AuthContext.Provider value={{ session, setSession, logout }}>
      <ToastProvider>
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
              <Route path="/reset-password" element={<ResetPassword />} />
            </Routes>
          </Router>
        </LanguageProvider>
      </ToastProvider>
    </AuthContext.Provider>
  );
}
