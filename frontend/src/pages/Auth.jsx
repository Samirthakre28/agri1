import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { AuthContext } from '../App';
import * as api from '../services/supabase';
import Button from '../components/Button';

export default function Auth() {
  const { setSession } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const initialMode = queryParams.get('mode') === 'signup' ? 'signup' : 'login';

  const [mode, setMode] = useState(initialMode);
  const [formData, setFormData] = useState({ fullName: '', contact: '', password: '', role: 'Seller' });
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    setMode(initialMode);
  }, [initialMode]);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    
    if (mode === 'signup') {
      const res = await api.signup(formData.fullName, formData.contact, formData.password, formData.role);
      if (res.success) {
        alert('Signed up! Logging in...');
        setMode('login');
      } else {
        setErrorMsg(res.message);
      }
    } else {
      const res = await api.login(formData.contact, formData.password);
      if (res.success) {
        setSession(res.user);
        navigate('/dashboard');
      } else {
        setErrorMsg(res.message);
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#f8faf8] flex items-center justify-center p-5">
      <div className="w-full max-w-[420px]">
        {/* Logo */}
        <div className="text-center mb-8 fade-up">
          <Link to="/" className="inline-flex flex-col items-center justify-center text-emerald-950 no-underline">
            <span className="material-symbols-outlined text-[42px] text-emerald-700 bg-emerald-50 w-20 h-20 flex items-center justify-center rounded-2xl mb-3 shadow-sm border border-emerald-100">
              agriculture
            </span>
            <h1 className="text-[24px] font-bold tracking-tight">AgriContract</h1>
          </Link>
          <p className="text-[14px] text-zinc-500 mt-1">{mode === 'signup' ? 'Join AgriContract' : 'Login to your account'}</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl shadow-emerald-900/5 overflow-hidden fade-up fade-up-d1 border border-zinc-100">
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

          <div className="p-8">
            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === 'signup' && (
                <div className="fade-in">
                  <label className="block text-[12px] font-semibold text-zinc-600 mb-1.5 ml-1">Full Name</label>
                  <input type="text" name="fullName" placeholder="Enter your full name" className="w-full px-4 py-3 rounded-xl border border-zinc-200 bg-zinc-50 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-none transition-all text-[14px]" value={formData.fullName} onChange={handleChange} required={mode === 'signup'} />
                </div>
              )}
              
              <div>
                <label className="block text-[12px] font-semibold text-zinc-600 mb-1.5 ml-1">Mobile Number</label>
                <input type="tel" name="contact" placeholder="Enter your 10-digit mobile number" className="w-full px-4 py-3 rounded-xl border border-zinc-200 bg-zinc-50 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-none transition-all text-[14px]" value={formData.contact} onChange={handleChange} required />
              </div>

              <div>
                <label className="block text-[12px] font-semibold text-zinc-600 mb-1.5 ml-1">Password</label>
                <input type="password" name="password" placeholder="Enter your password" className="w-full px-4 py-3 rounded-xl border border-zinc-200 bg-zinc-50 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-none transition-all text-[14px]" value={formData.password} onChange={handleChange} required />
              </div>

              {mode === 'signup' && (
                <div className="fade-in">
                  <label className="block text-[12px] font-semibold text-zinc-600 mb-1.5 ml-1">I am a...</label>
                  <select name="role" className="w-full px-4 py-3 rounded-xl border border-zinc-200 bg-zinc-50 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-none transition-all text-[14px] text-zinc-700" value={formData.role} onChange={handleChange}>
                    <option value="Seller">Farmer (Agri-Producer)</option>
                    <option value="Buyer">Buyer (Procurement)</option>
                  </select>
                </div>
              )}

              {errorMsg && <p className="text-red-500 text-sm font-bold mt-2 text-center">{errorMsg}</p>}

              <button type="submit" className="w-full py-3.5 mt-2 bg-emerald-800 text-white font-bold rounded-xl hover:bg-emerald-900 transition-all shadow-md active:scale-[0.98] text-[15px] flex items-center justify-center gap-2 group">
                {mode === 'signup' ? 'Create Account' : 'Login'}
                <span className="material-symbols-outlined text-[18px] group-hover:translate-x-1 transition-transform">arrow_forward</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
