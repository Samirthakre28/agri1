import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../App';
import { LanguageContext } from '../context/LanguageContext';
import * as api from '../services/supabase';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const { session } = useContext(AuthContext);
  const { t } = useContext(LanguageContext);
  const [stats, setStats] = useState(null);
  const [activities, setActivities] = useState([]);
  
  const [cropForm, setCropForm] = useState({ cropName: '', quantity: '', price: '', location: '' });

  useEffect(() => {
    loadData();
  }, [session]);

  const loadData = async () => {
    const contracts = await api.fetchMyContracts(session);
    const offers = await api.fetchMyOffers(session);
    
    let calcStats = {};
    if (session.role === 'Seller') {
      const crops = await api.fetchMyCrops(session.name);
      calcStats = {
        label1: t('totalCrops'), val1: crops.length,
        label2: t('activeContracts'), val2: contracts.length,
        label3: t('earnings'), val3: `₹${contracts.filter(c => c.paymentStatus === 'Paid').reduce((s, c) => s + c.agreedPrice, 0).toLocaleString()}`,
        label4: t('pendingDeals'), val4: offers.filter(o => o.status === 'Pending').length
      };
    } else {
      const availableCrops = await api.fetchAvailableCrops();
      calcStats = {
        label1: t('totalOrders'), val1: offers.length,
        label2: t('buyerContracts'), val2: contracts.length,
        label3: t('spending'), val3: `₹${contracts.filter(c => c.paymentStatus === 'Paid').reduce((s, c) => s + c.agreedPrice, 0).toLocaleString()}`,
        label4: t('availableCrops'), val4: availableCrops.length
      };
    }
    setStats(calcStats);

    let acts = [];
    contracts.forEach(c => {
      acts.push(c.paymentStatus === 'Paid' 
        ? { title: 'Payment Received', desc: `₹${c.agreedPrice.toLocaleString()} for ${c.cropName}`, icon: 'payments', color: 'emerald' }
        : { title: 'Contract Active', desc: `With ${session.role === 'Seller' ? c.buyerName : c.farmerName}`, icon: 'description', color: 'blue' });
    });
    offers.forEach(o => {
      if (o.status === 'Pending') acts.push({ title: 'New Offer', desc: `₹${o.offeredPrice} for ${o.cropId?.cropName || 'Crop'}`, icon: 'handshake', color: 'amber' });
    });
    setActivities(acts.slice(0, 5));
  };

  const handleCreateCrop = async (e) => {
    e.preventDefault();
    const res = await api.addCrop(cropForm, session.name);
    if(res.success) {
      alert("Crop Listed!");
      setCropForm({ cropName: '', quantity: '', price: '', location: '' });
      loadData();
    }
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
      {stats && (
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
            <div className="bg-white p-5 rounded-xl border border-zinc-200 shadow-sm fade-up">
                <p className="text-zinc-500 text-[13px] font-medium mb-1">{stats.label1}</p>
                <h3 className="text-[26px] font-bold text-emerald-950">{stats.val1}</h3>
            </div>
            <div className="bg-white p-5 rounded-xl border border-zinc-200 shadow-sm fade-up fade-up-d1">
                <p className="text-zinc-500 text-[13px] font-medium mb-1">{stats.label2}</p>
                <h3 className="text-[26px] font-bold text-emerald-950">{stats.val2}</h3>
            </div>
            <div className="bg-white p-5 rounded-xl border border-zinc-200 shadow-sm fade-up fade-up-d2">
                <p className="text-zinc-500 text-[13px] font-medium mb-1">{stats.label3}</p>
                <h3 className="text-[26px] font-bold text-emerald-950">{stats.val3}</h3>
            </div>
            <div className="bg-emerald-900 p-5 rounded-xl shadow-md fade-up fade-up-d3">
                <p className="text-emerald-200 text-[13px] font-medium mb-1">{stats.label4}</p>
                <h3 className="text-[26px] font-bold text-white">{stats.val4}</h3>
            </div>
        </section>
      )}

      {/* Quick Actions */}
      <section className="mb-8 fade-up">
        <h3 className="text-[15px] font-semibold text-zinc-700 mb-3 flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px] text-zinc-500">bolt</span> {t('quickActions')}
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Link to="/marketplace" className="flex items-center gap-3 bg-white border border-zinc-200 rounded-xl p-4 shadow-sm text-zinc-700 font-medium">
                <span className="material-symbols-outlined text-blue-700">storefront</span> {t('browseMarket')}
            </Link>
            <Link to="/contracts" className="flex items-center gap-3 bg-white border border-zinc-200 rounded-xl p-4 shadow-sm text-zinc-700 font-medium">
                <span className="material-symbols-outlined text-purple-700">description</span> {t('viewContracts')}
            </Link>
            <Link to="/payments" className="flex items-center gap-3 bg-white border border-zinc-200 rounded-xl p-4 shadow-sm text-zinc-700 font-medium">
                <span className="material-symbols-outlined text-emerald-700">account_balance_wallet</span> {t('payments')}
            </Link>
            <Link to="/analytics" className="flex items-center gap-3 bg-white border border-zinc-200 rounded-xl p-4 shadow-sm text-zinc-700 font-medium">
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
                      <input type="text" value={cropForm.cropName} onChange={e => setCropForm({...cropForm, cropName: e.target.value})} className="w-full px-4 py-2 border rounded-lg" required/>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                      <div>
                          <label className="block text-[11px] font-semibold text-zinc-500 uppercase mb-1.5">Expected Yield</label>
                          <input type="text" value={cropForm.quantity} onChange={e => setCropForm({...cropForm, quantity: e.target.value})} className="w-full px-4 py-2 border rounded-lg" required/>
                      </div>
                      <div>
                          <label className="block text-[11px] font-semibold text-zinc-500 uppercase mb-1.5">Asking Price (₹)</label>
                          <input type="number" value={cropForm.price} onChange={e => setCropForm({...cropForm, price: e.target.value})} className="w-full px-4 py-2 border rounded-lg" required/>
                      </div>
                  </div>
                  <div className="mb-2">
                        <label className="block text-[11px] font-semibold text-zinc-500 uppercase mb-1.5">Location</label>
                        <input type="text" value={cropForm.location} onChange={e => setCropForm({...cropForm, location: e.target.value})} className="w-full px-4 py-2 border rounded-lg" required/>
                  </div>
                  <button type="submit" className="w-full py-2.5 bg-emerald-800 text-white font-semibold rounded-lg mt-2">Publish Listing</button>
              </form>
          </div>
        )}

        {/* Activity Feed */}
        <div className={`lg:col-span-${session.role === 'Seller' ? '7' : '12'} bg-white rounded-xl border border-zinc-200 shadow-sm p-6 fade-up`}>
          <h3 className="text-[16px] font-bold text-emerald-950 mb-5">{t('recentActivity')}</h3>
          <div className="space-y-3">
              {activities.length > 0 ? activities.map((a, i) => (
                <div key={i} className={`flex gap-3 p-3 bg-${a.color}-50 rounded-lg border border-${a.color}-100`}>
                    <div className={`w-9 h-9 bg-${a.color}-200 flex items-center justify-center rounded-lg`}>
                        <span className={`material-symbols-outlined text-${a.color}-800`}>{a.icon}</span>
                    </div>
                    <div>
                        <p className={`text-[13px] font-semibold text-${a.color}-900`}>{a.title}</p>
                        <p className="text-[11px] text-zinc-500">{a.desc}</p>
                    </div>
                </div>
              )) : <p className="text-zinc-500">No activity yet.</p>}
          </div>
        </div>
      </div>
    </>
  );
}
