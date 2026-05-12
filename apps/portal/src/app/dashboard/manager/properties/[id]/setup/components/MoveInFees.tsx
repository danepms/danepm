"use client";

import React from 'react';
import { Plus, Trash2, ChevronRight, Calculator, Info, ArrowLeft } from 'lucide-react';

interface MoveInFee {
  id: number;
  name: string;
  amount: string;
  mode?: 'fixed' | 'rent_multiple';
  multiple?: number;
}

interface MoveInFeesProps {
  units: any[];
  rents: Record<string, number[]>;
  oneTime: MoveInFee[];
  setOneTime: (items: MoveInFee[]) => void;
  onNext: () => void;
  onBack: () => void;
}

export const MoveInFees = ({ units, rents, oneTime, setOneTime, onNext, onBack }: MoveInFeesProps) => {
  const updateFee = (index: number, updates: Partial<MoveInFee>) => {
    const newList = [...oneTime];
    newList[index] = { ...newList[index], ...updates };
    setOneTime(newList);
  };

  // Derive source of truth: 
  // 1. If units exist (fresh upload), use them to get unique types/prices
  // 2. Fallback to rents object
  let unitTypes: [string, number[]][] = [];
  
  if (units && units.length > 0) {
    const derived: Record<string, Set<number>> = {};
    units.forEach(u => {
      const typeName = u.type || 'Unknown';
      if (!derived[typeName]) derived[typeName] = new Set();
      derived[typeName].add(parseInt(u.rent) || 0);
    });
    unitTypes = Object.entries(derived).map(([type, set]) => [type, Array.from(set)]);
  } else {
    unitTypes = Object.entries(rents);
  }

  return (
    <div className="flex flex-col h-full space-y-4">
      {/* Tight Header with Back Button */}
      <div className="flex items-center justify-between border-b border-[var(--border)] border-opacity-10 pb-3">
        <div className="flex items-center gap-3">
          <button 
            type="button" 
            onClick={onBack} 
            className="w-8 h-8 flex items-center justify-center border border-[var(--border)] border-opacity-20 rounded-base hover:bg-[var(--bg-input)] transition-all"
          >
            <ArrowLeft size={14} />
          </button>
          <h2 className="text-lg font-black uppercase tracking-tighter text-[var(--text-base)]">
            Move-In Fees.
          </h2>
        </div>
        <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/5 border border-emerald-500/10 rounded-base">
           <Info size={10} className="text-emerald-500" />
           <span className="font-mono text-[7px] uppercase font-black text-emerald-600/80 tracking-widest">Step-04 / Financials</span>
        </div>
      </div>

      <div className="space-y-3 flex-1 overflow-y-auto pr-1 custom-scrollbar">
        {oneTime.map((item, index) => {
          const isRentMultiple = !item.mode || item.mode === 'rent_multiple';
          const multiplier = item.multiple || 1;

          return (
            <div key={item.id} className="border border-[var(--border)] border-opacity-10 bg-[var(--bg-panel)] p-4 rounded-base space-y-4 relative animate-reveal">
              <button 
                type="button"
                onClick={() => setOneTime(oneTime.filter(o=>o.id !== item.id))} 
                className="absolute top-4 right-4 p-1 text-[var(--text-muted)] hover:text-red-500 transition-colors bg-[var(--bg-base)] border border-[var(--border)] border-opacity-5 rounded-sm"
              >
                <Trash2 size={12} />
              </button>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-mono text-[8px] text-[var(--text-muted)] uppercase font-black">Fee Description</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Security Deposit" 
                    value={item.name} 
                    onChange={(e) => updateFee(index, { name: e.target.value })} 
                    className="w-full bg-[var(--bg-input)] border border-[var(--border)] border-opacity-10 text-[var(--text-base)] p-2 rounded-base font-mono text-[10px] outline-none font-black uppercase focus:border-[var(--accent-bg)] transition-all" 
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-mono text-[8px] text-[var(--text-muted)] uppercase font-black">Calculation Method</label>
                  <div className="flex gap-1 p-1 bg-[var(--bg-input)] rounded-base border border-[var(--border)] border-opacity-5">
                    <button 
                      type="button"
                      onClick={() => updateFee(index, { mode: 'rent_multiple', multiple: multiplier })} 
                      className={`flex-1 py-1.5 rounded-sm font-mono text-[8px] uppercase font-black transition-all ${isRentMultiple ? 'bg-[var(--accent-bg)] text-[var(--accent-text)]' : 'text-[var(--text-muted)] hover:text-[var(--text-base)]'}`}
                    >
                      Rent Multiple
                    </button>
                    <button 
                      type="button"
                      onClick={() => updateFee(index, { mode: 'fixed' })} 
                      className={`flex-1 py-1.5 rounded-sm font-mono text-[8px] uppercase font-black transition-all ${item.mode === 'fixed' ? 'bg-[var(--accent-bg)] text-[var(--accent-text)]' : 'text-[var(--text-muted)] hover:text-[var(--text-base)]'}`}
                    >
                      Fixed Amount
                    </button>
                  </div>
                </div>
              </div>

              {isRentMultiple ? (
                <div className="space-y-3">
                  <div className="bg-[var(--bg-base)] p-3 rounded-base border border-[var(--border)] border-opacity-5 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <label className="font-mono text-[8px] text-[var(--text-muted)] uppercase font-black">Multiplier:</label>
                      <input 
                        type="number" step="0.5" min="0" 
                        value={multiplier} 
                        onChange={(e) => updateFee(index, { multiple: parseFloat(e.target.value) || 0 })} 
                        className="w-16 bg-[var(--bg-input)] border border-[var(--border)] border-opacity-10 text-[var(--text-base)] p-1.5 rounded-base font-mono text-[11px] outline-none font-black text-center"
                      />
                      <span className="font-mono text-[8px] uppercase font-black text-[var(--text-muted)] opacity-50">× Rent</span>
                    </div>
                    <div className="flex items-center gap-2 text-emerald-500">
                       <Calculator size={12} />
                       <p className="font-mono text-[8px] font-black uppercase">Auto-Breaking Down Below</p>
                    </div>
                  </div>

                  {unitTypes.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {unitTypes.flatMap(([type, prices]) => {
                        const priceArray = Array.isArray(prices) ? prices : [parseInt((prices as any)?.toString()) || 0];
                        return priceArray.map((price, pIdx) => (
                          <div key={`${type}-${price}-${pIdx}`} className="p-2 bg-[var(--bg-input)] border border-[var(--border)] border-opacity-5 rounded-base flex justify-between items-center group hover:border-[var(--accent-bg)]/20 transition-all">
                            <div className="overflow-hidden">
                              <p className="font-mono text-[6px] uppercase font-black text-[var(--text-muted)] truncate">{type}</p>
                              <p className="font-mono text-[8px] font-black">@{price.toLocaleString()}</p>
                            </div>
                            <div className="text-right border-l border-[var(--border)] border-opacity-5 pl-2">
                              <p className="font-mono text-[6px] uppercase font-black text-[var(--accent-bg)]">Depo</p>
                              <p className="font-mono text-[9px] font-black text-[var(--text-base)]">{(price * multiplier).toLocaleString()}</p>
                            </div>
                          </div>
                        ));
                      })}
                    </div>
                  ) : (
                    <div className="p-3 bg-yellow-500/5 border border-dashed border-yellow-500/20 rounded-base text-center">
                       <p className="font-mono text-[8px] uppercase font-black text-yellow-600/60">No unit types detected from Step 1. Please ensure you uploaded the master file.</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-1">
                  <label className="font-mono text-[8px] text-[var(--text-muted)] uppercase block font-black">Exact Amount (KES)</label>
                  <input 
                    type="number" 
                    placeholder="0" 
                    value={item.amount} 
                    onChange={(e) => updateFee(index, { amount: e.target.value })} 
                    className="w-full bg-[var(--bg-input)] border border-[var(--border)] border-opacity-10 text-[var(--text-base)] p-2 rounded-base font-mono text-[10px] outline-none font-black focus:border-[var(--accent-bg)]" 
                  />
                </div>
              )}
            </div>
          );
        })}
        
        <button 
          type="button" 
          onClick={() => setOneTime([...oneTime, { id: Date.now(), name: '', amount: '', mode: 'rent_multiple', multiple: 1 }])} 
          className="w-full border border-dashed border-[var(--border)] border-opacity-20 rounded-base text-[var(--text-muted)] hover:text-[var(--text-base)] font-mono text-[8px] uppercase py-3 flex justify-center items-center gap-2 font-black transition-all"
        >
          <Plus size={12} /> Add More
        </button>
      </div>

      <div className="pt-2 border-t border-[var(--border)] border-opacity-10">
        <button 
          onClick={onNext} 
          className="w-full bg-[var(--accent-bg)] text-[var(--accent-text)] py-4 rounded-base font-black font-mono text-[10px] uppercase flex items-center justify-center gap-2 transition-all hover:opacity-90"
        >
          Launch Property Portfolio <ChevronRight size={14} />
        </button>
      </div>
    </div>
  );
};
