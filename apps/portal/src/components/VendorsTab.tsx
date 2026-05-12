"use client";

import React, { useState, useEffect } from 'react';
import { HardHat, Plus, X, Loader2, Phone, Mail, Star, MessageSquare, Search } from 'lucide-react';
import { api } from '@/lib/api';

const SPECIALTIES = ['plumber', 'electrician', 'painter', 'carpenter', 'mason', 'welder', 'cleaner', 'general'];
const SPECIALTY_COLORS: Record<string, string> = {
  plumber: 'bg-blue-500/10 text-blue-500',
  electrician: 'bg-yellow-500/10 text-yellow-600',
  painter: 'bg-pink-500/10 text-pink-500',
  carpenter: 'bg-amber-500/10 text-amber-600',
  mason: 'bg-stone-500/10 text-stone-600',
  welder: 'bg-orange-500/10 text-orange-500',
  cleaner: 'bg-green-500/10 text-green-500',
  general: 'bg-gray-500/10 text-gray-500',
};

export const VendorsTab = ({ managerId }: { managerId: string }) => {
  const [vendors, setVendors] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const [showCreate, setShowCreate] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [newVendor, setNewVendor] = useState({ name: '', phone: '', email: '', specialty: 'general', notes: '' });

  const [editingVendor, setEditingVendor] = useState<string | null>(null);
  const [editNote, setEditNote] = useState('');

  const fetchVendors = async () => {
    setIsLoading(true);
    const res = await api.get<any>(`/maintenance/vendors?managerId=${managerId}`);
    if (res.success) setVendors(res.vendors || []);
    setIsLoading(false);
  };

  useEffect(() => { fetchVendors(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);
    const res = await api.post<any>("/maintenance/vendors", { ...newVendor, managerId });
    if (res.success) {
      setShowCreate(false);
      setNewVendor({ name: '', phone: '', email: '', specialty: 'general', notes: '' });
      fetchVendors();
    }
    setIsCreating(false);
  };

  const handleRate = async (vendorId: string, rating: number) => {
    await api.post<any>(`/maintenance/vendors/${vendorId}`, { rating: rating.toString() });
    setVendors(vendors.map(v => v.id === vendorId ? { ...v, rating: rating.toString() } : v));
  };

  const handleSaveNote = async (vendorId: string) => {
    await api.post<any>(`/maintenance/vendors/${vendorId}`, { notes: editNote });
    setVendors(vendors.map(v => v.id === vendorId ? { ...v, notes: editNote } : v));
    setEditingVendor(null);
    setEditNote('');
  };

  const filteredVendors = vendors.filter(v => 
    v.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    v.specialty?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    v.phone?.includes(searchQuery)
  );

  return (
    <div className="space-y-10 animate-reveal">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="text-5xl font-black uppercase tracking-tighter leading-none">Vendors</h2>
          <p className="font-mono text-[10px] text-[var(--text-muted)] uppercase font-bold tracking-[0.2em] mt-3">Your trusted fundis and service providers</p>
        </div>
        <button onClick={() => setShowCreate(true)} className="bg-[var(--text-base)] text-[var(--bg-panel)] px-8 py-4 font-mono text-[11px] uppercase font-black hover:translate-y-[-2px] active:translate-y-0 transition-all flex items-center gap-3 shadow-[8px_8px_0px_0px_var(--shadow-color)] rounded-xl">
          <Plus size={16} /> Add Vendor
        </button>
      </div>

      {/* SEARCH */}
      <div className="relative max-w-md">
        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
        <input type="text" placeholder="Search by name, specialty, or phone..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="w-full pl-12 pr-4 py-3.5 bg-[var(--bg-panel)] border border-[var(--border)] border-opacity-10 rounded-xl font-mono text-xs font-bold outline-none focus:border-opacity-100 transition-all" />
      </div>

      {/* GRID */}
      {isLoading ? (
        <div className="h-48 flex items-center justify-center font-mono text-sm uppercase font-black opacity-20">Loading...</div>
      ) : filteredVendors.length === 0 ? (
        <div className="h-48 bg-[var(--bg-panel)] border border-[var(--border)] border-opacity-10 rounded-2xl flex flex-col items-center justify-center gap-3">
          <HardHat size={32} className="opacity-15" />
          <p className="font-mono text-sm uppercase font-black opacity-20">{vendors.length === 0 ? 'No vendors yet' : 'No matches'}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredVendors.map(v => {
            const rating = parseInt(v.rating) || 0;
            return (
              <div key={v.id} className="bg-[var(--bg-panel)] border border-[var(--border)] border-opacity-10 rounded-2xl shadow-[4px_4px_0px_0px_var(--shadow-color)] p-6 hover:translate-y-[-2px] transition-all group">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-black text-sm ${SPECIALTY_COLORS[v.specialty] || SPECIALTY_COLORS.general}`}>
                      {v.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="font-black text-sm tracking-tight">{v.name}</h4>
                      <span className={`inline-block px-2.5 py-0.5 rounded-md text-[7px] uppercase font-black mt-1 ${SPECIALTY_COLORS[v.specialty] || SPECIALTY_COLORS.general}`}>{v.specialty}</span>
                    </div>
                  </div>
                </div>

                {/* Rating */}
                <div className="flex items-center gap-1 mb-4">
                  {[1, 2, 3, 4, 5].map(s => (
                    <button key={s} onClick={() => handleRate(v.id, s)} className="transition-transform hover:scale-125 active:scale-90">
                      <Star size={16} className={s <= rating ? 'text-yellow-500 fill-yellow-500' : 'text-[var(--border)] opacity-20'} />
                    </button>
                  ))}
                  <span className="font-mono text-[8px] font-black opacity-30 ml-2">{rating > 0 ? `${rating}/5` : 'Not rated'}</span>
                </div>

                {/* Contact */}
                <div className="space-y-2 mb-4">
                  <a href={`tel:${v.phone}`} className="flex items-center gap-2.5 font-mono text-[10px] font-bold hover:text-green-500 transition-colors group/call">
                    <div className="w-7 h-7 rounded-lg bg-[var(--bg-ghost)] flex items-center justify-center group-hover/call:bg-green-500 group-hover/call:text-white transition-all">
                      <Phone size={12} />
                    </div>
                    {v.phone}
                  </a>
                  {v.email && (
                    <a href={`mailto:${v.email}`} className="flex items-center gap-2.5 font-mono text-[10px] font-bold hover:text-blue-500 transition-colors">
                      <div className="w-7 h-7 rounded-lg bg-[var(--bg-ghost)] flex items-center justify-center"><Mail size={12} /></div>
                      {v.email}
                    </a>
                  )}
                </div>

                {/* Notes */}
                {editingVendor === v.id ? (
                  <div className="space-y-2">
                    <textarea rows={2} value={editNote} onChange={e => setEditNote(e.target.value)} placeholder="Add a note about this vendor..." className="w-full bg-[var(--bg-input)] border border-[var(--border)] border-opacity-10 p-3 rounded-xl font-mono text-[10px] font-bold outline-none resize-none" autoFocus />
                    <div className="flex gap-2">
                      <button onClick={() => handleSaveNote(v.id)} className="px-4 py-1.5 bg-[var(--text-base)] text-[var(--bg-panel)] rounded-lg font-mono text-[8px] font-black uppercase">Save</button>
                      <button onClick={() => setEditingVendor(null)} className="px-4 py-1.5 border border-[var(--border)] border-opacity-10 rounded-lg font-mono text-[8px] font-black uppercase">Cancel</button>
                    </div>
                  </div>
                ) : (
                  <div onClick={() => { setEditingVendor(v.id); setEditNote(v.notes || ''); }} className="cursor-pointer hover:bg-[var(--bg-ghost)] rounded-xl p-3 -mx-3 transition-all">
                    {v.notes ? (
                      <p className="font-mono text-[9px] opacity-50 italic leading-relaxed">{v.notes}</p>
                    ) : (
                      <p className="font-mono text-[8px] opacity-20 flex items-center gap-1"><MessageSquare size={10} /> Click to add a note</p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* CREATE MODAL */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 backdrop-blur-xl bg-[var(--bg-base)] bg-opacity-80 animate-reveal">
          <form onSubmit={handleCreate} className="bg-[var(--bg-panel)] border border-[var(--border)] border-opacity-20 w-full max-w-lg rounded-3xl shadow-[32px_32px_0px_0px_var(--shadow-color)] overflow-hidden">
            <div className="p-8 border-b border-[var(--border)] border-opacity-10 flex justify-between items-center">
              <h3 className="text-2xl font-black uppercase tracking-tighter">Add a Vendor</h3>
              <button type="button" onClick={() => setShowCreate(false)}><X size={20} /></button>
            </div>
            <div className="p-10 space-y-6">
              <div className="space-y-3">
                <label className="font-mono text-[8px] uppercase text-[var(--text-muted)] font-black tracking-widest">Name</label>
                <input required type="text" placeholder="e.g. John the Plumber" value={newVendor.name} onChange={e => setNewVendor({...newVendor, name: e.target.value})} className="w-full bg-[var(--bg-input)] border border-[var(--border)] border-opacity-10 p-5 rounded-2xl font-mono text-sm font-black outline-none" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-3">
                  <label className="font-mono text-[8px] uppercase text-[var(--text-muted)] font-black tracking-widest">Phone</label>
                  <input required type="tel" placeholder="0712 345 678" value={newVendor.phone} onChange={e => setNewVendor({...newVendor, phone: e.target.value})} className="w-full bg-[var(--bg-input)] border border-[var(--border)] border-opacity-10 p-5 rounded-2xl font-mono text-xs font-black outline-none" />
                </div>
                <div className="space-y-3">
                  <label className="font-mono text-[8px] uppercase text-[var(--text-muted)] font-black tracking-widest">Email (Optional)</label>
                  <input type="email" placeholder="john@email.com" value={newVendor.email} onChange={e => setNewVendor({...newVendor, email: e.target.value})} className="w-full bg-[var(--bg-input)] border border-[var(--border)] border-opacity-10 p-5 rounded-2xl font-mono text-xs font-black outline-none" />
                </div>
              </div>
              <div className="space-y-3">
                <label className="font-mono text-[8px] uppercase text-[var(--text-muted)] font-black tracking-widest">What do they do?</label>
                <div className="flex flex-wrap gap-2">
                  {SPECIALTIES.map(s => (
                    <button key={s} type="button" onClick={() => setNewVendor({...newVendor, specialty: s})} className={`px-4 py-2.5 rounded-xl font-mono text-[8px] uppercase font-black transition-all border ${newVendor.specialty === s ? 'bg-[var(--text-base)] text-[var(--bg-panel)] border-transparent' : 'border-[var(--border)] border-opacity-10 hover:bg-[var(--bg-ghost)]'}`}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-3">
                <label className="font-mono text-[8px] uppercase text-[var(--text-muted)] font-black tracking-widest">Notes (Optional)</label>
                <textarea rows={2} placeholder="e.g. Available weekends, charges 2000/day" value={newVendor.notes} onChange={e => setNewVendor({...newVendor, notes: e.target.value})} className="w-full bg-[var(--bg-input)] border border-[var(--border)] border-opacity-10 p-5 rounded-2xl font-mono text-xs font-black outline-none resize-none" />
              </div>
            </div>
            <div className="p-8 bg-[var(--bg-ghost)] flex gap-4">
              <button type="button" onClick={() => setShowCreate(false)} className="px-8 py-4 border border-[var(--border)] border-opacity-10 rounded-xl font-mono text-[10px] uppercase font-black">Cancel</button>
              <button type="submit" disabled={isCreating} className="flex-1 bg-[var(--text-base)] text-[var(--bg-panel)] py-4 rounded-xl font-mono text-[10px] uppercase font-black hover:translate-y-[-2px] transition-all flex items-center justify-center gap-3">
                {isCreating ? <Loader2 size={14} className="animate-spin" /> : 'Save Vendor'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
