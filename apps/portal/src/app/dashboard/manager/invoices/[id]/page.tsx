"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  ArrowLeft, FileText, Download, Send, Printer, 
  CheckCircle2, Clock, AlertCircle, Building2, 
  Home, Users, ChevronRight, Hash, Calendar,
  ShieldCheck, ArrowUpRight, Receipt, Wallet,
  Info, ExternalLink
} from 'lucide-react';
import Link from 'next/link';

// --- SKELETONS ---
const HeaderSkeleton = () => (
  <div className="flex items-center justify-between pb-8 border-b border-[var(--border)] border-opacity-10 animate-pulse">
    <div className="flex items-center gap-4">
      <div className="w-12 h-12 bg-[var(--bg-ghost)] rounded-lg" />
      <div className="space-y-2">
        <div className="w-48 h-6 bg-[var(--bg-ghost)] rounded" />
        <div className="w-32 h-2 bg-[var(--bg-ghost)] rounded" />
      </div>
    </div>
    <div className="w-32 h-12 bg-[var(--bg-ghost)] rounded-xl" />
  </div>
);

const ReceiptSkeleton = () => (
  <div className="glass-card bg-[var(--bg-panel)] border border-[var(--border)] border-opacity-10 p-10 space-y-10 animate-pulse">
    <div className="w-full h-32 bg-[var(--bg-ghost)] rounded-xl" />
    <div className="space-y-4">
      <div className="w-full h-4 bg-[var(--bg-ghost)] rounded" />
      <div className="w-full h-4 bg-[var(--bg-ghost)] rounded" />
      <div className="w-3/4 h-4 bg-[var(--bg-ghost)] rounded" />
    </div>
  </div>
);

