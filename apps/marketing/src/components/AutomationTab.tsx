"use client";

import React from 'react';
import Image from 'next/image';
import { Play, ArrowRight, CornerDownRight, CheckCircle2 } from 'lucide-react';

export default function AutomationTab() {
  const steps = [
    {
      num: "01",
      title: "Callback Capture",
      desc: "Tenant pays via M-Pesa. Safaricom sends a POST webhook request to Dane API. The payload contains MpesaReceiptNumber, Amount, and PhoneNumber."
    },
    {
      num: "02",
      title: "FIFO Matching Ledger",
      desc: "API retrieves pending invoices for the identified tenant. Allocates the amount in chronological FIFO order: oldest rent invoices first, followed by utilities, and finally late penalty fees."
    },
    {
      num: "03",
      title: "Double Ledger Write",
      desc: "Saves a payment row and creates allocation links. If excess cash is paid, it gets registered as a prepayment credit on the tenant profile for the next billing cycle."
    },
    {
      num: "04",
      title: "Communication Fire",
      desc: "API dispatches asynchronous SMS and WhatsApp messages to the tenant confirming the exact allocation details. Spawns cron verification heartbeats."
    }
  ];

  return (
    <div className="space-y-6 animate-fade-in font-sans">
      
      {/* Schematic Illustration Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
        
        {/* Vector Image Panel */}
        <div className="lg:col-span-6 rounded-2xl border border-[var(--border)] bg-[#0d0d0d] p-6 flex flex-col justify-between relative glow-accent-sm">
          <div className="flex justify-between items-center text-[9px] font-mono text-[var(--text-muted)] mb-4">
            <span>SCHEMATIC // WEBHOOK_ENGINE</span>
            <span>STATUS: READY</span>
          </div>

          <div className="relative w-full h-56 border border-[#1a1a1a] rounded-xl overflow-hidden bg-black/40">
            <Image 
              src="/images/mpesa_flow.png" 
              alt="M-Pesa Reconciliation Flow Diagram" 
              fill 
              className="object-cover" 
            />
          </div>

          <div className="mt-4 text-[10px] text-[var(--text-muted)] font-mono leading-relaxed">
            API Webhook path: <code className="text-[var(--accent)]">/api/v1/payments/mpesa/callback</code>
          </div>
        </div>

        {/* Technical Specification Box */}
        <div className="lg:col-span-6 glass rounded-2xl p-6 border border-[var(--border)] flex flex-col justify-between space-y-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#151515] border border-[var(--border)] mb-4">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)]" />
              <span className="text-[9px] font-mono uppercase text-white tracking-wider">FIFO ALLOCATION MATRIX</span>
            </div>
            <h3 className="text-2xl font-black uppercase text-white tracking-tighter leading-none mb-3">
              ZERO HUMAN DATA RECONCILIATION
            </h3>
            <p className="text-xs leading-relaxed text-[var(--text-muted)]">
              Manual bank statement audits lead to arithmetic errors and lost hours. Dane PMS replaces standard bookkeeping loops with a state machine that handles unallocated cash, invoice fractional allocations, and refund parameters.
            </p>
          </div>

          <div className="space-y-3 font-mono text-[10px]">
            <div className="flex items-center gap-3 text-white border-b border-[#1a1a1a] pb-2">
              <span className="text-[var(--accent)]">▶</span>
              <span>100% Matching Accuracy on Till & Paybills</span>
            </div>
            <div className="flex items-center gap-3 text-white border-b border-[#1a1a1a] pb-2">
              <span className="text-[var(--accent)]">▶</span>
              <span>Sub-Second SMS/WhatsApp Delivery Trigger</span>
            </div>
            <div className="flex items-center gap-3 text-white border-b border-[#1a1a1a] pb-2">
              <span className="text-[var(--accent)]">▶</span>
              <span>Automated Overpayment Carrying Ledgers</span>
            </div>
          </div>
        </div>
      </div>

      {/* Step by Step HUD Trace */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        {steps.map((s, idx) => (
          <div key={idx} className="glass p-5 rounded-xl border border-[var(--border)] flex flex-col justify-between space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-xs font-mono font-black text-[var(--accent)]">{s.num}</span>
              <span className="text-[8px] font-mono text-[var(--text-muted)]">STAGE {s.num}</span>
            </div>
            <div>
              <h4 className="text-sm font-bold text-white uppercase tracking-tight mb-1">{s.title}</h4>
              <p className="text-[11px] leading-relaxed text-[var(--text-muted)]">{s.desc}</p>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
