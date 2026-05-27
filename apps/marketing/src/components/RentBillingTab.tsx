"use client";

import React from 'react';
import { Receipt, Coins, ShieldCheck, CheckCircle2 } from 'lucide-react';

export default function RentBillingTab() {
  return (
    <div className="space-y-6 animate-fade-in font-sans">
      
      {/* Narrative grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
        
        {/* Billing rules */}
        <div className="lg:col-span-7 glass rounded-2xl p-6 border border-[var(--border)] flex flex-col justify-between space-y-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#151515] border border-[var(--border)] mb-4 font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)]" />
              <span className="text-[9px] uppercase text-white tracking-wider">FINANCIAL ENGINE</span>
            </div>
            <h3 className="text-2xl font-black uppercase text-white tracking-tighter leading-none mb-3 font-mono">
              Automatic Monthly Invoices & M-Pesa Settlement
            </h3>
            <p className="text-xs leading-relaxed text-[var(--text-muted)]">
              Dane automates your monthly rental billing. On your set day, the system automatically creates rent, utility, and other invoices for all occupied units. 
            </p>
          </div>

          <div className="space-y-3 text-[11px] text-[var(--text-muted)]">
            <div className="flex items-start gap-2">
              <CheckCircle2 size={12} className="text-[var(--accent)] mt-0.5 shrink-0" />
              <span><strong>M-Pesa Webhook Matching:</strong> Tenants pay via your Till or Paybill. The system instantly detects the receipt, matches it to their registered phone number or unit ID, and processes the allocation.</span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle2 size={12} className="text-[var(--accent)] mt-0.5 shrink-0" />
              <span><strong>FIFO Settlement:</strong> Rent payments are allocated chronologically. The oldest unpaid invoice is settled first, ensuring that utility balances, penalty charges, and basic rent are cleared systematically.</span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle2 size={12} className="text-[var(--accent)] mt-0.5 shrink-0" />
              <span><strong>Arrears & Carry Forward:</strong> Any remaining payment balance automatically reduces the tenant's global arrears. Overpayments are carried forward as a credit balance.</span>
            </div>
          </div>
        </div>

        {/* Dynamic Mockup Card */}
        <div className="lg:col-span-5 glass rounded-2xl p-6 border border-[var(--border)] flex flex-col justify-between space-y-4">
          <div>
            <h4 className="text-xs font-mono uppercase font-black text-white flex items-center gap-2">
              <Coins size={12} className="text-[var(--accent)]" /> BILLING OVERWATCH CONFIG
            </h4>
            <p className="text-[11px] text-[var(--text-muted)]">Set customized financial parameters to control automation limits:</p>
          </div>

          <div className="space-y-2 font-mono text-[10px]">
            <div className="flex justify-between items-center p-2 rounded bg-white/2 border border-white/5 text-white">
              <span>Rent Due Day</span>
              <span>1st of the month</span>
            </div>
            <div className="flex justify-between items-center p-2 rounded bg-white/2 border border-white/5 text-white">
              <span>Grace Period Days</span>
              <span>5 Days</span>
            </div>
            <div className="flex justify-between items-center p-2 rounded bg-white/2 border border-white/5 text-white">
              <span>Late Penalty Type</span>
              <span>Flat Fee / Percentage</span>
            </div>
            <div className="flex justify-between items-center p-2 rounded bg-white/2 border border-white/5 text-white">
              <span>Auto SMS Receipts</span>
              <span className="text-[var(--accent)]">ENABLED</span>
            </div>
          </div>
        </div>

      </div>

      {/* Transaction flow HUD */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="glass p-4 rounded-xl border border-[var(--border)] font-mono text-[10px]">
          <span className="text-[9px] text-[var(--text-muted)] uppercase block mb-1">Step 1: Payment Sent</span>
          <div className="text-xs font-bold text-white">Tenant pays Till/Paybill</div>
          <span className="text-[9px] text-[var(--text-dim)]">Tenants can pay via STK push or paybill using unit IDs</span>
        </div>
        <div className="glass p-4 rounded-xl border border-[var(--border)] font-mono text-[10px]">
          <span className="text-[9px] text-[var(--text-muted)] uppercase block mb-1">Step 2: Matching loop</span>
          <div className="text-xs font-bold text-white">Matches Phone/ID</div>
          <span className="text-[9px] text-[var(--text-dim)]">Identifies tenant and matches reference to invoice ledger</span>
        </div>
        <div className="glass p-4 rounded-xl border border-[var(--border)] font-mono text-[10px]">
          <span className="text-[9px] text-[var(--text-muted)] uppercase block mb-1">Step 3: Receipt SMS</span>
          <div className="text-xs font-bold text-white">Asynchronous Dispatch</div>
          <span className="text-[9px] text-[var(--text-dim)]">Sends SMS/WhatsApp confirming invoice settlement details</span>
        </div>
      </div>

    </div>
  );
}
