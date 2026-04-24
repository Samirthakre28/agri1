import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../App';
import * as api from '../services/supabase';

export default function Marketplace() {
  const { session } = useContext(AuthContext);
  const [crops, setCrops] = useState([]);

  useEffect(() => {
    loadMarket();
  }, []);

  const loadMarket = async () => {
    const data = await api.fetchAvailableCrops();
    setCrops(data);
  };

  const handleOffer = async (cropId, currentPrice) => {
    const bid = prompt("Enter your bid price (₹):", currentPrice);
    if(bid) {
      const res = await api.sendOffer({ cropId, offeredPrice: parseFloat(bid) }, session.name);
      alert(res.message);
    }
  };

  return (
    <div className="fade-up">
      <h2 className="text-2xl font-bold text-emerald-950 mb-6">Buyers Marketplace</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {crops.map(c => (
          <div key={c.id} className="bg-white p-5 rounded-xl border border-zinc-200 shadow-sm transition-all hover:shadow-md">
            <div className="flex justify-between mb-4">
              <span className="bg-emerald-50 text-emerald-700 px-3 py-1 rounded text-[10px] font-bold uppercase">{c.cropName}</span>
              <p className="font-bold text-emerald-800">₹{c.price.toLocaleString()}</p>
            </div>
            <h3 className="font-bold text-emerald-950 mb-1">{c.farmerName}</h3>
            <p className="text-[12px] text-zinc-500 mb-4">{c.location} · {c.quantity}</p>
            <button onClick={() => handleOffer(c.id, c.price)} className="w-full bg-emerald-800 text-white py-2 rounded-lg font-bold text-[13px] flex justify-center gap-2">
              <span className="material-symbols-outlined text-[18px]">handshake</span> Send Offer
            </button>
          </div>
        ))}
        {crops.length === 0 && <p className="text-zinc-500">No crops currently available.</p>}
      </div>
    </div>
  );
}
