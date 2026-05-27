"use client";

import React from 'react';
import { Settings, ClipboardList, ShieldCheck } from 'lucide-react';

export default function OperationsTab() {
  const mockLogs = [
    { action: "RENT_ADJUSTED", target: "Unit B3 - Dane Plaza", details: "Base rate adjusted to KES 25,000" },
    { action: "TENANT_DELETED", target: "Jane Koech", details: "Tenant records cleanly archived" },
    { action: "INVOICE_GENERATED", target: "Batch Invoicing (48 Units)", details: "System auto-invoiced monthly rent" },
    { action: "EXPENSE_RECORDED", target: "Property Maintenance", details: "Plumbing repair logged for KES 4,500" }
  ];

  return (
    <div className="space-y-6 animate-fade-in font-sans">
      
      {/* Narrative grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
        
        {/* Maintenance and Expense tracking */}
        <div className="lg:col-span-7 glass rounded-2xl p-6 border border-[var(--border)] flex flex-col justify-between space-y-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#151515] border border-[var(--border)] mb-4 font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)]" />
              <span className="text-[9px] uppercase text-white tracking-wider">MAINTENANCE & OVERHEADS</span>
            </div>
            <h3 className="text-2xl font-black uppercase text-white tracking-tighter leading-none mb-3 font-mono">
              Track Maintenance, Expenses & Vendors
            </h3>
            <p className="text-xs leading-relaxed text-[var(--text-muted)]">
              Operations go beyond rent collections. Dane allows caretakers to manage day-to-day tickets and expenses, giving you a real-time view of your net yields.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-[#1a1a1a] pt-4 text-xs">
            <div className="space-y-1">
              <h4 className="font-mono uppercase font-black text-white flex items-center gap-1.5">
                ● Maintenance Tickets
              </h4>
              <p className="text-[11px] text-[var(--text-muted)] leading-relaxed">
                Log tenant requests, assign priority (normal, high), upload photo records, and tag them by categories (plumbing, electrical, structural).
              </p>
            </div>
            <div className="space-y-1">
              <h4 className="font-mono uppercase font-black text-white flex items-center gap-1.5">
                ● Vendor Directory
              </h4>
              <p className="text-[11px] text-[var(--text-muted)] leading-relaxed">
                Keep contact cards for your local technicians (electricians, painters). Log their phone numbers, specialties, and service ratings.
              </p>
            </div>
          </div>
        </div>

        {/* Audit Log View Card */}
        <div className="lg:col-span-5 glass rounded-2xl p-6 border border-[var(--border)] flex flex-col justify-between space-y-4">
          <div>
            <h4 className="text-xs font-mono uppercase font-black text-white flex items-center gap-2">
              <ShieldCheck size={12} className="text-[var(--accent)]" /> AUDIT & SYSTEM GOVERNANCE
            </h4>
            <p className="text-[11px] text-[var(--text-muted)]">Every administrative action is recorded to prevent fraud or unauthorized edits:</p>
          </div>

          <div className="border border-[var(--border)] rounded-xl overflow-hidden font-mono text-[9px] bg-black/30">
            <div className="grid grid-cols-3 bg-[#0c0c0c] p-2 text-[var(--text-muted)] border-b border-[var(--border)] font-bold">
              <span>ACTION</span>
              <span>TARGET</span>
              <span>SUMMARY</span>
            </div>
            {mockLogs.map((log, idx) => (
              <div key={idx} className="grid grid-cols-3 p-2 border-b border-[#131313] last:border-b-0 text-white">
                <span className="text-[var(--accent)] font-bold">{log.action}</span>
                <span>{log.target}</span>
                <span className="text-[var(--text-muted)]">{log.details}</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Metrics breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="glass p-4 rounded-xl border border-[var(--border)] font-mono text-[10px]">
          <span className="text-[9px] text-[var(--text-muted)] uppercase block mb-1">Expense Tracking</span>
          <div className="text-xs font-bold text-white">Categorized Property Costs</div>
          <span className="text-[9px] text-[var(--text-dim)]">Link repair expenses directly to units and vendor contacts</span>
        </div>
        <div className="glass p-4 rounded-xl border border-[var(--border)] font-mono text-[10px]">
          <span className="text-[9px] text-[var(--text-muted)] uppercase block mb-1">System Heartbeat</span>
          <div className="text-xs font-bold text-white">Active Background Checkers</div>
          <span className="text-[9px] text-[var(--text-dim)]">Validates SMS logs, heartbeats, and overdue bill dispatches daily</span>
        </div>
        <div className="glass p-4 rounded-xl border border-[var(--border)] font-mono text-[10px]">
          <span className="text-[9px] text-[var(--text-muted)] uppercase block mb-1">Landlord Reports</span>
          <div className="text-xs font-bold text-white">Owner Portfolios</div>
          <span className="text-[9px] text-[var(--text-dim)]">Share live occupancy rates and expense ratios with property owners</span>
        </div>
      </div>

    </div>
  );
}
