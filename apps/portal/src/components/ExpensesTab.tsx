"use client";

import React, { useState, useEffect } from 'react';
import { Receipt, Plus, X, Loader2, Image as ImageIcon, Eye } from 'lucide-react';
import { getExpenses, createExpense, uploadReceipt } from '@/app/actions';

const CATEGORIES = ['maintenance', 'utilities', 'supplies', 'legal', 'other'];
const CATEGORY_COLORS: Record<string, string> = {
  maintenance: 'bg-orange-500/10 text-orange-500',
  utilities: 'bg-blue-500/10 text-blue-500',
  supplies: 'bg-purple-500/10 text-purple-500',
  legal: 'bg-red-500/10 text-red-500',
  other: 'bg-gray-500/10 text-gray-500',
};

export const ExpensesTab = ({ managerId, properties }: { managerId: string; properties: any[] }) => {
  const [expenses, setExpenses] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [total, setTotal] = useState(0);
  const [monthlyTotal, setMonthlyTotal] = useState(0);
  const [categoryBreakdown, setCategoryBreakdown] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [categoryFilter, setCategoryFilter] = useState('');
  const [propertyFilter, setPropertyFilter] = useState('');

  const [showCreate, setShowCreate] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [newExpense, setNewExpense] = useState({
    propertyId: '', category: 'maintenance', description: '', amount: '', vendorName: '', vendorPhone: '', receipt: '', paidDate: new Date().toISOString().split('T')[0]
  });
  const [isUploadingReceipt, setIsUploadingReceipt] = useState(false);
  const [viewingReceipt, setViewingReceipt] = useState<string | null>(null);

  const fetchExpenses = async (p: number) => {
    setIsLoading(true);
    const filters: any = {};
    if (categoryFilter) filters.category = categoryFilter;
    if (propertyFilter) filters.propertyId = propertyFilter;
    const res = await getExpenses(managerId, p, filters);
    if (res.success) {
      setExpenses(res.expenses || []);
      setHasMore(res.hasMore || false);
      setTotal(res.total as any || 0);
      setMonthlyTotal(res.monthlyTotal as any || 0);
      setCategoryBreakdown(res.categoryBreakdown as any || []);
      setPage(p);
    }
    setIsLoading(false);
  };

  useEffect(() => { fetchExpenses(1); }, [categoryFilter, propertyFilter]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);
    const res = await createExpense({ ...newExpense, managerId });
    if (res.success) {
      setShowCreate(false);
      setNewExpense({ propertyId: '', category: 'maintenance', description: '', amount: '', vendorName: '', vendorPhone: '', receipt: '', paidDate: new Date().toISOString().split('T')[0] });
      fetchExpenses(1);
    }
    setIsCreating(false);
  };

  const handleReceiptUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingReceipt(true);
    const fd = new FormData();
    fd.append('photo', file);
    const res = await uploadReceipt(fd);
    if (res.success && res.imageUrl) {
      setNewExpense({ ...newExpense, receipt: res.imageUrl });
    }
    setIsUploadingReceipt(false);
  };

  const formatDate = (d: any) => d ? new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';
  const maxCategoryTotal = Math.max(...categoryBreakdown.map((c: any) => c.total || 0), 1);

  return (
    <div className="space-y-10 animate-reveal">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="text-5xl font-black uppercase tracking-tighter leading-none">Expenses</h2>
          <p className="font-mono text-[10px] text-[var(--text-muted)] uppercase font-bold tracking-[0.2em] mt-3">Track every shilling spent on your properties</p>
        </div>
        <button onClick={() => setShowCreate(true)} className="bg-[var(--text-base)] text-[var(--bg-panel)] px-8 py-4 font-mono text-[11px] uppercase font-black hover:translate-y-[-2px] active:translate-y-0 transition-all flex items-center gap-3 shadow-[8px_8px_0px_0px_var(--shadow-color)] rounded-xl">
          <Plus size={16} /> Log Expense
        </button>
      </div>

      {/* SUMMARY */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-[var(--bg-panel)] border border-[var(--border)] border-opacity-10 p-8 rounded-xl shadow-[8px_8px_0px_0px_var(--shadow-color)]">
          <p className="font-mono text-[8px] uppercase text-[var(--text-muted)] font-black tracking-widest mb-2">This Month's Total</p>
          <p className="text-3xl font-black tracking-tighter">KES {monthlyTotal.toLocaleString()}</p>
          <p className="font-mono text-[7px] opacity-30 mt-1">{new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>
        </div>
        <div className="bg-[var(--bg-panel)] border border-[var(--border)] border-opacity-10 p-8 rounded-xl shadow-[8px_8px_0px_0px_var(--shadow-color)]">
          <p className="font-mono text-[8px] uppercase text-[var(--text-muted)] font-black tracking-widest mb-4">By Category</p>
          {categoryBreakdown.length === 0 ? (
            <p className="font-mono text-[9px] opacity-20">No expenses this month</p>
          ) : (
            <div className="space-y-3">
              {categoryBreakdown.map((c: any) => (
                <div key={c.category} className="flex items-center gap-3">
                  <span className={`px-2 py-0.5 rounded-md text-[7px] uppercase font-black ${CATEGORY_COLORS[c.category] || ''} min-w-[70px] text-center`}>{c.category}</span>
                  <div className="flex-1 h-2 bg-[var(--bg-ghost)] rounded-full overflow-hidden">
                    <div className="h-full bg-[var(--accent-bg)] rounded-full transition-all duration-700" style={{ width: `${(c.total / maxCategoryTotal) * 100}%` }} />
                  </div>
                  <span className="font-mono text-[9px] font-black min-w-[80px] text-right">KES {c.total.toLocaleString()}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* FILTERS */}
      <div className="flex flex-wrap gap-3">
        <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)} className="bg-[var(--bg-panel)] border border-[var(--border)] border-opacity-10 px-4 py-2.5 rounded-xl font-mono text-[10px] font-black uppercase outline-none appearance-none">
          <option value="">All Categories</option>
          {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <select value={propertyFilter} onChange={e => setPropertyFilter(e.target.value)} className="bg-[var(--bg-panel)] border border-[var(--border)] border-opacity-10 px-4 py-2.5 rounded-xl font-mono text-[10px] font-black uppercase outline-none appearance-none">
          <option value="">All Buildings</option>
          {properties.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
        <div className="ml-auto font-mono text-[10px] font-black opacity-30 self-center">{total} expense{total !== 1 ? 's' : ''}</div>
      </div>

      {/* TABLE */}
      <div className="bg-[var(--bg-panel)] border border-[var(--border)] border-opacity-10 rounded-2xl shadow-[8px_8px_0px_0px_var(--shadow-color)] overflow-hidden">
        <table className="w-full text-left font-mono text-[10px]">
          <thead className="bg-[var(--bg-ghost)] border-b border-[var(--border)] border-opacity-10">
            <tr>
              <th className="p-5 uppercase font-black tracking-widest opacity-50">Description</th>
              <th className="p-5 uppercase font-black tracking-widest opacity-50">Building</th>
              <th className="p-5 uppercase font-black tracking-widest opacity-50">Category</th>
              <th className="p-5 uppercase font-black tracking-widest opacity-50">Amount</th>
              <th className="p-5 uppercase font-black tracking-widest opacity-50">Vendor</th>
              <th className="p-5 uppercase font-black tracking-widest opacity-50">Date</th>
              <th className="p-5 uppercase font-black tracking-widest opacity-50">Receipt</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border)] divide-opacity-5">
            {isLoading ? (
              <tr><td colSpan={7} className="p-16 text-center uppercase font-black opacity-20">Loading...</td></tr>
            ) : expenses.length === 0 ? (
              <tr><td colSpan={7} className="p-16 text-center uppercase font-black opacity-20">No expenses recorded yet</td></tr>
            ) : expenses.map(exp => (
              <tr key={exp.id} className="hover:bg-[var(--bg-ghost)] transition-colors">
                <td className="p-5 font-black text-xs tracking-tight max-w-[200px] truncate">{exp.description}</td>
                <td className="p-5 opacity-60">{exp.propertyName}</td>
                <td className="p-5"><span className={`px-2.5 py-1 rounded-lg text-[8px] uppercase font-black ${CATEGORY_COLORS[exp.category] || ''}`}>{exp.category}</span></td>
                <td className="p-5 font-black">KES {parseFloat(exp.amount).toLocaleString()}</td>
                <td className="p-5">{exp.vendorName || '—'}</td>
                <td className="p-5 opacity-50">{formatDate(exp.paidDate)}</td>
                <td className="p-5">
                  {exp.receipt ? (
                    <button onClick={() => setViewingReceipt(exp.receipt)} className="p-2 bg-[var(--bg-ghost)] rounded-lg hover:bg-[var(--accent-bg)] hover:text-white transition-all"><Eye size={12} /></button>
                  ) : '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="p-5 bg-[var(--bg-ghost)] border-t border-[var(--border)] border-opacity-10 flex justify-end gap-3">
          <button disabled={page === 1} onClick={() => fetchExpenses(page - 1)} className="px-5 py-2 border border-[var(--border)] border-opacity-10 rounded-lg font-black uppercase text-[8px] disabled:opacity-10 hover:bg-[var(--text-base)] hover:text-[var(--bg-panel)] transition-all">Prev</button>
          <button disabled={!hasMore} onClick={() => fetchExpenses(page + 1)} className="px-5 py-2 border border-[var(--border)] border-opacity-10 rounded-lg font-black uppercase text-[8px] disabled:opacity-10 hover:bg-[var(--text-base)] hover:text-[var(--bg-panel)] transition-all">Next</button>
        </div>
      </div>

      {/* CREATE MODAL */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 backdrop-blur-xl bg-[var(--bg-base)] bg-opacity-80 animate-reveal">
          <form onSubmit={handleCreate} className="bg-[var(--bg-panel)] border border-[var(--border)] border-opacity-20 w-full max-w-xl rounded-3xl shadow-[32px_32px_0px_0px_var(--shadow-color)] overflow-hidden">
            <div className="p-8 border-b border-[var(--border)] border-opacity-10 flex justify-between items-center">
              <h3 className="text-2xl font-black uppercase tracking-tighter">Log an Expense</h3>
              <button type="button" onClick={() => setShowCreate(false)}><X size={20} /></button>
            </div>
            <div className="p-10 space-y-6 max-h-[60vh] overflow-y-auto custom-scrollbar">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-3">
                  <label className="font-mono text-[8px] uppercase text-[var(--text-muted)] font-black tracking-widest">Building</label>
                  <select required value={newExpense.propertyId} onChange={e => setNewExpense({...newExpense, propertyId: e.target.value})} className="w-full bg-[var(--bg-input)] border border-[var(--border)] border-opacity-10 p-5 rounded-2xl font-mono text-xs font-black outline-none appearance-none">
                    <option value="">Select...</option>
                    {properties.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </div>
                <div className="space-y-3">
                  <label className="font-mono text-[8px] uppercase text-[var(--text-muted)] font-black tracking-widest">Category</label>
                  <select value={newExpense.category} onChange={e => setNewExpense({...newExpense, category: e.target.value})} className="w-full bg-[var(--bg-input)] border border-[var(--border)] border-opacity-10 p-5 rounded-2xl font-mono text-xs font-black outline-none appearance-none capitalize">
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <div className="space-y-3">
                <label className="font-mono text-[8px] uppercase text-[var(--text-muted)] font-black tracking-widest">What was this for?</label>
                <input required type="text" placeholder="e.g. Fixed broken kitchen sink" value={newExpense.description} onChange={e => setNewExpense({...newExpense, description: e.target.value})} className="w-full bg-[var(--bg-input)] border border-[var(--border)] border-opacity-10 p-5 rounded-2xl font-mono text-sm font-black outline-none" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-3">
                  <label className="font-mono text-[8px] uppercase text-[var(--text-muted)] font-black tracking-widest">Amount (KES)</label>
                  <input required type="number" step="0.01" value={newExpense.amount} onChange={e => setNewExpense({...newExpense, amount: e.target.value})} className="w-full bg-[var(--bg-input)] border border-[var(--border)] border-opacity-10 p-5 rounded-2xl font-mono text-lg font-black outline-none" />
                </div>
                <div className="space-y-3">
                  <label className="font-mono text-[8px] uppercase text-[var(--text-muted)] font-black tracking-widest">Date Paid</label>
                  <input type="date" value={newExpense.paidDate} onChange={e => setNewExpense({...newExpense, paidDate: e.target.value})} className="w-full bg-[var(--bg-input)] border border-[var(--border)] border-opacity-10 p-5 rounded-2xl font-mono text-xs font-black outline-none" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-3">
                  <label className="font-mono text-[8px] uppercase text-[var(--text-muted)] font-black tracking-widest">Vendor / Fundi Name</label>
                  <input type="text" placeholder="Optional" value={newExpense.vendorName} onChange={e => setNewExpense({...newExpense, vendorName: e.target.value})} className="w-full bg-[var(--bg-input)] border border-[var(--border)] border-opacity-10 p-5 rounded-2xl font-mono text-xs font-black outline-none" />
                </div>
                <div className="space-y-3">
                  <label className="font-mono text-[8px] uppercase text-[var(--text-muted)] font-black tracking-widest">Vendor Phone</label>
                  <input type="tel" placeholder="Optional" value={newExpense.vendorPhone} onChange={e => setNewExpense({...newExpense, vendorPhone: e.target.value})} className="w-full bg-[var(--bg-input)] border border-[var(--border)] border-opacity-10 p-5 rounded-2xl font-mono text-xs font-black outline-none" />
                </div>
              </div>
              <div className="space-y-3">
                <label className="font-mono text-[8px] uppercase text-[var(--text-muted)] font-black tracking-widest">Receipt Photo</label>
                {newExpense.receipt ? (
                  <div className="relative w-24 h-24 rounded-xl overflow-hidden group">
                    <img src={newExpense.receipt} alt="Receipt" className="w-full h-full object-cover" />
                    <button type="button" onClick={() => setNewExpense({...newExpense, receipt: ''})} className="absolute inset-0 bg-red-500/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all text-white font-mono text-[7px] font-black">Remove</button>
                  </div>
                ) : (
                  <label className="w-24 h-24 border-2 border-dashed border-[var(--border)] border-opacity-10 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-opacity-100 transition-all">
                    <input type="file" accept="image/*" className="hidden" onChange={handleReceiptUpload} />
                    {isUploadingReceipt ? <Loader2 size={16} className="animate-spin" /> : <><ImageIcon size={16} className="opacity-30 mb-1" /><span className="font-mono text-[6px] font-black opacity-30">Upload</span></>}
                  </label>
                )}
              </div>
            </div>
            <div className="p-8 bg-[var(--bg-ghost)] flex gap-4">
              <button type="button" onClick={() => setShowCreate(false)} className="px-8 py-4 border border-[var(--border)] border-opacity-10 rounded-xl font-mono text-[10px] uppercase font-black">Cancel</button>
              <button type="submit" disabled={isCreating} className="flex-1 bg-[var(--text-base)] text-[var(--bg-panel)] py-4 rounded-xl font-mono text-[10px] uppercase font-black hover:translate-y-[-2px] transition-all flex items-center justify-center gap-3">
                {isCreating ? <Loader2 size={14} className="animate-spin" /> : 'Save Expense'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* RECEIPT VIEWER */}
      {viewingReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 backdrop-blur-xl bg-black/80 animate-reveal" onClick={() => setViewingReceipt(null)}>
          <div className="max-w-2xl max-h-[80vh] rounded-3xl overflow-hidden shadow-2xl">
            <img src={viewingReceipt} alt="Receipt" className="w-full h-full object-contain" />
          </div>
        </div>
      )}
    </div>
  );
};
