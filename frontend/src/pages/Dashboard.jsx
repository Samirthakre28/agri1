import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../App';
import { LanguageContext } from '../context/LanguageContext';
import { useToast } from '../context/ToastContext';
import * as api from '../services/supabase';
import { supabase } from '../services/supabase';
import { Link } from 'react-router-dom';

// Skeleton Loading Component
const SkeletonCard = () => (
  <div className="bg-white p-5 rounded-xl border border-zinc-200 shadow-sm">
    <div className="skeleton h-3 w-24 mb-3"></div>
    <div className="skeleton h-7 w-16"></div>
  </div>
);

const SkeletonActivity = () => (
  <div className="flex gap-3 p-3 rounded-lg border border-zinc-100 bg-zinc-50">
    <div className="skeleton w-9 h-9 rounded-lg flex-shrink-0"></div>
    <div className="flex-1">
      <div className="skeleton h-3 w-28 mb-2"></div>
      <div className="skeleton h-2 w-40"></div>
    </div>
  </div>
);

export default function Dashboard() {
  const { session } = useContext(AuthContext);
  const { t } = useContext(LanguageContext);
  const toast = useToast();
  const [stats, setStats] = useState(null);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [cropForm, setCropForm] = useState({ cropName: '', quantity: '', price: '', location: '' });
  const [successMsg, setSuccessMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadData();

    // Supabase Realtime: Listen for new contracts involving this user
    const channel = supabase
      .channel('dashboard-contracts')
      .on('postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'contracts' },
        (payload) => {
          const contract = payload.new;
          if (contract.farmer_id === session.id || contract.buyer_id === session.id) {
            toast.success(`🎉 New contract secured for ${contract.cropName || 'a crop'}!`);
            loadData(); // Refresh dashboard data
          }
        }
      )
      .on('postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'contracts' },
        (payload) => {
          const contract = payload.new;
          if (contract.farmer_id === session.id || contract.buyer_id === session.id) {
            if (contract.paymentStatus === 'Paid') {
              toast.success(`💰 Payment received for ${contract.cropName || 'contract'}!`);
            }
            loadData();
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [session]);

  const loadData = async () => {
    try {
      setLoading(true);
      const contracts = await api.fetchMyContracts(session);
      const offers = await api.fetchMyOffers(session);
      
      const safeNum = (val) => Number(val) || 0;

      const calcFlow = (list) => {
          return list.reduce((s, c) => {
              const price = safeNum(c.agreedPrice);
              if (c.paymentStatus === 'Advance Paid') return s + (price * 0.1);
              if (c.paymentStatus === 'Paid') return s + price;
              return s;
          }, 0);
      };

      let calcStats = {};
      if (session.role === 'Seller') {
        const crops = await api.fetchMyCrops(session.name);
        calcStats = {
          label1: t('totalCrops'), val1: crops.length,
          label2: t('activeContracts'), val2: contracts.length,
          label3: t('earnings'), val3: `₹${calcFlow(contracts).toLocaleString()}`,
          label4: t('pendingDeals'), val4: offers.filter(o => o.status === 'Pending').length
        };
      } else {
        const availableCrops = await api.fetchAvailableCrops();
        calcStats = {
          label1: t('totalOrders'), val1: offers.length,
          label2: t('buyerContracts'), val2: contracts.length,
          label3: t('spending'), val3: `₹${calcFlow(contracts).toLocaleString()}`,
          label4: t('availableCrops'), val4: availableCrops.length
        };
      }
      setStats(calcStats);

      let acts = [];
      contracts.forEach(c => {
        const price = safeNum(c.agreedPrice);
        acts.push(c.paymentStatus === 'Paid' 
          ? { title: 'Payment Received', desc: `₹${price.toLocaleString()} for ${c.cropName || 'Crop'}`, icon: 'payments', 
              colors: { bg: 'bg-emerald-50', border: 'border-emerald-100', iconBg: 'bg-emerald-200', iconText: 'text-emerald-800', text: 'text-emerald-900' } }
          : { title: 'Contract Active', desc: `With ${session.role === 'Seller' ? (c.buyerName || 'Buyer') : (c.farmerName || 'Farmer')}`, icon: 'description', 
              colors: { bg: 'bg-blue-50', border: 'border-blue-100', iconBg: 'bg-blue-200', iconText: 'text-blue-800', text: 'text-blue-900' } });
      });
      offers.forEach(o => {
        if (o.status === 'Pending') acts.push({ title: 'New Offer', desc: `₹${safeNum(o.offeredPrice)} for ${o.cropId?.cropName || 'Crop'}`, icon: 'handshake', 
            colors: { bg: 'bg-amber-50', border: 'border-amber-100', iconBg: 'bg-amber-200', iconText: 'text-amber-800', text: 'text-amber-900' } });
      });
      setActivities(acts.slice(0, 5));
    } catch (err) {
      console.error("Dashboard loadData error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCrop = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    const res = await api.addCrop(cropForm, session.name, session.id);
    if(res.success) {
      toast.success("🌾 Crop listing published successfully!");
      setCropForm({ cropName: '', quantity: '', price: '', location: '' });
      loadData();
    } else {
      toast.error(res.message || "Failed to publish listing.");
    }
    setIsSubmitting(false);
  };

  return (
    <>
      <header className="mb-8 fade-up">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
              <div>
                  <h2 className="text-2xl md:text-[30px] font-bold text-emerald-950 tracking-tight leading-tight mb-1">
                      {t('welcome')}, <span className="user-name-display">{session.name}</span> 👋
                  </h2>
              </div>
          </div>
      </header>

      {/* Stats Cards */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        {loading ? (
          <>
            <SkeletonCard /><SkeletonCard /><SkeletonCard /><SkeletonCard />
          </>
        ) : stats && (
          <>
            <div className="bg-white p-5 rounded-xl border border-zinc-200 shadow-sm fade-up transition-all hover:shadow-md hover:-translate-y-0.5 duration-300">
                <p className="text-zinc-500 text-[13px] font-medium mb-1">{stats.label1}</p>
                <h3 className="text-[26px] font-bold text-emerald-950">{stats.val1}</h3>
            </div>
            <div className="bg-white p-5 rounded-xl border border-zinc-200 shadow-sm fade-up fade-up-d1 transition-all hover:shadow-md hover:-translate-y-0.5 duration-300">
                <p className="text-zinc-500 text-[13px] font-medium mb-1">{stats.label2}</p>
                <h3 className="text-[26px] font-bold text-emerald-950">{stats.val2}</h3>
            </div>
            <div className="bg-white p-5 rounded-xl border border-zinc-200 shadow-sm fade-up fade-up-d2 transition-all hover:shadow-md hover:-translate-y-0.5 duration-300">
                <p className="text-zinc-500 text-[13px] font-medium mb-1">{stats.label3}</p>
                <h3 className="text-[26px] font-bold text-emerald-950">{stats.val3}</h3>
            </div>
            <div className="bg-emerald-900 p-5 rounded-xl shadow-md fade-up fade-up-d3 transition-all hover:shadow-lg hover:-translate-y-0.5 duration-300">
                <p className="text-emerald-200 text-[13px] font-medium mb-1">{stats.label4}</p>
                <h3 className="text-[26px] font-bold text-white uppercase">{stats.val4}</h3>
            </div>
          </>
        )}
      </section>

      {/* Quick Actions */}
      <section className="mb-8 fade-up">
        <h3 className="text-[15px] font-semibold text-zinc-700 mb-3 flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px] text-zinc-500">bolt</span> {t('quickActions')}
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Link to="/marketplace" className="flex items-center gap-3 bg-white border border-zinc-200 rounded-xl p-4 shadow-sm text-zinc-700 font-medium hover:bg-zinc-50 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300">
                <span className="material-symbols-outlined text-blue-700">storefront</span> {t('browseMarket')}
            </Link>
            <Link to="/contracts" className="flex items-center gap-3 bg-white border border-zinc-200 rounded-xl p-4 shadow-sm text-zinc-700 font-medium hover:bg-zinc-50 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300">
                <span className="material-symbols-outlined text-purple-700">description</span> {t('viewContracts')}
            </Link>
            <Link to="/payments" className="flex items-center gap-3 bg-white border border-zinc-200 rounded-xl p-4 shadow-sm text-zinc-700 font-medium hover:bg-zinc-50 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300">
                <span className="material-symbols-outlined text-emerald-700">account_balance_wallet</span> {t('payments')}
            </Link>
            <Link to="/analytics" className="flex items-center gap-3 bg-white border border-zinc-200 rounded-xl p-4 shadow-sm text-zinc-700 font-medium hover:bg-zinc-50 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300">
                <span className="material-symbols-outlined text-amber-700">insert_chart</span> {t('analytics')}
            </Link>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8">
        {session.role === 'Seller' && (
          <div className="lg:col-span-5 bg-white rounded-xl border border-zinc-200 shadow-sm p-6 fade-up">
              <h3 className="text-[16px] font-bold text-emerald-950 mb-5 flex items-center gap-2">
                  <span className="material-symbols-outlined text-emerald-600 text-[20px]">add_circle</span> {t('listNewCrop')}
              </h3>
              <form onSubmit={handleCreateCrop} className="space-y-4">
                  <div>
                      <label className="block text-[11px] font-semibold text-zinc-500 uppercase mb-1.5">Crop Type</label>
                      <input type="text" value={cropForm.cropName} onChange={e => setCropForm({...cropForm, cropName: e.target.value})} className="w-full px-4 py-2 border rounded-lg outline-none focus:border-emerald-500 transition-colors" required/>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                      <div>
                          <label className="block text-[11px] font-semibold text-zinc-500 uppercase mb-1.5">Expected Yield</label>
                          <input type="text" value={cropForm.quantity} onChange={e => setCropForm({...cropForm, quantity: e.target.value})} className="w-full px-4 py-2 border rounded-lg outline-none focus:border-emerald-500 transition-colors" required/>
                      </div>
                      <div>
                          <label className="block text-[11px] font-semibold text-zinc-500 uppercase mb-1.5">Asking Price (₹)</label>
                          <input type="number" value={cropForm.price} onChange={e => setCropForm({...cropForm, price: e.target.value})} className="w-full px-4 py-2 border rounded-lg outline-none focus:border-emerald-500 transition-colors" required/>
                      </div>
                  </div>
                  <div className="mb-2">
                        <label className="block text-[11px] font-semibold text-zinc-500 uppercase mb-1.5">Location</label>
                        <input type="text" value={cropForm.location} onChange={e => setCropForm({...cropForm, location: e.target.value})} className="w-full px-4 py-2 border rounded-lg outline-none focus:border-emerald-500 transition-colors" required/>
                  </div>
                  <button type="submit" disabled={isSubmitting} className="w-full py-2.5 bg-emerald-800 text-white font-semibold rounded-lg mt-2 hover:bg-emerald-900 transition-colors shadow-lg shadow-emerald-900/20 disabled:opacity-50">
                    {isSubmitting ? 'Publishing...' : 'Publish Listing'}
                  </button>
              </form>
          </div>
        )}

        {/* Activity Feed */}
        <div className={`${session.role === 'Seller' ? 'lg:col-span-7' : 'lg:col-span-12'} bg-white rounded-xl border border-zinc-200 shadow-sm p-6 fade-up`}>
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-[16px] font-bold text-emerald-950">{t('recentActivity')}</h3>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Live</span>
            </div>
          </div>
          <div className="space-y-3">
              {loading ? (
                <>
                  <SkeletonActivity /><SkeletonActivity /><SkeletonActivity />
                </>
              ) : activities.length > 0 ? activities.map((a, i) => (
                <div key={i} className={`flex gap-3 p-3 rounded-lg border ${a.colors.bg} ${a.colors.border} transition-all hover:scale-[1.01] duration-200`}>
                    <div className={`w-9 h-9 flex items-center justify-center rounded-lg flex-shrink-0 ${a.colors.iconBg}`}>
                        <span className={`material-symbols-outlined ${a.colors.iconText}`}>{a.icon}</span>
                    </div>
                    <div>
                        <p className={`text-[13px] font-semibold mb-0 ${a.colors.text}`}>{a.title}</p>
                        <p className="text-[11px] text-zinc-500 mb-0">{a.desc}</p>
                    </div>
                </div>
              )) : <p className="text-zinc-500">No activity yet.</p>}
          </div>
        </div>
      </div>
    </>
  );
}
