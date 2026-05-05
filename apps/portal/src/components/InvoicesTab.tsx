"use client";

import React, { useState, useEffect } from 'react';
import { Receipt, Plus, ChevronDown, ChevronRight, CreditCard, Clock, CheckCircle2, AlertCircle, X, Loader2, Calendar, DollarSign } from 'lucide-react';
import { getInvoices, generateMonthlyInvoices, recordPayment, getPaymentsForInvoice } from '@/app/actions';

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
  const [generatePeriod, setGeneratePeriod] = useState(new Date().toISOString().slice(0, 7));
  const [isGenerating, setIsGenerating] = useState(false);
  const [generateResult, setGenerateResult] = useState<any>(null);

  const [payingInvoice, setPayingInvoice] = useState<any>(null);
  const [paymentData, setPaymentData] = useState({ amount: '', method: 'mpesa', reference: '', notes: '' });
  const [isRecording, setIsRecording] = useState(false);

  const [expandedInvoice, setExpandedInvoice] = useState<string | null>(null);
  const [invoicePayments, setInvoicePayments] = useState<any[]>([]);

  const fetchInvoices = async (p: number) => {
    setIsLoading(true);
    const filters: any = {};
    if (statusFilter) filters.status = statusFilter;
    if (periodFilter) filters.period = periodFilter;
    const res = await getInvoices(managerId, p, filters);
    if (res.success) {
      setInvoices(res.invoices || []);
      setHasMore(res.hasMore || false);
      setTotal(res.total as any || 0);
      setLastGenerated(res.lastGenerated);
      setPage(p);
    }
    setIsLoading(false);
  };

  useEffect(() => { fetchInvoices(1); }, [statusFilter, periodFilter]);

  const handleGenerate = async () => {
    setIsGenerating(true);
    setGenerateResult(null);
    const res = await generateMonthlyInvoices(managerId, generatePeriod);
    if (res.success) {
      setGenerateResult(res);
      fetchInvoices(1);
    }
    setIsGenerating(false);
  };

  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!payingInvoice) return;
    setIsRecording(true);
    const res = await recordPayment({
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
    }
    setIsRecording(false);
  };

  const handleExpandInvoice = async (inv: any) => {
    if (expandedInvoice === inv.id) {
      setExpandedInvoice(null);
      return;
    }
    setExpandedInvoice(inv.id);
    const res = await getPaymentsForInvoice(inv.id);
    if (res.success) setInvoicePayments(res.payments || []);
  };

  const formatDate = (d: any) => d ? new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';
  const formatPeriod = (p: string) => {
    try { return new Date(p + '-01').toLocaleDateString('en-US', { month: 'long', year: 'numeric' }); } catch { return p; }
  };

  return (
    <div className="space-y-10 animate-reveal">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="text-5xl font-black uppercase tracking-tighter leading-none">Invoices</h2>
          <p className="font-mono text-[10px] text-[var(--text-muted)] uppercase font-bold tracking-[0.2em] mt-3">
            Monthly rent billing for all your tenants
          </p>
        </div>
        <div className="flex items-center gap-4">
          {lastGenerated && (
            <div className="text-right hidden md:block">
              <p className="font-mono text-[7px] uppercase font-black opacity-30">Last Generated</p>
              <p className="font-mono text-[10px] font-bold">{formatPeriod(lastGenerated.period)} · {formatDate(lastGenerated.date)}</p>
            </div>
          )}
          <button
            onClick={() => { setShowGenerate(true); setGenerateResult(null); }}
            className="bg-[var(--text-base)] text-[var(--bg-panel)] px-8 py-4 font-mono text-[11px] uppercase font-black hover:translate-y-[-2px] active:translate-y-0 transition-all flex items-center gap-3 shadow-[8px_8px_0px_0px_var(--shadow-color)] rounded-xl"
          >
            <Plus size={16} /> Generate Invoices
          </button>
        </div>
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
              <th className="p-5 uppercase font-black tracking-widest opacity-50">Amount</th>
              <th className="p-5 uppercase font-black tracking-widest opacity-50">Paid</th>
              <th className="p-5 uppercase font-black tracking-widest opacity-50">Balance</th>
              <th className="p-5 uppercase font-black tracking-widest opacity-50">Status</th>
              <th className="p-5 uppercase font-black tracking-widest opacity-50">Action</th>
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
                  <td className="p-5 font-black">KES {parseFloat(inv.amount).toLocaleString()}</td>
                  <td className="p-5 font-bold text-green-600">KES {parseFloat(inv.paid || '0').toLocaleString()}</td>
                  <td className="p-5 font-black text-red-500">KES {parseFloat(inv.balance).toLocaleString()}</td>
                  <td className="p-5">
                    <span className={`px-3 py-1 rounded-full text-[8px] uppercase font-black border ${STATUS_STYLES[inv.status] || ''}`}>
                      {inv.status}
                    </span>
                  </td>
                  <td className="p-5">
                    {inv.status !== 'paid' && (
                      <button
                        onClick={(e) => { e.stopPropagation(); setPayingInvoice(inv); setPaymentData({ ...paymentData, amount: inv.balance }); }}
                        className="px-4 py-2 bg-green-500/10 text-green-600 border border-green-500/20 rounded-lg font-black text-[8px] uppercase hover:bg-green-500 hover:text-white transition-all"
                      >
                        Record Payment
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
                      <div className="flex items-center gap-4 mt-4 pt-4 border-t border-[var(--border)] border-opacity-5">
                        <span className="font-mono text-[8px] opacity-30">Due: {formatDate(inv.dueDate)}</span>
                        <span className="font-mono text-[8px] opacity-30">Issued: {formatDate(inv.issuedAt)}</span>
                        <span className="font-mono text-[8px] opacity-30">📞 {inv.tenantPhone}</span>
                      </div>
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
              <h3 className="text-2xl font-black uppercase tracking-tighter">Generate Invoices</h3>
              <button onClick={() => setShowGenerate(false)}><X size={20} /></button>
            </div>
            <div className="p-10 space-y-8">
              <div className="space-y-3">
                <label className="font-mono text-[8px] uppercase text-[var(--text-muted)] font-black tracking-widest flex items-center gap-2">
                  <Calendar size={10} /> Billing Period
                </label>
                <input type="month" value={generatePeriod} onChange={e => setGeneratePeriod(e.target.value)} className="w-full bg-[var(--bg-input)] border border-[var(--border)] border-opacity-10 p-5 rounded-2xl font-mono text-sm font-black outline-none" />
                <p className="font-mono text-[8px] opacity-40">One invoice per tenant based on their unit's rent. Tenants who already have an invoice for this period will be skipped.</p>
              </div>

              {generateResult && (
                <div className="bg-green-500/10 border border-green-500/20 rounded-2xl p-6 space-y-2 animate-reveal">
                  <p className="font-mono text-[10px] font-black text-green-600 uppercase">Generation Complete</p>
                  <div className="grid grid-cols-3 gap-4 mt-3">
                    <div>
                      <p className="font-mono text-[7px] uppercase opacity-40">Created</p>
                      <p className="text-xl font-black text-green-600">{generateResult.created}</p>
                    </div>
                    <div>
                      <p className="font-mono text-[7px] uppercase opacity-40">Skipped</p>
                      <p className="text-xl font-black opacity-40">{generateResult.skipped}</p>
                    </div>
                    <div>
                      <p className="font-mono text-[7px] uppercase opacity-40">Total</p>
                      <p className="text-xl font-black">KES {generateResult.totalAmount?.toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div className="p-8 bg-[var(--bg-ghost)] flex gap-4">
              <button onClick={() => setShowGenerate(false)} className="px-8 py-4 border border-[var(--border)] border-opacity-10 rounded-xl font-mono text-[10px] uppercase font-black hover:bg-[var(--text-base)] hover:text-[var(--bg-panel)] transition-all">Close</button>
              <button onClick={handleGenerate} disabled={isGenerating} className="flex-1 bg-[var(--accent-bg)] text-[var(--accent-text)] py-4 rounded-xl font-mono text-[10px] uppercase font-black hover:translate-y-[-2px] transition-all flex items-center justify-center gap-3 disabled:opacity-50">
                {isGenerating ? <><Loader2 size={14} className="animate-spin" /> Generating...</> : <>Generate for {formatPeriod(generatePeriod)}</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PAYMENT MODAL */}
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
