"use client";

import React from 'react';
import { CheckSquare, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';

export const Success = ({ units }: { units: any[] }) => {
  const router = useRouter();
  
  return (
     <div className="h-full flex flex-col justify-center items-center text-center py-12">
      <div className="relative mb-12">
        <div className="w-32 h-32 bg-[var(--accent-bg)] text-[var(--accent-text)] flex items-center justify-center relative shadow-[8px_8px_0px_0px_var(--shadow-color)]">
          <CheckSquare size={64} />
        </div>
      </div>
      
      <h2 className="text-5xl md:text-6xl font-bold uppercase tracking-tighter mb-6 leading-none text-[var(--text-base)]">
        Ready to roll!
      </h2>
      
      <p className="text-sm font-mono text-[var(--text-muted)] uppercase max-w-md mx-auto mb-12 leading-relaxed">
        Rules applied. {units.filter((u: any)=>u.status==='occupied').length} out of {units.length} units are currently occupied. The system is ready to automate your rent and bills.
      </p>

      <div className="border border-[var(--border)] bg-[var(--bg-panel)] p-6 max-w-sm w-full mb-12 text-left shadow-[4px_4px_0px_0px_var(--shadow-color)]">
        <div className="font-mono text-[10px] text-[var(--text-muted)] uppercase border-b border-[var(--border)] pb-2 mb-4">Final Checklist</div>
        <ul className="space-y-4 font-mono text-xs text-[var(--text-base)] uppercase">
          <li className="flex items-start gap-3"><CheckSquare size={16} className="text-[var(--accent-bg)] shrink-0" /> Layout & Naming mapped</li>
          <li className="flex items-start gap-3"><CheckSquare size={16} className="text-[var(--accent-bg)] shrink-0" /> Base rent configured</li>
          <li className="flex items-start gap-3"><CheckSquare size={16} className="text-[var(--accent-bg)] shrink-0" /> Utilities & Billing rules set</li>
          <li className="flex items-start gap-3"><CheckSquare size={16} className="text-[var(--accent-bg)] shrink-0" /> Occupancy state mapped</li>
        </ul>
      </div>

      <button 
        onClick={() => router.push('/dashboard/manager/properties')}
        className="w-full max-w-sm bg-[var(--text-base)] text-[var(--bg-base)] font-bold font-mono text-sm uppercase py-6 border border-[var(--text-base)] shadow-[4px_4px_0px_0px_var(--shadow-color)] active:translate-y-1 active:shadow-none transition-all duration-150 flex justify-center items-center gap-3 group hover:opacity-90"
      >
        Go to Dashboard <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
      </button>
    </div>
  );
};
