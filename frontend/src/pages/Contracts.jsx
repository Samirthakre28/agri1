import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../App';
import * as api from '../services/supabase';

export default function Contracts() {
  const { session } = useContext(AuthContext);
  const [contracts, setContracts] = useState([]);

  useEffect(() => { loadData(); }, []);
  const loadData = async () => setContracts(await api.fetchMyContracts(session));

  const handlePay = async (id) => {
    const res = await api.markContractPaid(id);
    alert(res.message);
    loadData();
  };

  return (
    <div className="fade-up">
      <h2 className="text-2xl font-bold text-emerald-950 mb-6">Active Contracts</h2>
      <div className="space-y-4">
        {contracts.map(c => (
            <div key={c.id} className="bg-white p-5 rounded-xl border border-zinc-200 shadow-sm flex justify-between items-center text-left">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                        <span className="material-symbols-outlined text-[24px]">description</span>
                    </div>
                    <div>
                        <h3 className="font-bold text-emerald-950 text-[16px]">{c.cropName}</h3>
                        <p className="text-[12px] text-zinc-500">{session.role==='Seller'?'Buyer: '+c.buyerName:'Farmer: '+c.farmerName}</p>
                        <div className="flex gap-2 mt-2">
                            <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-zinc-100 text-zinc-600 uppercase">{c.status}</span>
                            <span className={`text-[9px] font-bold px-2 py-0.5 rounded ${c.paymentStatus==='Paid'?'bg-green-100 text-green-700':'bg-amber-100 text-amber-700'} uppercase`}>{c.paymentStatus}</span>
                        </div>
                    </div>
                </div>
                <div className="text-right">
                    <p className="font-bold text-emerald-800 text-[18px]">₹{c.agreedPrice.toLocaleString()}</p>
                    {(session.role==='Buyer' && c.paymentStatus==='Pending') && (
                        <button onClick={() => handlePay(c.id)} className="mt-2 bg-emerald-700 text-white px-4 py-1.5 rounded-md text-[11px] font-bold shadow-sm cursor-pointer">Mark Paid</button>
                    )}
                </div>
            </div>
        ))}
        {contracts.length === 0 && <p className="text-zinc-500">No active contracts found.</p>}
      </div>
    </div>
  );
}
