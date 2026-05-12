"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  ArrowLeft, ArrowRightLeft, Wallet, CheckCircle2, 
  Clock, Hash, User, Calendar, Building2, 
  ShieldCheck, ArrowUpRight, MessageSquare, ExternalLink,
  Printer, Download, Home, Receipt, Info, Share2, ChevronRight
} from 'lucide-react';
import Link from 'next/link';

// --- SKELETONS ---
const VoucherSkeleton = () => (
  <div className="glass-card bg-[var(--bg-panel)] border border-[var(--border)] border-opacity-10 p-10 space-y-10 animate-pulse">
    <div className="w-full h-40 bg-[var(--bg-ghost)] rounded-xl" />
    <div className="space-y-6">
      <div className="w-full h-4 bg-[var(--bg-ghost)] rounded" />
      <div className="w-3/4 h-4 bg-[var(--bg-ghost)] rounded" />
    </div>
  </div>
);

export default function ReconciliationDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  // Simulate loading
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 700);
    return () => clearTimeout(timer);
  }, []);

  const settlementData = {
    id: id || 'REC-901',
    amount: 46200,
    method: 'M-PESA',
    reference: 'RFG892KL',
    payer: 'James Kamau',
    payerId: 't-123',
    property: 'Skyline Residentials',
    propertyId: 'p-111',
    unit: 'A4',
    date: '2026-05-08 09:45 AM',
    status: 'verified',
    allocations: [
      { invoice: 'INV-001', desc: 'Rent Settlement (May)', amount: 45000 },
      { invoice: 'INV-002', desc: 'Water (May)', amount: 1200 },
    ]
  };

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8 animate-reveal">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-[var(--border)] border-opacity-10">
        <div className="flex items-center gap-6">
          <button 
            onClick={() => router.back()}
            className="p-3 bg-[var(--bg-ghost)] hover:bg-[var(--text-base)] hover:text-[var(--bg-panel)] transition-all rounded-lg"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-3xl font-black uppercase tracking-tighter text-emerald-500">Settlement Proof</h1>
            <p className="font-mono text-[9px] text-[var(--text-muted)] uppercase font-bold tracking-widest mt-1">
              RECORD ID: {settlementData.id}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
            <button className="p-3 glass-card hover:bg-[var(--bg-ghost)] transition-all rounded-lg border border-[var(--border)] border-opacity-10">
                <Printer size={18} />
            </button>
            <button className="px-6 py-3 bg-[var(--text-base)] text-[var(--bg-panel)] font-mono text-[10px] font-black uppercase shadow-lg hover:opacity-90 transition-all rounded-lg">
                Send Receipt
            </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
        
        {/* MAIN VOUCHER */}
        <div className="lg:col-span-3 space-y-8">
            {isLoading ? <VoucherSkeleton /> : (
              <div className="glass-card bg-[var(--bg-panel)] border border-[var(--border)] border-opacity-10 p-10 space-y-10 relative">
                  <div className="absolute top-0 right-0 p-8 opacity-5">
                      <Wallet size={120} />
                  </div>

                  <div className="space-y-2 border-b border-dashed border-[var(--border)] border-opacity-20 pb-10">
                      <p className="font-mono text-[10px] uppercase text-[var(--text-muted)] font-black tracking-widest">Total Settlement Verified</p>
                      <h2 className="text-6xl font-black tracking-tighter leading-none text-emerald-500">KES {settlementData.amount.toLocaleString()}</h2>
                  </div>

                  {/* DATA GRID */}
                  <div className="grid grid-cols-2 gap-8 py-2 border-b border-dashed border-[var(--border)] border-opacity-20 pb-10">
                      <div className="space-y-5">
                          <div className="space-y-1">
                              <p className="font-mono text-[8px] uppercase text-[var(--text-muted)] font-black tracking-widest">Arrival Method</p>
                              <p className="font-black text-sm uppercase flex items-center gap-2">
                                 <ArrowRightLeft size={14} className="opacity-30" />
                                 {settlementData.method}
                              </p>
                          </div>
                          <div className="space-y-1">
                              <p className="font-mono text-[8px] uppercase text-[var(--text-muted)] font-black tracking-widest">Reference Code</p>
                              <p className="font-mono text-sm font-black uppercase text-blue-500">{settlementData.reference}</p>
                          </div>
                      </div>
                      <div className="space-y-5 text-right">
                          <div className="space-y-1">
                              <p className="font-mono text-[8px] uppercase text-[var(--text-muted)] font-black tracking-widest">Verified Date</p>
                              <p className="font-mono text-xs font-black uppercase">{settlementData.date}</p>
                          </div>
                          <div className="space-y-1">
                              <p className="font-mono text-[8px] uppercase text-[var(--text-muted)] font-black tracking-widest">Verification Status</p>
                              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 font-mono text-[9px] font-black uppercase rounded-md ml-auto">
                                  <ShieldCheck size={10} /> Forensic Verified
                              </div>
                          </div>
                      </div>
                  </div>

                  {/* ALLOCATIONS */}
                  <div className="space-y-6">
                      <p className="font-mono text-[10px] uppercase text-[var(--text-muted)] font-black tracking-[0.2em]">Allocation Ledger</p>
                      <div className="space-y-4">
                          {settlementData.allocations.map((alloc, i) => (
                              <div key={i} className="flex justify-between items-center p-4 bg-[var(--bg-ghost)]/50 border border-[var(--border)] border-opacity-5 rounded-xl group hover:border-[var(--accent-bg)] transition-all">
                                  <div className="space-y-1">
                                      <p className="font-black text-xs uppercase">{alloc.desc}</p>
                                      <Link href={`/dashboard/manager/invoices/${alloc.invoice}`} className="font-mono text-[8px] text-[var(--text-muted)] uppercase tracking-widest hover:text-[var(--accent-bg)] flex items-center gap-1">
                                         INV Path: {alloc.invoice} <ChevronRight size={10} />
                                      </Link>
                                  </div>
                                  <span className="font-mono text-sm font-black text-emerald-500">KES {alloc.amount.toLocaleString()}</span>
                              </div>
                          ))}
                      </div>
                  </div>
              </div>
            )}
        </div>

        {/* SIDEBAR */}
        <div className="lg:col-span-2 space-y-6">
            {/* PAYER PROFILE */}
            <div className="glass-card bg-[var(--bg-panel)] border border-[var(--border)] border-opacity-10 p-8 rounded-2xl space-y-6 shadow-2xl">
                <div className="flex items-center gap-3 border-b border-[var(--border)] border-opacity-10 pb-4">
                    <User size={18} className="text-blue-500" />
                    <h4 className="font-black uppercase tracking-tighter text-xs">Payer Integrity</h4>
                </div>
                <div className="space-y-6">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-[var(--bg-ghost)] rounded-xl flex items-center justify-center font-black text-lg">
                           {settlementData.payer.charAt(0)}
                        </div>
                        <div>
                           <Link href={`/dashboard/manager/tenants/${settlementData.payerId}`} className="font-black text-base uppercase hover:text-[var(--accent-bg)] transition-colors">
                              {settlementData.payer}
                           </Link>
                           <p className="font-mono text-[8px] text-[var(--text-muted)] uppercase tracking-widest font-black">Verified Resident</p>
                        </div>
                    </div>
                    <div className="p-4 bg-[var(--bg-ghost)]/50 rounded-xl space-y-3">
                        <div className="flex items-center gap-3">
                           <Home size={14} className="opacity-40" />
                           <p className="font-black text-[10px] uppercase">{settlementData.property} · {settlementData.unit}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* CONFIRMATION STATUS */}
            <div className="glass-card bg-[var(--bg-panel)] border border-[var(--border)] border-opacity-10 p-6 rounded-2xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <MessageSquare size={18} className="text-emerald-500" />
                    <p className="font-black text-xs uppercase tracking-tight">Receipt Sent</p>
                </div>
                <div className="flex items-center gap-2 font-mono text-[9px] font-black uppercase text-emerald-500">
                   <CheckCircle2 size={12} /> SMS & Email Verified
                </div>
            </div>

            {/* AUDIT LOG */}
            <div className="bg-[var(--bg-ghost)]/30 border border-[var(--border)] border-opacity-10 p-6 rounded-2xl space-y-4">
                <div className="flex items-center gap-2 opacity-40">
                    <ShieldCheck size={14} />
                    <span className="font-mono text-[8px] uppercase font-black tracking-widest">Settlement Audit</span>
                </div>
                <div className="space-y-2">
                    <div className="flex justify-between text-[9px] font-mono">
                        <span className="opacity-40 uppercase">Handled By</span>
                        <span className="font-black">System Terminal</span>
                    </div>
                    <div className="flex justify-between text-[9px] font-mono">
                        <span className="opacity-40 uppercase">Compliance</span>
                        <span className="font-black text-emerald-500">Passed</span>
                    </div>
                </div>
            </div>
        </div>

      </div>
    </div>
  );
}
