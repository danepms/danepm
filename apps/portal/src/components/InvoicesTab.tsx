"use client";

import React, { useState, useEffect } from 'react';
import { Receipt, Plus, ChevronDown, ChevronRight, CreditCard, Clock, CheckCircle2, AlertCircle, X, Loader2, Calendar, DollarSign } from 'lucide-react';
import { api } from '@/lib/api';

const STATUS_STYLES: Record<string, string> = {
  paid: 'bg-green-500/10 text-green-600 border-green-500/20',
  partial: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20',
  unpaid: 'bg-red-500/10 text-red-600 border-red-500/20',
  overdue: 'bg-red-600/10 text-red-700 border-red-600/30',
};

export const InvoicesTab = ({ managerId, properties }: { managerId: string; properties: any[] }) => {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [lastGenerated, setLastGenerated] = useState<any>(null);

  // Filters
  const [statusFilter, setStatusFilter] = useState('');
  const [periodFilter, setPeriodFilter] = useState('');

  // Modals
  const [showGenerate, setShowGenerate] = useState(false);
  const [generateTarget, setGenerateTarget] = useState<'property' | 'tenant'>('property');
  const [selectedProperty, setSelectedProperty] = useState('');
  const [selectedTenant, setSelectedTenant] = useState('');
  const [generatePeriod, setGeneratePeriod] = useState(new Date().toISOString().slice(0, 7));
  const [isGenerating, setIsGenerating] = useState(false);
  const [generateResult, setGenerateResult] = useState<any>(null);

  const [showManualInvoice, setShowManualInvoice] = useState(false);
  const [manualData, setManualData] = useState({
    tenantId: '',
    propertyId: '',
    period: new Date().toISOString().slice(0, 7),
    amount: '',
    type: 'rent',
    description: '',
    dueDate: ''
  });
  const [isCreatingManual, setIsCreatingManual] = useState(false);

  const [payingInvoice, setPayingInvoice] = useState<any>(null);
  const [paymentData, setPaymentData] = useState({ amount: '', method: 'mpesa', reference: '', notes: '' });
  const [isRecording, setIsRecording] = useState(false);

  const [expandedInvoice, setExpandedInvoice] = useState<string | null>(null);
  const [invoicePayments, setInvoicePayments] = useState<any[]>([]);

  const [viewingLedger, setViewingLedger] = useState<any>(null);
  const [ledgerData, setLedgerData] = useState<any>(null);
  const [isLedgerLoading, setIsLedgerLoading] = useState(false);

  const [tenants, setTenants] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  const [summary, setSummary] = useState<any>(null);
  const [isStatsLoading, setIsStatsLoading] = useState(true);

  const fetchInvoices = async (p: number) => {
    setIsLoading(true);
    const filters: any = {};
    if (statusFilter) filters.status = statusFilter;
    if (periodFilter) filters.period = periodFilter;
    const res = await api.get<any>(`/finance/invoices?managerId=${managerId}&page=${p}&status=${filters.status || ''}&period=${filters.period || ''}`);
    if (res.success) {
      setInvoices(res.invoices || []);
      setHasMore(res.hasMore || false);
      setTotal(res.total as any || 0);
      setLastGenerated(res.lastGenerated);
      setPage(p);
    }
    setIsLoading(false);
  };

  const fetchSummary = async () => {
    setIsStatsLoading(true);
    const res = await api.get<any>(`/finance/reconciliation-summary?managerId=${managerId}`);
    if (res.success) setSummary(res.summary);
    setIsStatsLoading(false);
  };

  useEffect(() => { 
    fetchInvoices(1); 
    fetchSummary();
  }, [statusFilter, periodFilter, managerId]);

  const fetchTenants = async () => {
    const res = await api.get<any>(`/tenants?managerId=${managerId}&limit=100`);
    if (res.success) setTenants(res.tenants || []);
  };

  useEffect(() => { if (showGenerate || showManualInvoice) fetchTenants(); }, [showGenerate, showManualInvoice]);

  const handleGenerate = async () => {
    setIsGenerating(true);
    setGenerateResult(null);
    const res = await api.post<any>("/finance/generate-invoices", { 
      managerId, 
      period: generatePeriod,
      propertyId: generateTarget === 'property' ? selectedProperty : undefined,
      tenantId: generateTarget === 'tenant' ? selectedTenant : undefined
    });
    if (res.success) {
      setGenerateResult(res);
      fetchInvoices(1);
      fetchSummary();
    }
    setIsGenerating(false);
  };

  const handleCreateManual = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreatingManual(true);
    const res = await api.post<any>("/finance/create-invoice", {
      ...manualData,
      managerId
    });
    if (res.success) {
      setShowManualInvoice(false);
      setManualData({
        tenantId: '',
        propertyId: '',
        period: new Date().toISOString().slice(0, 7),
        amount: '',
        type: 'rent',
        description: '',
        dueDate: ''
      });
      fetchInvoices(1);
      fetchSummary();
    }
    setIsCreatingManual(false);
  };

  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!payingInvoice) return;
    setIsRecording(true);
    const res = await api.post<any>("/finance/reconcile", {
      invoiceId: payingInvoice.id,
      tenantId: payingInvoice.tenantId,
      managerId,
      amount: paymentData.amount,
      method: paymentData.method,
      reference: paymentData.reference,
      notes: paymentData.notes,
    });
    if (res.success) {
      setPayingInvoice(null);
      setPaymentData({ amount: '', method: 'mpesa', reference: '', notes: '' });
      fetchInvoices(page);
      fetchSummary();
    }
    setIsRecording(false);
  };

  const fetchLedger = async (tenantId: string) => {
    setIsLedgerLoading(true);
    const res = await api.get<any>(`/finance/tenant-ledger?tenantId=${tenantId}&managerId=${managerId}`);
    if (res.success) setLedgerData(res);
    setIsLedgerLoading(false);
  };

  const handleExpandInvoice = async (inv: any) => {
    if (expandedInvoice === inv.id) {
      setExpandedInvoice(null);
      return;
    }
    setExpandedInvoice(inv.id);
    const res = await api.get<any>(`/finance/invoices/${inv.id}/payments`);
    if (res.success) setInvoicePayments(res.payments || []);
  };

  const formatDate = (d: any) => d ? new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';
  const formatPeriod = (p: string) => {
    try { return new Date(p + '-01').toLocaleDateString('en-US', { month: 'long', year: 'numeric' }); } catch { return p; }
  };

  const filteredTenants = tenants.filter(t => 
    t.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    t.phone.includes(searchTerm)
  );

  return (
    <div className="space-y-10 animate-reveal">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="text-5xl font-black uppercase tracking-tighter leading-none">Invoices</h2>
          <p className="font-mono text-[10px] text-[var(--text-muted)] uppercase font-bold tracking-[0.2em] mt-3">
            Revenue Terminal :: Fiscal Period {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => { setShowGenerate(true); setGenerateResult(null); }}
            className="border border-[var(--border)] border-opacity-20 px-6 py-4 font-mono text-[11px] uppercase font-black hover:bg-[var(--bg-ghost)] transition-all rounded-xl"
          >
            Bulk Generation
          </button>
          <button
            onClick={() => setShowManualInvoice(true)}
            className="bg-[var(--text-base)] text-[var(--bg-panel)] px-8 py-4 font-mono text-[11px] uppercase font-black hover:translate-y-[-2px] active:translate-y-0 transition-all flex items-center gap-3 shadow-[8px_8px_0px_0px_var(--shadow-color)] rounded-xl"
          >
            <Plus size={16} /> Create Invoice
          </button>
        </div>
      </div>

      {/* STATS STRIP */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Billed', value: summary?.expected || 0, color: 'text-[var(--text-base)]' },
          { label: 'Collected', value: summary?.collected || 0, color: 'text-emerald-500' },
          { label: 'Outstanding', value: summary?.outstanding || 0, color: 'text-red-500' },
          { label: 'Collection Rate', value: `${summary?.collectionRate || 0}%`, color: 'text-amber-500' }
        ].map((stat, i) => (
          <div key={i} className="bg-[var(--bg-panel)] border border-[var(--border)] border-opacity-10 p-6 rounded-2xl shadow-[4px_4px_0px_0px_var(--shadow-color)]">
             <p className="font-mono text-[8px] uppercase text-[var(--text-muted)] font-black tracking-widest mb-2 flex items-center gap-2">
                <Calendar size={10} /> {stat.label}
             </p>
             <h3 className={`text-2xl font-black tracking-tighter ${stat.color}`}>
                {isStatsLoading ? '...' : (typeof stat.value === 'number' ? `KES ${stat.value.toLocaleString()}` : stat.value)}
             </h3>
          </div>
        ))}
      </div>

      {/* FILTERS */}
      <div className="flex flex-wrap gap-3">
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="bg-[var(--bg-panel)] border border-[var(--border)] border-opacity-10 px-4 py-2.5 rounded-xl font-mono text-[10px] font-black uppercase outline-none appearance-none">
          <option value="">All Status</option>
          <option value="unpaid">Unpaid</option>
          <option value="partial">Partial</option>
          <option value="paid">Paid</option>
        </select>
        <input type="month" value={periodFilter} onChange={e => setPeriodFilter(e.target.value)} className="bg-[var(--bg-panel)] border border-[var(--border)] border-opacity-10 px-4 py-2.5 rounded-xl font-mono text-[10px] font-black outline-none" placeholder="Filter by month" />
        {(statusFilter || periodFilter) && (
          <button onClick={() => { setStatusFilter(''); setPeriodFilter(''); }} className="px-4 py-2.5 text-red-500 font-mono text-[10px] font-black uppercase hover:bg-red-500/10 rounded-xl transition-all">Clear</button>
        )}
        <div className="ml-auto font-mono text-[10px] font-black opacity-30 self-center">{total} invoice{total !== 1 ? 's' : ''}</div>
      </div>

      {/* TABLE */}
      <div className="bg-[var(--bg-panel)] border border-[var(--border)] border-opacity-10 rounded-2xl shadow-[8px_8px_0px_0px_var(--shadow-color)] overflow-hidden">
        <table className="w-full text-left font-mono text-[10px]">
          <thead className="bg-[var(--bg-ghost)] border-b border-[var(--border)] border-opacity-10">
            <tr>
              <th className="p-5 uppercase font-black tracking-widest opacity-50">Tenant</th>
              <th className="p-5 uppercase font-black tracking-widest opacity-50">Period</th>
              <th className="p-5 uppercase font-black tracking-widest opacity-50">Type</th>
              <th className="p-5 uppercase font-black tracking-widest opacity-50">Amount</th>
              <th className="p-5 uppercase font-black tracking-widest opacity-50">Balance</th>
              <th className="p-5 uppercase font-black tracking-widest opacity-50">Status</th>
              <th className="p-5 uppercase font-black tracking-widest opacity-50 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border)] divide-opacity-5">
            {isLoading ? (
              <tr><td colSpan={7} className="p-16 text-center uppercase font-black opacity-20">Loading invoices...</td></tr>
            ) : invoices.length === 0 ? (
              <tr><td colSpan={7} className="p-16 text-center uppercase font-black opacity-20">No invoices found. Generate some above!</td></tr>
            ) : invoices.map((inv) => (
              <React.Fragment key={inv.id}>
                <tr className="hover:bg-[var(--bg-ghost)] transition-colors cursor-pointer" onClick={() => handleExpandInvoice(inv)}>
                  <td className="p-5">
                    <div className="font-black text-xs tracking-tight">{inv.tenantName}</div>
                    <div className="text-[8px] opacity-40 mt-0.5">{inv.propertyName} · {inv.unitId}</div>
                  </td>
                  <td className="p-5 font-bold opacity-70">{formatPeriod(inv.period)}</td>
                  <td className="p-5 uppercase font-black opacity-40">{inv.type || 'rent'}</td>
                  <td className="p-5 font-black">KES {parseFloat(inv.amount).toLocaleString()}</td>
                  <td className="p-5 font-black text-red-500">KES {parseFloat(inv.balance).toLocaleString()}</td>
                  <td className="p-5">
                    <span className={`px-3 py-1 rounded-full text-[8px] uppercase font-black border ${STATUS_STYLES[inv.status] || ''}`}>
                      {inv.status}
                    </span>
                  </td>
                  <td className="p-5 text-right space-x-2">
                    <button
                      onClick={(e) => { e.stopPropagation(); setViewingLedger(inv.tenantId); fetchLedger(inv.tenantId); }}
                      className="px-3 py-1.5 border border-[var(--border)] border-opacity-10 rounded-lg font-black text-[8px] uppercase hover:bg-[var(--text-base)] hover:text-[var(--bg-panel)] transition-all"
                    >
                      Ledger
                    </button>
                    {inv.status !== 'paid' && (
                      <button
                        onClick={(e) => { e.stopPropagation(); setPayingInvoice(inv); setPaymentData({ ...paymentData, amount: inv.balance }); }}
                        className="px-3 py-1.5 bg-green-500/10 text-green-600 border border-green-500/20 rounded-lg font-black text-[8px] uppercase hover:bg-green-500 hover:text-white transition-all"
                      >
                        Pay
                      </button>
                    )}
                  </td>
                </tr>
                {/* Expanded detail */}
                {expandedInvoice === inv.id && (
                  <tr>
                    <td colSpan={7} className="bg-[var(--bg-ghost)] p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <span className="font-mono text-[8px] font-black uppercase opacity-40">Payment History</span>
                        <div className="flex-1 h-px bg-[var(--border)] opacity-10" />
                      </div>
                      {invoicePayments.length === 0 ? (
                        <p className="font-mono text-[9px] opacity-30 italic">No payments recorded yet</p>
                      ) : (
                        <div className="space-y-2">
                          {invoicePayments.map((p: any) => (
                            <div key={p.id} className="flex items-center justify-between bg-[var(--bg-panel)] px-4 py-3 rounded-xl border border-[var(--border)] border-opacity-5">
                              <div className="flex items-center gap-4">
                                <CheckCircle2 size={14} className="text-green-500" />
                                <div>
                                  <span className="font-mono text-[10px] font-black">KES {parseFloat(p.amount).toLocaleString()}</span>
                                  <span className="font-mono text-[8px] opacity-40 ml-3">{p.method?.toUpperCase()}</span>
                                  {p.reference && <span className="font-mono text-[8px] opacity-30 ml-2">Ref: {p.reference}</span>}
                                </div>
                              </div>
                              <span className="font-mono text-[8px] opacity-40">{formatDate(p.recordedAt)}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>

        {/* Pagination */}
        <div className="p-5 bg-[var(--bg-ghost)] border-t border-[var(--border)] border-opacity-10 flex items-center justify-between">
          <span className="font-black uppercase tracking-widest text-[8px] opacity-50">Page {page}</span>
          <div className="flex gap-3">
            <button disabled={page === 1} onClick={() => fetchInvoices(page - 1)} className="px-5 py-2 border border-[var(--border)] border-opacity-10 rounded-lg font-black uppercase tracking-widest text-[8px] disabled:opacity-10 hover:bg-[var(--text-base)] hover:text-[var(--bg-panel)] transition-all">Prev</button>
            <button disabled={!hasMore} onClick={() => fetchInvoices(page + 1)} className="px-5 py-2 border border-[var(--border)] border-opacity-10 rounded-lg font-black uppercase tracking-widest text-[8px] disabled:opacity-10 hover:bg-[var(--text-base)] hover:text-[var(--bg-panel)] transition-all">Next</button>
          </div>
        </div>
      </div>

      {/* GENERATE MODAL */}
      {showGenerate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 backdrop-blur-xl bg-[var(--bg-base)] bg-opacity-80 animate-reveal">
          <div className="bg-[var(--bg-panel)] border border-[var(--border)] border-opacity-20 w-full max-w-lg rounded-3xl shadow-[32px_32px_0px_0px_var(--shadow-color)] overflow-hidden">
            <div className="p-8 border-b border-[var(--border)] border-opacity-10 flex justify-between items-center">
              <h3 className="text-2xl font-black uppercase tracking-tighter">Bulk Generate</h3>
              <button onClick={() => setShowGenerate(false)}><X size={20} /></button>
            </div>
            <div className="p-10 space-y-6">
              <div className="flex gap-2 p-1 bg-[var(--bg-ghost)] rounded-xl">
                <button onClick={() => setGenerateTarget('property')} className={`flex-1 py-3 rounded-lg font-mono text-[9px] uppercase font-black transition-all ${generateTarget === 'property' ? 'bg-[var(--text-base)] text-[var(--bg-panel)]' : 'opacity-40'}`}>Entire Property</button>
                <button onClick={() => setGenerateTarget('tenant')} className={`flex-1 py-3 rounded-lg font-mono text-[9px] uppercase font-black transition-all ${generateTarget === 'tenant' ? 'bg-[var(--text-base)] text-[var(--bg-panel)]' : 'opacity-40'}`}>Single Person</button>
              </div>

              <div className="space-y-3">
                <label className="font-mono text-[8px] uppercase text-[var(--text-muted)] font-black tracking-widest">Billing Period</label>
                <input type="month" value={generatePeriod} onChange={e => setGeneratePeriod(e.target.value)} className="w-full bg-[var(--bg-input)] border border-[var(--border)] border-opacity-10 p-5 rounded-2xl font-mono text-sm font-black outline-none" />
              </div>

              {generateTarget === 'property' ? (
                <div className="space-y-3">
                  <label className="font-mono text-[8px] uppercase text-[var(--text-muted)] font-black tracking-widest">Select Property</label>
                  <select value={selectedProperty} onChange={e => setSelectedProperty(e.target.value)} className="w-full bg-[var(--bg-input)] border border-[var(--border)] border-opacity-10 p-5 rounded-2xl font-mono text-xs font-black outline-none appearance-none">
                    <option value="">All Properties</option>
                    {properties.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </div>
              ) : (
                <div className="space-y-3">
                  <label className="font-mono text-[8px] uppercase text-[var(--text-muted)] font-black tracking-widest">Search Tenant</label>
                  <input type="text" placeholder="Name or Phone..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full bg-[var(--bg-input)] border border-[var(--border)] border-opacity-10 p-5 rounded-2xl font-mono text-xs font-black outline-none" />
                  <div className="max-h-40 overflow-y-auto border border-[var(--border)] border-opacity-10 rounded-xl">
                    {filteredTenants.map(t => (
                      <button key={t.id} onClick={() => setSelectedTenant(t.id)} className={`w-full text-left p-4 font-mono text-[10px] border-b border-[var(--border)] border-opacity-5 hover:bg-[var(--bg-ghost)] ${selectedTenant === t.id ? 'bg-green-500/10 border-l-4 border-l-green-500' : ''}`}>
                        <div className="font-black">{t.name}</div>
                        <div className="opacity-40">{t.phone} · {t.unitId}</div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {generateResult && (
                <div className="bg-green-500/10 border border-green-500/20 rounded-2xl p-6 space-y-2">
                  <p className="font-mono text-[10px] font-black text-green-600 uppercase">Success</p>
                  <p className="font-mono text-[9px]">Created {generateResult.created} invoices. Skipped {generateResult.skipped}.</p>
                </div>
              )}
            </div>
            <div className="p-8 bg-[var(--bg-ghost)] flex gap-4">
              <button onClick={handleGenerate} disabled={isGenerating || (generateTarget === 'tenant' && !selectedTenant)} className="flex-1 bg-[var(--text-base)] text-[var(--bg-panel)] py-4 rounded-xl font-mono text-[10px] uppercase font-black hover:translate-y-[-2px] transition-all flex items-center justify-center gap-3 disabled:opacity-50">
                {isGenerating ? <Loader2 size={14} className="animate-spin" /> : 'Run Batch Generation'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MANUAL INVOICE MODAL */}
      {showManualInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 backdrop-blur-xl bg-[var(--bg-base)] bg-opacity-80 animate-reveal">
          <form onSubmit={handleCreateManual} className="bg-[var(--bg-panel)] border border-[var(--border)] border-opacity-20 w-full max-w-xl rounded-3xl shadow-[32px_32px_0px_0px_var(--shadow-color)] overflow-hidden">
            <div className="p-8 border-b border-[var(--border)] border-opacity-10 flex justify-between items-center">
              <h3 className="text-2xl font-black uppercase tracking-tighter">Manual Invoice</h3>
              <button type="button" onClick={() => setShowManualInvoice(false)}><X size={20} /></button>
            </div>
            <div className="p-10 space-y-6 max-h-[70vh] overflow-y-auto">
              <div className="space-y-3">
                <label className="font-mono text-[8px] uppercase text-[var(--text-muted)] font-black tracking-widest">Recipient</label>
                <input type="text" placeholder="Search by name or phone..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full bg-[var(--bg-input)] border border-[var(--border)] border-opacity-10 p-5 rounded-2xl font-mono text-xs font-black outline-none" />
                <div className="max-h-32 overflow-y-auto border border-[var(--border)] border-opacity-10 rounded-xl">
                  {filteredTenants.map(t => (
                    <button key={t.id} type="button" onClick={() => setManualData({...manualData, tenantId: t.id, propertyId: t.propertyId})} className={`w-full text-left p-4 font-mono text-[10px] border-b border-[var(--border)] border-opacity-5 hover:bg-[var(--bg-ghost)] ${manualData.tenantId === t.id ? 'bg-green-500/10 border-l-4 border-l-green-500' : ''}`}>
                      <div className="font-black">{t.name}</div>
                      <div className="opacity-40">{t.unitId} · {t.phone}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-3">
                  <label className="font-mono text-[8px] uppercase text-[var(--text-muted)] font-black tracking-widest">Type</label>
                  <select required value={manualData.type} onChange={e => setManualData({...manualData, type: e.target.value})} className="w-full bg-[var(--bg-input)] border border-[var(--border)] border-opacity-10 p-5 rounded-2xl font-mono text-xs font-black outline-none appearance-none">
                    <option value="rent">Rent</option>
                    <option value="penalty">Penalty</option>
                    <option value="utility">Utility / Water</option>
                    <option value="deposit">Security Deposit</option>
                    <option value="other">Other Charge</option>
                  </select>
                </div>
                <div className="space-y-3">
                  <label className="font-mono text-[8px] uppercase text-[var(--text-muted)] font-black tracking-widest">Amount (KES)</label>
                  <input required type="number" value={manualData.amount} onChange={e => setManualData({...manualData, amount: e.target.value})} className="w-full bg-[var(--bg-input)] border border-[var(--border)] border-opacity-10 p-5 rounded-2xl font-mono text-lg font-black outline-none" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-3">
                  <label className="font-mono text-[8px] uppercase text-[var(--text-muted)] font-black tracking-widest">Period</label>
                  <input required type="month" value={manualData.period} onChange={e => setManualData({...manualData, period: e.target.value})} className="w-full bg-[var(--bg-input)] border border-[var(--border)] border-opacity-10 p-5 rounded-2xl font-mono text-xs font-black outline-none" />
                </div>
                <div className="space-y-3">
                  <label className="font-mono text-[8px] uppercase text-[var(--text-muted)] font-black tracking-widest">Due Date</label>
                  <input type="date" value={manualData.dueDate} onChange={e => setManualData({...manualData, dueDate: e.target.value})} className="w-full bg-[var(--bg-input)] border border-[var(--border)] border-opacity-10 p-5 rounded-2xl font-mono text-xs font-black outline-none" />
                </div>
              </div>

              <div className="space-y-3">
                <label className="font-mono text-[8px] uppercase text-[var(--text-muted)] font-black tracking-widest">Description</label>
                <input required type="text" placeholder="e.g. Water bill for Unit A1" value={manualData.description} onChange={e => setManualData({...manualData, description: e.target.value})} className="w-full bg-[var(--bg-input)] border border-[var(--border)] border-opacity-10 p-5 rounded-2xl font-mono text-xs font-black outline-none" />
              </div>
            </div>
            <div className="p-8 bg-[var(--bg-ghost)] flex gap-4">
              <button type="submit" disabled={isCreatingManual || !manualData.tenantId} className="flex-1 bg-[var(--text-base)] text-[var(--bg-panel)] py-4 rounded-xl font-mono text-[10px] uppercase font-black hover:translate-y-[-2px] transition-all flex items-center justify-center gap-3 disabled:opacity-50">
                {isCreatingManual ? <Loader2 size={14} className="animate-spin" /> : 'Create Invoice'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* LEDGER MODAL */}
      {viewingLedger && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 backdrop-blur-xl bg-[var(--bg-base)] bg-opacity-80 animate-reveal">
          <div className="bg-[var(--bg-panel)] border border-[var(--border)] border-opacity-20 w-full max-w-4xl rounded-3xl shadow-[32px_32px_0px_0px_var(--shadow-color)] overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-8 border-b border-[var(--border)] border-opacity-10 flex justify-between items-center">
              <div>
                <h3 className="text-2xl font-black uppercase tracking-tighter">Tenant Ledger</h3>
                <p className="font-mono text-[9px] opacity-40 uppercase font-black">Forensic breakdown of all financial activities</p>
              </div>
              <button onClick={() => setViewingLedger(null)}><X size={20} /></button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-10 space-y-10 custom-scrollbar">
              {isLedgerLoading ? (
                <div className="h-60 flex items-center justify-center font-mono text-sm uppercase font-black opacity-20">Loading ledger data...</div>
              ) : ledgerData ? (
                <>
                  <div className="grid grid-cols-3 gap-6">
                    <div className="bg-[var(--bg-ghost)] p-6 rounded-2xl border border-[var(--border)] border-opacity-10">
                      <p className="font-mono text-[8px] uppercase font-black opacity-40">Total Invoiced</p>
                      <p className="text-2xl font-black mt-1">KES {ledgerData.invoices.reduce((acc: number, curr: any) => acc + parseFloat(curr.amount), 0).toLocaleString()}</p>
                    </div>
                    <div className="bg-[var(--bg-ghost)] p-6 rounded-2xl border border-[var(--border)] border-opacity-10">
                      <p className="font-mono text-[8px] uppercase font-black opacity-40 text-green-600">Total Paid</p>
                      <p className="text-2xl font-black mt-1 text-green-600">KES {ledgerData.payments.reduce((acc: number, curr: any) => acc + parseFloat(curr.amount), 0).toLocaleString()}</p>
                    </div>
                    <div className="bg-[var(--bg-ghost)] p-6 rounded-2xl border border-[var(--border)] border-opacity-10 border-red-500/20">
                      <p className="font-mono text-[8px] uppercase font-black opacity-40 text-red-500">Current Arrears</p>
                      <p className="text-2xl font-black mt-1 text-red-500">KES {ledgerData.invoices.reduce((acc: number, curr: any) => acc + parseFloat(curr.balance), 0).toLocaleString()}</p>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <h4 className="font-black uppercase tracking-widest text-[10px] opacity-40 border-b border-[var(--border)] border-opacity-10 pb-4">Activity Stream</h4>
                    <div className="space-y-4">
                      {[...ledgerData.invoices.map((i: any) => ({...i, entryType: 'invoice'})), ...ledgerData.payments.map((p: any) => ({...p, entryType: 'payment', issuedAt: p.recordedAt}))]
                        .sort((a: any, b: any) => new Date(b.issuedAt).getTime() - new Date(a.issuedAt).getTime())
                        .map((entry: any, idx: number) => (
                          <div key={idx} className={`flex items-center justify-between p-5 rounded-2xl border ${entry.entryType === 'invoice' ? 'border-[var(--border)] border-opacity-10 bg-[var(--bg-panel)]' : 'border-green-500/20 bg-green-500/5'}`}>
                            <div className="flex items-center gap-5">
                              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${entry.entryType === 'invoice' ? 'bg-[var(--bg-ghost)] text-[var(--text-base)]' : 'bg-green-500 text-white'}`}>
                                {entry.entryType === 'invoice' ? <Receipt size={18} /> : <DollarSign size={18} />}
                              </div>
                              <div>
                                <div className="flex items-center gap-3">
                                  <p className="font-black text-sm uppercase tracking-tight">{entry.entryType === 'invoice' ? entry.description : 'Payment Received'}</p>
                                  <span className="font-mono text-[8px] px-2 py-0.5 rounded-full bg-[var(--border)] bg-opacity-10 uppercase font-black opacity-50">{entry.type || entry.method}</span>
                                </div>
                                <p className="font-mono text-[9px] opacity-40 mt-1">{formatDate(entry.issuedAt)} {entry.reference ? `· Ref: ${entry.reference}` : ''}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className={`font-black text-sm ${entry.entryType === 'invoice' ? 'text-red-500' : 'text-green-600'}`}>
                                {entry.entryType === 'invoice' ? `+ KES ${parseFloat(entry.amount).toLocaleString()}` : `- KES ${parseFloat(entry.amount).toLocaleString()}`}
                              </p>
                              {entry.entryType === 'invoice' && entry.balance !== entry.amount && (
                                <p className="font-mono text-[8px] opacity-40 mt-1">Bal: KES {parseFloat(entry.balance).toLocaleString()}</p>
                              )}
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                </>
              ) : null}
            </div>
          </div>
        </div>
      )}

      {/* PAYMENT MODAL (RESTORED) */}
      {payingInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 backdrop-blur-xl bg-[var(--bg-base)] bg-opacity-80 animate-reveal">
          <form onSubmit={handleRecordPayment} className="bg-[var(--bg-panel)] border border-[var(--border)] border-opacity-20 w-full max-w-lg rounded-3xl shadow-[32px_32px_0px_0px_var(--shadow-color)] overflow-hidden">
            <div className="p-8 border-b border-[var(--border)] border-opacity-10">
              <h3 className="text-2xl font-black uppercase tracking-tighter">Record Payment</h3>
              <p className="font-mono text-[10px] text-[var(--text-muted)] mt-2">{payingInvoice.tenantName} · {payingInvoice.description}</p>
            </div>
            <div className="p-10 space-y-6">
              <div className="bg-[var(--bg-ghost)] p-5 rounded-2xl flex justify-between items-center">
                <span className="font-mono text-[9px] uppercase font-black opacity-40">Outstanding</span>
                <span className="text-2xl font-black text-red-500">KES {parseFloat(payingInvoice.balance).toLocaleString()}</span>
              </div>
              <div className="space-y-3">
                <label className="font-mono text-[8px] uppercase text-[var(--text-muted)] font-black tracking-widest">Amount Received</label>
                <input required type="number" step="0.01" value={paymentData.amount} onChange={e => setPaymentData({...paymentData, amount: e.target.value})} className="w-full bg-[var(--bg-input)] border border-[var(--border)] border-opacity-10 p-5 rounded-2xl font-mono text-lg font-black outline-none" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-3">
                  <label className="font-mono text-[8px] uppercase text-[var(--text-muted)] font-black tracking-widest">Method</label>
                  <select value={paymentData.method} onChange={e => setPaymentData({...paymentData, method: e.target.value})} className="w-full bg-[var(--bg-input)] border border-[var(--border)] border-opacity-10 p-5 rounded-2xl font-mono text-xs font-black outline-none appearance-none">
                    <option value="mpesa">M-Pesa</option>
                    <option value="cash">Cash</option>
                    <option value="bank">Bank Transfer</option>
                  </select>
                </div>
                <div className="space-y-3">
                  <label className="font-mono text-[8px] uppercase text-[var(--text-muted)] font-black tracking-widest">Reference Code</label>
                  <input type="text" placeholder="e.g. SHL12345" value={paymentData.reference} onChange={e => setPaymentData({...paymentData, reference: e.target.value})} className="w-full bg-[var(--bg-input)] border border-[var(--border)] border-opacity-10 p-5 rounded-2xl font-mono text-xs font-black outline-none" />
                </div>
              </div>
              <div className="space-y-3">
                <label className="font-mono text-[8px] uppercase text-[var(--text-muted)] font-black tracking-widest">Notes (Optional)</label>
                <input type="text" placeholder="Any extra details..." value={paymentData.notes} onChange={e => setPaymentData({...paymentData, notes: e.target.value})} className="w-full bg-[var(--bg-input)] border border-[var(--border)] border-opacity-10 p-4 rounded-2xl font-mono text-xs font-black outline-none" />
              </div>
            </div>
            <div className="p-8 bg-[var(--bg-ghost)] flex gap-4">
              <button type="button" onClick={() => setPayingInvoice(null)} className="px-8 py-4 border border-[var(--border)] border-opacity-10 rounded-xl font-mono text-[10px] uppercase font-black">Cancel</button>
              <button type="submit" disabled={isRecording} className="flex-1 bg-green-600 text-white py-4 rounded-xl font-mono text-[10px] uppercase font-black hover:translate-y-[-2px] transition-all flex items-center justify-center gap-3">
                {isRecording ? <Loader2 size={14} className="animate-spin" /> : <><CreditCard size={14} /> Confirm Payment</>}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
