"use client";

import React, { useState, useEffect } from 'react';
import { AlertCircle, Plus, X, Loader2, ChevronRight, Wrench, Zap, Droplets, PaintBucket, Trash2, Image as ImageIcon, Receipt } from 'lucide-react';
import { api } from '@/lib/api';

const CATEGORIES = [
  { id: 'plumbing', label: 'Plumbing', icon: Droplets, color: 'text-blue-500 bg-blue-500/10' },
  { id: 'electrical', label: 'Electrical', icon: Zap, color: 'text-yellow-500 bg-yellow-500/10' },
  { id: 'structural', label: 'Structural', icon: Wrench, color: 'text-orange-500 bg-orange-500/10' },
  { id: 'cleaning', label: 'Cleaning', icon: PaintBucket, color: 'text-green-500 bg-green-500/10' },
  { id: 'general', label: 'General', icon: Wrench, color: 'text-gray-500 bg-gray-500/10' },
];

const PRIORITY_STYLES: Record<string, string> = {
  low: 'bg-gray-500/10 text-gray-500 border-gray-500/20',
  normal: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  urgent: 'bg-red-500/10 text-red-500 border-red-500/20',
};

const STATUS_FLOW = ['open', 'in_progress', 'resolved', 'closed'];

export const RequestsTab = ({ managerId, properties }: { managerId: string; properties: any[] }) => {
  const [requests, setRequests] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [total, setTotal] = useState(0);
  const [statusCounts, setStatusCounts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [statusFilter, setStatusFilter] = useState('');
  const [propertyFilter, setPropertyFilter] = useState('');

  const [showCreate, setShowCreate] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [newRequest, setNewRequest] = useState({
    propertyId: '', unitId: '', title: '', description: '', category: 'general', priority: 'normal', photos: [] as string[]
  });
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  
  // Fiscal Resolution State
  const [resolvingRequest, setResolvingRequest] = useState<any | null>(null);
  const [isResolving, setIsResolving] = useState(false);
  const [fiscalData, setFiscalData] = useState({
    amount: '', vendorName: '', vendorPhone: '', receipt: '', paidDate: new Date().toISOString().split('T')[0], category: 'maintenance'
  });
  const [isUploadingReceipt, setIsUploadingReceipt] = useState(false);

  const fetchRequests = async (p: number) => {
    setIsLoading(true);
    const filters: any = {};
    if (statusFilter) filters.status = statusFilter;
    if (propertyFilter) filters.propertyId = propertyFilter;
    const res = await api.get<any>(`/maintenance/requests?managerId=${managerId}&page=${p}&status=${filters.status || ''}&propertyId=${filters.propertyId || ''}`);
    if (res.success) {
      setRequests(res.requests || []);
      setHasMore(res.hasMore || false);
      setTotal(res.total as any || 0);
      setStatusCounts(res.statusCounts || []);
      setPage(p);
    }
    setIsLoading(false);
  };

  useEffect(() => { fetchRequests(1); }, [statusFilter, propertyFilter]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);
    const res = await api.post<any>("/maintenance/requests", {
      ...newRequest,
      managerId,
      photos: newRequest.photos.length > 0 ? JSON.stringify(newRequest.photos) : undefined,
    });
    if (res.success) {
      setShowCreate(false);
      setNewRequest({ propertyId: '', unitId: '', title: '', description: '', category: 'general', priority: 'normal', photos: [] });
      fetchRequests(1);
    }
    setIsCreating(false);
  };

  const handleStatusChange = async (requestId: string, newStatus: string) => {
    if (newStatus === 'resolved') {
      const req = requests.find(r => r.id === requestId);
      setResolvingRequest(req);
      setFiscalData(prev => ({ ...prev, category: req.category || 'maintenance' }));
      return;
    }
    const res = await api.post<any>(`/maintenance/requests/${requestId}/status`, { status: newStatus });
    if (res.success) fetchRequests(page);
  };

  const handleFiscalResolve = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resolvingRequest) return;
    setIsResolving(true);
    const res = await api.post<any>("/maintenance/resolve-with-expense", {
      ...fiscalData,
      requestId: resolvingRequest.id,
      propertyId: resolvingRequest.propertyId,
      managerId,
      description: resolvingRequest.title
    });
    if (res.success) {
      setResolvingRequest(null);
      setFiscalData({ amount: '', vendorName: '', vendorPhone: '', receipt: '', paidDate: new Date().toISOString().split('T')[0], category: 'maintenance' });
      fetchRequests(page);
    }
    setIsResolving(false);
  };

  const handleReceiptUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingReceipt(true);
    const fd = new FormData();
    fd.append('photo', file);
    const res = await api.post<any>("/maintenance/upload-receipt", fd);
    if (res.success && res.imageUrl) {
      setFiscalData({ ...fiscalData, receipt: res.imageUrl });
    }
    setIsUploadingReceipt(false);
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    setIsUploadingPhoto(true);
    const newPhotos = [...newRequest.photos];
    for (let i = 0; i < Math.min(files.length, 4 - newPhotos.length); i++) {
      const fd = new FormData();
      fd.append('photo', files[i]);
      const res = await api.post<any>("/tenants/upload-photo", fd);
      if (res.success && res.imageUrl) newPhotos.push(res.imageUrl);
    }
    setNewRequest({ ...newRequest, photos: newPhotos });
    setIsUploadingPhoto(false);
  };

  const getNextStatus = (current: string) => {
    const idx = STATUS_FLOW.indexOf(current);
    return idx < STATUS_FLOW.length - 1 ? STATUS_FLOW[idx + 1] : null;
  };

  const getCountForStatus = (status: string) => statusCounts.find((s: any) => s.status === status)?.count || 0;
  const formatDate = (d: any) => d ? new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }) : '—';

  const getCategoryInfo = (cat: string) => CATEGORIES.find(c => c.id === cat) || CATEGORIES[4];

  // Available units based on selected property
  const availableUnits = newRequest.propertyId
    ? (() => {
        const prop = properties.find(p => p.id === newRequest.propertyId);
        if (!prop?.config) return [];
        return JSON.parse(prop.config).units || [];
      })()
    : [];

  return (
    <div className="space-y-10 animate-reveal">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="text-5xl font-black uppercase tracking-tighter leading-none">Requests</h2>
          <p className="font-mono text-[10px] text-[var(--text-muted)] uppercase font-bold tracking-[0.2em] mt-3">Things that need fixing in your buildings</p>
        </div>
        <button onClick={() => setShowCreate(true)} className="bg-[var(--text-base)] text-[var(--bg-panel)] px-8 py-4 font-mono text-[11px] uppercase font-black hover:translate-y-[-2px] active:translate-y-0 transition-all flex items-center gap-3 shadow-[8px_8px_0px_0px_var(--shadow-color)] rounded-xl">
          <Plus size={16} /> New Request
        </button>
      </div>

      {/* STATUS PILLS */}
      <div className="flex flex-wrap gap-3">
        {['', 'open', 'in_progress', 'resolved', 'closed'].map(s => (
          <button key={s} onClick={() => setStatusFilter(s)} className={`px-5 py-2.5 rounded-xl font-mono text-[10px] uppercase font-black transition-all ${statusFilter === s ? 'bg-[var(--text-base)] text-[var(--bg-panel)] shadow-md' : 'bg-[var(--bg-panel)] border border-[var(--border)] border-opacity-10 hover:bg-[var(--bg-ghost)]'}`}>
            {s === '' ? `All (${total})` : `${s.replace('_', ' ')} (${getCountForStatus(s)})`}
          </button>
        ))}
      </div>

      {/* LIST */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="h-48 flex items-center justify-center font-mono text-sm uppercase font-black opacity-20">Loading...</div>
        ) : requests.length === 0 ? (
          <div className="h-48 bg-[var(--bg-panel)] border border-[var(--border)] border-opacity-10 rounded-2xl flex items-center justify-center font-mono text-sm uppercase font-black opacity-20">No requests found</div>
        ) : requests.map((r) => {
          const cat = getCategoryInfo(r.category);
          const CatIcon = cat.icon;
          const nextStatus = getNextStatus(r.status);
          const photos = r.photos ? JSON.parse(r.photos) : [];

          return (
            <div key={r.id} className="bg-[var(--bg-panel)] border border-[var(--border)] border-opacity-10 rounded-2xl shadow-[4px_4px_0px_0px_var(--shadow-color)] p-6 hover:translate-y-[-2px] transition-all group">
              <div className="flex flex-col md:flex-row md:items-center gap-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${cat.color}`}>
                  <CatIcon size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 flex-wrap">
                    <h4 className="font-black text-sm tracking-tight">{r.title}</h4>
                    <span className={`px-2.5 py-0.5 rounded-full text-[7px] uppercase font-black border ${PRIORITY_STYLES[r.priority] || ''}`}>{r.priority}</span>
                  </div>
                  <p className="font-mono text-[9px] opacity-40 mt-1">{r.propertyName} · {r.unitId || 'Common Area'} {r.tenantName ? `· ${r.tenantName}` : ''}</p>
                  {r.description && <p className="font-mono text-[10px] opacity-50 mt-2 line-clamp-2">{r.description}</p>}
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  {photos.length > 0 && (
                    <div className="flex -space-x-2">
                      {photos.slice(0, 3).map((url: string, i: number) => (
                        <div key={i} className="w-8 h-8 rounded-lg overflow-hidden border-2 border-[var(--bg-panel)]">
                          <img src={url} alt="" className="w-full h-full object-cover" />
                        </div>
                      ))}
                      {photos.length > 3 && <div className="w-8 h-8 rounded-lg bg-[var(--bg-ghost)] flex items-center justify-center font-mono text-[7px] font-black border-2 border-[var(--bg-panel)]">+{photos.length - 3}</div>}
                    </div>
                  )}

                  <span className="font-mono text-[8px] opacity-30">{formatDate(r.createdAt)}</span>

                  <div className={`px-3 py-1.5 rounded-lg font-mono text-[8px] uppercase font-black ${
                    r.status === 'open' ? 'bg-red-500/10 text-red-500' :
                    r.status === 'in_progress' ? 'bg-yellow-500/10 text-yellow-600' :
                    r.status === 'resolved' ? 'bg-green-500/10 text-green-600' :
                    'bg-gray-500/10 text-gray-500'
                  }`}>{r.status.replace('_', ' ')}</div>

                  {nextStatus && (
                    <button onClick={() => handleStatusChange(r.id, nextStatus)} className="px-4 py-2 border border-[var(--border)] border-opacity-10 rounded-lg font-mono text-[8px] uppercase font-black hover:bg-[var(--text-base)] hover:text-[var(--bg-panel)] transition-all flex items-center gap-1.5 opacity-0 group-hover:opacity-100">
                      <ChevronRight size={10} /> {nextStatus.replace('_', ' ')}
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Pagination */}
      {requests.length > 0 && (
        <div className="flex justify-end gap-3">
          <button disabled={page === 1} onClick={() => fetchRequests(page - 1)} className="px-5 py-2 border border-[var(--border)] border-opacity-10 rounded-lg font-black uppercase text-[8px] disabled:opacity-10 hover:bg-[var(--text-base)] hover:text-[var(--bg-panel)] transition-all">Prev</button>
          <button disabled={!hasMore} onClick={() => fetchRequests(page + 1)} className="px-5 py-2 border border-[var(--border)] border-opacity-10 rounded-lg font-black uppercase text-[8px] disabled:opacity-10 hover:bg-[var(--text-base)] hover:text-[var(--bg-panel)] transition-all">Next</button>
        </div>
      )}

      {/* CREATE MODAL */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 backdrop-blur-xl bg-[var(--bg-base)] bg-opacity-80 animate-reveal">
          <form onSubmit={handleCreate} className="bg-[var(--bg-panel)] border border-[var(--border)] border-opacity-20 w-full max-w-xl rounded-3xl shadow-[32px_32px_0px_0px_var(--shadow-color)] overflow-hidden">
            <div className="p-8 border-b border-[var(--border)] border-opacity-10 flex justify-between items-center">
              <h3 className="text-2xl font-black uppercase tracking-tighter">New Request</h3>
              <button type="button" onClick={() => setShowCreate(false)}><X size={20} /></button>
            </div>
            <div className="p-10 space-y-6 max-h-[60vh] overflow-y-auto custom-scrollbar">
              <div className="space-y-3">
                <label className="font-mono text-[8px] uppercase text-[var(--text-muted)] font-black tracking-widest">What needs fixing?</label>
                <input required type="text" placeholder="e.g. Leaking bathroom pipe" value={newRequest.title} onChange={e => setNewRequest({...newRequest, title: e.target.value})} className="w-full bg-[var(--bg-input)] border border-[var(--border)] border-opacity-10 p-5 rounded-2xl font-mono text-sm font-black outline-none" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-3">
                  <label className="font-mono text-[8px] uppercase text-[var(--text-muted)] font-black tracking-widest">Building</label>
                  <select required value={newRequest.propertyId} onChange={e => setNewRequest({...newRequest, propertyId: e.target.value, unitId: ''})} className="w-full bg-[var(--bg-input)] border border-[var(--border)] border-opacity-10 p-5 rounded-2xl font-mono text-xs font-black outline-none appearance-none">
                    <option value="">Select...</option>
                    {properties.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </div>
                <div className="space-y-3">
                  <label className="font-mono text-[8px] uppercase text-[var(--text-muted)] font-black tracking-widest">Unit (or leave empty for common area)</label>
                  <select value={newRequest.unitId} onChange={e => setNewRequest({...newRequest, unitId: e.target.value})} className="w-full bg-[var(--bg-input)] border border-[var(--border)] border-opacity-10 p-5 rounded-2xl font-mono text-xs font-black outline-none appearance-none">
                    <option value="">Common Area</option>
                    {availableUnits.map((u: any) => <option key={u.name} value={u.name}>{u.name}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-3">
                  <label className="font-mono text-[8px] uppercase text-[var(--text-muted)] font-black tracking-widest">Category</label>
                  <div className="flex flex-wrap gap-2">
                    {CATEGORIES.map(c => (
                      <button key={c.id} type="button" onClick={() => setNewRequest({...newRequest, category: c.id})} className={`px-3 py-2 rounded-xl font-mono text-[8px] uppercase font-black transition-all border ${newRequest.category === c.id ? 'bg-[var(--text-base)] text-[var(--bg-panel)] border-transparent' : 'border-[var(--border)] border-opacity-10 hover:bg-[var(--bg-ghost)]'}`}>
                        {c.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="space-y-3">
                  <label className="font-mono text-[8px] uppercase text-[var(--text-muted)] font-black tracking-widest">Priority</label>
                  <div className="flex gap-2">
                    {['low', 'normal', 'urgent'].map(p => (
                      <button key={p} type="button" onClick={() => setNewRequest({...newRequest, priority: p})} className={`flex-1 px-3 py-3 rounded-xl font-mono text-[8px] uppercase font-black transition-all border text-center ${newRequest.priority === p ? (p === 'urgent' ? 'bg-red-500 text-white border-transparent' : 'bg-[var(--text-base)] text-[var(--bg-panel)] border-transparent') : 'border-[var(--border)] border-opacity-10 hover:bg-[var(--bg-ghost)]'}`}>
                        {p}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                <label className="font-mono text-[8px] uppercase text-[var(--text-muted)] font-black tracking-widest">Description</label>
                <textarea rows={3} placeholder="More details about the issue..." value={newRequest.description} onChange={e => setNewRequest({...newRequest, description: e.target.value})} className="w-full bg-[var(--bg-input)] border border-[var(--border)] border-opacity-10 p-5 rounded-2xl font-mono text-xs font-black outline-none resize-none" />
              </div>
              <div className="space-y-3">
                <label className="font-mono text-[8px] uppercase text-[var(--text-muted)] font-black tracking-widest">Photos (up to 4)</label>
                <div className="flex gap-3">
                  {newRequest.photos.map((url, i) => (
                    <div key={i} className="w-16 h-16 rounded-xl overflow-hidden relative group">
                      <img src={url} alt="" className="w-full h-full object-cover" />
                      <button type="button" onClick={() => setNewRequest({...newRequest, photos: newRequest.photos.filter((_, idx) => idx !== i)})} className="absolute inset-0 bg-red-500/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all"><Trash2 size={12} className="text-white" /></button>
                    </div>
                  ))}
                  {newRequest.photos.length < 4 && (
                    <label className="w-16 h-16 border-2 border-dashed border-[var(--border)] border-opacity-10 rounded-xl flex items-center justify-center cursor-pointer hover:border-opacity-100 transition-all">
                      <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
                      {isUploadingPhoto ? <Loader2 size={14} className="animate-spin" /> : <ImageIcon size={14} className="opacity-30" />}
                    </label>
                  )}
                </div>
              </div>
            </div>
            <div className="p-8 bg-[var(--bg-ghost)] flex gap-4">
              <button type="button" onClick={() => setShowCreate(false)} className="px-8 py-4 border border-[var(--border)] border-opacity-10 rounded-xl font-mono text-[10px] uppercase font-black">Cancel</button>
              <button type="submit" disabled={isCreating} className="flex-1 bg-[var(--text-base)] text-[var(--bg-panel)] py-4 rounded-xl font-mono text-[10px] uppercase font-black hover:translate-y-[-2px] transition-all flex items-center justify-center gap-3">
                {isCreating ? <Loader2 size={14} className="animate-spin" /> : 'Submit Request'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* FISCAL RESOLUTION MODAL */}
      {resolvingRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 backdrop-blur-xl bg-black/40 animate-reveal">
          <form onSubmit={handleFiscalResolve} className="bg-[var(--bg-panel)] border border-[var(--border)] border-opacity-20 w-full max-w-xl rounded-3xl shadow-[32px_32px_0px_0px_var(--shadow-color)] overflow-hidden">
            <div className="p-8 border-b border-[var(--border)] border-opacity-10 flex justify-between items-center bg-amber-500/5">
              <div className="flex items-center gap-3 text-amber-600">
                <Receipt size={24} />
                <h3 className="text-xl font-black uppercase tracking-tighter">Settle & Resolve</h3>
              </div>
              <button type="button" onClick={() => setResolvingRequest(null)}><X size={20} /></button>
            </div>
            
            <div className="p-8 space-y-6">
              <div className="bg-[var(--bg-ghost)] p-4 rounded-xl border border-[var(--border)] border-opacity-5">
                <p className="font-mono text-[8px] uppercase opacity-40 font-black tracking-widest">Resolving Request</p>
                <h4 className="font-black text-sm mt-1">{resolvingRequest.title}</h4>
                <p className="font-mono text-[9px] opacity-60 mt-0.5">{resolvingRequest.propertyName} · {resolvingRequest.unitId || 'Common Area'}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-3">
                  <label className="font-mono text-[8px] uppercase text-[var(--text-muted)] font-black tracking-widest">Amount Paid (KES)</label>
                  <input required type="number" step="0.01" value={fiscalData.amount} onChange={e => setFiscalData({...fiscalData, amount: e.target.value})} className="w-full bg-[var(--bg-input)] border border-[var(--border)] border-opacity-10 p-5 rounded-2xl font-mono text-lg font-black outline-none" />
                </div>
                <div className="space-y-3">
                  <label className="font-mono text-[8px] uppercase text-[var(--text-muted)] font-black tracking-widest">Date Settled</label>
                  <input type="date" value={fiscalData.paidDate} onChange={e => setFiscalData({...fiscalData, paidDate: e.target.value})} className="w-full bg-[var(--bg-input)] border border-[var(--border)] border-opacity-10 p-5 rounded-2xl font-mono text-xs font-black outline-none" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-3">
                  <label className="font-mono text-[8px] uppercase text-[var(--text-muted)] font-black tracking-widest">Vendor / Fundi</label>
                  <input type="text" placeholder="e.g. John Electrician" value={fiscalData.vendorName} onChange={e => setFiscalData({...fiscalData, vendorName: e.target.value})} className="w-full bg-[var(--bg-input)] border border-[var(--border)] border-opacity-10 p-5 rounded-2xl font-mono text-xs font-black outline-none" />
                </div>
                <div className="space-y-3">
                  <label className="font-mono text-[8px] uppercase text-[var(--text-muted)] font-black tracking-widest">Receipt / Proof</label>
                  <label className="w-full bg-[var(--bg-input)] border border-2 border-dashed border-[var(--border)] border-opacity-10 p-4 rounded-2xl flex items-center justify-center cursor-pointer hover:border-opacity-100 transition-all">
                    <input type="file" accept="image/*" className="hidden" onChange={handleReceiptUpload} />
                    {isUploadingReceipt ? <Loader2 size={16} className="animate-spin" /> : fiscalData.receipt ? <div className="flex items-center gap-2 text-green-500 font-black text-[8px] uppercase tracking-widest"><ImageIcon size={12} /> Attached</div> : <><ImageIcon size={16} className="opacity-30 mr-2" /><span className="font-mono text-[8px] font-black opacity-30 uppercase">Upload</span></>}
                  </label>
                </div>
              </div>
            </div>

            <div className="p-8 bg-[var(--bg-ghost)] flex gap-4">
              <button type="button" onClick={() => setResolvingRequest(null)} className="px-8 py-4 border border-[var(--border)] border-opacity-10 rounded-xl font-mono text-[10px] uppercase font-black">Skip Finance</button>
              <button type="submit" disabled={isResolving || !fiscalData.amount} className="flex-1 bg-amber-500 text-black py-4 rounded-xl font-mono text-[10px] uppercase font-black hover:translate-y-[-2px] transition-all flex items-center justify-center gap-3 shadow-lg">
                {isResolving ? <Loader2 size={14} className="animate-spin" /> : 'Confirm & Close Ticket'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
