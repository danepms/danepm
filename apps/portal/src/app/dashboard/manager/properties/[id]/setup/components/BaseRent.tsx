"use client";

import React from 'react';
import { Coins, Plus, Check, Zap, ArrowRight } from 'lucide-react';

interface BaseRentProps {
  rents: Record<string, any>;
  setRents: (rents: Record<string, any>) => void;
  onNext: () => void;
  onBack: () => void;
}

export const BaseRent = ({ rents, setRents, onNext, onBack }: BaseRentProps) => {
  return (
    <form onSubmit={(e) => { e.preventDefault(); onNext(); }} className="flex flex-col h-full">
      <div className="mb-10">
        <button type="button" onClick={onBack} className="font-mono text-[10px] text-[var(--text-muted)] hover:text-[var(--text-base)] uppercase mb-6 flex items-center gap-2 transition-colors">
          ← Go Back
        </button>
        <div className="w-12 h-12 bg-[var(--accent-bg)] text-[var(--accent-text)] flex items-center justify-center mb-6 shadow-[4px_4px_0px_0px_var(--shadow-color)] transition-all">
          <Coins size={24} />
        </div>
        <h2 className="text-4xl md:text-5xl font-bold uppercase tracking-tighter mb-4 leading-none text-[var(--text-base)]">
          Base Rent.
        </h2>
        <p className="text-sm font-mono text-[var(--text-muted)] uppercase leading-relaxed">
          Set the monthly yield for your individual unit categories.
        </p>
      </div>

      <div className="space-y-3 flex-1">
        {Object.keys(rents).map(typeId => {
          const isVariable = typeof rents[typeId] === 'object';
          return (
            <div key={typeId} className="bg-[var(--bg-panel)] border border-[var(--border)] p-5 shadow-[2px_2px_0px_0px_var(--shadow-color)] hover:border-[var(--accent-bg)] transition-all group">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <span className="font-black text-sm uppercase tracking-tight text-[var(--text-base)] group-hover:text-[var(--accent-bg)] transition-colors">{typeId}</span>
                  <p className="text-[8px] font-mono uppercase text-[var(--text-muted)] font-bold">Base Configuration</p>
                </div>
                <button 
                  type="button"
                  onClick={() => {
                    if (isVariable) {
                      setRents({...rents, [typeId]: ''});
                    } else {
                      setRents({...rents, [typeId]: { min: '', max: '' }});
                    }
                  }}
                  className={`flex items-center gap-2 px-3 py-1.5 border font-mono text-[9px] uppercase font-bold transition-all ${isVariable ? 'bg-[var(--accent-bg)] border-[var(--accent-bg)] text-[var(--accent-text)]' : 'bg-[var(--bg-ghost)] border-[var(--border)] text-[var(--text-muted)]'}`}
                >
                  {isVariable ? <Check size={12} /> : <Plus size={12} />}
                  Variable Pricing
                </button>
              </div>

              <div className="flex items-center gap-4 reveal-step">
                {!isVariable ? (
                  <div className="relative flex-1">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 font-mono text-[10px] text-[var(--text-muted)] font-bold">KES</span>
                    <input 
                      type="number" required placeholder="0" 
                      value={rents[typeId]}
                      onChange={(e) => setRents({...rents, [typeId]: e.target.value})}
                      className="w-full bg-[var(--bg-base)] border border-[var(--border)] text-[var(--text-base)] py-3 pl-12 pr-4 font-mono text-sm focus:border-[var(--accent-bg)] outline-none transition-all rounded-none font-bold" 
                    />
                  </div>
                ) : (
                  <div className="flex items-center gap-3 w-full">
                    <div className="relative flex-1">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 font-mono text-[8px] text-[var(--text-muted)] font-bold">MIN</span>
                      <input 
                        type="number" required placeholder="Min" 
                        value={rents[typeId].min}
                        onChange={(e) => setRents({...rents, [typeId]: { ...rents[typeId], min: e.target.value }})}
                        className="w-full bg-[var(--bg-base)] border border-[var(--border)] text-[var(--text-base)] py-3 pl-12 pr-4 font-mono text-xs focus:border-[var(--accent-bg)] outline-none transition-all rounded-none font-bold" 
                      />
                    </div>
                    <span className="font-mono text-[var(--text-muted)]">-</span>
                    <div className="relative flex-1">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 font-mono text-[8px] text-[var(--text-muted)] font-bold">MAX</span>
                      <input 
                        type="number" required placeholder="Max" 
                        value={rents[typeId].max}
                        onChange={(e) => setRents({...rents, [typeId]: { ...rents[typeId], max: e.target.value }})}
                        className="w-full bg-[var(--bg-base)] border border-[var(--border)] text-[var(--text-base)] py-3 pl-12 pr-4 font-mono text-xs focus:border-[var(--accent-bg)] outline-none transition-all rounded-none font-bold" 
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        <div className="mt-8 p-4 border border-dashed border-[var(--border)] border-opacity-20 rounded-lg flex items-start gap-3 bg-[var(--bg-ghost)] bg-opacity-30">
          <Zap size={14} className="text-[var(--text-muted)] mt-0.5" />
          <p className="text-[9px] font-mono uppercase font-bold text-[var(--text-muted)] leading-relaxed">
            <span className="text-[var(--text-base)]">Note:</span> Variable Pricing allows you to set a price spectrum for the same unit type. You will map specific rates to individual units during the final occupancy stage.
          </p>
        </div>
      </div>

      <div className="pt-12 shrink-0">
        <button type="submit" className="w-full bg-[var(--accent-bg)] text-[var(--accent-text)] font-bold font-mono text-sm uppercase py-6 border border-[var(--accent-bg)] shadow-[4px_4px_0px_0px_var(--shadow-color)] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_var(--shadow-color)] active:translate-y-1 active:shadow-none transition-all duration-150 flex justify-center items-center gap-3">
          Continue to Utilities <ArrowRight size={16} />
        </button>
      </div>
    </form>
  );
};
