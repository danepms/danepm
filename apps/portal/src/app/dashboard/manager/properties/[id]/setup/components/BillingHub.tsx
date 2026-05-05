"use client";

import React from 'react';
import { Zap, Receipt, Droplets, Trash2, Plus, ArrowRight } from 'lucide-react';

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
     <form onSubmit={(e) => { e.preventDefault(); onNext(); }} className="flex flex-col h-full">
      <div className="mb-10">
        <button type="button" onClick={onBack} className="font-mono text-[10px] text-[var(--text-muted)] hover:text-[var(--text-base)] uppercase mb-6 flex items-center gap-2 transition-colors">
          ← Go Back
        </button>
        <div className="flex items-center gap-4 mb-6">
          <div className="w-12 h-12 border-2 border-[var(--text-base)] text-[var(--text-base)] flex items-center justify-center">
            <Zap size={24} />
          </div>
          <div className="w-12 h-12 bg-[var(--text-base)] text-[var(--bg-base)] flex items-center justify-center shadow-[4px_4px_0px_0px_var(--shadow-color)]">
            <Receipt size={24} />
          </div>
        </div>
        <h2 className="text-4xl md:text-5xl font-bold uppercase tracking-tighter mb-4 leading-none text-[var(--text-base)]">
          Billing Hub.
        </h2>
        <p className="text-sm font-mono text-[var(--text-muted)] uppercase">Configure utilities and recurring management fees.</p>
      </div>

      <div className="space-y-12 flex-1">
        {/* Utilities Selection */}
        <div className="space-y-8">
          <div>
            <h3 className="font-black uppercase text-sm text-[var(--text-base)] mb-4 flex items-center gap-2">
              <Zap size={16} className="text-[var(--accent-bg)]" /> Electricity
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-4">
              {[
                { id: 'token', label: 'Tokens', desc: 'Tenants buy' },
                { id: 'included', label: 'Included', desc: 'In rent' },
                { id: 'extra', label: 'Billed', desc: 'Via meter' }
              ].map(opt => (
                <button 
                  key={opt.id} type="button"
                  onClick={() => setUtilities({...utilities, electricity: opt.id})}
                  className={`p-4 border text-left transition-all flex flex-col ${
                    utilities.electricity === opt.id 
                    ? 'bg-[var(--bg-panel)] border-[var(--accent-bg)] shadow-[3px_3px_0px_0px_var(--shadow-color)] text-[var(--text-base)]' 
                    : 'bg-[var(--bg-base)] border-[var(--border)] text-[var(--text-muted)] hover:border-[var(--text-base)]'
                  }`}
                >
                  <span className="font-black text-[10px] uppercase block mb-1">{opt.label}</span>
                  <span className="text-[8px] font-mono uppercase opacity-70">{opt.desc}</span>
                </button>
              ))}
            </div>
            {utilities.electricity === 'extra' && (
              <div className="reveal-step flex items-center gap-4 bg-[var(--bg-panel)] p-4 border border-[var(--accent-bg)] shadow-[3px_3px_0px_0px_var(--shadow-color)]">
                <span className="font-mono text-[10px] text-[var(--text-muted)] uppercase font-bold">Price per Unit</span>
                <div className="relative flex-1 max-w-[200px]">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 font-mono text-[10px] text-[var(--text-muted)] font-bold">KES</span>
                  <input 
                    type="number" required placeholder="0" 
                    value={utilities.electricityPrice}
                    onChange={(e) => setUtilities({...utilities, electricityPrice: e.target.value})}
                    className="w-full bg-[var(--bg-base)] border border-[var(--border)] text-[var(--text-base)] py-2 pl-12 pr-4 font-mono text-sm focus:border-[var(--accent-bg)] outline-none transition-all font-bold" 
                  />
                </div>
              </div>
            )}
          </div>

          <div>
            <h3 className="font-black uppercase text-sm text-[var(--text-base)] mb-4 flex items-center gap-2">
              <Droplets size={16} className="text-[var(--accent-bg)]" /> Water
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-4">
              {[
                { id: 'included', label: 'Included in Rent', desc: 'Flat rate coverage' },
                { id: 'extra', label: 'Billed Separately', desc: 'Unit consumption' }
              ].map(opt => (
                <button 
                  key={opt.id} type="button"
                  onClick={() => setUtilities({...utilities, water: opt.id})}
                  className={`p-4 border text-left transition-all flex flex-col ${
                    utilities.water === opt.id 
                    ? 'bg-[var(--bg-panel)] border-[var(--accent-bg)] shadow-[3px_3px_0px_0px_var(--shadow-color)] text-[var(--text-base)]' 
                    : 'bg-[var(--bg-base)] border-[var(--border)] text-[var(--text-muted)] hover:border-[var(--text-base)]'
                  }`}
                >
                  <span className="font-black text-[10px] uppercase block mb-1">{opt.label}</span>
                  <span className="text-[8px] font-mono uppercase opacity-70">{opt.desc}</span>
                </button>
              ))}
            </div>
            {utilities.water === 'extra' && (
              <div className="reveal-step flex items-center gap-4 bg-[var(--bg-panel)] p-4 border border-[var(--accent-bg)] shadow-[3px_3px_0px_0px_var(--shadow-color)]">
                <span className="font-mono text-[10px] text-[var(--text-muted)] uppercase font-bold">Price per Unit / Flat Rate</span>
                <div className="relative flex-1 max-w-[200px]">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 font-mono text-[10px] text-[var(--text-muted)] font-bold">KES</span>
                  <input 
                    type="number" required placeholder="0" 
                    value={utilities.waterPrice}
                    onChange={(e) => setUtilities({...utilities, waterPrice: e.target.value})}
                    className="w-full bg-[var(--bg-base)] border border-[var(--border)] text-[var(--text-base)] py-2 pl-12 pr-4 font-mono text-sm focus:border-[var(--accent-bg)] outline-none transition-all font-bold" 
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Regular Bills Section */}
        <div className="pt-8 border-t border-[var(--border)] border-opacity-10">
          <h3 className="font-black uppercase text-sm text-[var(--text-base)] mb-6 flex items-center gap-2">
            <Receipt size={16} className="text-[var(--accent-bg)]" /> Recurring Expenses
          </h3>
          <div className="space-y-3">
            {recurring.map((item: RecurringItem, index: number) => (
              <div key={item.id} className="border border-[var(--border)] bg-[var(--bg-panel)] p-4 flex flex-col sm:flex-row gap-4 items-start sm:items-center relative shadow-[2px_2px_0px_0px_var(--shadow-color)]">
                <div className="flex-1">
                  <label className="font-mono text-[8px] text-[var(--text-muted)] uppercase mb-1 block font-bold">Name</label>
                  <input type="text" placeholder="e.g. Garbage" value={item.name} onChange={(e) => { const n = [...recurring]; n[index].name = e.target.value; setRecurring(n); }} className="w-full bg-[var(--bg-base)] border border-[var(--border)] text-[var(--text-base)] p-2 font-mono text-[10px] focus:border-[var(--accent-bg)] outline-none font-bold" />
                </div>
                <div className="w-full sm:w-1/3">
                  <label className="font-mono text-[8px] text-[var(--text-muted)] uppercase mb-1 block font-bold">Amount (KES)</label>
                  <input type="number" placeholder="0" value={item.amount} onChange={(e) => { const n = [...recurring]; n[index].amount = e.target.value; setRecurring(n); }} className="w-full bg-[var(--bg-base)] border border-[var(--border)] text-[var(--text-base)] p-2 font-mono text-[10px] focus:border-[var(--accent-bg)] outline-none font-bold" />
                </div>
                <button type="button" onClick={() => setRecurring(recurring.filter((r: RecurringItem)=>r.id !== item.id))} className="absolute top-4 right-4 sm:relative sm:top-5 sm:right-0 p-1 text-[var(--text-muted)] hover:text-red-500 transition-colors">
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
            <button type="button" onClick={() => setRecurring([...recurring, { id: Date.now(), name: '', amount: '', frequency: '1' }])} className="w-full border border-dashed border-[var(--border)] border-opacity-30 text-[var(--text-muted)] hover:text-[var(--text-base)] font-mono text-[9px] uppercase py-3 flex justify-center items-center gap-2 transition-all font-bold">
              <Plus size={12} /> Add Management Fee
            </button>
          </div>
        </div>
      </div>

      <div className="pt-12 shrink-0">
        <button type="submit" className="w-full bg-[var(--accent-bg)] text-[var(--accent-text)] font-bold font-mono text-sm uppercase py-6 border border-[var(--accent-bg)] shadow-[4px_4px_0px_0px_var(--shadow-color)] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_var(--shadow-color)] active:translate-y-1 active:shadow-none transition-all duration-150 flex justify-center items-center gap-3">
          Move-In Fees <ArrowRight size={16} />
        </button>
      </div>
    </form>
  );
};
