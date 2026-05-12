"use client";

import React, { useEffect, useState } from 'react';
import { Building2, Search, MapPin, Tag, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { getVacantUnits, getVacancyDetails } from '../actions';

export default function VacanciesPage() {
  const [units, setUnits] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedVacancy, setSelectedVacancy] = useState<any>(null);
  const [isDetailLoading, setIsDetailLoading] = useState(false);

  useEffect(() => {
    async function load() {
      const res = await getVacantUnits();
      if (res.success) setUnits(res.units || []);
      setIsLoading(false);
    }
    load();
  }, []);

  const openDetails = async (id: string) => {
    setIsDetailLoading(true);
    const res = await getVacancyDetails(id);
    if (res.success) setSelectedVacancy(res.vacancy);
    setIsDetailLoading(false);
  };

  return (
    <div className="min-h-screen bg-[var(--bg-base)]">
      {/* ... header same ... */}
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
        <div className="w-20" />
      </header>

      <main className="max-w-7xl mx-auto py-20 px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
          <div>
            <h1 className="text-6xl font-black tracking-tighter mb-4">Available Units.</h1>
            <p className="text-[var(--text-muted)] font-medium">Browse vacant assets across our premium portfolio.</p>
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
              <div key={u.id} className="bg-[var(--bg-panel)] rounded border border-[var(--border)] border-opacity-10 overflow-hidden group hover:shadow-2xl transition-all cursor-pointer" onClick={() => openDetails(u.id)}>
                <div className="h-64 bg-[var(--bg-ghost)] relative flex items-center justify-center overflow-hidden">
                   {u.imageUrl ? <img src={u.imageUrl} alt={u.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" /> : <Building2 size={80} className="opacity-10" />}
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
                      View Details
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

      {/* DETAIL OVERLAY */}
      {selectedVacancy && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-8">
           <div className="absolute inset-0 bg-black/90 backdrop-blur-md" onClick={() => setSelectedVacancy(null)} />
           <div className="relative w-full max-w-4xl bg-[var(--bg-panel)] border border-[var(--border)] border-opacity-20 shadow-[40px_40px_0px_0px_rgba(0,0,0,0.5)] flex flex-col md:flex-row overflow-hidden animate-reveal">
              <div className="w-full md:w-1/2 h-64 md:h-auto bg-[var(--bg-ghost)] relative">
                 <Building2 size={120} className="absolute inset-0 m-auto opacity-5" />
                 <div className="absolute top-8 left-8">
                    <span className="px-4 py-2 bg-[var(--accent-bg)] text-white text-[10px] font-black uppercase tracking-widest">Premium Unit</span>
                 </div>
              </div>
              <div className="w-full md:w-1/2 p-12 overflow-y-auto max-h-[80vh] md:max-h-none">
                 <button onClick={() => setSelectedVacancy(null)} className="absolute top-8 right-8 text-[var(--text-muted)] hover:text-[var(--text-base)]">
                    <ArrowLeft size={24} className="rotate-180" />
                 </button>

                 <div className="mb-10">
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--accent-bg)] mb-2">{selectedVacancy.property.location}</p>
                    <h2 className="text-5xl font-black tracking-tighter leading-none mb-2">{selectedVacancy.unit.name}</h2>
                    <p className="text-xl font-bold opacity-40 uppercase tracking-tight">{selectedVacancy.property.name}</p>
                 </div>

                 <p className="text-sm leading-relaxed text-[var(--text-muted)] mb-10">{selectedVacancy.property.description}</p>

                 <div className="grid grid-cols-2 gap-8 mb-12 border-y border-[var(--border)] border-opacity-10 py-8">
                    <div>
                       <p className="text-[9px] font-black uppercase tracking-widest text-[var(--text-muted)] mb-1">Monthly Rent</p>
                       <p className="text-2xl font-black tracking-tighter uppercase">KES {selectedVacancy.unit.rent.toLocaleString()}</p>
                    </div>
                    <div>
                       <p className="text-[9px] font-black uppercase tracking-widest text-[var(--text-muted)] mb-1">Deposit Required</p>
                       <p className="text-2xl font-black tracking-tighter uppercase">KES {selectedVacancy.unit.deposit.toLocaleString()}</p>
                    </div>
                 </div>

                 <div className="space-y-6 mb-12">
                    <h4 className="text-[10px] font-black uppercase tracking-widest">Move-in Requirements</h4>
                    <div className="p-6 bg-[var(--bg-ghost)] border border-[var(--border)] border-opacity-10 rounded-sm">
                       <div className="flex justify-between items-center mb-4">
                          <span className="text-xs font-medium">First Month Rent</span>
                          <span className="text-xs font-black">KES {selectedVacancy.unit.rent.toLocaleString()}</span>
                       </div>
                       <div className="flex justify-between items-center mb-4">
                          <span className="text-xs font-medium">Security Deposit (1 Month)</span>
                          <span className="text-xs font-black">KES {selectedVacancy.unit.deposit.toLocaleString()}</span>
                       </div>
                       <div className="flex justify-between items-center pt-4 border-t border-[var(--border)] border-opacity-20">
                          <span className="text-[10px] font-black uppercase tracking-widest">Estimated Total</span>
                          <span className="text-xl font-black">KES {selectedVacancy.unit.totalMoveIn.toLocaleString()}</span>
                       </div>
                    </div>
                 </div>

                 <button className="w-full py-6 bg-[var(--text-base)] text-[var(--bg-panel)] text-xs font-black uppercase tracking-[0.4em] shadow-2xl hover:bg-[var(--accent-bg)] hover:text-white transition-all">
                    Apply Now
                 </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
}
