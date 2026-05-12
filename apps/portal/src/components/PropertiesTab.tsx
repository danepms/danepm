"use client";

import React, { useState, useMemo } from 'react';
import { Building2, Plus, Download, Search, Filter, ChevronLeft, ChevronRight, LayoutGrid, List, Activity, Zap } from 'lucide-react';
import Link from 'next/navigation';
import { useRouter } from 'next/navigation';
import { parseConfig } from '@/lib/utils';
import { PropertyCard } from './PropertyCard';

interface PropertiesTabProps {
  properties: any[];
  isLoading: boolean;
}

export const PropertiesTab = ({ properties, isLoading }: PropertiesTabProps) => {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'pending' | 'arrears' | 'occupied'>('all');
  const router = useRouter();

  // UNIFIED SOURCE OF TRUTH HELPER
  const getAccurateUnits = (p: any) => {
    const config = parseConfig(p.config);
    
    // 1. Priority: Live Unit Registry
    if (config.units?.length > 0) return config.units.length;

    // 2. Priority: Excel upload records
    if (config.masterUploads?.length > 0) {
        const latestUpload = config.masterUploads[config.masterUploads.length - 1];
        return parseInt(latestUpload.totalUnits) || 0;
    }

    // 3. Priority: Wizard Unit Summaries (New)
    if (config.unitSummaries) {
        const res = config.unitSummaries.residential || {};
        const com = config.unitSummaries.commercial || {};
        return Object.values(res).reduce((a: number, b: any) => a + (parseInt(b) || 0), 0) + 
               Object.values(com).reduce((a: number, b: any) => a + (parseInt(b) || 0), 0);
    }
    
    return 0;
  };

  const getUnifiedStats = (p: any) => {
    const config = parseConfig(p.config);
    const units = config.units || [];
    const totalUnits = getAccurateUnits(p);
    const occupied = units.filter((u: any) => u.status === 'occupied').length || 0;
    const arrears = config.tenants?.reduce((s: number, t: any) => s + (parseFloat(t.arrears) || 0), 0) || 0;
    
    // Revenue logic mirrored from details page
    const rents = config.rents || {};
    const totalPotential = Object.entries(rents).reduce((acc, [type, priceVal]) => {
        const count = units.filter((u: any) => u.typeId === type).length;
        let price = 0;
        if (Array.isArray(priceVal)) price = parseFloat(priceVal[0]) || 0;
        else if (typeof priceVal === 'object' && priceVal !== null) price = (parseFloat((priceVal as any).min) || 0);
        else price = parseFloat(priceVal as string) || 0;
        return acc + (count * price);
    }, 0);

    return { totalUnits, occupied, arrears, totalPotential };
  };

  const globalStats = useMemo(() => {
    let totalU = 0;
    let totalO = 0;
    let totalA = 0;
    let totalExpected = 0;
    let pendingCount = 0;

    properties.forEach(p => {
        if (!p.isLive) {
            pendingCount++;
            return;
        }

        const stats = getUnifiedStats(p);
        totalU += stats.totalUnits;
        totalO += stats.occupied;
        totalA += stats.arrears;
        totalExpected += stats.totalPotential;
    });

    return { totalU, totalO, totalA, totalExpected, pendingCount };
  }, [properties]);

  const filtered = useMemo(() => {
    return properties.filter(p => {
        const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.location.toLowerCase().includes(search.toLowerCase());
        if (!matchesSearch) return false;
        if (filter === 'pending') return !p.isLive;
        
        const stats = getUnifiedStats(p);
        if (filter === 'occupied') return stats.occupied === stats.totalUnits && stats.totalUnits > 0;
        if (filter === 'arrears') return stats.arrears > 0;
        return true;
    });
  }, [properties, search, filter]);

  if (isLoading) {
    return (
      <div className="h-[600px] flex items-center justify-center">
         <div className="flex flex-col items-center gap-6">
            <div className="w-12 h-12 border border-white/10 flex items-center justify-center animate-spin">
                <div className="w-6 h-6 border-t border-[var(--accent-bg)]" />
            </div>
            <p className="font-mono text-[8px] uppercase font-black tracking-[0.6em] opacity-20">Loading...</p>
         </div>
      </div>
    );
  }

  return (
    <div className="space-y-12 animate-reveal pb-32 px-4 font-sans">
      
      {/* SHARP COMMAND HEADER */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8 pt-8">
        <div className="space-y-1">
          <h2 className="text-5xl font-black uppercase tracking-tighter leading-none">Properties</h2>
          <div className="flex items-center gap-3">
            <div className="w-1.5 h-1.5 bg-green-500 animate-pulse" />
            <p className="font-mono text-[7px] font-black uppercase tracking-[0.4em] opacity-20">{properties.filter(p => p.isLive).length} Live — {globalStats.pendingCount} Need Setup</p>
          </div>
        </div>
        
        <div className="flex gap-1 w-full lg:w-auto">
            <button className="flex-1 lg:flex-none flex items-center justify-center gap-3 px-8 py-4 bg-[var(--bg-panel)] border border-white/5 rounded-none text-[9px] font-black uppercase tracking-widest hover:bg-white/5 transition-all">
                <Download size={12} /> Download
            </button>
            <button onClick={() => router.push('/dashboard/manager/properties/new')} className="flex-1 lg:flex-none flex items-center justify-center gap-3 px-8 py-4 bg-[var(--text-base)] text-[var(--bg-panel)] rounded-none text-[9px] font-black uppercase tracking-widest hover:bg-[var(--accent-bg)] hover:text-white transition-all shadow-2xl">
                <Plus size={12} /> Add Property
            </button>
        </div>
      </div>

      {/* SHARP GLOBAL PULSE */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-px bg-white/5 border border-white/5">
          {/* Revenue Health Map */}
          <div className="lg:col-span-8 bg-[var(--bg-panel)] p-10 flex flex-col justify-between h-80">
              <div className="space-y-1">
                  <p className="text-[8px] font-black uppercase opacity-20 tracking-[0.5em]">Money Collection</p>
                  <h3 className="text-3xl font-black tracking-tighter uppercase">Rent Overview</h3>
              </div>
              
              <div className="flex items-end gap-1 h-32">
                  {[40, 70, 45, 90, 65, 80, 100, 85, 95, 100].map((h, i) => (
                      <div key={i} className="flex-1 bg-white/5 group relative hover:bg-[var(--accent-bg)]/20 transition-all cursor-crosshair">
                          <div className="absolute bottom-0 left-0 right-0 bg-[var(--accent-bg)] transition-all" style={{ height: `${h}%` }} />
                      </div>
                  ))}
              </div>

              <div className="flex justify-between items-center pt-6 border-t border-white/5 font-mono">
                  <div className="flex gap-12">
                      <div>
                          <p className="text-[7px] font-black uppercase opacity-20 mb-1">Arrears</p>
                          <p className="text-xl font-black text-red-500">KES {globalStats.totalA.toLocaleString()}</p>
                      </div>
                      <div>
                          <p className="text-[7px] font-black uppercase opacity-20 mb-1">Total Rent</p>
                          <p className="text-xl font-black">KES {globalStats.totalExpected.toLocaleString()}</p>
                      </div>
                  </div>
                  <div className="text-right">
                      <p className="text-[7px] font-black uppercase opacity-20 mb-1">Paid %</p>
                      <p className="text-xl font-black text-green-500">{( (globalStats.totalExpected - globalStats.totalA) / globalStats.totalExpected * 100 || 0).toFixed(1)}%</p>
                  </div>
              </div>
          </div>

          {/* Occupancy Velocity */}
          <div className="lg:col-span-4 bg-[var(--bg-panel)] p-10 flex flex-col justify-between h-80">
              <div className="space-y-1">
                  <p className="text-[8px] font-black uppercase opacity-20 tracking-[0.5em]">Unit Status</p>
                  <h3 className="text-3xl font-black tracking-tighter uppercase">Occupancy</h3>
              </div>

              <div className="flex items-center gap-8">
                  <div className="w-24 h-24 border border-white/10 flex items-center justify-center relative">
                      <p className="text-xl font-black tracking-tighter">{(globalStats.totalO/globalStats.totalU * 100 || 0).toFixed(0)}%</p>
                      <div className="absolute inset-0 border border-[var(--accent-bg)] opacity-30" style={{ clipPath: `inset(${100 - (globalStats.totalO/globalStats.totalU * 100 || 0)}% 0 0 0)` }} />
                  </div>
                  <div className="space-y-4 font-mono text-[9px] font-black uppercase">
                      <div className="flex items-center gap-3">
                          <div className="w-1 h-1 bg-[var(--accent-bg)]" />
                          <span className="opacity-40">Occupied: {globalStats.totalO}</span>
                      </div>
                      <div className="flex items-center gap-3 text-red-500">
                          <div className="w-1 h-1 bg-red-500" />
                          <span>Vacant: {globalStats.totalU - globalStats.totalO}</span>
                      </div>
                      <div className="flex items-center gap-3 text-amber-500">
                          <div className="w-1 h-1 bg-amber-500 animate-pulse" />
                          <span>Needs Setup: {globalStats.pendingCount}</span>
                      </div>
                  </div>
              </div>
          </div>
      </div>

      {/* FILTER BAR */}
      <div className="flex flex-col lg:flex-row gap-px bg-white/5 border border-white/5">
          <div className="flex flex-wrap flex-1 bg-[var(--bg-panel)]">
              {[
                { id: 'all', label: 'All' },
                { id: 'pending', label: 'Need Setup' },
                { id: 'arrears', label: 'In Arrears' },
                { id: 'occupied', label: 'Full' }
              ].map(t => (
                <button 
                    key={t.id}
                    onClick={() => setFilter(t.id as any)}
                    className={`px-10 py-5 text-[8px] font-black uppercase tracking-widest border-r border-white/5 transition-all ${filter === t.id ? 'bg-white/10 opacity-100 shadow-[inset_0_-2px_0_0_var(--accent-bg)]' : 'opacity-20 hover:opacity-100 hover:bg-white/[0.02]'}`}
                >
                    {t.label}
                </button>
              ))}
          </div>

          <div className="relative w-full lg:w-96 bg-[var(--bg-panel)] flex items-center">
              <Search className="absolute left-6 opacity-20" size={14} />
              <input 
                type="text" 
                placeholder="Search..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-transparent py-5 pl-14 pr-6 text-[9px] font-black uppercase tracking-widest outline-none border-none"
              />
          </div>
      </div>

      {/* ASSET GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-6">
        {filtered.map((p) => (
            <PropertyCard key={p.id} property={p} />
        ))}
      </div>

    </div>
  );
};
