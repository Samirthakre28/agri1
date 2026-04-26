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
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSession = async () => {
      const { data: { session: supaSession } } = await supabase.auth.getSession();
      
      if (supaSession) {
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
              const newSession = {
                  id: user.id, email: user.email,
                  name: user.user_metadata?.display_name || user.user_metadata?.name,
                  role: user.user_metadata?.role,
                  contact: user.user_metadata?.contact
              };
              setSession(newSession);
          }
      } else {
          setSession(null);
      }
      setLoading(false);
    };
    
    fetchSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, currentSupaSession) => {
        if (event === 'SIGNED_OUT') {
            setSession(null);
        } else if (event === 'SIGNED_IN' && currentSupaSession) {
            const user = currentSupaSession.user;
            const newSession = {
                id: user.id, email: user.email,
                name: user.user_metadata?.display_name || user.user_metadata?.name,
                role: user.user_metadata?.role,
                contact: user.user_metadata?.contact
            };
            setSession(newSession);
        }
    });

    return () => {
        subscription?.unsubscribe();
    };
  }, []);

  const logout = async () => {
    await supabase.auth.signOut();
    setSession(null);
  };

  const ProtectedRoute = ({ children }) => {
    if (loading) return null;
    return session ? <Layout>{children}</Layout> : <Navigate to="/login" />;
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-[#f8faf8]"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-800"></div></div>;

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
