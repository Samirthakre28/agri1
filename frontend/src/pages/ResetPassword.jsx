import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import * as api from '../services/supabase';

export default function ResetPassword() {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirm) return setError("Passwords do not match");
    
    const res = await api.updatePassword(password);
    if (res.success) {
      setSuccess(true);
      setTimeout(() => navigate('/'), 3000);
    } else {
      setError(res.message);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8faf8] flex items-center justify-center p-5">
      <div className="w-full max-w-[420px]">
        <div className="text-center mb-8 fade-up">
          <Link to="/" className="inline-flex flex-col items-center justify-center text-emerald-950 no-underline">
            <span className="material-symbols-outlined text-[42px] text-emerald-700 bg-emerald-50 w-20 h-20 flex items-center justify-center rounded-2xl mb-3 shadow-sm border border-emerald-100">
              lock_reset
            </span>
            <h1 className="text-[24px] font-bold tracking-tight">Set New Password</h1>
          </Link>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8 border border-zinc-100 fade-up">
          {success ? (
            <div className="text-center">
              <span className="material-symbols-outlined text-emerald-500 text-[48px] mb-4">check_circle</span>
              <h2 className="text-xl font-bold text-emerald-950 mb-2">Password Updated!</h2>
              <p className="text-zinc-500 text-sm">Redirecting you to login...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-[12px] font-semibold text-zinc-600 mb-1.5 ml-1">New Password</label>
                <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Minimum 6 characters" className="w-full px-4 py-3 rounded-xl border border-zinc-200 bg-zinc-50 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-none transition-all text-[14px]" required />
              </div>
              <div>
                <label className="block text-[12px] font-semibold text-zinc-600 mb-1.5 ml-1">Confirm Password</label>
                <input type="password" value={confirm} onChange={e => setConfirm(e.target.value)} placeholder="Repeat password" className="w-full px-4 py-3 rounded-xl border border-zinc-200 bg-zinc-50 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-none transition-all text-[14px]" required />
              </div>
              
              {error && <p className="text-red-500 text-[13px] font-bold mt-2 text-center bg-red-50 py-2 rounded-lg border border-red-100">{error}</p>}

              <button type="submit" className="w-full py-3.5 mt-4 bg-emerald-800 text-white font-bold rounded-xl hover:bg-emerald-900 transition-all shadow-md active:scale-[0.98] text-[15px]">
                Update Password
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
