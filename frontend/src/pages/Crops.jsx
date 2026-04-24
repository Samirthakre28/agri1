import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../App';
import * as api from '../services/supabase';

export default function Crops() {
  const { session } = useContext(AuthContext);
  const [crops, setCrops] = useState([]);
  const [offers, setOffers] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    if(session.role === 'Seller') {
        setCrops(await api.fetchMyCrops(session.name));
    }
    setOffers(await api.fetchMyOffers(session));
  };

  const handleUpdateOffer = async (id, status) => {
    const res = await api.updateOfferStatus(id, status, session.name);
    alert(res.message);
    loadData();
  };

  return (
    <div className="fade-up">
      <h2 className="text-2xl font-bold text-emerald-950 mb-6">{session.role === 'Seller' ? 'My Crops & Listings' : 'My Offers'}</h2>
      
      {session.role === 'Seller' && (
        <div className="bg-white rounded-xl border border-zinc-200 shadow-sm p-6 mb-8">
            <h3 className="font-bold text-emerald-950 mb-4">Current Listings</h3>
            {crops.map(c => (
                <div key={c.id} className="flex justify-between items-center p-3 border-b border-zinc-100">
                    <div>
                        <p className="font-bold text-emerald-950">{c.cropName}</p>
                        <p className="text-[11px] text-zinc-500">{c.quantity} · {c.location}</p>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-1 rounded ${c.status==='Available'?'bg-emerald-50 text-emerald-600':'bg-zinc-100 text-zinc-600'}`}>{c.status}</span>
                </div>
            ))}
        </div>
      )}

      <div className="bg-white rounded-xl border border-zinc-200 shadow-sm p-6">
        <h3 className="font-bold text-emerald-950 mb-4">Pending Offers</h3>
        {offers.filter(o => o.status === 'Pending').map(o => (
            <div key={o.id} className="p-4 bg-zinc-50 rounded-lg border border-zinc-200 mb-3 text-left">
                <div className="flex justify-between items-start mb-2">
                    <div>
                        <p className="font-bold text-emerald-950 text-[14px]">{o.cropId?.cropName || 'Crop'}</p>
                        <p className="text-[11px] text-zinc-500">From: {o.buyerName}</p>
                    </div>
                    <p className="font-bold text-emerald-800 text-[14px]">₹{o.offeredPrice.toLocaleString()}</p>
                </div>
                {session.role === 'Seller' && (
                    <div className="flex gap-2">
                        <button onClick={() => handleUpdateOffer(o.id, 'Accepted')} className="flex-1 bg-emerald-700 text-white text-[10px] py-1.5 rounded-md font-bold">Accept</button>
                        <button onClick={() => handleUpdateOffer(o.id, 'Rejected')} className="flex-1 bg-zinc-200 text-zinc-700 text-[10px] py-1.5 rounded-md font-bold">Reject</button>
                    </div>
                )}
            </div>
        ))}
        {offers.filter(o => o.status === 'Pending').length === 0 && <p className="text-zinc-500">No pending offers.</p>}
      </div>
    </div>
  );
}
