import React from 'react';

export default function Button({ children, onClick, variant = 'primary', className = '', type = 'button', ...props }) {
  const baseStyle = "px-4 py-2 rounded-lg font-medium shadow-sm transition-all flex items-center justify-center gap-2";
  const variants = {
    primary: "bg-emerald-800 text-white hover:bg-emerald-900 active:scale-[0.98]",
    secondary: "border border-zinc-300 text-zinc-700 hover:bg-zinc-50 bg-white",
    outline: "text-emerald-700 hover:bg-emerald-50 bg-transparent font-bold",
    danger: "bg-red-50 text-red-600 hover:bg-red-100 font-bold"
  };
  
  return (
    <button 
      type={type}
      onClick={onClick} 
      className={`${baseStyle} ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
