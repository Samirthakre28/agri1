import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { AuthContext } from '../App';
import { useToast } from '../context/ToastContext';
import * as api from '../services/supabase';
import Button from '../components/ui/Button';

export default function Auth() {
  const { setSession } = useContext(AuthContext);
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const initialMode = queryParams.get('mode') === 'signup' ? 'signup' : 'login';

  const [mode, setMode] = useState(initialMode); // login, signup, forgot
  const [formData, setFormData] = useState({ fullName: '', contact: '', password: '', role: 'Seller', email: '' });
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    setMode(initialMode);
  }, [initialMode]);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleResend = async () => {
    const email = formData.email || formData.contact;
    if(!email || !email.includes('@')) return setErrorMsg("Please enter your email to resend link.");
    const res = await api.resendVerification(email);
    if(res.success) setSuccessMsg(res.message);
    else setErrorMsg(res.message);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    
    if (mode === 'signup') {
      const res = await api.signup(formData.fullName, formData.contact, formData.password, formData.role, formData.email);
      if (res.success) {
        setSuccessMsg('Registration successful! please check your email inbox to verify your account before logging in.');
        setMode('login');
      } else {
        setErrorMsg(res.message);
      }
    } else if (mode === 'login') {
      const res = await api.login(formData.email || formData.contact, formData.password);
      if (res.success) {
        toast.success('Welcome back! 🎉');
        setSession(res.user);
        navigate('/dashboard');
      } else {
        setErrorMsg(res.message);
      }
    } else if (mode === 'forgot') {
      const res = await api.forgotPassword(formData.email);
      if (res.success) {
        setSuccessMsg(res.message);
      } else {
        setErrorMsg(res.message);
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#f8faf8] flex items-center justify-center p-5">
      <div className="w-full max-w-[420px]">
        {/* Logo */}
        <div className="text-center mb-8 fade-up text-left">
          <Link to="/" className="inline-flex flex-col items-center justify-center text-emerald-950 no-underline">
            <span className="material-symbols-outlined text-[42px] text-emerald-700 bg-emerald-50 w-20 h-20 flex items-center justify-center rounded-2xl mb-3 shadow-sm border border-emerald-100">
              agriculture
            </span>
            <h1 className="text-[24px] font-bold tracking-tight">Farm Link</h1>
          </Link>
          <p className="text-[14px] text-zinc-500 mt-1">
            {mode === 'signup' ? 'Join Farm Link' : mode === 'forgot' ? 'Reset your password' : 'Login to your account'}
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl shadow-emerald-900/5 overflow-hidden fade-up border border-zinc-100">
          {mode !== 'forgot' && (
            <div className="flex border-b border-zinc-100">
              <button 
                className={`flex-1 py-4 text-[14px] font-semibold transition-all ${mode === 'login' ? 'text-emerald-700 border-b-2 border-emerald-600 bg-emerald-50/30' : 'text-zinc-500 hover:text-zinc-700 hover:bg-zinc-50'}`}
                onClick={() => setMode('login')}
              >
                Login
              </button>
              <button 
                className={`flex-1 py-4 text-[14px] font-semibold transition-all ${mode === 'signup' ? 'text-emerald-700 border-b-2 border-emerald-600 bg-emerald-50/30' : 'text-zinc-500 hover:text-zinc-700 hover:bg-zinc-50'}`}
                onClick={() => setMode('signup')}
              >
                Sign Up
              </button>
            </div>
          )}

          <div className="p-8">
            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === 'signup' && (
                <div className="fade-in space-y-4">
                  <div>
                    <label className="block text-[12px] font-semibold text-zinc-600 mb-1.5 ml-1">Full Name</label>
                    <input type="text" name="fullName" placeholder="Enter your full name" className="w-full px-4 py-3 rounded-xl border border-zinc-200 bg-zinc-50 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-none transition-all text-[14px]" value={formData.fullName} onChange={handleChange} required />
                  </div>
                  <div>
                    <label className="block text-[12px] font-semibold text-zinc-600 mb-1.5 ml-1">Email Address</label>
                    <input type="email" name="email" placeholder="you@example.com" className="w-full px-4 py-3 rounded-xl border border-zinc-200 bg-zinc-50 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-none transition-all text-[14px]" value={formData.email} onChange={handleChange} required />
                  </div>
                  <div>
                    <label className="block text-[12px] font-semibold text-zinc-600 mb-1.5 ml-1">Mobile Number</label>
                    <input type="tel" name="contact" placeholder="10-digit mobile number" className="w-full px-4 py-3 rounded-xl border border-zinc-200 bg-zinc-50 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-none transition-all text-[14px]" value={formData.contact} onChange={handleChange} required />
                  </div>
                </div>
              )}

              {mode === 'login' && (
                <div className="fade-in">
                  <label className="block text-[12px] font-semibold text-zinc-600 mb-1.5 ml-1">Mobile or Email</label>
                  <input type="text" name="contact" placeholder="Enter mobile or email" className="w-full px-4 py-3 rounded-xl border border-zinc-200 bg-zinc-50 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-none transition-all text-[14px]" value={formData.contact} onChange={handleChange} required />
                </div>
              )}

              {mode === 'forgot' && (
                <div className="fade-in">
                  <label className="block text-[12px] font-semibold text-zinc-600 mb-1.5 ml-1">Registered Email</label>
                  <input type="email" name="email" placeholder="Enter your email to receive reset link" className="w-full px-4 py-3 rounded-xl border border-zinc-200 bg-zinc-50 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-none transition-all text-[14px]" value={formData.email} onChange={handleChange} required />
                </div>
              )}

              {mode !== 'forgot' && (
                <div>
                  <div className="flex justify-between items-center mb-1.5 ml-1">
                    <label className="block text-[12px] font-semibold text-zinc-600">Password</label>
                    {mode === 'login' && (
                      <button type="button" onClick={() => setMode('forgot')} className="text-[11px] font-bold text-emerald-600 hover:text-emerald-700">Forgot?</button>
                    )}
                  </div>
                  <input type="password" name="password" placeholder="Enter password" className="w-full px-4 py-3 rounded-xl border border-zinc-200 bg-zinc-50 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-none transition-all text-[14px]" value={formData.password} onChange={handleChange} required />
                </div>
              )}

              {mode === 'signup' && (
                <div className="fade-in">
                  <label className="block text-[12px] font-semibold text-zinc-600 mb-1.5 ml-1">I am a...</label>
                  <select name="role" className="w-full px-4 py-3 rounded-xl border border-zinc-200 bg-zinc-50 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-none transition-all text-[14px] text-zinc-700" value={formData.role} onChange={handleChange}>
                    <option value="Seller">Farmer (Agri-Producer)</option>
                    <option value="Buyer">Buyer (Procurement)</option>
                  </select>
                </div>
              )}

              {errorMsg && (
                <div className="mt-2 text-center bg-red-50 py-3 px-4 rounded-lg border border-red-100">
                  <p className="text-red-500 text-[13px] font-bold">{errorMsg}</p>
                  {errorMsg.toLowerCase().includes('email') && (
                    <button 
                      type="button" onClick={handleResend}
                      className="mt-2 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full hover:bg-emerald-100 transition-colors border border-emerald-200"
                    >
                      Resend Verification Email
                    </button>
                  )}
                </div>
              )}
              {successMsg && <p className="text-emerald-600 text-[13px] font-bold mt-2 text-center bg-emerald-50 py-2 rounded-lg border border-emerald-100">{successMsg}</p>}

              <button type="submit" className="w-full py-3.5 mt-2 bg-emerald-800 text-white font-bold rounded-xl hover:bg-emerald-900 transition-all shadow-md active:scale-[0.98] text-[15px] flex items-center justify-center gap-2 group">
                {mode === 'signup' ? 'Create Account' : mode === 'forgot' ? 'Send Reset Link' : 'Login'}
                <span className="material-symbols-outlined text-[18px] group-hover:translate-x-1 transition-transform">arrow_forward</span>
              </button>

              {mode === 'login' && (
                <div className="mt-6 pt-6 border-t border-zinc-100 text-center">
                  <p className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest mb-3">Demo Accounts</p>
                  <div className="grid grid-cols-1 gap-2">
                    <button 
                      type="button"
                      onClick={() => setFormData({...formData, contact: 'seller@farmlink.com', password: 'password123'})}
                      className="text-[12px] py-2 px-4 rounded-lg bg-emerald-50 text-emerald-700 font-semibold hover:bg-emerald-100 transition-colors border border-emerald-100"
                    >
                      Login as Seller (Farmer)
                    </button>
                    <button 
                      type="button"
                      onClick={() => setFormData({...formData, contact: 'buyer@farmlink.com', password: 'password123'})}
                      className="text-[12px] py-2 px-4 rounded-lg bg-blue-50 text-blue-700 font-semibold hover:bg-blue-100 transition-colors border border-blue-100"
                    >
                      Login as Buyer (Procurement)
                    </button>
                  </div>
                  <p className="text-[10px] text-zinc-400 mt-2">Password: <span className="font-mono">password123</span></p>
                </div>
              )}

              {mode === 'forgot' && (
                <button type="button" onClick={() => setMode('login')} className="w-full text-[13px] font-semibold text-zinc-500 hover:text-zinc-700 mt-2">Back to Login</button>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
