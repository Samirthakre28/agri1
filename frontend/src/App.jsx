import React, { createContext, useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Landing from './pages/Landing';
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
import { ENV } from './config/env';

import { AuthContext } from './context/AuthContext';

export default function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSession = async () => {
      try {
        // 1. Check for hardcoded demo session in localStorage first
        const savedSession = localStorage.getItem('farmlink_demo_session');
        if (savedSession) {
          setSession(JSON.parse(savedSession));
          return;
        }

        // 2. Otherwise check Supabase (only if URL is configured)
        if (supabase && ENV.SUPABASE_URL) {
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
            }
        }
      } catch (err) {
        console.error("Session fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchSession();

    let subscription = null;
    if (supabase && ENV.SUPABASE_URL) {
        const { data: authSubscription } = supabase.auth.onAuthStateChange(async (event, currentSupaSession) => {
            if (event === 'SIGNED_OUT') {
                setSession(null);
                localStorage.removeItem('farmlink_demo_session');
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
        subscription = authSubscription?.subscription;
    }

    return () => {
        subscription?.unsubscribe();
    };
  }, []);

  const logout = async () => {
    if (supabase) {
        await supabase.auth.signOut();
    }
    localStorage.removeItem('farmlink_demo_session');
    setSession(null);
  };

  const ProtectedRoute = ({ children }) => {
    if (loading) return null;
    return session ? <Layout>{children}</Layout> : <Navigate to="/" />;
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-[#f8faf8]"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-800"></div></div>;

  return (
    <AuthContext.Provider value={{ session, setSession, logout }}>
      <ToastProvider>
        <LanguageProvider>
          <Router>
            <Routes>
              <Route path="/" element={session ? <Navigate to="/dashboard" /> : <Landing />} />
              
              <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/marketplace" element={<ProtectedRoute><Marketplace /></ProtectedRoute>} />
              <Route path="/analytics" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
              <Route path="/crops" element={<ProtectedRoute><Crops /></ProtectedRoute>} />
              <Route path="/contracts" element={<ProtectedRoute><Contracts /></ProtectedRoute>} />
              <Route path="/payments" element={<ProtectedRoute><Payments /></ProtectedRoute>} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </Router>
        </LanguageProvider>
      </ToastProvider>
    </AuthContext.Provider>
  );
}
