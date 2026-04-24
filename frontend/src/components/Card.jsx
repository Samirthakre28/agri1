import React from 'react';

export default function Card({ children, className = '' }) {
  return (
    <div className={`bg-white p-5 rounded-xl border border-zinc-200 shadow-sm transition-all ${className}`}>
      {children}
    </div>
  );
}
