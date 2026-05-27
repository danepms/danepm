"use client";

import React from 'react';
import { HelpCircle, ChevronDown, Check, Coins, MessageSquare, ShieldCheck } from 'lucide-react';

export default function PricingTab({ onGoToSignup }: { onGoToSignup: () => void }) {
  const pricingMatrix = [
    { range: "5 - 20 Units", price: "KES 150 / unit / mo", billing: "Billed Monthly" },
    { range: "21 - 50 Units", price: "KES 120 / unit / mo", billing: "Billed Monthly" },
    { range: "51 - 100 Units", price: "KES 100 / unit / mo", billing: "Billed Monthly" },
    { range: "101+ Units", price: "KES 80 / unit / mo", billing: "Custom Enterprise SLA" }
  ];

  const transactionalFees = [
    { channel: "M-PESA C2B Webhook Callback", fee: "1.0% per transaction (capped at KES 150)", settlement: "Instant to your Paybill/Till" },
    { channel: "Paystack Cards & Transfers", fee: "1.5% + KES 100 (local cards)", settlement: "T+1 rolling settlements" },
    { channel: "System SMS Alerts & Queue Dispatches", fee: "KES 0.85 per SMS (wholesale rate)", settlement: "Prepaid wallet credit checks" }
  ];

  return (
    <div className="space-y-6 animate-fade-in font-sans">
      
      {/* Dynamic Tier Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
        
        {/* Flat Rate Pricing Matrix */}
        <div className="lg:col-span-7 glass rounded-2xl p-6 border border-[var(--border)] flex flex-col justify-between space-y-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#151515] border border-[var(--border)] mb-4">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)]" />
              <span className="text-[9px] font-mono uppercase text-white tracking-wider">UNIT BILLING GRID</span>
            </div>
            <h3 className="text-2xl font-black uppercase text-white tracking-tighter leading-none mb-3">
              VOLUME ACCREDITED TIER MATRIX
            </h3>
            <p className="text-xs leading-relaxed text-[var(--text-muted)]">
              No flat entry penalties or hidden support charges. You only pay for active occupied units registered in the database schema. Drafted setup configurations are free.
            </p>
          </div>

          <div className="border border-[var(--border)] rounded-xl overflow-hidden font-mono text-[10px]">
            <div className="grid grid-cols-3 bg-[#0c0c0c] p-3 text-[var(--text-muted)] border-b border-[var(--border)] font-bold">
              <span>UNIT QUANTITY RANGE</span>
              <span>MONTHLY RATE</span>
              <span>BILLING LOOP</span>
            </div>
            {pricingMatrix.map((item, idx) => (
              <div key={idx} className="grid grid-cols-3 p-3 border-b border-[#131313] last:border-b-0 text-white">
                <span className="font-bold">{item.range}</span>
                <span className="text-[var(--accent)]">{item.price}</span>
                <span className="text-[var(--text-muted)]">{item.billing}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Flat Rate Billing Policy info */}
        <div className="lg:col-span-5 glass rounded-2xl p-6 border border-[var(--border)] flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <h4 className="text-xs font-mono uppercase font-black text-white flex items-center gap-2">
              <ShieldCheck size={12} className="text-[var(--accent)]" /> DANE SERVICE SLA POLICY
            </h4>
            <ul className="space-y-3 text-[11px] text-[var(--text-muted)]">
              <li className="flex items-start gap-2">
                <Check size={12} className="text-[var(--accent)] mt-0.5 shrink-0" />
                <span><strong>No Setup Fees:</strong> Free configuration, data imports, Excel migrations, and workspace validation.</span>
              </li>
              <li className="flex items-start gap-2">
                <Check size={12} className="text-[var(--accent)] mt-0.5 shrink-0" />
                <span><strong>Unlimited Caretakers:</strong> Invite unlimited administrators and managers with granular roles.</span>
              </li>
              <li className="flex items-start gap-2">
                <Check size={12} className="text-[var(--accent)] mt-0.5 shrink-0" />
                <span><strong>Free Owner Portals:</strong> Zero cost for read-only landlord logins and analytics tools.</span>
              </li>
            </ul>
          </div>

          <button
            onClick={onGoToSignup}
            className="w-full bg-white text-black font-black uppercase py-3.5 rounded-xl text-[10px] tracking-widest hover:opacity-90 hover:scale-[0.99] transition-all"
          >
            LAUNCH PORTAL SETUP
          </button>
        </div>

      </div>

      {/* Transactional Fee Grid */}
      <div className="glass rounded-2xl p-6 border border-[var(--border)] space-y-4">
        <div>
          <h3 className="text-xs font-mono uppercase font-black text-white mb-2">Transactional Gateway & Messaging Matrix</h3>
          <p className="text-[11px] text-[var(--text-muted)]">All third-party settlement fees are passed through at wholesale cost.</p>
        </div>

        <div className="border border-[var(--border)] rounded-xl overflow-hidden font-mono text-[10px]">
          <div className="grid grid-cols-3 bg-[#0c0c0c] p-3 text-[var(--text-muted)] border-b border-[var(--border)] font-bold">
            <span>GATEWAY / CHANNEL</span>
            <span>TRANSACTION FEE RATE</span>
            <span>DISBURSAL TIMELINE</span>
          </div>
          {transactionalFees.map((fee, idx) => (
            <div key={idx} className="grid grid-cols-3 p-3 border-b border-[#131313] last:border-b-0 text-white">
              <span className="font-bold">{fee.channel}</span>
              <span className="text-[var(--accent)]">{fee.fee}</span>
              <span className="text-[var(--text-muted)]">{fee.settlement}</span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
