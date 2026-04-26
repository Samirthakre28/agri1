import React from 'react';
import { Link } from 'react-router-dom';

export default function Landing() {
  return (
    <div className="min-h-screen bg-white font-['Poppins',sans-serif] selection:bg-emerald-100 selection:text-emerald-900">
      {/* Navigation */}
      <header className="fixed top-0 left-0 right-0 z-[100] bg-white/70 backdrop-blur-xl border-b border-zinc-100/50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link className="flex items-center gap-2 group no-underline" to="/">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-lg shadow-emerald-600/20 group-hover:scale-110 transition-all duration-500">
              <span className="material-symbols-outlined text-2xl">agriculture</span>
            </div>
            <span className="text-xl font-black tracking-tight text-emerald-950 uppercase">Farm Link</span>
          </Link>
          <div className="hidden md:flex items-center gap-10">
            <Link className="text-[13px] font-bold text-zinc-500 hover:text-emerald-700 transition-colors" to="#features">Features</Link>
            <Link className="text-[13px] font-bold text-zinc-500 hover:text-emerald-700 transition-colors" to="#how-it-works">How it Works</Link>
            <Link className="text-[13px] font-bold text-zinc-500 hover:text-emerald-700 transition-colors" to="#advantage">Advantage</Link>
          </div>
          <div className="flex items-center gap-4">
            <Link className="hidden sm:block text-[14px] font-bold text-zinc-600 hover:text-emerald-700" to="/login">Login</Link>
            <Link className="px-8 py-3 bg-emerald-800 text-white text-[14px] font-bold rounded-2xl hover:bg-emerald-950 transition-all shadow-xl shadow-emerald-900/20 active:scale-95" to="/login?mode=signup">Explore Now</Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-32 lg:pt-48 pb-20 lg:pb-40 overflow-hidden">
        <div className="absolute top-0 right-0 -z-10 w-[60%] h-[80%] bg-gradient-to-bl from-emerald-50 to-transparent rounded-full blur-[120px] opacity-60"></div>
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <div className="fade-up">
              <div className="inline-flex items-center gap-3 px-4 py-2 rounded-2xl bg-emerald-50/50 border border-emerald-100/50 mb-8">
                <div className="flex -space-x-2">
                  {[1, 2, 3].map(i => <div key={i} className="w-6 h-6 rounded-full border-2 border-white bg-zinc-200 overflow-hidden"><img src={`https://i.pravatar.cc/50?u=${i+10}`} alt=""/></div>)}
                </div>
                <span className="text-[11px] font-black text-emerald-800 uppercase tracking-widest">Trusted by 50,000+ Farmers</span>
              </div>
              <h1 className="text-6xl lg:text-8xl font-black text-emerald-950 leading-[1] tracking-tight mb-8">
                Harvest <span className="text-emerald-600">Peace</span> of Mind
              </h1>
              <p className="text-xl text-zinc-500 leading-relaxed max-w-xl mb-12 font-medium">
                The first platform that lets you sell your crops <span className="text-emerald-900 font-bold underline decoration-emerald-200 decoration-4">before they ever leave the soil</span>. Fixed prices, verified buyers. 
              </p>
              <div className="flex flex-col sm:row gap-5">
                <Link className="px-10 py-5 bg-emerald-800 text-white font-bold rounded-[22px] hover:bg-emerald-950 transition-all shadow-2xl shadow-emerald-900/30 active:scale-95 text-[18px] flex items-center justify-center gap-3 group" to="/login?mode=signup">
                  Launch Your Storefront
                  <span className="material-symbols-outlined transition-transform group-hover:translate-x-2">arrow_forward</span>
                </Link>
                <div className="flex items-center gap-6 px-4">
                  <div className="flex flex-col">
                    <span className="text-2xl font-black text-emerald-950 leading-none">₹500Cr+</span>
                    <span className="text-[11px] text-zinc-400 font-bold uppercase tracking-tighter">Volume Processed</span>
                  </div>
                  <div className="w-px h-10 bg-zinc-100"></div>
                  <div className="flex flex-col">
                    <span className="text-2xl font-black text-emerald-950 leading-none">99.8%</span>
                    <span className="text-[11px] text-zinc-400 font-bold uppercase tracking-tighter">Contract Success</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="relative fade-up-d2">
              <div className="absolute -top-10 -left-10 w-40 h-40 bg-zinc-100 rounded-full blur-3xl opacity-50"></div>
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-[44px] blur opacity-25 group-hover:opacity-40 transition duration-1000"></div>
                <div className="relative bg-white p-2 rounded-[42px] shadow-2xl overflow-hidden hover:scale-[1.02] transition-transform duration-700">
                  <img alt="Farmer Excellence" src="/assets/hero.png" className="w-full h-auto rounded-[36px] grayscale-[0.1] group-hover:grayscale-0 transition-all duration-700" />
                </div>
                {/* Floating Badge */}
                <div className="absolute -bottom-10 -right-5 bg-white p-6 rounded-3xl shadow-2xl border border-zinc-100 animate-bounce duration-[3000ms]">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-emerald-500 text-white flex items-center justify-center"><span className="material-symbols-outlined">verified</span></div>
                    <div>
                      <p className="text-[11px] font-bold text-zinc-400 uppercase leading-none mb-1">Last Transaction</p>
                      <p className="text-[16px] font-black text-emerald-950">₹2,45,000 Secured</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Comparison Section (The "Attention Grabber") */}
      <section id="advantage" className="py-32 bg-[#fafafa]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
            <div className="lg:col-span-4 fade-up">
              <h2 className="text-4xl font-black text-emerald-950 leading-tight mb-6">Why settle for <span className="text-zinc-400">uncertainty?</span></h2>
              <p className="text-zinc-500 mb-8 font-medium">The traditional market relies on luck. Farm Link relies on data and secure contracts.</p>
              <div className="space-y-4">
                {['Direct Market Access', 'Payment Security', 'Price Protection'].map(item => (
                  <div key={item} className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-emerald-500 font-bold">check_circle</span>
                    <span className="font-bold text-zinc-700">{item}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-6 fade-up-d2">
              <div className="bg-white p-8 rounded-[40px] border border-zinc-100 shadow-sm relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-red-50 rounded-full -mr-16 -mt-16 opacity-50 group-hover:scale-125 transition-transform duration-700"></div>
                <span className="text-[11px] font-black text-zinc-400 uppercase tracking-widest mb-4 block">Traditional Way</span>
                <h3 className="text-2xl font-black text-zinc-800 mb-6 underline decoration-red-200 decoration-4">The Guessing Game</h3>
                <ul className="space-y-4">
                  {['Unstable middle-man pricing', 'No guarantee of sale at harvest', 'Payment delays and disputes', 'Market fluctuation risks'].map(i => (
                    <li key={i} className="flex gap-3 text-zinc-400 text-sm italic">
                      <span className="material-symbols-outlined text-[18px]">close</span> {i}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-emerald-950 p-8 rounded-[40px] shadow-2xl relative overflow-hidden group border-4 border-emerald-500/10">
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-800 rounded-full -mr-16 -mt-16 opacity-30 group-hover:scale-125 transition-transform duration-700"></div>
                <span className="text-[11px] font-black text-emerald-400 uppercase tracking-widest mb-4 block">Farm Link Way</span>
                <h3 className="text-2xl font-black text-white mb-6 underline decoration-emerald-500 decoration-4">Digital Certainty</h3>
                <ul className="space-y-4">
                  {['Transparent, verified pricing', 'Contract signed before planting', '10% Advance deposit instant', 'Total financial protection'].map(i => (
                    <li key={i} className="flex gap-3 text-emerald-50 text-sm font-bold">
                      <span className="material-symbols-outlined text-[18px] text-emerald-400">check_circle</span> {i}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-40 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              { icon: 'contract', title: 'Smart Agreements', desc: 'Legally binding contracts that protect your labor and your future earnings.', color: 'emerald' },
              { icon: 'payments', title: 'Secure Escrow', desc: 'Buyers pay into a secure escrow system. Your money is waiting for you at harvest.', color: 'blue' },
              { icon: 'monitoring', title: 'Price Intelligence', desc: 'Real-time market analytics across India to help you pick the most profitable crops.', color: 'amber' }
            ].map((f, i) => (
              <div key={i} className="group cursor-default">
                <div className="w-20 h-20 rounded-3xl bg-zinc-50 border border-zinc-100 flex items-center justify-center text-zinc-900 mb-8 group-hover:bg-emerald-950 group-hover:text-white transition-all duration-500 group-hover:rotate-[10deg] group-hover:scale-110 shadow-sm">
                  <span className="material-symbols-outlined text-4xl">{f.icon}</span>
                </div>
                <h3 className="text-2xl font-black text-emerald-950 mb-4 tracking-tight group-hover:text-emerald-600 transition-colors">{f.title}</h3>
                <p className="text-zinc-500 leading-relaxed font-medium">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="pb-32">
        <div className="max-w-7xl mx-auto px-6">
          <div className="relative bg-emerald-950 rounded-[60px] p-16 lg:p-32 overflow-hidden shadow-[0_40px_100px_-20px_rgba(6,78,59,0.3)]">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10"></div>
            <div className="relative z-10 text-center max-w-3xl mx-auto">
              <h2 className="text-5xl lg:text-7xl font-black text-white leading-tight mb-10 italic">Your sweat. Your crops. <br/> <span className="text-emerald-500">Your price.</span></h2>
              <Link className="inline-flex items-center gap-4 px-12 py-6 bg-white text-emerald-950 font-black text-xl rounded-3xl hover:scale-105 active:scale-95 transition-all shadow-2xl hover:bg-emerald-50" to="/login?mode=signup">
                Secure Your Next Harvest
                <span className="material-symbols-outlined text-3xl">rocket_launch</span>
              </Link>
              <p className="mt-8 text-emerald-200/50 text-[13px] font-bold uppercase tracking-[0.2em]">Zero hidden fees • Unlimited Trust</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-zinc-100 bg-white">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-8">
          <Link className="flex items-center gap-2 no-underline group" to="/">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white"><span className="material-symbols-outlined text-xl">agriculture</span></div>
            <span className="text-lg font-black tracking-tight text-emerald-950 uppercase">Farm Link</span>
          </Link>
          <div className="flex gap-8 items-center">
            {['Platform', 'Resources', 'Support', 'Terms'].map(link => (
              <Link key={link} className="text-[12px] font-black text-zinc-400 hover:text-emerald-800 uppercase tracking-tighter" to="#">{link}</Link>
            ))}
          </div>
          <div className="text-right">
            <p className="text-[11px] text-zinc-400 font-bold uppercase tracking-widest">&copy; 2026 Farm Link. India's Agricultural Future.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
