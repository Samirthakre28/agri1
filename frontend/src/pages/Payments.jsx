import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../App';
import * as api from '../services/supabase';

export default function Payments() {
  const { session } = useContext(AuthContext);
  const [payments, setPayments] = useState([]);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    async function load() {
        const contracts = await api.fetchMyContracts(session);
        const paid = contracts.filter(c => ['Paid', 'Advance Paid'].includes(c.paymentStatus));
        setPayments(paid);
        let calculatedTotal = 0;
        paid.forEach(c => {
            const price = Number(c.agreedPrice) || 0;
            if (c.paymentStatus === 'Advance Paid') calculatedTotal += (price * 0.1);
            else calculatedTotal += price;
        });
        setTotal(calculatedTotal);
    }
    load();
  }, [session]);

  return (
    <div className="fade-up w-full">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-[28px] font-bold text-emerald-950 tracking-tight">Payment History</h2>
          <p className="text-zinc-500 text-[14px]">Monitor your financial transactions and escrow status</p>
        </div>
        <div className="bg-emerald-50 px-4 py-2 rounded-lg border border-emerald-100 flex items-center gap-3">
          <span className="material-symbols-outlined text-emerald-700">account_balance_wallet</span>
          <div>
            <p className="text-[10px] font-bold text-emerald-800 uppercase tracking-widest">Total Volume</p>
            <p className="text-lg font-bold text-emerald-950">₹{total.toLocaleString()}</p>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
        <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm transition-all hover:shadow-md">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center mb-4">
                <span className="material-symbols-outlined">payments</span>
            </div>
            <p className="text-zinc-500 font-bold uppercase tracking-widest text-[11px] mb-1">Settled Flow</p>
            <h3 className="text-3xl font-bold text-emerald-950 tracking-tight">₹{total.toLocaleString()}</h3>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm transition-all hover:shadow-md">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center mb-4">
                <span className="material-symbols-outlined">analytics</span>
            </div>
            <p className="text-zinc-500 font-bold uppercase tracking-widest text-[11px] mb-1">Transactions</p>
            <h3 className="text-3xl font-bold text-emerald-950 tracking-tight">{payments.length}</h3>
        </div>
        <div className="bg-emerald-900 p-6 rounded-2xl shadow-xl shadow-emerald-950/20 flex flex-col justify-between">
            <div className="flex justify-between items-start">
               <div className="w-10 h-10 rounded-xl bg-white/10 text-emerald-200 flex items-center justify-center">
                   <span className="material-symbols-outlined">verified</span>
               </div>
               <span className="text-[10px] font-bold text-emerald-300 uppercase tracking-widest bg-white/5 px-2 py-1 rounded">Secured Escrow</span>
            </div>
            <div className="mt-4">
              <p className="text-emerald-200 font-medium text-[12px] opacity-80">Payment distribution is secured by Farm Link Escrow.</p>
            </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden transition-all duration-300">
          <div className="px-6 py-5 border-b border-zinc-100 flex justify-between items-center">
              <h3 className="font-bold text-emerald-950">Transaction History</h3>
              <div className="flex gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  <p className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest">Live Updates</p>
              </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="bg-zinc-50/50 border-b border-zinc-200 text-[11px] text-zinc-500 font-bold tracking-widest uppercase">
                        <th className="py-4 px-6">Ref ID</th>
                        <th className="py-4 px-6">Product</th>
                        <th className="py-4 px-6">{session.role === 'Seller' ? 'Buyer Name' : 'Farmer Name'}</th>
                        <th className="py-4 px-6">Status</th>
                        <th className="py-4 px-6 text-right">Amount</th>
                    </tr>
                </thead>
                <tbody>
                    {payments.map(c => (
                        <tr key={c.id} className="border-b border-zinc-50 hover:bg-zinc-50/50 transition-colors group">
                            <td className="py-5 px-6">
                                <p className="text-[13px] font-bold text-emerald-950">#{String(c.id).slice(-6)}</p>
                            </td>
                            <td className="py-5 px-6">
                                <p className="text-[13px] text-zinc-900 font-semibold">{c.cropName}</p>
                            </td>
                            <td className="py-5 px-6 text-[13px] text-zinc-600">
                                {session.role === 'Seller' ? c.buyerName : c.farmerName}
                            </td>
                            <td className="py-5 px-6">
                                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase ${c.paymentStatus === 'Advance Paid' ? 'bg-blue-100 text-blue-700' : 'bg-emerald-100 text-emerald-700'}`}>
                                    <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                                    {c.paymentStatus}
                                </span>
                            </td>
                            <td className="py-5 px-6 text-right">
                                <p className="font-bold text-emerald-950 font-mono">₹{c.paymentStatus === 'Advance Paid' ? (Number(c.agreedPrice || 0) * 0.1).toLocaleString() : Number(c.agreedPrice || 0).toLocaleString()}</p>
                                <p className="text-[10px] text-zinc-400 font-medium">via Secured Gate</p>
                            </td>
                        </tr>
                    ))}
                    {payments.length === 0 && (
                        <tr>
                            <td colSpan="5" className="py-20 text-center">
                                <span className="material-symbols-outlined text-[48px] text-zinc-200 mb-2">move_to_inbox</span>
                                <p className="text-zinc-400 font-medium uppercase tracking-widest text-[12px]">No payment history recorded.</p>
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
          </div>
      </div>
    </div>
  );
}
