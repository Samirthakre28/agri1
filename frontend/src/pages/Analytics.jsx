import React from 'react';

export default function Analytics() {
  return (
    <div className="fade-up">
      <h2 className="text-2xl font-bold text-emerald-950 mb-6">Analytics Dashboard</h2>
      <div className="bg-white rounded-xl border border-zinc-200 shadow-sm p-6 mb-8">
          <div className="flex justify-between items-center mb-5">
              <h3 className="text-[16px] font-bold text-emerald-950 flex items-center gap-2">
                  <span className="material-symbols-outlined text-emerald-600 text-[20px]">insert_chart</span> Price Trends Overview
              </h3>
          </div>
          <div className="h-[280px] flex items-end gap-4 px-2 relative">
              <div className="absolute w-full h-px bg-zinc-100 bottom-0 left-0"></div>
              <div className="absolute w-full h-px bg-zinc-100 bottom-1/4 left-0"></div>
              <div className="absolute w-full h-px bg-zinc-100 bottom-1/2 left-0"></div>
              <div className="absolute w-full h-px bg-zinc-100 bottom-3/4 left-0"></div>
              
              <div className="flex-1 bg-emerald-200 rounded-t-md relative z-10 hover:bg-emerald-300 transition-colors" style={{height:'30%'}}></div>
              <div className="flex-1 bg-emerald-300 rounded-t-md relative z-10 hover:bg-emerald-400 transition-colors" style={{height:'45%'}}></div>
              <div className="flex-1 bg-emerald-400 rounded-t-md relative z-10 hover:bg-emerald-500 transition-colors" style={{height:'60%'}}></div>
              <div className="flex-1 bg-emerald-500 rounded-t-md relative z-10 hover:bg-emerald-600 transition-colors" style={{height:'80%'}}></div>
              <div className="flex-1 bg-emerald-600 rounded-t-md relative z-10 hover:bg-emerald-700 transition-colors" style={{height:'50%'}}></div>
              <div className="flex-1 bg-zinc-200 rounded-t-md relative z-10 transition-colors" style={{height:'70%'}}></div>
          </div>
          <div className="flex justify-between mt-3 px-1 text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">
              <span>Jan</span><span>Feb</span><span>Mar</span><span>Apr</span><span>May</span><span>Jun</span>
          </div>
      </div>
    </div>
  );
}
