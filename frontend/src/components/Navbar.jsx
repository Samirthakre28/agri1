import React, { useContext } from 'react';
import { AuthContext } from '../App';
import { LanguageContext } from '../context/LanguageContext';

export default function Navbar({ onMenuToggle }) {
  const { session, logout } = useContext(AuthContext);
  const { lang, toggleLang, t } = useContext(LanguageContext);

  return (
    <header className="fixed top-0 w-full bg-white border-b border-zinc-200 shadow-sm flex items-center justify-between h-16 px-5 z-50">
      <div className="flex items-center gap-3">
        <button onClick={onMenuToggle} className="lg:hidden p-1 hover:bg-zinc-100 rounded-lg transition-colors">
            <span className="material-symbols-outlined text-[24px] text-emerald-800">menu</span>
        </button>
        <span className="material-symbols-outlined text-[26px] text-emerald-800">agriculture</span>
        <h1 className="text-[17px] font-bold text-emerald-950 tracking-tight hidden sm:block">{t('agriContract')}</h1>
      </div>
      <div className="flex items-center gap-4">
        <button 
           onClick={toggleLang} 
           className="px-3 py-1 bg-emerald-50 text-emerald-800 font-bold text-[12px] rounded border border-emerald-200 uppercase tracking-widest shadow-sm hover:bg-emerald-100 transition-colors"
        >
           {lang === 'en' ? 'मराठी' : 'English'}
        </button>

        <div className="hidden sm:flex items-center gap-2 pl-3 border-l border-zinc-200">
            <div className="text-right">
                <p className="text-[13px] font-semibold text-emerald-950 leading-tight mb-0">{session?.name || 'User'}</p>
                <p className="text-[10px] text-zinc-500 uppercase tracking-wider font-medium mb-0">{session?.role === 'Seller' ? t('agriProducer') : t('buyer')}</p>
            </div>
            <div className="h-9 w-9 rounded-full bg-emerald-100 border border-emerald-200 flex items-center justify-center overflow-hidden">
                <span className="material-symbols-outlined text-emerald-700 text-[18px]">person</span>
            </div>
        </div>
        <button onClick={logout} className="p-2 hover:bg-red-50 rounded-lg transition-colors text-zinc-400 hover:text-red-500" title={t('logout')}>
            <span className="material-symbols-outlined text-[20px]">logout</span>
        </button>
      </div>
    </header>
  );
}
