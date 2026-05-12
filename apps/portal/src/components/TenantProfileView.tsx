"use client";

import React, { useState, useRef } from 'react';
import { 
  UserCircle, Building2, Calendar, CreditCard, History, 
  Mail, ShieldCheck, ChevronRight, ArrowRightLeft, 
  MessageSquare, FileText, Camera, Wrench, AlertCircle, 
  ExternalLink, Download, Clock, MapPin, Phone, Mail as MailIcon,
  CheckCircle2, Plus, Image as ImageIcon, Banknote, Landmark, Upload, X, Menu, Receipt, Eye
} from 'lucide-react';
import { parseConfig } from '@/lib/utils';
import { format } from 'date-fns';
import { api } from '@/lib/api';
import { useToast } from '@/context/ToastContext';

interface TenantProfileViewProps {
  data: {
    tenant: any;
    property: any;
    invoices: any[];
    payments: any[];
    comms: any[];
    history: any[];
    maintenance: any[];
  }
}

export const TenantProfileView = ({ data }: TenantProfileViewProps) => {
  const { tenant, property, invoices, payments, comms, history, maintenance } = data;
  const [activeTab, setActiveTab] = useState('overview');
  const [financialSubTab, setFinancialSubTab] = useState<'invoices' | 'payments'>('invoices');
  const [isReconModalOpen, setIsReconModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
  
  const [reconType, setReconType] = useState<'payment' | 'charge'>('payment');
  const [reconData, setReconData] = useState({ amount: '', method: 'bank', reason: '', proof: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const tabScrollRef = useRef<HTMLDivElement>(null);
  const { showToast } = useToast();

  const totalPaid = (payments || []).reduce((sum, p) => sum + parseFloat(p.amount || '0'), 0);
  const totalInvoiced = (invoices || []).reduce((sum, i) => sum + parseFloat(i.amount || '0'), 0);
  const currentBalance = parseFloat(tenant.arrears || '0');

  const tabs = [
    { id: 'overview', label: 'Identity', icon: UserCircle },
    { id: 'financials', label: 'Financials', icon: CreditCard },
    { id: 'history', label: 'Relocation', icon: ArrowRightLeft },
    { id: 'comms', label: 'Communications', icon: MessageSquare },
    { id: 'assets', label: 'Asset Care', icon: Camera },
  ];

  const resolveUnitName = (unitId: any) => {
    if (!unitId || typeof unitId !== 'string') return 'NONE';
    if (!unitId.startsWith('U_')) return unitId;
    try {
        const config = parseConfig(property?.config);
        const unit = config.units?.find((u: any) => u.id === unitId || u.name === unitId);
        return unit?.name || unitId;
    } catch (e) { return unitId; }
  };

  const parseNextOfKin = (nokString: string) => {
    try {
        if (!nokString) return null;
        if (nokString.startsWith('[') || nokString.startsWith('{')) {
            const parsed = JSON.parse(nokString);
            return Array.isArray(parsed) ? parsed[0] : parsed;
        }
        return { name: nokString, relationship: 'Emergency Contact' };
    } catch (e) { return { name: nokString, relationship: 'Emergency Contact' }; }
  };

  const nok = parseNextOfKin(tenant.nextOfKin);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingFile(true);
    const formData = new FormData();
    formData.append('file', file);
    try {
        const res = await api.post<any>("/system/upload", formData);
        if (res.success) {
            setReconData({ ...reconData, proof: res.url || '' });
            showToast("Proof uploaded", "success");
        } else { showToast("Upload failed", "error"); }
    } catch (err) { showToast("Upload error", "error"); }
    finally { setUploadingFile(false); }
  };

  const handleReconcile = async () => {
    if (!reconData.amount || parseFloat(reconData.amount) <= 0) { showToast("Enter a valid amount", "error"); return; }
    if (!reconData.reason) { showToast("Reason is required", "error"); return; }
    setIsSubmitting(true);
    
    const res = await api.post<any>("/finance/reconcile", {
        tenantId: tenant.id,
        amount: reconData.amount,
        method: reconData.method,
        reference: reconData.reason,
        date: new Date().toISOString(),
        managerId: tenant.managerId,
        allocations: selectedInvoice ? [
            { invoiceId: selectedInvoice.id, amount: parseFloat(reconData.amount) }
        ] : []
    });

    if (res.success) {
        showToast(reconType === 'payment' ? "Payment recorded" : "Charge added", "success");
        setIsReconModalOpen(false);
        window.location.reload();
    } else { showToast(res.error || "Action failed", "error"); }
    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-[var(--bg-page)] text-[var(--text-base)] font-sans animate-reveal pb-20 overflow-x-hidden">
      
      {/* HEADER BANNER */}
      <div className="relative min-h-[340px] lg:h-72 w-full overflow-hidden border-b border-[var(--border)] border-opacity-10">
        <div className="absolute inset-0 bg-gradient-to-r from-[var(--accent-bg)]/10 to-transparent z-10" />
        <div className="absolute inset-0 bg-[var(--bg-page)]/60 backdrop-blur-[2px] z-10" />
        <div className="absolute inset-0 flex items-center p-6 lg:p-12 z-20">
          <div className="flex flex-col lg:flex-row lg:items-center gap-8 w-full max-w-7xl mx-auto">
             
             <div className="flex items-center gap-6">
                 <div className="w-24 h-24 lg:w-32 lg:h-32 rounded-3xl bg-[var(--bg-panel)] border border-[var(--border)] border-opacity-10 p-1 relative shadow-2xl shrink-0">
                    <div className="w-full h-full rounded-2xl bg-gradient-to-br from-[var(--text-base)]/5 to-transparent flex items-center justify-center overflow-hidden">
                       {tenant.moveInPhotos ? (
                          <img src={JSON.parse(tenant.moveInPhotos)[0]} alt={tenant.name} className="w-full h-full object-cover" />
                       ) : (
                          <UserCircle size={64} className="opacity-20" />
                       )}
                    </div>
                    <div className="absolute -top-2 -right-2 bg-green-500 text-white p-1.5 lg:p-2 rounded-xl shadow-lg">
                        <ShieldCheck size={14} />
                    </div>
                 </div>

                 <div className="lg:hidden text-left">
                    <h1 className="text-3xl font-black uppercase tracking-tighter leading-tight">{tenant.name}</h1>
                    <div className="mt-1 flex items-center gap-2">
                        <span className={`px-3 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest ${tenant.status === 'active' ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'}`}>
                            {tenant.status}
                        </span>
                    </div>
                 </div>
             </div>
             
             <div className="flex-1 hidden lg:block">
                <div className="flex items-center gap-4 text-left">
                    <h1 className="text-6xl font-black uppercase tracking-tighter leading-none">{tenant.name}</h1>
                    <span className={`px-4 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${tenant.status === 'active' ? 'bg-green-500/20 text-green-500 border border-green-500/30' : 'bg-red-500/20 text-red-500 border border-red-500/30'}`}>
                        {tenant.status}
                    </span>
                </div>
                <div className="flex items-center gap-8 mt-6">
                    <div className="flex items-center gap-2 opacity-40 font-mono text-[10px] uppercase font-black">
                        <MapPin size={14} className="text-[var(--accent-bg)]" /> {property?.name} — {resolveUnitName(tenant.unitId)}
                    </div>
                    <div className="flex items-center gap-2 opacity-40 font-mono text-[10px] uppercase font-black">
                        <Calendar size={14} className="text-[var(--accent-bg)]" /> Joined {tenant.createdAt ? format(new Date(tenant.createdAt), 'MMM yyyy') : 'N/A'}
                    </div>
                </div>
             </div>

             <div className="flex gap-4 w-full lg:w-auto">
                <div className="bg-[var(--bg-panel)] backdrop-blur-md border border-[var(--border)] border-opacity-10 p-6 rounded-2xl text-center flex-1 lg:min-w-[200px] shadow-xl">
                    <p className="text-[9px] font-black uppercase opacity-40 tracking-widest mb-1">Arrears Balance</p>
                    <p className={`text-2xl lg:text-3xl font-black tracking-tighter ${currentBalance > 0 ? 'text-red-500' : 'text-green-500'}`}>
                        KES {currentBalance.toLocaleString()}
                    </p>
                </div>
             </div>

             <div className="lg:hidden space-y-2 pt-4 border-t border-white/5 w-full text-left">
                <div className="flex items-center gap-2 opacity-40 font-mono text-[10px] uppercase font-black">
                    <MapPin size={14} className="text-[var(--accent-bg)]" /> {property?.name} — {resolveUnitName(tenant.unitId)}
                </div>
                <div className="flex items-center gap-2 opacity-40 font-mono text-[10px] uppercase font-black">
                    <Calendar size={14} className="text-[var(--accent-bg)]" /> Joined {tenant.createdAt ? format(new Date(tenant.createdAt), 'MMM yyyy') : 'N/A'}
                </div>
             </div>
          </div>
        </div>
      </div>

      {/* CONTENT GRID */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-12 py-8 lg:py-12 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
        
        <div className="col-span-1 lg:col-span-3 space-y-6 lg:space-y-8">
            <div className="bg-[var(--bg-panel)] border border-[var(--border)] border-opacity-5 p-6 lg:p-8 rounded-3xl space-y-6 lg:space-y-8 shadow-sm">
                <div className="space-y-4">
                    <p className="text-[10px] font-black uppercase opacity-20 tracking-widest">Contact Identity</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-[var(--bg-ghost)] rounded-xl opacity-40 shrink-0"><Phone size={16} /></div>
                            <div>
                                <p className="text-[8px] font-black uppercase opacity-20">Phone</p>
                                <p className="text-xs font-bold">{tenant.phone}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-[var(--bg-ghost)] rounded-xl opacity-40 shrink-0"><MailIcon size={16} /></div>
                            <div className="overflow-hidden">
                                <p className="text-[8px] font-black uppercase opacity-20">Email</p>
                                <p className="text-xs font-bold truncate">{tenant.email}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <button className="w-full py-5 bg-[var(--accent-bg)] text-[var(--accent-text)] rounded-2xl font-black uppercase text-[10px] tracking-widest hover:translate-y-[-2px] transition-all shadow-xl">
                Relocate Resident
            </button>
        </div>

        <div className="col-span-1 lg:col-span-9 space-y-8 lg:space-y-12">
            
            <div className="relative group">
                <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-[var(--bg-page)] to-transparent z-10 pointer-events-none opacity-0 sm:group-hover:opacity-100 transition-opacity" />
                <div 
                    ref={tabScrollRef}
                    className="flex items-center gap-2 p-1 bg-[var(--bg-panel)] border border-[var(--border)] border-opacity-10 rounded-2xl overflow-x-auto no-scrollbar shadow-lg relative scroll-smooth"
                >
                    {tabs.map((tab) => {
                        const Icon = tab.icon;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-3 px-6 lg:px-8 py-3 lg:py-4 rounded-xl text-[9px] lg:text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap shrink-0 ${activeTab === tab.id ? 'bg-[var(--text-base)] text-[var(--bg-panel)] shadow-xl' : 'opacity-40 hover:opacity-100'}`}
                            >
                                <Icon size={14} />
                                {tab.label}
                            </button>
                        );
                    })}
                </div>
                <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-[var(--bg-panel)] to-transparent z-10 pointer-events-none shadow-[inset_-20px_0_20px_-20px_rgba(0,0,0,0.5)] lg:rounded-r-2xl" />
            </div>

            <div className="bg-[var(--bg-panel)] border border-[var(--border)] border-opacity-5 rounded-3xl p-6 lg:p-10 min-h-[600px] shadow-sm">
                
                {activeTab === 'overview' && (
                    <div className="space-y-12">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                            <div className="space-y-6">
                                <h3 className="text-2xl font-black uppercase tracking-tight">Resident Bio</h3>
                                <p className="text-sm opacity-60 leading-relaxed">
                                    {tenant.notes || "No additional notes recorded for this resident."}
                                </p>
                            </div>
                            <div className="space-y-6">
                                <h3 className="text-2xl font-black uppercase tracking-tight">Emergency Contact</h3>
                                <div className="bg-[var(--bg-ghost)] p-6 rounded-2xl border border-[var(--border)] border-opacity-5">
                                    {nok ? (
                                        <div className="space-y-2">
                                            <p className="text-lg font-black">{nok.name}</p>
                                            <div className="flex flex-wrap items-center gap-4 text-[10px] font-bold opacity-40 uppercase">
                                                <span className="flex items-center gap-1"><Phone size={10} /> {nok.phone}</span>
                                                <span className="flex items-center gap-1"><UserCircle size={10} /> {nok.relationship}</span>
                                            </div>
                                        </div>
                                    ) : (
                                        <p className="text-lg font-black opacity-20 uppercase tracking-widest">N/A</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'financials' && (
                    <div className="space-y-12">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 lg:gap-6">
                            <div className="p-6 lg:p-8 bg-[var(--bg-ghost)] border border-[var(--border)] border-opacity-5 rounded-3xl">
                                <p className="text-[9px] font-black uppercase opacity-40 tracking-widest mb-2">Total Invoiced</p>
                                <p className="text-2xl lg:text-3xl font-black tracking-tighter">KES {totalInvoiced.toLocaleString()}</p>
                            </div>
                            <div className="p-6 lg:p-8 bg-green-500/5 border border-green-500/10 rounded-3xl">
                                <p className="text-[9px] font-black uppercase text-green-500/40 tracking-widest mb-2">Total Collected</p>
                                <p className="text-2xl lg:text-3xl font-black tracking-tighter text-green-500">KES {totalPaid.toLocaleString()}</p>
                            </div>
                            <div className="p-6 lg:p-8 bg-red-500/5 border border-red-500/10 rounded-3xl">
                                <p className="text-[9px] font-black uppercase text-red-500/40 tracking-widest mb-2">Arrears</p>
                                <p className="text-2xl lg:text-3xl font-black tracking-tighter text-red-500">KES {currentBalance.toLocaleString()}</p>
                            </div>
                        </div>

                        <div className="space-y-6">
                             <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[var(--bg-ghost)] p-2 rounded-2xl border border-[var(--border)] border-opacity-5">
                                <div className="flex gap-2 w-full sm:w-auto">
                                    <button 
                                        onClick={() => setFinancialSubTab('invoices')}
                                        className={`flex-1 sm:flex-none px-6 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${financialSubTab === 'invoices' ? 'bg-[var(--text-base)] text-[var(--bg-panel)] shadow-lg' : 'opacity-40 hover:opacity-100'}`}
                                    >
                                        Invoices
                                    </button>
                                    <button 
                                        onClick={() => setFinancialSubTab('payments')}
                                        className={`flex-1 sm:flex-none px-6 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${financialSubTab === 'payments' ? 'bg-[var(--text-base)] text-[var(--bg-panel)] shadow-lg' : 'opacity-40 hover:opacity-100'}`}
                                    >
                                        Receipts
                                    </button>
                                </div>
                                <button 
                                    onClick={() => { setSelectedInvoice(null); setReconType('payment'); setIsReconModalOpen(true); }}
                                    className="w-full sm:w-auto px-6 py-3 bg-[var(--accent-bg)] text-[var(--accent-text)] rounded-xl text-[9px] font-black uppercase tracking-widest hover:translate-y-[-2px] transition-all flex items-center justify-center gap-2 shadow-lg"
                                >
                                    <Plus size={14} /> Reconcile
                                </button>
                             </div>

                             {financialSubTab === 'invoices' ? (
                                 <div className="bg-[var(--bg-ghost)] border border-[var(--border)] border-opacity-10 rounded-3xl overflow-x-auto shadow-inner custom-scrollbar">
                                    <table className="w-full text-left font-mono text-[10px] min-w-[600px]">
                                        <thead className="bg-[var(--text-base)]/5 border-b border-[var(--border)] border-opacity-5">
                                            <tr>
                                                <th className="p-6 uppercase font-black tracking-widest opacity-40">Invoice #</th>
                                                <th className="p-6 uppercase font-black tracking-widest opacity-40">Period</th>
                                                <th className="p-6 uppercase font-black tracking-widest opacity-40">Amount</th>
                                                <th className="p-6 uppercase font-black tracking-widest opacity-40">Status</th>
                                                <th className="p-6 text-right uppercase font-black tracking-widest opacity-40">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-[var(--border)] divide-opacity-5">
                                            {(invoices || []).map((inv) => (
                                                <tr key={inv.id} className="hover:bg-[var(--text-base)]/[0.02] transition-colors group">
                                                    <td className="p-6 font-black text-xs opacity-80">{inv.id.substring(0, 8)}</td>
                                                    <td className="p-6 opacity-40 uppercase">{inv.period}</td>
                                                    <td className="p-6 font-black">KES {parseFloat(inv.amount || '0').toLocaleString()}</td>
                                                    <td className="p-6">
                                                        <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase ${inv.status === 'paid' ? 'text-green-500 bg-green-500/10' : 'text-red-500 bg-red-500/10'}`}>
                                                            {inv.status}
                                                        </span>
                                                    </td>
                                                    <td className="p-6 text-right">
                                                        <button 
                                                            onClick={() => { setSelectedInvoice(inv); setReconType('payment'); setIsReconModalOpen(true); }}
                                                            className="p-2 hover:bg-[var(--accent-bg)] hover:text-white rounded-lg opacity-20 group-hover:opacity-100 transition-all inline-flex items-center"
                                                        >
                                                            <CheckCircle2 size={14} />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                 </div>
                             ) : (
                                 <div className="bg-[var(--bg-ghost)] border border-[var(--border)] border-opacity-10 rounded-3xl overflow-x-auto shadow-inner custom-scrollbar">
                                    <table className="w-full text-left font-mono text-[10px] min-w-[700px]">
                                        <thead className="bg-[var(--text-base)]/5 border-b border-[var(--border)] border-opacity-5">
                                            <tr>
                                                <th className="p-6 uppercase font-black tracking-widest opacity-40">Receipt #</th>
                                                <th className="p-6 uppercase font-black tracking-widest opacity-40">Date</th>
                                                <th className="p-6 uppercase font-black tracking-widest opacity-40">Method</th>
                                                <th className="p-6 uppercase font-black tracking-widest opacity-40">Amount</th>
                                                <th className="p-6 uppercase font-black tracking-widest opacity-40">Reason</th>
                                                <th className="p-6 text-right uppercase font-black tracking-widest opacity-40">Proof</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-[var(--border)] divide-opacity-5">
                                            {(payments || []).map((pay) => (
                                                <tr key={pay.id} className="hover:bg-[var(--text-base)]/[0.02] transition-colors group">
                                                    <td className="p-6 font-black text-xs opacity-80">{pay.id.substring(0, 8)}</td>
                                                    <td className="p-6 opacity-40 uppercase">{pay.recordedAt ? format(new Date(pay.recordedAt), 'PP') : 'N/A'}</td>
                                                    <td className="p-6">
                                                        <div className="flex items-center gap-2">
                                                            {pay.method === 'bank' ? <Landmark size={12} className="opacity-40" /> : <Banknote size={12} className="opacity-40" />}
                                                            <span className="uppercase font-black">{pay.method}</span>
                                                        </div>
                                                    </td>
                                                    <td className="p-6 font-black text-green-500">KES {parseFloat(pay.amount || '0').toLocaleString()}</td>
                                                    <td className="p-6 opacity-60 truncate max-w-[150px]">{pay.reference || "Payment Reconciliation"}</td>
                                                    <td className="p-6 text-right">
                                                        {pay.notes?.startsWith('http') ? (
                                                            <a href={pay.notes} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 p-2 bg-[var(--text-base)] text-[var(--bg-panel)] rounded-lg hover:bg-[var(--accent-bg)] transition-all">
                                                                <Eye size={14} />
                                                            </a>
                                                        ) : (
                                                            <span className="opacity-20 italic">No File</span>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                            {(payments || []).length === 0 && (
                                                <tr>
                                                    <td colSpan={6} className="p-20 text-center opacity-20 uppercase font-black tracking-[0.2em]">No receipts found</td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                 </div>
                             )}
                        </div>
                    </div>
                )}
            </div>
        </div>
      </div>

      {/* RECON MODAL */}
      {isReconModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-8 overflow-y-auto">
            <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setIsReconModalOpen(false)} />
            <div className="relative w-full max-w-xl bg-[var(--bg-panel)] border border-[var(--border)] border-opacity-10 rounded-3xl p-6 lg:p-10 shadow-2xl animate-reveal-up my-auto">
                <div className="flex justify-between items-start mb-8 lg:mb-10">
                    <div>
                        <h2 className="text-2xl lg:text-3xl font-black uppercase tracking-tighter">Reconcile</h2>
                        <div className="flex flex-wrap gap-2 mt-4">
                            <button onClick={() => setReconType('payment')} className={`px-4 py-1.5 rounded-full text-[8px] font-black uppercase tracking-widest transition-all ${reconType === 'payment' ? 'bg-green-500 text-white' : 'bg-[var(--bg-ghost)] opacity-40'}`}>Received</button>
                            <button onClick={() => setReconType('charge')} className={`px-4 py-1.5 rounded-full text-[8px] font-black uppercase tracking-widest transition-all ${reconType === 'charge' ? 'bg-red-500 text-white' : 'bg-[var(--bg-ghost)] opacity-40'}`}>Add Charge</button>
                        </div>
                    </div>
                    <button onClick={() => setIsReconModalOpen(false)} className="p-2 hover:bg-[var(--bg-ghost)] rounded-xl opacity-20"><X size={20} /></button>
                </div>

                <div className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-[9px] font-black uppercase tracking-widest opacity-40 ml-1">Amount (KES)</label>
                        <input type="number" value={reconData.amount} onChange={(e) => setReconData({ ...reconData, amount: e.target.value })} placeholder="0.00" className="w-full bg-[var(--bg-ghost)] border border-[var(--border)] border-opacity-10 p-5 rounded-2xl text-2xl font-black focus:border-[var(--accent-bg)] outline-none transition-all shadow-inner" />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[9px] font-black uppercase tracking-widest opacity-40 ml-1">Description</label>
                        <input type="text" value={reconData.reason} onChange={(e) => setReconData({ ...reconData, reason: e.target.value })} placeholder="Reason for this entry..." className="w-full bg-[var(--bg-ghost)] border border-[var(--border)] border-opacity-10 p-4 rounded-xl text-xs font-bold outline-none" />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[9px] font-black uppercase tracking-widest opacity-40 ml-1">Evidence / Proof</label>
                        <div onClick={() => fileInputRef.current?.click()} className="w-full border-2 border-dashed border-[var(--border)] border-opacity-10 rounded-2xl p-6 flex flex-col items-center justify-center gap-2 hover:border-[var(--accent-bg)] hover:bg-[var(--accent-bg)]/5 transition-all cursor-pointer group">
                            {uploadingFile ? <Clock className="animate-spin text-[var(--accent-bg)]" /> : reconData.proof ? <CheckCircle2 className="text-green-500" /> : <Upload size={20} className="opacity-20" />}
                            <p className="text-[8px] font-black uppercase opacity-30">{reconData.proof ? "Verified" : "Upload Evidence"}</p>
                            <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" accept="image/*,application/pdf" />
                        </div>
                    </div>
                    <button onClick={handleReconcile} disabled={isSubmitting || uploadingFile} className="w-full py-5 bg-[var(--accent-bg)] text-[var(--accent-text)] rounded-2xl font-black uppercase text-[10px] tracking-widest hover:translate-y-[-1px] transition-all shadow-xl flex items-center justify-center gap-4 disabled:opacity-50">
                        {isSubmitting ? <Clock className="animate-spin" size={16} /> : <CheckCircle2 size={16} />}
                        Complete Reconciliation
                    </button>
                </div>
            </div>
          </div>
      )}

      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
};
