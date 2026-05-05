"use client";

import React, { createContext, useContext, useState, useCallback } from 'react';
import { X, AlertCircle, CheckCircle, Info } from 'lucide-react';

type ToastType = 'info' | 'error' | 'success';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider = ({ children }: { children: React.ReactNode }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: ToastType = 'info') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 5000);
  }, []);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed bottom-8 right-8 z-[10000] flex flex-col gap-3 pointer-events-none">
        {toasts.map((toast) => (
          <div 
            key={toast.id}
            className={`
              pointer-events-auto
              flex items-center gap-3 px-6 py-4 rounded-2xl border shadow-2xl
              animate-reveal bg-[var(--bg-panel)] backdrop-blur-xl
              min-w-[320px] max-w-[450px]
              ${toast.type === 'error' ? 'border-red-500/50 text-red-500' : 
                toast.type === 'success' ? 'border-emerald-500/50 text-emerald-500' : 
                'border-[var(--border)] text-[var(--text-base)]'}
            `}
          >
            <div className="shrink-0">
              {toast.type === 'error' && <AlertCircle size={20} />}
              {toast.type === 'success' && <CheckCircle size={20} />}
              {toast.type === 'info' && <Info size={20} />}
            </div>
            <p className="flex-1 font-mono text-xs uppercase font-bold tracking-tight leading-tight">
              {toast.message}
            </p>
            <button 
              onClick={() => removeToast(toast.id)}
              className="p-1 hover:bg-[var(--bg-ghost)] rounded-lg transition-colors opacity-50 hover:opacity-100"
            >
              <X size={16} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within ToastProvider');
  return context;
};
