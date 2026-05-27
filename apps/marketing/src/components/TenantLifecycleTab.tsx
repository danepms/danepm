"use client";

import React from 'react';
import Image from 'next/image';
import { Users, FileText, Camera, ShieldAlert } from 'lucide-react';

export default function TenantLifecycleTab() {
  const steps = [
    {
      icon: Users,
      title: "1. Add Tenant Details",
      desc: "Record contact names, phone numbers (used for M-Pesa matching), ID/Passport copies, next-of-kin contacts, and initial arrears balances."
    },
    {
      icon: FileText,
      title: "2. Allocate Unit & Set Rent",
      desc: "Select a vacant residential or commercial unit. Assign the tenant, specify lease dates, and verify the baseline rent/deposit charges."
    },
    {
      icon: Camera,
      title: "3. Move-In Photos Checklist",
      desc: "Upload photo records of key room conditions (walls, sockets, plumbing) during the move-in inspection. These are stored on the tenant profile."
    },
    {
      icon: ShieldAlert,
      title: "4. Vacate & Statement Log",
      desc: "When a tenant moves out, log final inspection photos, deduct repair costs, and generate a printable final balance and deposit refund statement."
    }
  ];

  return (
    <div className="space-y-6 animate-fade-in font-sans">
      
      {/* Narrative grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
        
        {/* Onboarding walkthrough */}
        <div className="lg:col-span-7 glass rounded-2xl p-6 border border-[var(--border)] flex flex-col justify-between space-y-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#151515] border border-[var(--border)] mb-4 font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)]" />
              <span className="text-[9px] uppercase text-white tracking-wider">RESIDENT MANAGER</span>
            </div>
            <h3 className="text-2xl font-black uppercase text-white tracking-tighter leading-none mb-3 font-mono">
              From Move-in to Move-out
            </h3>
            <p className="text-xs leading-relaxed text-[var(--text-muted)]">
              Managing tenant files on spreadsheets leads to disputes and lost documents. Dane keeps all resident records, tenancy timelines, arrears balances, contact cards, and site photographs archived in one secure, searchable directory.
            </p>
          </div>

          <div className="space-y-3 text-[11px] text-[var(--text-muted)]">
            <p><strong>● Digital Move-in Logs:</strong> Ensure caretakers upload key inspection photos before handing over keys, establishing clear evidence of unit conditions.</p>
            <p><strong>● Overdue Reminders:</strong> Set customized notifications. The system prepares pending alerts and nudges tenants when rent is past the grace period.</p>
            <p><strong>● Archiving & History:</strong> Past tenants are cleanly archived. You can always review their final checkout logs, exit statements, and payment history.</p>
          </div>
        </div>

        {/* HUD Visual Panel */}
        <div className="lg:col-span-5 rounded-2xl border border-[var(--border)] bg-[#0d0d0d] p-6 flex flex-col justify-between relative">
          <div className="flex justify-between items-center text-[9px] font-mono text-[var(--text-muted)] mb-4">
            <span>VISUAL CHECKLIST</span>
            <span>TENANT HUD VIEW</span>
          </div>

          <div className="relative w-full h-56 border border-[#1a1a1a] rounded-xl overflow-hidden bg-black/40">
            <Image 
              src="/images/mpesa_flow.png" 
              alt="Tenant lifecycle illustration" 
              fill 
              className="object-cover" 
            />
          </div>

          <div className="mt-4 text-[10px] text-[var(--text-muted)] leading-relaxed font-mono">
            Keeps all tenant records, arrears, next-of-kin listings, and move-out check sheets consolidated.
          </div>
        </div>

      </div>

      {/* Step boxes */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        {steps.map((s, idx) => (
          <div key={idx} className="glass p-5 rounded-xl border border-[var(--border)] flex flex-col justify-between space-y-4">
            <div className="w-10 h-10 rounded-lg bg-[var(--accent-soft)] flex items-center justify-center">
              <s.icon size={18} className="text-[var(--accent)]" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white uppercase tracking-tight mb-1">{s.title}</h4>
              <p className="text-[11px] leading-relaxed text-[var(--text-muted)]">{s.desc}</p>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
