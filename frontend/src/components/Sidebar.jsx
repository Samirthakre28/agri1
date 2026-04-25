import React, { useContext } from 'react';
import { NavLink } from 'react-router-dom';
import { AuthContext } from '../App';
import { LanguageContext } from '../context/LanguageContext';

export default function Sidebar({ isOpen, onClose }) {
  const { session } = useContext(AuthContext);
  const { t } = useContext(LanguageContext);

  // Initials avatar
  const initials = (session?.name || 'U')
    .split(' ')
    .map(w => w.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2);
  const avatarColors = ['bg-emerald-600', 'bg-blue-600', 'bg-purple-600', 'bg-amber-600', 'bg-rose-600', 'bg-teal-600', 'bg-indigo-600'];
  const hash = (session?.name || '').split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const avatarColor = avatarColors[hash % avatarColors.length];

  const sellerLinks = [
    { to: "/dashboard", icon: "space_dashboard", label: t('dashboard') },
    { to: "/crops", icon: "eco", label: t('myCrops') },
    { to: "/marketplace", icon: "storefront", label: t('marketplace') },
    { to: "/contracts", icon: "description", label: t('contracts') },
    { to: "/payments", icon: "account_balance_wallet", label: t('payments') },
    { to: "/analytics", icon: "insert_chart", label: t('analytics') }
  ];

  const buyerLinks = [
    { to: "/dashboard", icon: "space_dashboard", label: t('dashboard') },
    { to: "/marketplace", icon: "storefront", label: t('sourceCrops') },
    { to: "/contracts", icon: "description", label: t('contracts') },
    { to: "/payments", icon: "account_balance_wallet", label: t('payments') },
    { to: "/analytics", icon: "insert_chart", label: t('priceInsights') }
  ];

  const links = session?.role === 'Seller' ? sellerLinks : buyerLinks;
  const displayRole = session?.role === 'Seller' ? t('agriProducer') : t('buyer');

  return (
    <>
      <aside className={`fixed left-0 top-0 h-screen w-64 bg-white border-r border-zinc-200 flex flex-col pt-16 z-40 transition-all ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="px-5 py-6 border-b border-zinc-100">
            <div className="flex items-center gap-3 mb-3">
              <div className={`w-10 h-10 rounded-full ${avatarColor} flex items-center justify-center text-white font-bold text-[13px] shadow-sm border-2 border-white`}>
                {initials}
              </div>
              <div>
                <p className="text-[15px] font-bold text-emerald-950 leading-tight mb-0">{session?.name || 'User'}</p>
                <p className="text-[11px] text-zinc-500">{displayRole}</p>
              </div>
            </div>
            <span className="inline-block bg-emerald-900 text-white text-[9px] font-bold px-2.5 py-1 rounded tracking-widest uppercase">
                {session?.role} {t('account')}
            </span>
        </div>
        <div className="flex flex-col flex-1 py-3 space-y-0.5">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              onClick={onClose}
              className={({ isActive }) => 
                `flex items-center gap-3 px-5 py-2.5 text-[14px] transition-all ` + 
                (isActive 
                  ? 'bg-emerald-50 text-emerald-700 border-l-[3px] border-emerald-600 font-semibold' 
                  : 'text-zinc-600 hover:text-emerald-700 hover:bg-emerald-50/60 border-l-[3px] border-transparent')
              }
            >
              <span className="material-symbols-outlined text-[20px]">{link.icon}</span> {link.label}
            </NavLink>
          ))}
        </div>
      </aside>
      {isOpen && (
        <div className="fixed inset-0 bg-black/30 z-30 lg:hidden" onClick={onClose}></div>
      )}
    </>
  );
}
