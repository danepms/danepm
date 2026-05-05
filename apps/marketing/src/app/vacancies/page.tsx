"use client";

import React, { useEffect, useState } from 'react';
import { Building2, Search, MapPin, Tag, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { getVacantUnits } from '../actions';

export default function VacanciesPage() {
  const [units, setUnits] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const res = await getVacantUnits();
      if (res.success) setUnits(res.units || []);
      setIsLoading(false);
    }
    load();
  }, []);

  return (
    <div className="min-h-screen bg-[var(--bg-base)]">
      {/* --- HEADER --- */}
      <header className="h-20 border-b border-[var(--border)] border-opacity-10 px-8 flex items-center justify-between bg-[var(--bg-panel)] backdrop-blur-xl sticky top-0 z-50">
        <Link href="/" className="flex items-center gap-3 group">
          <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
          <span className="text-sm font-black uppercase tracking-widest">Back</span>
        </Link>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded bg-[var(--text-base)] text-[var(--bg-panel)] flex items-center justify-center">
            <Building2 size={16} />
          </div>
          <span className="text-lg font-black tracking-tighter">Dane.</span>
        </div>
        <div className="w-20" /> {/* Spacer */}
      </header>

      <main className="max-w-7xl mx-auto py-20 px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
          <div>
            <h1 className="text-6xl font-black tracking-tighter mb-4">Available Units.</h1>
            <p className="text-[var(--text-muted)] font-medium">Browse vacant assets across our premium portfolio.</p>
          </div>
          <div className="relative w-full md:w-96">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={18} />
            <input 
              type="text" 
              placeholder="Search by location or unit..."
              className="w-full bg-[var(--bg-panel)] border border-[var(--border)] border-opacity-10 pl-14 pr-6 py-4 rounded-sm text-sm font-black focus:border-opacity-100 outline-none shadow-inner"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="h-64 flex flex-col items-center justify-center gap-4">
            <div className="w-10 h-10 border-4 border-[var(--accent-bg)] border-t-transparent rounded-full animate-spin" />
            <p className="text-[10px] font-black uppercase tracking-widest opacity-40">Scanning Portfolio...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {units.length > 0 ? units.map((u: any) => (
              <div key={u.id} className="bg-[var(--bg-panel)] rounded border border-[var(--border)] border-opacity-10 overflow-hidden group hover:shadow-2xl transition-all">
                <div className="h-64 bg-[var(--bg-ghost)] relative flex items-center justify-center">
                   <Building2 size={80} className="opacity-10" />
                   <div className="absolute top-6 right-6 px-4 py-2 bg-[var(--text-base)] text-[var(--bg-panel)] rounded-sm text-[10px] font-black uppercase tracking-widest shadow-xl">
                      Vacant
                   </div>
                </div>
                <div className="p-10">
                   <div className="flex justify-between items-start mb-6">
                      <div>
                         <h3 className="text-2xl font-black tracking-tight">{u.name}</h3>
                         <p className="text-[10px] font-black uppercase tracking-widest text-[var(--accent-bg)] mt-1">{u.type}</p>
                      </div>
                      <div className="text-right">
                         <p className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] mb-1">Monthly Rent</p>
                         <p className="text-2xl font-black tracking-tighter">KES {u.rent?.toLocaleString()}</p>
                      </div>
                   </div>

                   <div className="space-y-4 mb-10">
                      <div className="flex items-center gap-3 text-[var(--text-muted)]">
                         <Building2 size={16} />
                         <span className="text-sm font-medium">{u.property}</span>
                      </div>
                      <div className="flex items-center gap-3 text-[var(--text-muted)]">
                         <MapPin size={16} />
                         <span className="text-sm font-medium">{u.location}</span>
                      </div>
                   </div>

                   <button className="w-full py-5 bg-[var(--bg-ghost)] rounded-sm border border-[var(--border)] border-opacity-5 text-[10px] font-black uppercase tracking-[0.3em] hover:bg-[var(--text-base)] hover:text-[var(--bg-panel)] transition-all shadow-sm">
                      Inquire Now
                   </button>
                </div>
              </div>
            )) : (
              <div className="col-span-full py-32 text-center bg-[var(--bg-panel)] rounded border border-dashed border-[var(--border)] border-opacity-20">
                 <Tag size={48} className="mx-auto mb-6 text-[var(--text-muted)] opacity-20" />
                 <p className="text-lg font-black tracking-tight mb-2">No Vacancies Found</p>
                 <p className="text-sm text-[var(--text-muted)]">Check back soon for new premium listings.</p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
