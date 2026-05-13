import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import * as api from '../services/supabase';
import { supabase } from '../services/supabase';

// Contract Status Timeline
const StatusTimeline = ({ status, paymentStatus }) => {
  const steps = [
    { label: 'Created', icon: 'edit_note', done: true },
    { label: 'Active', icon: 'handshake', done: status === 'Active' || status === 'Completed' },
    { label: 'Advance', icon: 'savings', done: paymentStatus === 'Advance Paid' || paymentStatus === 'Paid' },
    { label: 'Paid', icon: 'verified', done: paymentStatus === 'Paid' },
  ];

  return (
    <div className="flex items-center gap-0 mt-3">
      {steps.map((step, i) => (
        <div key={i} className="flex items-center">
          <div className={`flex flex-col items-center ${step.done ? 'text-emerald-600' : 'text-zinc-300'}`}>
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[14px] transition-all duration-500 ${step.done ? 'bg-emerald-100 border-2 border-emerald-500' : 'bg-zinc-100 border border-zinc-200'}`}>
              <span className="material-symbols-outlined text-[14px]">{step.icon}</span>
            </div>
            <span className="text-[8px] font-bold mt-1 uppercase tracking-wider">{step.label}</span>
          </div>
          {i < steps.length - 1 && (
            <div className={`w-6 h-0.5 mx-0.5 mb-4 transition-all duration-500 ${step.done ? 'bg-emerald-400' : 'bg-zinc-200'}`}></div>
          )}
        </div>
      ))}
    </div>
  );
};

const SkeletonContract = () => (
  <div className="bg-white p-5 rounded-xl border border-zinc-200 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
    <div className="flex items-center gap-4 w-full">
      <div className="skeleton w-12 h-12 rounded-xl"></div>
      <div className="flex-1">
        <div className="skeleton h-4 w-32 mb-2"></div>
        <div className="skeleton h-3 w-48 mb-2"></div>
        <div className="flex gap-2">
          <div className="skeleton h-5 w-16 rounded"></div>
          <div className="skeleton h-5 w-20 rounded"></div>
        </div>
      </div>
    </div>
    <div className="skeleton h-6 w-24"></div>
  </div>
);

export default function Contracts() {
  const { session } = useContext(AuthContext);
  const toast = useToast();
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { 
    loadData();

    // Supabase Realtime: Live contract updates
    const channel = supabase
      .channel('contracts-page')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'contracts' },
        (payload) => {
          const contract = payload.new;
          if (contract?.farmer_id === session.id || contract?.buyer_id === session.id) {
            if (payload.eventType === 'INSERT') {
              toast.info(`📋 New contract appeared: ${contract.cropName || 'Contract'}`);
            } else if (payload.eventType === 'UPDATE' && contract.paymentStatus === 'Paid') {
              toast.success(`💰 Payment confirmed for ${contract.cropName || 'contract'}!`);
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
    setLoading(true);
    const data = await api.fetchMyContracts(session);
    setContracts(data || []);
    setLoading(false);
  };

  const handleStatus = async (id, status) => {
    const res = await api.updateContractStatus(id, status);
    if (res.success) {
      toast.success(status === 'Active' ? "✅ Contract Accepted!" : "❌ Contract Rejected.");
    } else {
      toast.error(res.message || "Status update failed.");
    }
    loadData();
  };

  const handlePay = async (id) => {
    const res = await api.markContractPaid(id);
    if (res.success) {
      toast.success("✅ Payment processed successfully!");
    } else {
      toast.error(res.message || "Payment failed.");
    }
    loadData();
  };

  if (loading) return (
    <div className="fade-up">
      <h2 className="text-2xl font-bold text-emerald-950 mb-6 tracking-tight">Active Contracts</h2>
      <div className="space-y-4">
        <SkeletonContract /><SkeletonContract /><SkeletonContract />
      </div>
    </div>
  );

  return (
    <div className="fade-up">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-emerald-950 tracking-tight">Active Contracts</h2>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Live Updates</span>
        </div>
      </div>
      <div className="space-y-4">
        {contracts.map(c => (
            <div key={c.id} className={`bg-white p-6 rounded-xl border ${c.paymentStatus === 'Pending Approval' && c.status === 'Active' ? 'border-amber-200 shadow-amber-900/5' : c.status === 'Cancelled' ? 'border-red-200' : 'border-zinc-200'} shadow-sm flex flex-col justify-between items-start text-left gap-4 transition-all hover:shadow-md hover:-translate-y-0.5 duration-300 relative overflow-hidden`}>
                
                <div className="flex flex-col sm:flex-row w-full justify-between gap-6">
                  
                  {/* Connection Header & Info */}
                  <div className="flex-1">
                     <div className="flex items-center gap-3 bg-zinc-50 p-3 rounded-xl border border-zinc-100 max-w-max mb-4">
                         <div className="flex flex-col items-center">
                            <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs shadow-sm">{c.farmerName?.charAt(0) || 'F'}</div>
                            <span className="text-[10px] text-zinc-500 font-bold mt-1.5 uppercase tracking-wider">Farmer</span>
                         </div>
                         <div className="flex flex-col items-center px-4">
                             <div className="w-16 h-px bg-zinc-300 relative">
                                <span className="absolute left-1/2 -top-2.5 -translate-x-1/2 bg-zinc-50 px-1 text-zinc-400 material-symbols-outlined text-[16px]">sync_alt</span>
                             </div>
                         </div>
                         <div className="flex flex-col items-center">
                            <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center font-bold text-xs shadow-sm">{c.buyerName?.charAt(0) || 'B'}</div>
                            <span className="text-[10px] text-zinc-500 font-bold mt-1.5 uppercase tracking-wider">Buyer</span>
                         </div>
                     </div>

                     <h3 className="font-bold text-emerald-950 text-[18px]">{c.cropName}</h3>
                     <p className="text-[13px] text-zinc-600 font-medium">Quantity: {c.quantity || 'Negotiated'} • Base Price: ₹{Number(c.agreedPrice || 0).toLocaleString()}</p>
                     
                     <div className="mt-4">
                       <StatusTimeline status={c.status} paymentStatus={c.paymentStatus} />
                     </div>
                  </div>
                  
                  {/* Action Buttons & Pricing */}
                  <div className="text-right w-full sm:w-auto flex flex-col justify-end items-end sm:items-end">
                      <p className="font-bold text-emerald-800 text-[24px] sm:mb-2 text-right">₹{Number(c.agreedPrice || 0).toLocaleString()}</p>
                      
                      <div className="flex gap-2 justify-end mt-4 sm:mt-2 w-full sm:w-auto">
                        {/* Farmer Actions for Pending */}
                        {(session.role === 'Seller' && c.paymentStatus === 'Pending Approval' && c.status === 'Active') && (
                            <>
                                <button onClick={() => handleStatus(c.id, 'Active')} className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-lg text-[13px] font-bold shadow-lg shadow-emerald-600/20 active:scale-95 transition-all">
                                    Accept Offer
                                </button>
                                <button onClick={() => handleStatus(c.id, 'Cancelled')} className="w-full sm:w-auto bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 px-5 py-2.5 rounded-lg text-[13px] font-bold active:scale-95 transition-all">
                                    Decline
                                </button>
                            </>
                        )}
                        
                        {/* Buyer Actions for Payments */}
                        {(session.role === 'Buyer' && ['Advance Paid'].includes(c.paymentStatus) && c.status === 'Active') && (
                            <button onClick={() => handlePay(c.id)} className="w-full sm:w-auto bg-emerald-700 hover:bg-emerald-800 text-white px-5 py-2.5 rounded-lg text-[13px] font-bold shadow-lg shadow-emerald-700/20 active:scale-95 transition-all">
                                Pay Balance
                            </button>
                        )}
                        
                        {/* Pending Indicator for Buyer */}
                        {(session.role === 'Buyer' && c.paymentStatus === 'Pending Approval') && (
                            <span className="px-4 py-2 bg-amber-50 border border-amber-200 text-amber-700 rounded-lg text-[12px] font-bold w-full sm:w-auto text-center">
                                Awaiting Farmer Approval
                            </span>
                        )}
                        
                        {/* Rejected Indicator */}
                        {c.status === 'Cancelled' && (
                             <span className="px-4 py-2 bg-red-50 border border-red-200 text-red-700 rounded-lg text-[12px] font-bold w-full sm:w-auto text-center">
                                Contract Denied / Cancelled
                            </span>
                        )}
                      </div>
                  </div>
                </div>

                {/* Detailed Breakdown */}
                <div className="w-full mt-2 pt-4 border-t border-zinc-100 flex flex-col sm:flex-row gap-4 sm:gap-6 opacity-70 hover:opacity-100 transition-opacity">
                    <div className="flex-1 text-[11px] text-zinc-500">
                        <strong className="text-zinc-700 block mb-1">Farmer Contact</strong> 
                        {c.farmer?.name || c.farmerName} {c.farmer?.contact ? `• ${c.farmer.contact}` : ''}
                    </div>
                    <div className="flex-1 text-[11px] text-zinc-500 sm:text-right">
                        <strong className="text-zinc-700 block mb-1">Buyer Contact</strong> 
                        {c.buyer?.name || c.buyerName} {c.buyer?.contact ? `• ${c.buyer.contact}` : ''}
                    </div>
                </div>
            </div>
        ))}
        {contracts.length === 0 && <p className="text-zinc-500 font-medium">No contracts found.</p>}
      </div>
    </div>
  );
}
