import React, { createContext, useContext, useState, useCallback } from 'react';

const ToastContext = createContext();

export const useToast = () => useContext(ToastContext);

let toastId = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'success', duration = 4000) => {
    const id = ++toastId;
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, duration);
  }, []);

  const success = useCallback((msg) => addToast(msg, 'success'), [addToast]);
  const error = useCallback((msg) => addToast(msg, 'error'), [addToast]);
  const info = useCallback((msg) => addToast(msg, 'info'), [addToast]);
  const warning = useCallback((msg) => addToast(msg, 'warning'), [addToast]);

  const iconMap = {
    success: 'check_circle',
    error: 'error',
    info: 'info',
    warning: 'warning'
  };

  const colorMap = {
    success: 'bg-emerald-900 text-emerald-50 border-emerald-700',
    error: 'bg-red-900 text-red-50 border-red-700',
    info: 'bg-blue-900 text-blue-50 border-blue-700',
    warning: 'bg-amber-900 text-amber-50 border-amber-700'
  };

  const iconColorMap = {
    success: 'text-emerald-400',
    error: 'text-red-400',
    info: 'text-blue-400',
    warning: 'text-amber-400'
  };

  return (
    <ToastContext.Provider value={{ success, error, info, warning }}>
      {children}
      {/* Toast Container */}
      <div className="fixed bottom-6 right-6 z-[200] flex flex-col gap-3 pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-center gap-3 px-5 py-4 rounded-2xl border shadow-2xl backdrop-blur-xl min-w-[320px] max-w-[420px] animate-slide-in ${colorMap[toast.type]}`}
          >
            <span className={`material-symbols-outlined text-[22px] flex-shrink-0 ${iconColorMap[toast.type]}`}>
              {iconMap[toast.type]}
            </span>
            <p className="text-[13px] font-semibold leading-snug flex-1">{toast.message}</p>
            <button
              onClick={() => setToasts(prev => prev.filter(t => t.id !== toast.id))}
              className="text-white/40 hover:text-white/80 transition-colors flex-shrink-0"
            >
              <span className="material-symbols-outlined text-[16px]">close</span>
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
