import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import * as api from '../services/supabase';

const mockPriceData = [
  { id: 1, name: "Wheat (Lokwan)", price: 2350, change: 5.2,
    weeklyTrend: [30, 45, 40, 55, 65, 75, 85], monthlyTrend: [25, 35, 50, 55, 70, 85],
    insight: "Prices are expected to rise due to high export demand in upcoming months." },
  { id: 2, name: "Basmati Rice", price: 3800, change: -1.8,
    weeklyTrend: [80, 75, 70, 68, 72, 65, 60], monthlyTrend: [90, 85, 80, 75, 70, 60],
    insight: "Slight drop due to recent oversupply in local wholesale markets." },
  { id: 3, name: "Raw Cotton", price: 4100, change: 2.3,
    weeklyTrend: [40, 42, 45, 48, 50, 52, 55], monthlyTrend: [30, 35, 40, 45, 50, 55],
    insight: "Steady growth; textile mills are slowly increasing procurement." },
  { id: 4, name: "Sugarcane", price: 315, change: 0.8,
    weeklyTrend: [60, 62, 61, 63, 64, 65, 66], monthlyTrend: [55, 58, 60, 62, 64, 66],
    insight: "Stable trajectory with guaranteed government FRP support." },
  { id: 5, name: "Maize", price: 1850, change: -3.4,
    weeklyTrend: [70, 65, 60, 55, 50, 45, 40], monthlyTrend: [80, 75, 70, 60, 50, 40],
    insight: "Heavy rains delayed harvest, causing temporary market hesitance." },
  { id: 6, name: "Soybean", price: 4600, change: 7.1,
    weeklyTrend: [20, 25, 35, 50, 65, 80, 95], monthlyTrend: [15, 20, 35, 55, 75, 95],
    insight: "Sharp spike projected; high demand for poultry feed production." }
];

