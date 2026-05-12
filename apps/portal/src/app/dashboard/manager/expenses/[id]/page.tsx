"use client";

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  ArrowLeft, Receipt, Calendar, Building2, 
  Home, Users, HardHat, ShieldCheck, 
  Download, Image as ImageIcon, ExternalLink,
  Wrench, User, Clock, Hash, MapPin, Printer,
  ChevronRight, AlertCircle, FileText
} from 'lucide-react';
import { api } from '@/lib/api';
import Link from 'next/link';

export default function ExpenseDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (id) {
      api.get<any>(`/maintenance/expenses/${id}`).then(res => {
        if (res.success) setData(res.expense);
        setIsLoading(false);
      }).catch(err => {
        console.error("Fetch failed:", err);
        setIsLoading(false);
      });
    }
  }, [id]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[var(--bg-base)] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-[var(--accent-bg)] border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-20 text-center font-mono text-[10px] uppercase font-black opacity-30">
        Record Not Found
      </div>
    );
  }

  const { expense, propertyName, tenantName, requestTitle, requestDescription } = data;

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-8 animate-reveal">
      
      {/* HEADER - CLEAN & CLICKABLE */}
      <div className="flex items-center justify-between pb-6 border-b border-[var(--border)] border-opacity-10">
        <div className="flex items-center gap-6">
          <button 
            onClick={() => router.back()}
            className="p-3 bg-[var(--bg-ghost)] hover:bg-[var(--text-base)] hover:text-[var(--bg-panel)] transition-all rounded-lg"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-3xl font-black uppercase tracking-tighter">Expense Record</h1>
            <p className="font-mono text-[9px] text-[var(--text-muted)] uppercase font-bold tracking-widest mt-1">
                ID: {expense.id}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
            <button className="p-3 glass-card hover:bg-[var(--bg-ghost)] transition-all rounded-lg">
                <Printer size={18} />
            </button>
            <button className="px-6 py-3 bg-[var(--text-base)] text-[var(--bg-panel)] font-mono text-[10px] font-black uppercase shadow-lg hover:opacity-90 transition-all rounded-lg">
                Export Audit
            </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* MAIN DATA COLUMN */}
        <div className="lg:col-span-2 space-y-8">
            
            {/* THE RECEIPT BOX */}
            <div className="glass-card bg-[var(--bg-panel)] border border-[var(--border)] border-opacity-10 p-8 space-y-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-5">
                    <Receipt size={120} />
                </div>

                <div className="space-y-2 border-b border-dashed border-[var(--border)] border-opacity-20 pb-8">
                    <p className="font-mono text-[10px] uppercase text-[var(--text-muted)] font-black tracking-widest">Total Amount Paid</p>
                    <h2 className="text-6xl font-black tracking-tighter leading-none text-red-500">KES {parseFloat(expense.amount).toLocaleString()}</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-4 border-b border-dashed border-[var(--border)] border-opacity-20 pb-8">
                    <div className="space-y-4">
                        <div className="space-y-1">
                            <p className="font-mono text-[8px] uppercase text-[var(--text-muted)] font-black tracking-widest">Property</p>
                            <Link href={`/dashboard/manager/expenses/property/${expense.propertyId}`} className="font-black text-sm uppercase hover:text-[var(--accent-bg)] transition-colors flex items-center gap-2">
                                <Building2 size={14} className="opacity-30" />
                                {propertyName}
                            </Link>
                        </div>
                        <div className="space-y-1">
                            <p className="font-mono text-[8px] uppercase text-[var(--text-muted)] font-black tracking-widest">Apartment / Unit</p>
                            <Link href={`/dashboard/manager/expenses/unit/${expense.unitId || 'common'}/${expense.propertyId}`} className="font-black text-sm uppercase hover:text-[var(--accent-bg)] transition-colors flex items-center gap-2">
                                <Home size={14} className="opacity-30" />
                                {expense.unitId || 'Common Area'}
                            </Link>
                        </div>
                    </div>
                    <div className="space-y-4">
                        <div className="space-y-1">
                            <p className="font-mono text-[8px] uppercase text-[var(--text-muted)] font-black tracking-widest">Payment Date</p>
                            <p className="font-black text-sm uppercase flex items-center gap-2">
                                <Calendar size={14} className="opacity-30" />
                                {new Date(expense.paidDate || expense.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}
                            </p>
                        </div>
                        <div className="space-y-1">
                            <p className="font-mono text-[8px] uppercase text-[var(--text-muted)] font-black tracking-widest">Status</p>
                            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 font-mono text-[9px] font-black uppercase rounded-md">
                                <ShieldCheck size={10} /> Verified Settlement
                            </div>
                        </div>
                    </div>
                </div>

                {/* MAINTENANCE CONTEXT */}
                {expense.requestId && (
                    <div className="bg-[var(--bg-ghost)]/30 p-6 rounded-xl border border-[var(--border)] border-opacity-10 space-y-4">
                        <div className="flex items-center justify-between border-b border-[var(--border)] border-opacity-10 pb-4">
                            <div className="flex items-center gap-2">
                                <FileText size={16} className="text-amber-500" />
                                <h4 className="font-black uppercase tracking-tighter text-xs">Linked Maintenance Request</h4>
                            </div>
                            <Link href={`/dashboard/manager/maintenance/${expense.requestId}`} className="font-mono text-[9px] font-black uppercase hover:text-[var(--accent-bg)] flex items-center gap-1">
                                View Ticket <ChevronRight size={14} />
                            </Link>
                        </div>
                        <div className="space-y-2">
                            <p className="font-black text-sm uppercase">{requestTitle}</p>
                            <p className="text-[11px] text-[var(--text-muted)] uppercase font-medium line-clamp-3 leading-relaxed">
                                {requestDescription || 'No detailed description provided for this work order.'}
                            </p>
                        </div>
                    </div>
                )}

                {/* DESCRIPTION */}
                <div className="space-y-2 pt-4">
                    <p className="font-mono text-[8px] uppercase text-[var(--text-muted)] font-black tracking-widest">Notes / Description</p>
                    <p className="font-black text-xs uppercase leading-relaxed opacity-80">{expense.description}</p>
                </div>
            </div>

            {/* PEOPLE SECTION */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="glass-card bg-[var(--bg-panel)] border border-[var(--border)] border-opacity-10 p-6 rounded-2xl">
                    <p className="font-mono text-[8px] uppercase text-[var(--text-muted)] font-black tracking-widest mb-4">Resident</p>
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-[var(--bg-ghost)] rounded-lg flex items-center justify-center">
                            <Users size={18} className="opacity-40" />
                        </div>
                        <div>
                            {expense.tenantId ? (
                                <Link href={`/dashboard/manager/expenses/tenant/${expense.tenantId}`} className="font-black text-sm uppercase hover:text-[var(--accent-bg)] transition-colors">
                                    {tenantName}
                                </Link>
                            ) : (
                                <p className="font-black text-sm uppercase opacity-40">No Resident Assigned</p>
                            )}
                            <p className="font-mono text-[8px] opacity-40 uppercase tracking-widest font-black">Audit Path Available</p>
                        </div>
                    </div>
                </div>
                <div className="glass-card bg-[var(--bg-panel)] border border-[var(--border)] border-opacity-10 p-6 rounded-2xl">
                    <p className="font-mono text-[8px] uppercase text-[var(--text-muted)] font-black tracking-widest mb-4">Initiated By</p>
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-[var(--bg-ghost)] rounded-lg flex items-center justify-center">
                            <User size={18} className="opacity-40" />
                        </div>
                        <div>
                            <p className="font-black text-sm uppercase">{expense.initiatedBy}</p>
                            <p className="font-mono text-[8px] opacity-40 uppercase tracking-widest font-black">Record Initiator</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        {/* SIDEBAR */}
        <div className="space-y-6">
            {/* VENDOR CARD */}
            <div className="glass-card bg-[var(--bg-panel)] border border-[var(--border)] border-opacity-10 p-6 rounded-2xl space-y-6">
                <div className="flex items-center gap-3 border-b border-[var(--border)] border-opacity-10 pb-4">
                    <HardHat size={18} className="text-amber-500" />
                    <h4 className="font-black uppercase tracking-tighter text-xs">Vendor Details</h4>
                </div>
                <div className="space-y-4">
                    <div className="space-y-1">
                        <p className="font-mono text-[8px] opacity-40 uppercase tracking-widest font-black">Service Provider</p>
                        <p className="font-black text-sm uppercase">{expense.vendorName || 'Independent Registry'}</p>
                    </div>
                    <div className="space-y-1">
                        <p className="font-mono text-[8px] opacity-40 uppercase tracking-widest font-black">Trade</p>
                        <span className="px-3 py-1 bg-[var(--bg-ghost)] border border-[var(--border)] border-opacity-10 rounded-full font-mono text-[8px] font-black uppercase tracking-widest inline-block">
                            {expense.category}
                        </span>
                    </div>
                    {expense.vendorPhone && (
                        <div className="space-y-1">
                            <p className="font-mono text-[8px] opacity-40 uppercase tracking-widest font-black">Contact</p>
                            <p className="font-mono text-xs font-black">{expense.vendorPhone}</p>
                        </div>
                    )}
                </div>
            </div>

            {/* RECEIPT PREVIEW */}
            <div className="glass-card bg-[var(--bg-panel)] border border-[var(--border)] border-opacity-10 rounded-2xl overflow-hidden">
                <div className="p-4 border-b border-[var(--border)] border-opacity-10 flex items-center justify-between bg-[var(--bg-ghost)]/30">
                    <h4 className="font-black uppercase tracking-tighter text-[9px] opacity-40">Proof of Payment</h4>
                    <ImageIcon size={14} className="opacity-30" />
                </div>
                <div className="p-4">
                    {expense.receipt ? (
                        <div className="relative group border border-[var(--border)] border-opacity-10 rounded-xl overflow-hidden">
                            <img 
                                src={expense.receipt} 
                                alt="Receipt" 
                                className="w-full transition-all duration-500"
                            />
                            <button 
                                onClick={() => window.open(expense.receipt, '_blank')}
                                className="absolute inset-0 flex items-center justify-center bg-[var(--text-base)]/90 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                                <div className="flex items-center gap-2 text-[var(--bg-panel)] font-mono text-[10px] font-black uppercase">
                                    <ExternalLink size={16} /> Open Full Proof
                                </div>
                            </button>
                        </div>
                    ) : (
                        <div className="aspect-square bg-[var(--bg-ghost)]/50 flex flex-col items-center justify-center border border-dashed border-[var(--border)] border-opacity-10 rounded-xl">
                            <ImageIcon size={32} className="opacity-10 mb-4" />
                            <p className="font-mono text-[8px] uppercase font-black opacity-30">No Scan Uploaded</p>
                        </div>
                    )}
                </div>
            </div>

            {/* HISTORY */}
            <div className="bg-[var(--bg-ghost)]/30 border border-[var(--border)] border-opacity-10 p-6 rounded-2xl space-y-4">
                <div className="flex items-center gap-2 opacity-40">
                    <Clock size={14} />
                    <span className="font-mono text-[8px] uppercase font-black tracking-widest">History</span>
                </div>
                <div className="space-y-3">
                    <div className="flex justify-between text-[9px] font-mono">
                        <span className="opacity-40 uppercase">Record Logged</span>
                        <span className="font-black">{new Date(expense.createdAt).toLocaleString()}</span>
                    </div>
                    {expense.paidDate && (
                         <div className="flex justify-between text-[9px] font-mono">
                            <span className="opacity-40 uppercase">Settlement Date</span>
                            <span className="font-black">{new Date(expense.paidDate).toLocaleString()}</span>
                        </div>
                    )}
                </div>
            </div>
        </div>

      </div>
    </div>
  );
}
