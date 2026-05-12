"use client";

import React from 'react';
import { CheckCircle2, ArrowRight, Building2, Users, Receipt, Zap, TrendingUp } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface SuccessProps {
  property: any;
  units: any[];
  tenants: any[];
  recurring: any[];
  utilities: any;
}

export const Success = ({ property, units, tenants, recurring, utilities }: SuccessProps) => {
  const router = useRouter();
  
  const totalRent = units.reduce((acc, u) => acc + (parseFloat(u.rent) || 0), 0);
  
  // Calculate recurring fees + fixed utilities
  const recurringFees = (recurring || []).reduce((acc, r) => acc + (parseFloat(r.amount) || 0), 0);
  const fixedElec = utilities?.electricity === 'fixed' ? (parseFloat(utilities.electricityPrice) || 0) : 0;
  const fixedWater = utilities?.water === 'fixed' ? (parseFloat(utilities.waterPrice) || 0) : 0;
  
  const totalRecurring = recurringFees + fixedElec + fixedWater;
  const grandTotal = totalRent + totalRecurring;

  return (
    <div className="h-full flex flex-col items-center justify-center py-12 animate-reveal">
      {/* Success Icon Animation */}
      <div className="mb-10 relative">
        <div className="absolute inset-0 bg-[var(--accent-bg)] blur-3xl opacity-20 animate-pulse rounded-full" />
        <div className="relative w-24 h-24 bg-[var(--accent-bg)] text-[var(--accent-text)] rounded-full flex items-center justify-center shadow-2xl">
          <CheckCircle2 size={48} strokeWidth={3} />
        </div>
      </div>
      
      {/* Title Section */}
      <div className="text-center space-y-2 mb-12">
        <h2 className="text-4xl font-black uppercase tracking-tighter text-[var(--text-base)]">
          {property?.name || 'Property'} is Live.
        </h2>
        <p className="font-mono text-[10px] uppercase text-[var(--text-muted)] tracking-[0.3em] font-black opacity-60">
          Portfolio Launch Successful
        </p>
      </div>

      {/* Stats Grid - High Density / Premium Design */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-2xl mb-12">
        
        {/* Core Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-[var(--bg-panel)] border border-[var(--border)] border-opacity-10 p-5 rounded-base flex flex-col justify-between">
            <Building2 size={16} className="text-[var(--text-muted)] mb-4" />
            <div>
              <p className="font-mono text-[8px] uppercase font-black text-[var(--text-muted)] mb-1">Total Units</p>
              <p className="text-2xl font-black">{units.length}</p>
            </div>
          </div>
          <div className="bg-[var(--bg-panel)] border border-[var(--border)] border-opacity-10 p-5 rounded-base flex flex-col justify-between">
            <Users size={16} className="text-[var(--text-muted)] mb-4" />
            <div>
              <p className="font-mono text-[8px] uppercase font-black text-[var(--text-muted)] mb-1">Total Tenants</p>
              <p className="text-2xl font-black">{tenants.length}</p>
            </div>
          </div>
        </div>

        {/* Financial Projection */}
        <div className="bg-[var(--bg-panel)] border border-[var(--border)] border-opacity-10 p-6 rounded-base space-y-6 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-all">
             <TrendingUp size={80} />
          </div>
          
          <div className="space-y-4 relative z-10">
            <div className="flex justify-between items-center pb-3 border-b border-[var(--border)] border-opacity-5">
              <div className="flex items-center gap-2">
                <Receipt size={12} className="text-[var(--text-muted)]" />
                <span className="font-mono text-[8px] uppercase font-black text-[var(--text-muted)]">Monthly Rent</span>
              </div>
              <span className="font-mono text-[10px] font-black uppercase text-[var(--text-base)]">KES {totalRent.toLocaleString()}</span>
            </div>

            <div className="flex justify-between items-center pb-3 border-b border-[var(--border)] border-opacity-5">
              <div className="flex items-center gap-2">
                <Zap size={12} className="text-[var(--text-muted)]" />
                <span className="font-mono text-[8px] uppercase font-black text-[var(--text-muted)]">Recurring Utilities</span>
              </div>
              <span className="font-mono text-[10px] font-black uppercase text-[var(--text-base)]">KES {totalRecurring.toLocaleString()}</span>
            </div>

            <div className="flex justify-between items-center pt-2">
              <span className="font-mono text-[9px] uppercase font-black text-[var(--accent-bg)]">Grand Total / Month</span>
              <span className="text-xl font-black text-[var(--text-base)]">KES {grandTotal.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Action Button */}
      <div className="w-full max-w-sm space-y-4">
        <button 
          onClick={() => router.push(`/dashboard/manager/properties/${property?.id || ''}`)}
          className="w-full bg-[var(--accent-bg)] text-[var(--accent-text)] font-black font-mono text-[10px] uppercase py-5 rounded-base shadow-2xl hover:scale-[1.01] active:scale-[0.99] transition-all flex justify-center items-center gap-3 group"
        >
          Enter Property Command Center <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
        </button>
        <p className="text-center font-mono text-[7px] uppercase font-black text-[var(--text-muted)] opacity-40">
          Automations are now active and monitoring all assets
        </p>
      </div>
    </div>
  );
};
