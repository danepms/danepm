"use client";

import React from 'react';
import { Zap, Receipt, Droplets, Trash2, Plus, ArrowRight, Info, ArrowLeft } from 'lucide-react';

interface Utilities {
  electricity: string;
  electricityPrice: string;
  water: string;
  waterPrice: string;
}

interface RecurringItem {
  id: number;
  name: string;
  amount: string;
  frequency: string;
}

interface BillingHubProps {
  utilities: Utilities;
  setUtilities: (utils: Utilities) => void;
  recurring: RecurringItem[];
  setRecurring: (items: RecurringItem[]) => void;
  onNext: () => void;
  onBack: () => void;
}

export const BillingHub = ({ utilities, setUtilities, recurring, setRecurring, onNext, onBack }: BillingHubProps) => {
  return (
     <form onSubmit={(e) => { e.preventDefault(); onNext(); }} className="flex flex-col h-full space-y-6">
      {/* Tight Header with Back Button */}
      <div className="flex justify-between items-center border-b border-[var(--border)] border-opacity-10 pb-4">
        <div className="flex items-center gap-3">
          <button 
            type="button" 
            onClick={onBack} 
            className="w-8 h-8 flex items-center justify-center border border-[var(--border)] border-opacity-20 rounded-base hover:bg-[var(--bg-input)] transition-all"
          >
            <ArrowLeft size={14} />
          </button>
          <div>
            <h2 className="text-xl font-black uppercase tracking-tighter text-[var(--text-base)] flex items-center gap-2">
              Billing Hub. <span className="font-mono text-[8px] opacity-30 font-black tracking-widest mt-1">/ SETUP-03</span>
            </h2>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-emerald-500/5 border border-emerald-500/10 rounded-base">
           <Info size={10} className="text-emerald-500" />
           <span className="font-mono text-[7px] uppercase font-black text-emerald-600/80 tracking-widest">Global Settings</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Utilities: 5 Columns */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-[var(--bg-panel)] border border-[var(--border)] border-opacity-10 p-5 rounded-base">
            <h3 className="font-black uppercase text-[10px] tracking-widest text-[var(--text-muted)] mb-4 flex items-center gap-2">
              <Zap size={12} className="text-yellow-500" /> Electricity Billing
            </h3>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'token', label: 'Tokens' },
                { id: 'included', label: 'Included' },
                { id: 'extra', label: 'Metered' }
              ].map(opt => (
                <button 
                  key={opt.id} type="button"
                  onClick={() => setUtilities({...utilities, electricity: opt.id})}
                  className={`py-3 border-2 text-center transition-all rounded-base ${
                    utilities.electricity === opt.id 
                    ? 'bg-[var(--accent-bg)] border-[var(--accent-bg)] text-[var(--accent-text)]' 
                    : 'bg-[var(--bg-input)] border-[var(--border)] border-opacity-10 text-[var(--text-muted)] hover:border-opacity-30'
                  }`}
                >
                  <span className="font-black text-[9px] uppercase">{opt.label}</span>
                </button>
              ))}
            </div>
            {utilities.electricity === 'extra' && (
              <div className="mt-3 animate-reveal">
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 font-mono text-[9px] text-[var(--text-muted)] font-black">KES / UNIT</span>
                  <input 
                    type="number" required placeholder="0.00" 
                    value={utilities.electricityPrice}
                    onChange={(e) => setUtilities({...utilities, electricityPrice: e.target.value})}
                    className="w-full bg-[var(--bg-input)] border border-[var(--border)] border-opacity-10 text-[var(--text-base)] py-2.5 pl-20 pr-4 rounded-base font-mono text-xs focus:border-[var(--text-base)] outline-none font-black" 
                  />
                </div>
              </div>
            )}
          </div>

          <div className="bg-[var(--bg-panel)] border border-[var(--border)] border-opacity-10 p-5 rounded-base">
            <h3 className="font-black uppercase text-[10px] tracking-widest text-[var(--text-muted)] mb-4 flex items-center gap-2">
              <Droplets size={12} className="text-blue-500" /> Water Billing
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'included', label: 'Included' },
                { id: 'extra', label: 'Separately' }
              ].map(opt => (
                <button 
                  key={opt.id} type="button"
                  onClick={() => setUtilities({...utilities, water: opt.id})}
                  className={`py-3 border-2 text-center transition-all rounded-base ${
                    utilities.water === opt.id 
                    ? 'bg-[var(--accent-bg)] border-[var(--accent-bg)] text-[var(--accent-text)]' 
                    : 'bg-[var(--bg-input)] border-[var(--border)] border-opacity-10 text-[var(--text-muted)] hover:border-opacity-30'
                  }`}
                >
                  <span className="font-black text-[9px] uppercase">{opt.label}</span>
                </button>
              ))}
            </div>
            {utilities.water === 'extra' && (
              <div className="mt-3 animate-reveal">
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 font-mono text-[9px] text-[var(--text-muted)] font-black">KES / UNIT</span>
                  <input 
                    type="number" required placeholder="0.00" 
                    value={utilities.waterPrice}
                    onChange={(e) => setUtilities({...utilities, waterPrice: e.target.value})}
                    className="w-full bg-[var(--bg-input)] border border-[var(--border)] border-opacity-10 text-[var(--text-base)] py-2.5 pl-20 pr-4 rounded-base font-mono text-xs focus:border-[var(--text-base)] outline-none font-black" 
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Recurring: 7 Columns */}
        <div className="lg:col-span-7 bg-[var(--bg-panel)] border border-[var(--border)] border-opacity-10 p-5 rounded-base flex flex-col">
          <div className="flex items-center justify-between mb-4">
             <div>
               <h3 className="font-black uppercase text-[10px] tracking-widest text-[var(--text-muted)] flex items-center gap-2">
                  <Receipt size={12} className="text-emerald-500" /> Recurring Fees
               </h3>
               <p className="font-mono text-[7px] uppercase font-bold text-emerald-600/70 mt-0.5">Monthly add-ons paid with rent (e.g. Garbage, Security, Metered Utils)</p>
             </div>
             <span className="font-mono text-[8px] font-black px-2 py-0.5 bg-[var(--bg-base)] border border-[var(--border)] border-opacity-10 rounded-full text-[var(--text-muted)]">{recurring.length}</span>
          </div>

          <div className="flex-1 space-y-2 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
            {utilities.electricity === 'extra' && (
              <div className="p-2 bg-[var(--bg-base)] border border-yellow-500/20 rounded-base flex items-center justify-between opacity-60">
                <div className="flex items-center gap-2">
                  <Zap size={10} className="text-yellow-500" />
                  <span className="font-mono text-[8px] uppercase font-black">Electricity (Metered)</span>
                </div>
                <span className="font-mono text-[8px] font-black uppercase text-yellow-600/70">Auto-Invoiced</span>
              </div>
            )}
            {utilities.water === 'extra' && (
              <div className="p-2 bg-[var(--bg-base)] border border-blue-500/20 rounded-base flex items-center justify-between opacity-60">
                <div className="flex items-center gap-2">
                  <Droplets size={10} className="text-blue-500" />
                  <span className="font-mono text-[8px] uppercase font-black">Water (Metered)</span>
                </div>
                <span className="font-mono text-[8px] font-black uppercase text-blue-600/70">Auto-Invoiced</span>
              </div>
            )}
            
            {recurring.map((item: RecurringItem, index: number) => (
              <div key={item.id} className="group bg-[var(--bg-input)] border border-[var(--border)] border-opacity-10 p-3 rounded-base flex items-center gap-3 animate-reveal relative">
                <div className="flex-1">
                  <input 
                    type="text" 
                    placeholder="Fee Name (e.g. Garbage)" 
                    value={item.name} 
                    onChange={(e) => { const n = [...recurring]; n[index].name = e.target.value; setRecurring(n); }} 
                    className="w-full bg-transparent border-b border-transparent hover:border-[var(--border)] text-[var(--text-base)] p-1 font-mono text-[10px] focus:border-[var(--text-base)] outline-none font-black uppercase transition-all" 
                  />
                </div>
                <div className="w-24 relative">
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 font-mono text-[8px] text-[var(--text-muted)] font-black opacity-30">KES</span>
                  <input 
                    type="number" 
                    placeholder="0" 
                    value={item.amount} 
                    onChange={(e) => { const n = [...recurring]; n[index].amount = e.target.value; setRecurring(n); }} 
                    className="w-full bg-transparent border-b border-transparent hover:border-[var(--border)] text-[var(--text-base)] p-1 pl-6 font-mono text-[10px] focus:border-[var(--text-base)] outline-none font-black transition-all" 
                  />
                </div>
                <button 
                  type="button" 
                  onClick={() => setRecurring(recurring.filter((r: RecurringItem)=>r.id !== item.id))} 
                  className="p-1.5 text-[var(--text-muted)] hover:text-red-500 transition-colors rounded-sm hover:bg-red-500/5"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            ))}
            
            <button 
              type="button" 
              onClick={() => setRecurring([...recurring, { id: Date.now(), name: '', amount: '', frequency: '1' }])} 
              className="w-full border border-dashed border-[var(--border)] border-opacity-20 rounded-base text-[var(--text-muted)] hover:text-[var(--text-base)] hover:border-opacity-40 font-mono text-[9px] uppercase py-3 flex justify-center items-center gap-2 transition-all font-black group"
            >
              <Plus size={10} /> Add Item
            </button>
          </div>
        </div>
      </div>

      <div className="pt-4 border-t border-[var(--border)] border-opacity-10">
        <button 
          type="submit" 
          className="w-full bg-[var(--accent-bg)] text-[var(--accent-text)] font-black font-mono text-[10px] uppercase py-4 rounded-base hover:scale-[1.01] active:scale-[0.99] transition-all flex justify-center items-center gap-3 group"
        >
          Confirm Billing & Continue <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </form>
  );
};