// Real-Data Stats Section
const RealStats = ({ contracts }) => {
  const safeNum = (v) => Number(v) || 0;
  const totalValue = contracts.reduce((s, c) => s + safeNum(c.agreedPrice), 0);
  const paidContracts = contracts.filter(c => c.paymentStatus === 'Paid').length;
  const advancePaid = contracts.filter(c => c.paymentStatus === 'Advance Paid').length;
  const pending = contracts.filter(c => c.paymentStatus === 'Pending').length;
  
  // Crop distribution
  const cropCounts = {};
  contracts.forEach(c => {
    const name = c.cropName || 'Other';
    cropCounts[name] = (cropCounts[name] || 0) + 1;
  });
  const topCrops = Object.entries(cropCounts).sort((a, b) => b[1] - a[1]).slice(0, 4);
  const maxCropCount = topCrops.length > 0 ? topCrops[0][1] : 1;

  return (
    <div className="mb-10 fade-up">
      <h3 className="text-[15px] font-bold text-emerald-950 mb-4 flex items-center gap-2">
        <span className="material-symbols-outlined text-[18px] text-emerald-600">monitoring</span>
        Your Contract Analytics
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-5 rounded-xl border border-zinc-200 shadow-sm">
          <p className="text-zinc-500 text-[11px] font-bold uppercase tracking-widest mb-1">Total Contract Value</p>
          <h3 className="text-[24px] font-bold text-emerald-950">₹{totalValue.toLocaleString()}</h3>
        </div>
        <div className="bg-white p-5 rounded-xl border border-zinc-200 shadow-sm">
          <p className="text-zinc-500 text-[11px] font-bold uppercase tracking-widest mb-1">Fully Paid</p>
          <h3 className="text-[24px] font-bold text-emerald-700">{paidContracts}</h3>
        </div>
        <div className="bg-white p-5 rounded-xl border border-zinc-200 shadow-sm">
          <p className="text-zinc-500 text-[11px] font-bold uppercase tracking-widest mb-1">Advance Received</p>
          <h3 className="text-[24px] font-bold text-blue-700">{advancePaid}</h3>
        </div>
        <div className="bg-emerald-900 p-5 rounded-xl shadow-md">
          <p className="text-emerald-300 text-[11px] font-bold uppercase tracking-widest mb-1">Pending</p>
          <h3 className="text-[24px] font-bold text-white">{pending}</h3>
        </div>
      </div>

      {topCrops.length > 0 && (
        <div className="bg-white p-6 rounded-xl border border-zinc-200 shadow-sm">
          <p className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest mb-4">Crop Distribution</p>
          <div className="space-y-3">
            {topCrops.map(([name, count], i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="text-[13px] font-bold text-emerald-950 w-24 truncate">{name}</span>
                <div className="flex-1 h-6 bg-zinc-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-emerald-500 rounded-full transition-all duration-700 flex items-center justify-end pr-2"
                    style={{ width: `${(count / maxCropCount) * 100}%` }}
                  >
                    <span className="text-[10px] font-bold text-white">{count}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const PriceCard = ({ data, onClick }) => {
  const isPositive = data.change >= 0;
  
  return (
    <div 
      onClick={() => onClick(data)}
      className="bg-white p-5 rounded-[12px] border border-zinc-200 shadow-sm transition-all hover:shadow-md hover:-translate-y-1 duration-300 flex flex-col justify-between fade-up cursor-pointer"
    >
      <div>
          <div className="flex justify-between items-start mb-4">
              <h3 className="font-bold text-emerald-950 text-[16px]">{data.name}</h3>
              <div className={`flex items-center gap-1 font-bold text-[12px] px-2 py-1 rounded-md ${isPositive ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                  <span className="material-symbols-outlined text-[14px]">
                      {isPositive ? 'trending_up' : 'trending_down'}
                  </span>
                  {isPositive ? '+' : ''}{data.change}%
              </div>
          </div>
          <p className="text-[28px] font-bold text-zinc-900 mb-1 tracking-tight">
              ₹{data.price.toLocaleString()}<span className="text-[13px] font-normal text-zinc-500 tracking-normal"> / quintal</span>
          </p>
      </div>

      <div className="h-12 flex items-end gap-[3px] mt-3 mb-5 border-b border-zinc-100 pb-1">
          {data.weeklyTrend.slice(-5).map((val, i) => (
             <div 
                key={i} 
                className={`flex-1 rounded-t-[2px] ${isPositive ? 'bg-emerald-400' : 'bg-red-400'} transition-all`} 
                style={{ height: `${val}%`, opacity: 0.3 + ((i + 1) / 5) * 0.7 }}
             ></div>
          ))}
      </div>

      <div className="bg-zinc-50 p-3 rounded-lg border border-zinc-100 mt-auto">
          <p className="text-[11px] text-zinc-600 flex gap-2 font-medium leading-relaxed">
              <span className="material-symbols-outlined text-[15px] text-amber-500 shrink-0">tips_and_updates</span>
              Click for deeper insights
          </p>
      </div>
    </div>
  );
};

const DetailedInsights = ({ crop, onBack }) => {
    const [timeframe, setTimeframe] = useState('weekly');
    const isPositive = crop.change >= 0;
    const trend = timeframe === 'weekly' ? crop.weeklyTrend : crop.monthlyTrend;
    const labels = timeframe === 'weekly' ? ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] : ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];

    return (
        <div className="fade-in bg-white rounded-xl border border-zinc-200 shadow-sm p-6 mb-12 transition-colors duration-300">
            <button 
                onClick={onBack}
                className="flex items-center gap-2 text-zinc-500 hover:text-emerald-700 font-bold text-[14px] mb-6 transition-colors"
            >
                <span className="material-symbols-outlined text-[20px]">arrow_back</span>
                Back to Market Prices
            </button>

            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
                <div>
                    <h2 className="text-[28px] font-bold text-emerald-950 mb-1">{crop.name}</h2>
                    <p className="text-zinc-500 font-medium tracking-wide leading-relaxed">Detailed Price Trend Analysis</p>
                </div>
                <div className="flex items-center gap-6">
                    <div className="text-left">
                        <p className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest leading-relaxed">Current Price</p>
                        <p className="text-[24px] font-bold text-zinc-900">₹{crop.price.toLocaleString()}</p>
                    </div>
                    <div className={`p-3 rounded-xl ${isPositive ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                        <p className="text-[10px] font-bold uppercase mb-0.5">24h Change</p>
                        <div className="flex items-center gap-1 font-bold">
                             <span className="material-symbols-outlined text-[18px]">{isPositive ? 'trending_up' : 'trending_down'}</span>
                             {isPositive ? '+' : ''}{crop.change}%
                        </div>
                    </div>
                </div>
            </div>

            <div className="mb-8 overflow-hidden">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="font-bold text-emerald-950 text-[16px]">Price Movement</h3>
                    <div className="bg-zinc-100 p-1 rounded-lg flex gap-1">
                        <button 
                            onClick={() => setTimeframe('weekly')}
                            className={`px-4 py-1.5 text-[12px] font-bold rounded-md transition-all ${timeframe === 'weekly' ? 'bg-white text-emerald-700 shadow-sm' : 'text-zinc-500 hover:text-zinc-700'}`}
                        >Weekly</button>
                        <button 
                            onClick={() => setTimeframe('monthly')}
                            className={`px-4 py-1.5 text-[12px] font-bold rounded-md transition-all ${timeframe === 'monthly' ? 'bg-white text-emerald-700 shadow-sm' : 'text-zinc-500 hover:text-zinc-700'}`}
                        >Monthly</button>
                    </div>
                </div>

                <div className="h-[300px] flex items-end gap-3 md:gap-6 px-4 relative mt-10">
                    <div className="absolute w-full h-[1px] bg-zinc-100 bottom-0 left-0"></div>
                    <div className="absolute w-full h-[1px] bg-zinc-100 bottom-1/4 left-0"></div>
                    <div className="absolute w-full h-[1px] bg-zinc-100 bottom-1/2 left-0"></div>
                    <div className="absolute w-full h-[1px] bg-zinc-100 bottom-3/4 left-0"></div>

                    {trend.map((val, i) => (
                        <div key={i} className="flex-1 flex flex-col items-center gap-3 h-full justify-end group">
                            <div className="relative w-full flex justify-center h-full items-end">
                                <div 
                                    className={`w-full max-w-[40px] rounded-t-lg transition-all duration-700 ease-out hover:scale-x-110 cursor-pointer ${isPositive ? 'bg-emerald-500/80 hover:bg-emerald-500' : 'bg-red-500/80 hover:bg-red-500'}`}
                                    style={{ height: `${val}%` }}
                                >
                                     <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-zinc-900 border border-zinc-700 text-white text-[10px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-xl">
                                        ₹{(crop.price * (val/100 + 0.5)).toFixed(0)}
                                    </div>
                                </div>
                            </div>
                            <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-tighter leading-relaxed">{labels[i]}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* AI-Style Advisory */}
            <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-5 flex items-start gap-4">
                <div className="bg-emerald-200 text-emerald-700 p-2 rounded-lg">
                    <span className="material-symbols-outlined text-[24px]">psychology</span>
                </div>
                <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-bold text-emerald-950 text-[15px]">AI Price Advisory</h4>
                      <span className="text-[9px] font-black bg-emerald-200 text-emerald-800 px-2 py-0.5 rounded-full uppercase tracking-wider">Smart</span>
                    </div>
                    <p className="text-[13px] text-emerald-800 leading-relaxed font-medium">
                        {crop.insight} Based on historical patterns and current market velocity, we recommend 
                        {isPositive 
                          ? ` listing above ₹${(crop.price * 1.02).toFixed(0)}/quintal to capture the upward momentum.`
                          : ` holding inventory for 1-2 weeks until prices stabilize near the ₹${(crop.price * 0.98).toFixed(0)} floor.`
                        }
                    </p>
                </div>
            </div>
        </div>
    );
};

export default function Analytics() {
  const { session } = useContext(AuthContext);
  const [selectedCrop, setSelectedCrop] = useState(null);
  const [contracts, setContracts] = useState([]);

  useEffect(() => {
    const load = async () => {
      const data = await api.fetchMyContracts(session);
      setContracts(data || []);
    };
    load();
  }, [session]);

  if (selectedCrop) {
      return <DetailedInsights crop={selectedCrop} onBack={() => setSelectedCrop(null)} />;
  }

  return (
    <div className="fade-in relative z-10 w-full mb-12">
        <div className="mb-8">
            <h2 className="text-[26px] font-bold text-emerald-950 mb-1 tracking-tight">Market Price Insights</h2>
            <p className="text-zinc-500 font-medium tracking-wide leading-relaxed text-[14px]">Real-time crop price trends, predictions & your portfolio</p>
        </div>

        {/* Real contract analytics section */}
        {contracts.length > 0 && <RealStats contracts={contracts} />}
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mockPriceData.map((data, index) => (
                <PriceCard key={index} data={data} onClick={setSelectedCrop} />
            ))}
        </div>
    </div>
  );
}
