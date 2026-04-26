import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../App';
import { LanguageContext } from '../context/LanguageContext';
import { useToast } from '../context/ToastContext';
import * as api from '../services/supabase';

export default function Marketplace() {
  const { session } = useContext(AuthContext);
  const { t } = useContext(LanguageContext);
  const toast = useToast();
  const [crops, setCrops] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  
  // Advanced Modal State
  const [activeCrop, setActiveCrop] = useState(null);
  const [modalStep, setModalStep] = useState(1);
  const [bidPrice, setBidPrice] = useState('');
  const [deliveryLocation, setDeliveryLocation] = useState('');
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [transactionId, setTransactionId] = useState('');

  useEffect(() => {
    loadMarket();
  }, [session, t]);

  const loadMarket = async () => {
    setCrops(await api.fetchAvailableCrops());
  };

  // Filtered and sorted crops
  const filteredCrops = crops
    .filter(c => {
      if (!searchQuery) return true;
      const q = searchQuery.toLowerCase();
      return (c.cropName?.toLowerCase().includes(q)) || 
             (c.farmerName?.toLowerCase().includes(q)) ||
             (c.location?.toLowerCase().includes(q));
    })
    .sort((a, b) => {
      if (sortBy === 'price-low') return (Number(a.price) || 0) - (Number(b.price) || 0);
      if (sortBy === 'price-high') return (Number(b.price) || 0) - (Number(a.price) || 0);
      return 0; // newest = default order
    });

  const openOfferDashboard = (crop) => {
      setActiveCrop(crop);
      setBidPrice(crop.price);
      setDeliveryLocation('');
      setModalStep(1);
      setPaymentProcessing(false);
  };

  const advancePayment = bidPrice ? (parseFloat(bidPrice) * 0.1).toFixed(0) : 0;
  const remainingPayment = bidPrice ? (parseFloat(bidPrice) * 0.9).toFixed(0) : 0;

  const handleProceedToPayment = (e) => {
      e.preventDefault();
      if(!deliveryLocation) return toast.warning("Please specify a delivery location.");
      setModalStep(2);
  };

  const executeSecurePayment = async (e) => {
      e.preventDefault();
      setPaymentProcessing(true);
      
      setTimeout(async () => {
          const txId = 'TXN-' + Math.random().toString(36).substr(2, 9).toUpperCase();
          await api.procureCropWithAdvance(activeCrop, parseFloat(bidPrice), session.name, session.id);
          
          toast.success("🎉 Contract secured with advance deposit!");
          setTransactionId(txId);
          setModalStep(3);
          setPaymentProcessing(false);
          
          setTimeout(() => {
              setActiveCrop(null);
              loadMarket();
          }, 4000);
      }, 2000);
  };

  return (
    <div className="fade-up relative">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <h2 className="text-2xl font-bold text-emerald-950 tracking-tight">{t('sourceCrops') || 'Marketplace'}</h2>
        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 text-[18px]">search</span>
            <input 
              type="text"
              placeholder="Search crops, farmers, locations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2.5 rounded-xl border border-zinc-200 bg-white text-[13px] w-64 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition-all font-medium"
            />
          </div>
          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-2.5 rounded-xl border border-zinc-200 bg-white text-[13px] font-bold text-zinc-700 outline-none focus:border-emerald-500 transition-all cursor-pointer"
          >
            <option value="newest">Newest</option>
            <option value="price-low">Price: Low → High</option>
            <option value="price-high">Price: High → Low</option>
          </select>
        </div>
      </div>

      {searchQuery && (
        <p className="text-[12px] text-zinc-500 mb-4 font-medium">
          Showing {filteredCrops.length} result{filteredCrops.length !== 1 ? 's' : ''} for "<span className="text-emerald-700 font-bold">{searchQuery}</span>"
        </p>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredCrops.map(c => (
          <div key={c.id} className="bg-white p-5 rounded-xl border border-zinc-200 shadow-sm transition-all hover:shadow-md hover:-translate-y-1 duration-300">
            <div className="flex justify-between mb-4">
              <span className="bg-emerald-50 text-emerald-700 px-3 py-1 rounded text-[10px] font-bold uppercase">{c.cropName}</span>
              <p className="font-bold text-emerald-800">₹{Number(c.price || 0).toLocaleString()}</p>
            </div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center text-[10px] font-bold text-emerald-700 flex-shrink-0">
                {(c.farmerName || 'F').charAt(0).toUpperCase()}
              </div>
              <h3 className="font-bold text-emerald-950">{c.farmerName}</h3>
            </div>
            <p className="text-[12px] text-zinc-500 mb-4 flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">location_on</span>
              {c.location} · {c.quantity}
            </p>
            <button onClick={() => openOfferDashboard(c)} className="w-full bg-emerald-800 text-white py-2.5 rounded-lg font-bold text-[13px] flex justify-center items-center gap-2 hover:bg-emerald-900 transition-colors shadow-lg shadow-emerald-900/10 active:scale-[0.98]">
              <span className="material-symbols-outlined text-[18px]">handshake</span> Send Offer
            </button>
          </div>
        ))}
        {filteredCrops.length === 0 && <p className="text-zinc-500">No crops match your search.</p>}
      </div>

      {activeCrop && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-emerald-950/40 backdrop-blur-sm fade-in overflow-y-auto duration-300">
              <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl border border-emerald-100 relative my-8 duration-300">
                  {modalStep !== 3 && !paymentProcessing && (
                      <button onClick={() => setActiveCrop(null)} className="absolute top-4 right-4 text-zinc-400 hover:text-red-500 transition-colors p-2 z-10">
                          <span className="material-symbols-outlined">close</span>
                      </button>
                  )}

                  {/* Header Component */}
                  <div className="flex items-center gap-3 mb-5 border-b border-zinc-100 pb-4">
                      {modalStep === 1 && <div className="bg-emerald-100 text-emerald-700 p-2 text-[20px] rounded-lg material-symbols-outlined">description</div>}
                      {modalStep === 2 && <div className="bg-blue-100 text-blue-700 p-2 text-[20px] rounded-lg material-symbols-outlined">lock</div>}
                      {modalStep === 3 && <div className="bg-green-100 text-green-700 p-2 text-[20px] rounded-lg material-symbols-outlined">verified</div>}
                      <div>
                          <h3 className="font-bold text-zinc-900 text-[18px]">
                              {modalStep === 1 ? "Submit Offer Details" : modalStep === 2 ? "Secure Advance Payment" : "Offer Successful"}
                          </h3>
                          {modalStep !== 3 && <p className="text-[12px] text-zinc-500 font-medium">Secure procurement from {activeCrop.farmerName}</p>}
                      </div>
                  </div>

                  {/* Step 1: Configuration */}
                  {modalStep === 1 && (
                      <form onSubmit={handleProceedToPayment} className="space-y-4 fade-in">
                          <div className="bg-zinc-50 p-4 rounded-xl border border-zinc-100 flex justify-between items-center mb-2">
                              <div>
                                  <p className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest">{activeCrop.cropName}</p>
                                  <p className="text-[13px] text-emerald-950 font-bold">{activeCrop.quantity}</p>
                              </div>
                              <div className="text-right">
                                  <p className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest">Asking Price</p>
                                  <p className="text-[15px] text-emerald-800 font-bold">₹{Number(activeCrop.price || 0).toLocaleString()}</p>
                              </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <div>
                                  <label className="block text-[11px] font-bold text-zinc-500 uppercase tracking-wider mb-2 ml-1">Final Bid (₹)</label>
                                  <input 
                                      type="number" required
                                      className="w-full px-4 py-2.5 bg-white border-2 border-zinc-200 text-zinc-900 rounded-xl outline-none focus:border-emerald-500 font-bold transition-colors"
                                      value={bidPrice} onChange={(e) => setBidPrice(e.target.value)}
                                  />
                              </div>
                              <div>
                                  <label className="block text-[11px] font-bold text-zinc-500 uppercase tracking-wider mb-2 ml-1">Delivery Target</label>
                                  <input 
                                      type="text" required placeholder="City/Factory PIN"
                                      className="w-full px-4 py-2.5 bg-white border-2 border-zinc-200 text-zinc-900 rounded-xl outline-none focus:border-emerald-500 text-[14px] font-semibold transition-colors"
                                      value={deliveryLocation} onChange={(e) => setDeliveryLocation(e.target.value)}
                                  />
                              </div>
                          </div>

                          <div className="pt-2">
                              <p className="text-[11px] font-bold text-emerald-950 uppercase mb-2 tracking-wide">Payment Terms Calculation</p>
                              <div className="flex justify-between items-center text-[13px] bg-emerald-50 p-3 rounded-lg border border-emerald-100">
                                  <span className="text-emerald-800 font-semibold">10% Required Advance</span>
                                  <span className="text-emerald-950 font-bold">₹{Number(advancePayment).toLocaleString()}</span>
                              </div>
                              <p className="text-[11px] text-zinc-500 text-right mt-1.5 font-medium">* Remaining ₹{Number(remainingPayment).toLocaleString()} due on physical delivery</p>
                          </div>

                          <button type="submit" className="w-full bg-emerald-800 text-white font-bold py-3.5 rounded-xl hover:bg-emerald-900 transition-all mt-4 flex justify-center items-center gap-2 shadow-lg shadow-emerald-900/20">
                            Proceed to Payment <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                          </button>
                      </form>
                  )}

                  {/* Step 2: Payment Gateway Interface */}
                  {modalStep === 2 && !paymentProcessing && (
                      <form onSubmit={executeSecurePayment} className="space-y-4 fade-in">
                          <button onClick={() => setModalStep(1)} type="button" className="text-[12px] text-zinc-500 font-bold flex items-center gap-1 hover:text-emerald-700 transition-colors mb-4">
                              <span className="material-symbols-outlined text-[14px]">arrow_back</span> Edit Bid
                          </button>
                          
                          <div className="bg-zinc-900 text-white p-5 rounded-xl mb-4 relative overflow-hidden">
                              <div className="absolute -right-4 -top-4 w-32 h-32 bg-white/5 rounded-full blur-2xl"></div>
                              <p className="text-[11px] text-zinc-400 uppercase tracking-widest mb-1 relative z-10">Total Amount Due</p>
                              <h2 className="text-[32px] font-bold relative z-10">₹{Number(advancePayment).toLocaleString()}</h2>
                              <p className="text-[11px] text-emerald-400 mt-2 flex items-center gap-1 relative z-10 font-bold">
                                  <span className="material-symbols-outlined text-[13px]">lock</span> Secured Escrow Transaction
                              </p>
                          </div>

                          <div className="space-y-3">
                              <label className="block text-[12px] font-bold text-zinc-800 mb-1">Select Payment Method</label>
                              <div className="border border-emerald-500 bg-emerald-50 p-3 rounded-xl flex items-center justify-between cursor-pointer transition-all hover:bg-emerald-100">
                                  <div className="flex items-center gap-3">
                                      <span className="material-symbols-outlined text-emerald-700">credit_card</span>
                                      <span className="font-bold text-emerald-950 text-[14px]">Farm Link Corporate UPI</span>
                                  </div>
                                  <span className="w-4 h-4 rounded-full bg-emerald-500 ring-4 ring-emerald-100 flex-shrink-0"></span>
                              </div>
                              <div className="border border-zinc-200 p-3 rounded-xl flex items-center justify-between opacity-50 cursor-not-allowed">
                                  <div className="flex items-center gap-3">
                                      <span className="material-symbols-outlined text-zinc-500">account_balance</span>
                                      <span className="font-semibold text-zinc-500 text-[14px]">Bank Transfer (RTGS/NEFT)</span>
                                  </div>
                              </div>
                          </div>

                          <button type="submit" className="w-full bg-emerald-800 text-white font-bold py-3.5 rounded-xl hover:bg-emerald-900 transition-all mt-6 shadow-[0px_4px_14px_rgba(4,120,87,0.3)]">
                            Pay ₹{Number(advancePayment).toLocaleString()} & Secure Contract
                          </button>
                      </form>
                  )}

                  {/* Processing Spinner */}
                  {paymentProcessing && (
                      <div className="py-12 flex flex-col items-center justify-center fade-in">
                          <div className="w-12 h-12 border-4 border-emerald-100 border-t-emerald-600 rounded-full animate-spin mb-4"></div>
                          <h3 className="font-bold text-emerald-950">Validating Escrow Payment...</h3>
                          <p className="text-[12px] text-zinc-500 mt-1 font-medium">Please do not close this window</p>
                      </div>
                  )}

                  {/* Step 3: Success Screen */}
                  {modalStep === 3 && (
                      <div className="py-6 flex flex-col items-center justify-center fade-in relative">
                          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-5 border-4 border-white shadow-lg transition-colors">
                              <span className="material-symbols-outlined text-[40px] text-green-600 transition-colors">check_circle</span>
                          </div>
                          <h2 className="text-2xl font-bold text-zinc-900 mb-2 tracking-tight">Offer Deployed!</h2>
                          <p className="text-[14px] text-zinc-500 text-center mb-6 max-w-[280px] font-medium leading-relaxed">
                              Your 10% advance deposit for <strong>{activeCrop.cropName}</strong> was received securely. The farmer has been notified!
                          </p>
                          <div className="bg-zinc-50 p-4 rounded-xl w-full border border-zinc-100 text-left transition-colors">
                              <p className="text-[11px] text-zinc-400 font-bold uppercase tracking-widest mb-1">Transaction ID</p>
                              <p className="font-mono text-zinc-800 font-semibold">{transactionId}</p>
                          </div>
                      </div>
                  )}
              </div>
          </div>
      )}
    </div>
  );
}
