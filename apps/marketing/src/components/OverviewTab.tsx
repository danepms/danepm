"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import { 
  Building2, Users, Receipt, BarChart3, ShieldCheck, 
  MessageSquare, ArrowRight, Zap, Coins, Clock 
} from 'lucide-react';

export default function OverviewTab({ onGoToSignup }: { onGoToSignup: () => void }) {
  const [calcUnits, setCalcUnits] = useState(40);

  // Time savings metrics based on real property manager workflows
  const hoursManual = Math.round(calcUnits * 1.5);
  const hoursDane = Math.round(calcUnits * 0.15);
  const savedHours = Math.max(1, hoursManual - hoursDane);
  const savedMoney = savedHours * 1500;

  return (
    <div className="space-y-6 animate-fade-in font-sans">
      
      {/* Portfolio Quick HUD */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        
        {/* Pitch Column */}
        <div className="lg:col-span-7 glass rounded-2xl p-6 border border-[var(--border)] flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#151515] border border-[var(--border)]">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)]" />
              <span className="text-[9px] font-mono uppercase text-white tracking-wider">HOW IT WORKS</span>
            </div>
            <h2 className="text-3xl font-black uppercase tracking-tighter leading-none text-white font-mono">
              Manage Properties, Tenants & Invoices in One Place
            </h2>
            <p className="text-xs leading-relaxed text-[var(--text-muted)]">
              Dane is a comprehensive platform designed for Kenyan landlords and property managers. It takes the pain out of tracking monthly rent, onboarding residents, recording property expenses, and reconciling M-Pesa payments.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-[#1a1a1a] pt-4 text-xs">
            <div className="space-y-1">
              <h4 className="font-mono uppercase font-black text-white flex items-center gap-1.5">
                <Building2 size={12} className="text-[var(--accent)]" /> 1. Map Your Buildings
              </h4>
              <p className="text-[11px] text-[var(--text-muted)] leading-relaxed">
                Add residential or commercial properties. Map units by floor level, define base rent rates, and set billing due dates.
              </p>
            </div>
            <div className="space-y-1">
              <h4 className="font-mono uppercase font-black text-white flex items-center gap-1.5">
                <Users size={12} className="text-[var(--accent)]" /> 2. Onboard Residents
              </h4>
              <p className="text-[11px] text-[var(--text-muted)] leading-relaxed">
                Register contact cards, ID numbers, next-of-kin contacts, move-in checklists, and photograph conditions for clean vacating statements later.
              </p>
            </div>
          </div>

          <button 
            onClick={onGoToSignup}
            className="w-full bg-[var(--accent)] text-black font-black uppercase py-3.5 rounded-xl text-[10px] tracking-widest flex items-center justify-center gap-2 hover:opacity-95 hover:scale-[0.99] transition-all font-mono"
          >
            GET STARTED FOR FREE <ArrowRight size={14} />
          </button>
        </div>

        {/* Visual Mock Column */}
        <div className="lg:col-span-5 rounded-2xl border border-[var(--border)] bg-[#0d0d0d] overflow-hidden flex flex-col justify-between relative p-6">
          <div className="flex justify-between items-center text-[9px] font-mono text-[var(--text-muted)] mb-4">
            <span>DASHBOARD MOCKUP</span>
            <span>LIVE PORTAL VIEW</span>
          </div>

          <div className="relative w-full h-48 border border-[#1a1a1a] rounded-xl overflow-hidden bg-black/40">
            <Image 
              src="/images/dashboard_hud.png" 
              alt="Dane Dashboard HUD Graphic" 
              fill 
              className="object-cover" 
            />
          </div>

          <div className="mt-4 text-[10px] text-[var(--text-muted)] leading-relaxed font-mono">
            Tracks occupancy ratios, active tenancy matrices, pending maintenance lists, and itemized property expenses.
          </div>
        </div>
      </div>

      {/* ROI & Settings Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        
        {/* ROI slider */}
        <div className="lg:col-span-7 glass rounded-2xl p-6 border border-[var(--border)] flex flex-col justify-between space-y-6">
          <div>
            <h3 className="text-xs font-mono uppercase font-black text-white mb-1">Time & Cost Recovery Calculator</h3>
            <p className="text-[11px] text-[var(--text-muted)] font-sans">See how much time you save by replacing Excel records with automated tracking.</p>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center text-[10px] font-mono">
              <span className="uppercase text-[var(--text-muted)]">Active Managed Units</span>
              <span className="text-lg font-black text-[var(--accent)]">{calcUnits} Units</span>
            </div>
            <input 
              type="range"
              min="5"
              max="150"
              value={calcUnits}
              onChange={(e) => setCalcUnits(parseInt(e.target.value))}
              className="w-full h-1.5 rounded bg-[#18181b] appearance-none cursor-pointer accent-[var(--accent)]"
            />
            <div className="flex justify-between text-[8px] font-mono text-[var(--text-dim)]">
              <span>5 UNITS</span>
              <span>75 UNITS</span>
              <span>150 UNITS</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-[var(--border)] text-center font-mono">
            <div>
              <div className="text-2xl font-black text-white">{savedHours} Hours</div>
              <div className="text-[8px] text-[var(--text-muted)] uppercase mt-1">Manual Workload Saved / Month</div>
            </div>
            <div>
              <div className="text-2xl font-black text-[var(--accent)]">KES {savedMoney.toLocaleString()}</div>
              <div className="text-[8px] text-[var(--text-muted)] uppercase mt-1">Estimated Monthly Recovery Value</div>
            </div>
          </div>
        </div>

        {/* Integration matrix */}
        <div className="lg:col-span-5 glass rounded-2xl p-6 border border-[var(--border)] flex flex-col justify-between space-y-4">
          <div>
            <h3 className="text-xs font-mono uppercase font-black text-white mb-2">Supported Collection Methods</h3>
            <p className="text-[11px] text-[var(--text-muted)]">Direct connections with local payment providers.</p>
          </div>

          <div className="space-y-2 font-mono text-[10px]">
            <div className="flex justify-between items-center p-2 rounded bg-white/2 border border-white/5">
              <span className="text-white">M-Pesa Paybill / Buy Goods Till</span>
              <span className="text-[var(--accent)] font-bold">AUTOMATED MATCHING</span>
            </div>
            <div className="flex justify-between items-center p-2 rounded bg-white/2 border border-white/5">
              <span className="text-white">Paystack Card Payments</span>
              <span className="text-[var(--accent)] font-bold">ONLINE CREDIT</span>
            </div>
            <div className="flex justify-between items-center p-2 rounded bg-white/2 border border-white/5">
              <span className="text-white">Cash / Direct Bank Transfers</span>
              <span className="text-[var(--accent)] font-bold">MANUAL LOGGING</span>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
