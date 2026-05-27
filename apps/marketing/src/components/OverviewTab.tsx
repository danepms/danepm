"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import { 
  Building2, Users, Receipt, BarChart3, ShieldCheck, 
  MessageSquare, ArrowRight, Zap, Coins, Clock, ChevronRight 
} from 'lucide-react';

export default function OverviewTab({ onGoToSignup }: { onGoToSignup: () => void }) {
  const [calcUnits, setCalcUnits] = useState(40);

  const hoursManual = Math.round(calcUnits * 1.5);
  const hoursDane = Math.round(calcUnits * 0.15);
  const savedHours = Math.max(1, hoursManual - hoursDane);
  const savedMoney = savedHours * 1500;

  const KPIs = [
    { label: "M-PESA LATENCY", val: "< 1.2s", status: "ONLINE", desc: "Callback matching verification queue" },
    { label: "ACTIVE CRON WORKERS", val: "4 / 4", status: "OK", desc: "Message queue & heartbeat daemons" },
    { label: "COLLECTION RATE AVG", val: "98.4%", status: "OPTIMAL", desc: "On-time rent clearing statistics" },
    { label: "DB REPLICAS", val: "3 ACTIVE", status: "SYNCD", desc: "Neon PostgreSQL server clusters" }
  ];

  return (
    <div className="space-y-6 animate-fade-in font-sans">
      
      {/* KPI HUD Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {KPIs.map((k, i) => (
          <div key={i} className="glass p-4 rounded-xl border border-[var(--border)] flex flex-col justify-between space-y-2">
            <div className="flex justify-between items-center text-[9px] font-mono text-[var(--text-muted)]">
              <span>{k.label}</span>
              <span className="text-[var(--accent)] font-bold">● {k.status}</span>
            </div>
            <div className="text-xl font-black text-white tracking-tighter">{k.val}</div>
            <div className="text-[9px] text-[var(--text-muted)] leading-tight">{k.desc}</div>
          </div>
        ))}
      </div>

      {/* Main Grid: Info + Vector HUD */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        
        {/* Pitch / Spec column */}
        <div className="lg:col-span-7 glass rounded-2xl p-6 border border-[var(--border)] flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#151515] border border-[var(--border)]">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)]" />
              <span className="text-[9px] font-mono uppercase text-white tracking-wider">PLATFORM PROFILE</span>
            </div>
            <h2 className="text-3xl font-black uppercase tracking-tighter leading-none text-white">
              STABILIZED PROPERTY OPERATIONS
            </h2>
            <p className="text-xs leading-relaxed text-[var(--text-muted)]">
              DanePMS is a consolidated monorepo management platform designed to automate rent billing, matching ledgers, tenant archiving, and background communication flows. It bypasses spreadsheet overhead by integrating directly with core payment APIs.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-[var(--border)] pt-4">
            <div className="space-y-2">
              <h4 className="text-[10px] font-mono uppercase font-black text-white flex items-center gap-2">
                <Zap size={10} className="text-[var(--accent)]" /> CORE ENGINE
              </h4>
              <p className="text-[11px] text-[var(--text-muted)] leading-normal">
                Strict double-ledger writes. Any payment webhook callback inserts unified records across <code className="text-[var(--accent)]">payment</code> and <code className="text-[var(--accent)]">settlementAllocation</code> tables, maintaining mathematical reconciliation integrity.
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="text-[10px] font-mono uppercase font-black text-white flex items-center gap-2">
                <ShieldCheck size={10} className="text-[var(--accent)]" /> SAFE EXIT PARSING
              </h4>
              <p className="text-[11px] text-[var(--text-muted)] leading-normal">
                Archive tenants cleanly. Discharges balance statements, captures exit photos, logs exact move-out timestamps, and stores files in Cloudflare R2 bucket clusters.
              </p>
            </div>
          </div>

          <button 
            onClick={onGoToSignup}
            className="w-full bg-[var(--accent)] text-black font-black uppercase py-3.5 rounded-xl text-[10px] tracking-widest flex items-center justify-center gap-2 hover:opacity-95 hover:scale-[0.99] transition-all"
          >
            BOOT MANAGER PORTAL <ArrowRight size={14} />
          </button>
        </div>

        {/* Dynamic Image HUD Column */}
        <div className="lg:col-span-5 rounded-2xl border border-[var(--border)] bg-[#0d0d0d] overflow-hidden flex flex-col justify-between relative p-6 glow-accent-sm">
          <div className="flex justify-between items-center text-[9px] font-mono text-[var(--text-muted)] mb-4">
            <span>VISUAL // DASHBOARD_HUD</span>
            <span>SCALE: 1:1</span>
          </div>

          <div className="relative w-full h-48 border border-[#1a1a1a] rounded-xl overflow-hidden bg-black/40">
            <Image 
              src="/images/dashboard_hud.png" 
              alt="Dane Dashboard HUD Graphic" 
              fill 
              className="object-cover" 
            />
          </div>

          <div className="mt-4 text-[10px] text-[var(--text-muted)] leading-relaxed">
            Real-time analytics engine tracking unit status matrixes, arrears profiles, maintenance queues, and historical occupancy counters.
          </div>
        </div>
      </div>

      {/* ROI & Payment Integration Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        
        {/* ROI slider */}
        <div className="lg:col-span-7 glass rounded-2xl p-6 border border-[var(--border)] flex flex-col justify-between space-y-6">
          <div>
            <h3 className="text-xs font-mono uppercase font-black text-white mb-2">Simulated Portfolio Savings</h3>
            <p className="text-[11px] text-[var(--text-muted)]">Calculate time and overhead cost recovery based on unit density.</p>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center text-[10px] font-mono">
              <span className="uppercase text-[var(--text-muted)]">Managed Units</span>
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
              <div className="text-2xl font-black text-white">{savedHours} hrs</div>
              <div className="text-[8px] text-[var(--text-muted)] uppercase mt-1">Saved / Month</div>
            </div>
            <div>
              <div className="text-2xl font-black text-[var(--accent)]">KES {savedMoney.toLocaleString()}</div>
              <div className="text-[8px] text-[var(--text-muted)] uppercase mt-1">Administrative Recovery</div>
            </div>
          </div>
        </div>

        {/* Integration matrix */}
        <div className="lg:col-span-5 glass rounded-2xl p-6 border border-[var(--border)] flex flex-col justify-between space-y-4">
          <div>
            <h3 className="text-xs font-mono uppercase font-black text-white mb-2">Payment Integration Matrix</h3>
            <p className="text-[11px] text-[var(--text-muted)]">Native interfaces built into the core API codebase.</p>
          </div>

          <div className="space-y-2 font-mono text-[10px]">
            <div className="flex justify-between items-center p-2 rounded bg-white/2 border border-white/5">
              <span className="text-white">M-PESA (Till / Paybill)</span>
              <span className="text-[var(--accent)] font-bold">ACTIVE (C-SIDE)</span>
            </div>
            <div className="flex justify-between items-center p-2 rounded bg-white/2 border border-white/5">
              <span className="text-white">PAYSTACK CARD / TRANSFER</span>
              <span className="text-[var(--accent)] font-bold">ACTIVE (B-SIDE)</span>
            </div>
            <div className="flex justify-between items-center p-2 rounded bg-white/2 border border-white/5">
              <span className="text-white">LOCAL BANK CHANNELS</span>
              <span className="text-[var(--text-muted)]">RECON-QUEUE</span>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
