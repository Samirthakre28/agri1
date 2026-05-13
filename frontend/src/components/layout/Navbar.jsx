import React, { useContext, useState } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { LanguageContext } from '../../context/LanguageContext';
import { useToast } from '../../context/ToastContext';
import { supabase } from '../../services/supabase';

// Generate initials-based avatar
const Avatar = ({ name, size = 'h-9 w-9', textSize = 'text-[13px]' }) => {
  const initials = (name || 'U')
    .split(' ')
    .map(w => w.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2);
  
  // Generate a consistent color from the name
  const colors = [
    'bg-emerald-600', 'bg-blue-600', 'bg-purple-600', 
    'bg-amber-600', 'bg-rose-600', 'bg-teal-600', 'bg-indigo-600'
  ];
  const hash = (name || '').split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const color = colors[hash % colors.length];

  return (
    <div className={`${size} rounded-full ${color} flex items-center justify-center text-white font-bold ${textSize} shadow-sm border-2 border-white`}>
      {initials}
    </div>
  );
};

export default function Navbar({ onMenuToggle }) {
  const { session, logout } = useContext(AuthContext);
  const { lang, toggleLang, t } = useContext(LanguageContext);
  const toast = useToast();
  const [showSettings, setShowSettings] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [newPassword, setNewPassword] = useState('');

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (newPassword.length < 6) return toast.warning("Password must be at least 6 characters.");
    try {
      if (!supabase) throw new Error("Database connection is not configured.");
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      toast.success("🔒 Password updated successfully!");
      setNewPassword('');
      setChangingPassword(false);
    } catch (err) {
      toast.error(err.message || "Failed to update password.");
    }
  };

  const handleLogout = async () => {
    setShowSettings(false);
    toast.info("Logged out successfully.");
    await logout();
  };

  return (
    <header className="fixed top-0 w-full bg-white/80 backdrop-blur-xl border-b border-zinc-200/50 shadow-sm flex items-center justify-between h-16 px-5 z-50">
      <div className="flex items-center gap-3">
        <button onClick={onMenuToggle} className="lg:hidden p-1 hover:bg-zinc-100 rounded-lg transition-colors">
            <span className="material-symbols-outlined text-[24px] text-emerald-800">menu</span>
        </button>
        <span className="material-symbols-outlined text-[26px] text-emerald-800">agriculture</span>
        <h1 className="text-[17px] font-bold text-emerald-950 tracking-tight hidden sm:block">{t('agriContract')}</h1>
      </div>
      <div className="flex items-center gap-3 sm:gap-4">
        <button 
           onClick={toggleLang} 
           className="px-3 py-1.5 bg-emerald-50 text-emerald-800 font-bold text-[11px] rounded-lg border border-emerald-200 uppercase tracking-widest shadow-sm hover:bg-emerald-100 transition-colors"
        >
           {lang === 'en' ? 'मराठी' : 'ENG'}
        </button>

        <button 
          onClick={() => setShowSettings(true)}
          className="p-2 hover:bg-zinc-100 rounded-lg transition-colors text-zinc-500" title="Settings"
        >
          <span className="material-symbols-outlined text-[22px]">settings</span>
        </button>

        <div className="hidden sm:flex items-center gap-2 pl-3 border-l border-zinc-200">
            <div className="text-right">
                <p className="text-[13px] font-semibold text-emerald-950 leading-tight mb-0">{session?.name || 'User'}</p>
                <p className="text-[10px] text-zinc-500 uppercase tracking-wider font-medium mb-0">{session?.role === 'Seller' ? t('agriProducer') : t('buyer')}</p>
            </div>
            <Avatar name={session?.name} />
        </div>
        <button onClick={handleLogout} className="p-2 hover:bg-red-50 rounded-lg transition-colors text-zinc-400 hover:text-red-500" title={t('logout')}>
            <span className="material-symbols-outlined text-[20px]">logout</span>
        </button>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm fade-in"
          onClick={() => setShowSettings(false)}
        >
          <div 
            className="bg-white w-full max-w-sm rounded-2xl shadow-2xl border border-zinc-100 overflow-hidden fade-up"
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="bg-emerald-950 p-6 relative overflow-hidden">
              <div className="absolute -right-8 -top-8 w-32 h-32 bg-emerald-800 rounded-full opacity-30"></div>
              <div className="flex justify-between items-start relative z-10">
                <div className="flex items-center gap-4">
                  <Avatar name={session?.name} size="h-14 w-14" textSize="text-[18px]" />
                  <div>
                    <h2 className="text-lg font-bold text-white">{session?.name}</h2>
                    <p className="text-emerald-300 text-[12px] font-medium">{session?.email}</p>
                    <span className="inline-block mt-1 bg-emerald-800 text-emerald-200 text-[9px] font-bold px-2 py-0.5 rounded uppercase tracking-widest">
                      {session?.role} Account
                    </span>
                  </div>
                </div>
                <button 
                  onClick={() => setShowSettings(false)}
                  className="text-emerald-300 hover:text-white transition-colors"
                >
                  <span className="material-symbols-outlined text-[20px]">close</span>
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 space-y-4">
              {/* Account Info */}
              <div className="space-y-3">
                <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Account Details</p>
                <div className="flex items-center gap-3 p-3 bg-zinc-50 rounded-xl border border-zinc-100">
                  <span className="material-symbols-outlined text-zinc-500 text-[18px]">mail</span>
                  <div>
                    <p className="text-[10px] text-zinc-400 font-bold uppercase">Email</p>
                    <p className="text-[13px] text-zinc-800 font-medium">{session?.email || 'Not set'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-zinc-50 rounded-xl border border-zinc-100">
                  <span className="material-symbols-outlined text-zinc-500 text-[18px]">phone</span>
                  <div>
                    <p className="text-[10px] text-zinc-400 font-bold uppercase">Contact</p>
                    <p className="text-[13px] text-zinc-800 font-medium">{session?.contact || 'Not set'}</p>
                  </div>
                </div>
              </div>

              {/* Security */}
              <div className="space-y-3">
                <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Security</p>
                {changingPassword ? (
                  <form onSubmit={handleChangePassword} className="space-y-3 fade-in">
                    <input 
                      type="password" 
                      placeholder="New password (min 6 chars)"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 text-[13px] outline-none focus:border-emerald-500 transition-all"
                      required
                    />
                    <div className="flex gap-2">
                      <button type="submit" className="flex-1 bg-emerald-800 text-white py-2.5 rounded-xl text-[12px] font-bold hover:bg-emerald-900 transition-colors">
                        Update Password
                      </button>
                      <button type="button" onClick={() => { setChangingPassword(false); setNewPassword(''); }} className="px-4 text-zinc-500 text-[12px] font-bold hover:bg-zinc-100 rounded-xl transition-colors">
                        Cancel
                      </button>
                    </div>
                  </form>
                ) : (
                  <button 
                    onClick={() => setChangingPassword(true)}
                    className="w-full flex items-center gap-3 p-3 bg-zinc-50 rounded-xl border border-zinc-100 text-left hover:bg-zinc-100 transition-colors group"
                  >
                    <span className="material-symbols-outlined text-zinc-500 text-[18px] group-hover:text-emerald-600 transition-colors">lock</span>
                    <span className="text-[13px] font-medium text-zinc-700">Change Password</span>
                    <span className="material-symbols-outlined text-zinc-300 text-[16px] ml-auto">chevron_right</span>
                  </button>
                )}
              </div>

              {/* App Info */}
              <div className="pt-2 border-t border-zinc-100">
                <div className="flex items-center justify-between text-[11px] text-zinc-400">
                  <span className="flex items-center gap-1.5 font-medium">
                    <span className="material-symbols-outlined text-[14px]">agriculture</span>
                    Farm Link v1.0
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    Connected to Supabase
                  </span>
                </div>
              </div>

              {/* Logout */}
              <button 
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 py-3 bg-red-50 text-red-600 font-bold rounded-xl hover:bg-red-100 transition-colors text-[13px] border border-red-100"
              >
                <span className="material-symbols-outlined text-[18px]">logout</span>
                Log Out
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
