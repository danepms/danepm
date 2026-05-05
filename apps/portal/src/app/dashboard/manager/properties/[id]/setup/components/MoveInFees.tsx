"use client";

import React from 'react';
import { Wallet, Trash2, Plus, Users } from 'lucide-react';

interface MoveInFee {
  id: number;
  name: string;
  amount: string;
}

interface MoveInFeesProps {
  oneTime: MoveInFee[];
  setOneTime: (fees: MoveInFee[]) => void;
  onNext: () => void;
  onBack: () => void;
}

export const MoveInFees = ({ oneTime, setOneTime, onNext, onBack }: MoveInFeesProps) => {
  return (
     <form onSubmit={(e) => { e.preventDefault(); onNext(); }} className="flex flex-col h-full">
      <div className="mb-10">
        <button type="button" onClick={onBack} className="font-mono text-[10px] text-[var(--text-muted)] hover:text-[var(--text-base)] uppercase mb-6 flex items-center gap-2 transition-colors">
          ← Go Back
        </button>
        <div className="w-12 h-12 border-2 border-[var(--text-base)] text-[var(--text-base)] flex items-center justify-center mb-6">
          <Wallet size={24} />
        </div>
        <h2 className="text-4xl md:text-5xl font-bold uppercase tracking-tighter mb-4 leading-none text-[var(--text-base)]">Move-In Fees.</h2>
      </div>
      <div className="space-y-4 flex-1">
        {oneTime.map((item: MoveInFee, index: number) => (
          <div key={item.id} className="border border-[var(--border)] bg-[var(--bg-panel)] p-4 flex gap-4 items-center shadow-[2px_2px_0px_0px_var(--shadow-color)]">
            <div className="flex-1">
              <label className="font-mono text-[8px] text-[var(--text-muted)] uppercase mb-1 block font-bold">Fee Name</label>
              <input type="text" placeholder="Deposit" value={item.name} onChange={(e) => { const n = [...oneTime]; n[index].name = e.target.value; setOneTime(n); }} className="w-full bg-[var(--bg-base)] border border-[var(--border)] text-[var(--text-base)] p-3 font-mono text-[10px] focus:border-[var(--accent-bg)] outline-none font-bold" />
            </div>
            <div className="w-1/3">
              <label className="font-mono text-[8px] text-[var(--text-muted)] uppercase mb-1 block font-bold">Amount</label>
              <input type="number" placeholder="0" value={item.amount} onChange={(e) => { const n = [...oneTime]; n[index].amount = e.target.value; setOneTime(n); }} className="w-full bg-[var(--bg-base)] border border-[var(--border)] text-[var(--text-base)] p-3 font-mono text-[10px] focus:border-[var(--accent-bg)] outline-none font-bold" />
            </div>
            <button type="button" onClick={() => setOneTime(oneTime.filter((o: MoveInFee)=>o.id !== item.id))} className="mt-5 p-2 text-[var(--text-muted)] hover:text-red-500 transition-colors"><Trash2 size={16} /></button>
          </div>
        ))}
        <button type="button" onClick={() => setOneTime([...oneTime, { id: Date.now(), name: '', amount: '' }])} className="w-full border border-dashed border-[var(--border)] border-opacity-30 text-[var(--text-muted)] hover:text-[var(--text-base)] font-mono text-[9px] uppercase py-4 flex justify-center items-center gap-2 transition-all font-bold"><Plus size={12} /> Add One-Time Fee</button>
      </div>
      <div className="pt-12 shrink-0">
        <button type="submit" className="w-full bg-[var(--accent-bg)] text-[var(--accent-text)] font-bold font-mono text-sm uppercase py-6 border border-[var(--accent-bg)] shadow-[4px_4px_0px_0px_var(--shadow-color)] active:translate-y-1 active:shadow-none transition-all flex justify-center gap-3">
          Assign Tenants <Users size={16} />
        </button>
      </div>
    </form>
  );
};
