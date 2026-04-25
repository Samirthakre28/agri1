import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../App';
import { useToast } from '../context/ToastContext';
import * as api from '../services/supabase';

export default function Crops() {
  const { session } = useContext(AuthContext);
  const toast = useToast();
  const [crops, setCrops] = useState([]);
  const [offers, setOffers] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newCrop, setNewCrop] = useState({ cropName: '', quantity: '', price: '', location: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    if(session.role === 'Seller') {
        const myCrops = await api.fetchMyCrops(session.name);
        setCrops(myCrops);
    }
    const myOffers = await api.fetchMyOffers(session);
    setOffers(myOffers);
  };

  const handleUpdateOffer = async (id, status) => {
    const res = await api.updateOfferStatus(id, status, session.name, session.id);
    toast.success(status === 'Accepted' ? '✅ Offer accepted! Contract created.' : '❌ Offer declined.');
    loadData();
  };

  const handleAddCrop = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    const res = await api.addCrop(newCrop, session.name, session.id);
    if(res.success) {
        toast.success('🌾 Crop listed successfully!');
        setShowAddForm(false);
        setNewCrop({ cropName: '', quantity: '', price: '', location: '' });
        loadData();
    } else {
        toast.error(res.message || 'Failed to list crop.');
    }
    setIsSubmitting(false);
  };

  return (
    <div className="fade-up">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-emerald-950 tracking-tight">
          {session.role === 'Seller' ? 'My Crops & Listings' : 'My Offers'}
        </h2>
        {session.role === 'Seller' && (
            <button 
                onClick={() => setShowAddForm(!showAddForm)}
                className="bg-emerald-800 text-white px-4 py-2 rounded-xl text-[13px] font-bold shadow-md hover:bg-emerald-900 transition-all flex items-center gap-2"
            >
                <span className="material-symbols-outlined text-[18px]">{showAddForm ? 'close' : 'add'}</span>
                {showAddForm ? 'Cancel' : 'Add New Listing'}
            </button>
        )}
      </div>


      {showAddForm && (
        <div className="bg-white rounded-2xl border border-emerald-100 shadow-xl shadow-emerald-900/5 p-8 mb-8 fade-in">
            <h3 className="text-[17px] font-bold text-emerald-950 mb-6">List New Crop to Marketplace</h3>
            <form onSubmit={handleAddCrop} className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                    <label className="block text-[12px] font-bold text-zinc-500 mb-1.5 ml-1">Crop Name</label>
                    <input 
                        type="text" required placeholder="e.g. Organic Wheat"
                        className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 bg-zinc-50 focus:bg-white focus:border-emerald-500 outline-none transition-all text-[14px]"
                        value={newCrop.cropName} onChange={e => setNewCrop({...newCrop, cropName: e.target.value})}
                    />
                </div>
                <div>
                    <label className="block text-[12px] font-bold text-zinc-500 mb-1.5 ml-1">Quantity (MT / Quintals)</label>
                    <input 
                        type="text" required placeholder="e.g. 50 MT"
                        className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 bg-zinc-50 focus:bg-white focus:border-emerald-500 outline-none transition-all text-[14px]"
                        value={newCrop.quantity} onChange={e => setNewCrop({...newCrop, quantity: e.target.value})}
                    />
                </div>
                <div>
                    <label className="block text-[12px] font-bold text-zinc-500 mb-1.5 ml-1">Expected Price (₹)</label>
                    <input 
                        type="number" required placeholder="Price per unit"
                        className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 bg-zinc-50 focus:bg-white focus:border-emerald-500 outline-none transition-all text-[14px]"
                        value={newCrop.price} onChange={e => setNewCrop({...newCrop, price: e.target.value})}
                    />
                </div>
                <div>
                    <label className="block text-[12px] font-bold text-zinc-500 mb-1.5 ml-1">Location</label>
                    <input 
                        type="text" required placeholder="e.g. Punjab, India"
                        className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 bg-zinc-50 focus:bg-white focus:border-emerald-500 outline-none transition-all text-[14px]"
                        value={newCrop.location} onChange={e => setNewCrop({...newCrop, location: e.target.value})}
                    />
                </div>
                <div className="md:col-span-2">
                    <button 
                        disabled={isSubmitting}
                        className="w-full bg-emerald-800 text-white font-bold py-3 rounded-xl hover:bg-emerald-900 transition-all flex items-center justify-center gap-2"
                    >
                        {isSubmitting ? 'Listing...' : 'List Crop to Market'}
                    </button>
                </div>
            </form>
        </div>
      )}
      
      {session.role === 'Seller' && (
        <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden mb-8">
            <div className="bg-zinc-50/50 px-6 py-4 border-b border-zinc-100 flex justify-between items-center">
                <h3 className="font-bold text-emerald-950 uppercase tracking-wider text-[12px]">Your Current Listings</h3>
                <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">{crops.length} Total</span>
            </div>
            <div className="p-0">
                {crops.map((c, idx) => (
                    <div key={c.id} className={`flex justify-between items-center p-5 ${idx !== crops.length - 1 ? 'border-b border-zinc-100' : ''} hover:bg-zinc-50/30 transition-colors`}>
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600 font-bold">
                                {c.cropName.charAt(0)}
                            </div>
                            <div>
                                <p className="font-bold text-emerald-950 text-[15px]">{c.cropName}</p>
                                <p className="text-[12px] text-zinc-500 font-medium flex items-center gap-2">
                                    <span className="material-symbols-outlined text-[14px]">location_on</span> {c.location} · 
                                    <span className="font-bold text-zinc-700">{c.quantity}</span>
                                </p>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="font-bold text-emerald-900 text-[16px]">₹{c.price?.toLocaleString() || '0'}</p>
                            <span className={`text-[10px] font-black px-2 py-0.5 rounded tracking-tighter uppercase ${c.status==='Available' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-50 text-red-600'}`}>{c.status}</span>
                        </div>
                    </div>
                ))}
                {crops.length === 0 && (
                    <div className="p-10 text-center">
                        <span className="material-symbols-outlined text-[48px] text-zinc-300 mb-2">inventory_2</span>
                        <p className="text-zinc-500 font-medium">You haven't listed any crops yet.</p>
                    </div>
                )}
            </div>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden">
        <div className="bg-zinc-50/50 px-6 py-4 border-b border-zinc-100 italic">
            <h3 className="font-bold text-zinc-800 uppercase tracking-wider text-[12px] not-italic">{session.role === 'Seller' ? 'Incoming Purchase Requests' : 'Your Bids & Offers'}</h3>
        </div>
        <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {offers.filter(o => o.status === 'Pending').map(o => (
                    <div key={o.id} className="p-5 bg-white rounded-2xl border border-zinc-200 hover:border-emerald-200 transition-all shadow-sm">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <p className="font-bold text-emerald-950 text-[16px]">{o.cropId?.cropName || 'Organic Produce'}</p>
                                <p className="text-[11px] text-zinc-400 font-black uppercase tracking-widest mt-0.5">{session.role === 'Seller' ? `Buyer: ${o.buyerName}` : `Seller: ${o.cropId?.farmerName || 'Self'}`}</p>
                            </div>
                            <div className="bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full font-bold text-[14px]">
                                ₹{Number(o.offeredPrice || 0).toLocaleString()}
                            </div>
                        </div>
                        {session.role === 'Seller' && (
                            <div className="flex gap-2 mt-4">
                                <button onClick={() => handleUpdateOffer(o.id, 'Accepted')} className="flex-1 bg-emerald-800 text-white text-[12px] py-2.5 rounded-xl font-bold hover:bg-emerald-900 transition-all shadow-md active:scale-95">Approve Offer</button>
                                <button onClick={() => handleUpdateOffer(o.id, 'Rejected')} className="px-4 text-zinc-500 text-[12px] py-2.5 rounded-xl font-bold hover:bg-zinc-100 transition-colors">Decline</button>
                            </div>
                        )}
                        {session.role === 'Buyer' && (
                            <div className="py-2.5 text-center bg-zinc-50 rounded-xl border border-zinc-100">
                                <span className="text-[12px] font-bold text-zinc-500 flex items-center justify-center gap-2">
                                    <span className="material-symbols-outlined text-[16px] animate-pulse">hourglass_top</span>
                                    Awaiting Farmer's Response
                                </span>
                            </div>
                        )}
                    </div>
                ))}
            </div>
            {offers.filter(o => o.status === 'Pending').length === 0 && (
                <div className="text-center py-10">
                    <p className="text-zinc-400 font-medium">No pending activity to show.</p>
                </div>
            )}
        </div>
      </div>
    </div>
  );
}
