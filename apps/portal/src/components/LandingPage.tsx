"use client";

import React from 'react';
import { ArrowRight } from 'lucide-react';

export const LandingPage = ({ onStart }: { onStart: () => void }) => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center relative z-10">
      <div className="max-w-4xl w-full space-y-12 reveal-step">
        <div className="inline-flex items-center gap-3 px-5 py-2.5 bg-[var(--bg-panel)] glass-card border border-[var(--border)] text-[var(--text-base)] font-mono font-bold text-[10px] uppercase tracking-[0.25em] rounded-full shadow-lg">
          <span className="w-2 h-2 bg-[var(--accent-bg)] rounded-full animate-pulse"></span>
          Ready to work
        </div>
        
        <h1 className="text-6xl md:text-[8rem] font-black uppercase tracking-tighter leading-[0.85] text-[var(--text-base)]">
          Running rentals<br />
          <span className="opacity-40">made simple.</span>
        </h1>

        <p className="text-lg md:text-2xl text-[var(--text-muted)] font-mono uppercase font-bold tracking-tight max-w-2xl mx-auto leading-relaxed">
          Manage your buildings, track your money, and keep your tenants happy—all in one place. No jargon, just results.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
          <button 
            onClick={onStart}
            className="bg-[var(--accent-bg)] text-[var(--accent-text)] px-12 py-5 rounded-xl font-black text-lg uppercase shadow-[8px_8px_0px_0px_var(--shadow-color)] hover:opacity-90 active:translate-y-1 transition-all flex items-center gap-4 group"
          >
            Start Using Dane <ArrowRight size={24} className="group-hover:translate-x-2 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  );
};