export default function InvoiceDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  // Simulate loading
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 600);
    return () => clearTimeout(timer);
  }, []);

  const invoiceData = {
    id: id || 'INV-002',
    tenant: 'Sarah Wambui',
    tenantId: 't-789',
    property: 'Test Towers',
    propertyId: 'p-456',
    unit: '12B',
    status: 'pending',
    date: '2026-05-01',
    dueDate: '2026-05-05',
    items: [
      { desc: 'Rent Settlement (May 2026)', amount: 45000 },
      { desc: 'Water Consumption (Unit 12B)', amount: 1200 },
      { desc: 'Electricity Service Fee', amount: 3500 },
      { desc: 'Security & Maintenance Fee', amount: 2000 },
    ]
  };

  const total = invoiceData.items.reduce((acc, item) => acc + item.amount, 0);

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8 animate-reveal">
      
      {/* HEADER */}
      {isLoading ? <HeaderSkeleton /> : (
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-8 border-b border-[var(--border)] border-opacity-10">
          <div className="flex items-center gap-6">
            <button 
              onClick={() => router.back()}
              className="p-3 bg-[var(--bg-ghost)] hover:bg-[var(--text-base)] hover:text-[var(--bg-panel)] transition-all rounded-lg"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-3xl font-black uppercase tracking-tighter">Settlement Record</h1>
              <p className="font-mono text-[9px] text-[var(--text-muted)] uppercase font-bold tracking-widest mt-1">
                ID: {invoiceData.id}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
              <button className="p-3 glass-card hover:bg-[var(--bg-ghost)] transition-all rounded-lg border border-[var(--border)] border-opacity-10">
                  <Printer size={18} />
              </button>
              <button className="px-6 py-3 bg-[var(--text-base)] text-[var(--bg-panel)] font-mono text-[10px] font-black uppercase shadow-lg hover:opacity-90 transition-all rounded-lg">
                  Send Reminder
              </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">
        
        {/* MAIN RECEIPT */}
        <div className="lg:col-span-2 space-y-8">
            {isLoading ? <ReceiptSkeleton /> : (
              <div className="glass-card bg-[var(--bg-panel)] border border-[var(--border)] border-opacity-10 p-10 space-y-10 relative">
                  <div className="absolute top-0 right-0 p-6 opacity-5">
                      <Receipt size={120} />
                  </div>

                  {/* AMOUNT BOX */}
                  <div className="space-y-2 border-b border-dashed border-[var(--border)] border-opacity-20 pb-10">
                      <p className="font-mono text-[10px] uppercase text-[var(--text-muted)] font-black tracking-widest">Total Settlement Due</p>
                      <h2 className="text-7xl font-black tracking-tighter leading-none text-[var(--text-base)]">KES {total.toLocaleString()}</h2>
                  </div>

                  {/* INFO GRID */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10 py-2 border-b border-dashed border-[var(--border)] border-opacity-20 pb-10">
                      <div className="space-y-5">
                          <div className="space-y-1">
                              <p className="font-mono text-[8px] uppercase text-[var(--text-muted)] font-black tracking-widest">Resident / Payer</p>
                              <Link href={`/dashboard/manager/tenants/${invoiceData.tenantId}`} className="font-black text-sm uppercase hover:text-[var(--accent-bg)] transition-colors flex items-center gap-2">
                                  <Users size={14} className="opacity-30" />
                                  {invoiceData.tenant}
                              </Link>
                          </div>
                          <div className="space-y-1">
                              <p className="font-mono text-[8px] uppercase text-[var(--text-muted)] font-black tracking-widest">Linked Asset</p>
                              <Link href={`/dashboard/manager/properties/${invoiceData.propertyId}`} className="font-black text-sm uppercase hover:text-[var(--accent-bg)] transition-colors flex items-center gap-2">
                                  <Building2 size={14} className="opacity-30" />
                                  {invoiceData.property} · {invoiceData.unit}
                              </Link>
                          </div>
                      </div>
                      <div className="space-y-5">
                          <div className="space-y-1">
                              <p className="font-mono text-[8px] uppercase text-[var(--text-muted)] font-black tracking-widest">Due Date</p>
                              <p className="font-black text-sm uppercase flex items-center gap-2">
                                  <Calendar size={14} className="opacity-30" />
                                  {new Date(invoiceData.dueDate).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}
                              </p>
                          </div>
                          <div className="space-y-1">
                              <p className="font-mono text-[8px] uppercase text-[var(--text-muted)] font-black tracking-widest">Current Status</p>
                              <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border font-mono text-[9px] font-black uppercase ${
                                invoiceData.status === 'pending' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                              }`}>
                                  {invoiceData.status === 'pending' ? <Clock size={10} /> : <ShieldCheck size={10} />}
                                  {invoiceData.status} Settlement
                              </div>
                          </div>
                      </div>
                  </div>

                  {/* LINE ITEMS */}
                  <div className="space-y-6">
                      <p className="font-mono text-[10px] uppercase text-[var(--text-muted)] font-black tracking-[0.2em]">Service Breakdown</p>
                      <div className="space-y-4">
                          {invoiceData.items.map((item, i) => (
                              <div key={i} className="flex justify-between items-center group">
                                  <div className="flex items-center gap-3">
                                      <div className="w-1 h-1 bg-[var(--border)] group-hover:bg-[var(--accent-bg)] transition-all" />
                                      <span className="font-black text-xs uppercase opacity-70 group-hover:opacity-100">{item.desc}</span>
                                  </div>
                                  <span className="font-mono text-xs font-black">KES {item.amount.toLocaleString()}</span>
                              </div>
                          ))}
                      </div>
                      <div className="pt-6 border-t border-dashed border-[var(--border)] border-opacity-20 flex justify-between items-center">
                          <span className="font-mono text-[10px] font-black uppercase tracking-widest">Final Total</span>
                          <span className="text-2xl font-black">KES {total.toLocaleString()}</span>
                      </div>
                  </div>
              </div>
            )}

            {/* QUICK LINK PANEL */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="glass-card bg-[var(--bg-panel)] border border-[var(--border)] border-opacity-10 p-6 rounded-2xl group hover:border-[var(--accent-bg)] transition-all cursor-pointer">
                    <div className="flex items-center justify-between mb-4">
                        <Wallet size={20} className="text-emerald-500" />
                        <ArrowUpRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <h4 className="font-black text-xs uppercase tracking-tight">Record Payment</h4>
                    <p className="text-[9px] text-[var(--text-muted)] uppercase font-bold mt-1">Manual reconciliation for this invoice</p>
                </div>
                <div className="glass-card bg-[var(--bg-panel)] border border-[var(--border)] border-opacity-10 p-6 rounded-2xl group hover:border-amber-500 transition-all cursor-pointer">
                    <div className="flex items-center justify-between mb-4">
                        <Download size={20} className="text-amber-500" />
                        <ArrowUpRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <h4 className="font-black text-xs uppercase tracking-tight">Export PDF</h4>
                    <p className="text-[9px] text-[var(--text-muted)] uppercase font-bold mt-1">Generate official billing document</p>
                </div>
            </div>
        </div>

        {/* SIDEBAR - SETTLEMENT TIMELINE */}
        <div className="space-y-8">
            <div className="glass-card bg-[var(--bg-panel)] border border-[var(--border)] border-opacity-10 p-8 rounded-2xl space-y-8">
                <div className="flex items-center gap-3 border-b border-[var(--border)] border-opacity-10 pb-4">
                    <Clock size={18} className="text-blue-500" />
                    <h4 className="font-black uppercase tracking-tighter text-xs">Settlement Lifecycle</h4>
                </div>
                
                <div className="space-y-10 relative">
                    <div className="absolute left-[11px] top-2 bottom-2 w-px bg-[var(--border)] border-opacity-20 border-dashed" />
                    
                    {[
                      { label: 'Invoice Generated', date: 'May 1, 2026', time: '10:00 AM', status: 'done', icon: FileText },
                      { label: 'Notice Sent', date: 'May 1, 2026', time: '10:05 AM', status: 'done', icon: Send },
                      { label: 'Resident Viewed', date: 'May 2, 2026', time: '02:30 PM', status: 'done', icon: Users },
                      { label: 'Payment Pending', date: 'Expected May 5', time: '--', status: 'pending', icon: Clock }
                    ].map((step, i) => (
                      <div key={i} className="flex gap-4 relative z-10">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 border ${
                          step.status === 'done' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500' : 'bg-[var(--bg-ghost)] border-[var(--border)] text-[var(--text-muted)]'
                        }`}>
                          {step.status === 'done' ? <CheckCircle2 size={12} /> : <step.icon size={12} />}
                        </div>
                        <div>
                          <p className={`text-[11px] font-black uppercase tracking-tight ${step.status === 'done' ? 'opacity-100' : 'opacity-40'}`}>{step.label}</p>
                          <p className="font-mono text-[8px] text-[var(--text-muted)] uppercase mt-1">
                            {step.date} · {step.time}
                          </p>
                        </div>
                      </div>
                    ))}
                </div>
            </div>

            {/* AUDIT LOG */}
            <div className="bg-[var(--bg-ghost)]/30 border border-[var(--border)] border-opacity-10 p-6 rounded-2xl space-y-4">
                <div className="flex items-center gap-2 opacity-40">
                    <ShieldCheck size={14} />
                    <span className="font-mono text-[8px] uppercase font-black tracking-widest">Audit Chain</span>
                </div>
                <div className="space-y-3">
                    <div className="flex justify-between text-[9px] font-mono">
                        <span className="opacity-40 uppercase">Initiated</span>
                        <span className="font-black">System Auto-Gen</span>
                    </div>
                    <div className="flex justify-between text-[9px] font-mono">
                        <span className="opacity-40 uppercase">Method</span>
                        <span className="font-black">M-PESA STK</span>
                    </div>
                </div>
            </div>
        </div>

      </div>
    </div>
  );
}
