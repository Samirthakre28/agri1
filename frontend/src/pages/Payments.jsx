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
        const paid = contracts.filter(c => c.paymentStatus === 'Paid');
        setPayments(paid);
        setTotal(paid.reduce((s, c) => s + c.agreedPrice, 0));
    }
    load();
  }, [session]);

  return (
    <div className="fade-up">
      <h2 className="text-2xl font-bold text-emerald-950 mb-6">Payment History</h2>
      
      <div className="grid grid-cols-2 gap-5 mb-6">
        <div className="bg-white p-5 rounded-xl border border-zinc-200">
            <p className="text-zinc-500 font-medium mb-1">Total Flow</p>
            <h3 className="text-2xl font-bold text-emerald-950">₹{total.toLocaleString()}</h3>
        </div>
        <div className="bg-white p-5 rounded-xl border border-zinc-200">
            <p className="text-zinc-500 font-medium mb-1">Completed Transactions</p>
            <h3 className="text-2xl font-bold text-emerald-950">{payments.length}</h3>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden text-left">
          <table className="w-full text-left">
              <thead>
                  <tr className="bg-zinc-50 border-b border-zinc-200 text-[12px] text-zinc-500 font-semibold tracking-wider uppercase">
                      <th className="py-3 px-4">Transaction ID</th>
                      <th className="py-3 px-4">Crop</th>
                      <th className="py-3 px-4">{session.role === 'Seller' ? 'Buyer' : 'Farmer'}</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Amount</th>
                  </tr>
              </thead>
              <tbody>
                  {payments.map(c => (
                      <tr key={c.id} className="border-b border-zinc-100 hover:bg-zinc-50 transition-colors">
                          <td className="py-4 px-4 text-[13px] font-bold text-emerald-950">#{String(c.id).slice(-6)}</td>
                          <td className="py-4 px-4 text-[13px] text-zinc-600">{c.cropName}</td>
                          <td className="py-4 px-4 text-[13px] text-zinc-600">{session.role === 'Seller' ? c.buyerName : c.farmerName}</td>
                          <td className="py-4 px-4"><span className="bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase">Paid</span></td>
                          <td className="py-4 px-4 text-right font-bold text-emerald-950 font-mono">₹{c.agreedPrice.toLocaleString()}</td>
                      </tr>
                  ))}
              </tbody>
          </table>
          {payments.length === 0 && <p className="p-8 text-center text-zinc-400">No payment history.</p>}
      </div>
    </div>
  );
}
