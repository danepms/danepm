"use client";

import React from 'react';
import { Building2, Plus, ArrowUpRight } from 'lucide-react';
import Link from 'next/link';

interface PropertiesTabProps {
  properties: any[];
  isLoading: boolean;
}

export const PropertiesTab = ({ properties, isLoading }: PropertiesTabProps) => {
  const totalProperties = properties.length;
  const totalUnitsCount = properties.reduce((acc, prop) => {
      const res = JSON.parse(prop.residentialUnits || '{}') as Record<string, string>;
      const com = JSON.parse(prop.commercialUnits || '{}') as Record<string, string>;
      return acc + Object.values(res).reduce((a: number, b: string) => a + (parseInt(b) || 0), 0) + 
                  Object.values(com).reduce((a: number, b: string) => a + (parseInt(b) || 0), 0);
  }, 0);
  
  const totalOccupiedCount = properties.reduce((acc, prop) => {
      const config = JSON.parse(prop.config || '{}');
      return acc + (config.units?.filter((u: any) => u.status === 'occupied').length || 0);
  }, 0);

  const totalMoney = properties.reduce((acc, prop) => {
      const resUnits = JSON.parse(prop.residentialUnits || '{}');
      const comUnits = JSON.parse(prop.commercialUnits || '{}');
      const config = JSON.parse(prop.config || '{}');
      
      return acc + Object.entries(config.rents || {}).reduce((total, [type, priceVal]) => {
          const count = (parseInt(resUnits[type] as string) || 0) + (parseInt(comUnits[type] as string) || 0);
          let price = 0;
          if (typeof priceVal === 'object' && priceVal !== null) {
              price = ((parseFloat((priceVal as any).min) || 0) + (parseFloat((priceVal as any).max) || 0)) / 2;
          } else {
              price = parseFloat(priceVal as string) || 0;
          }
          return total + (count * price);
      }, 0);
  }, 0);

  if (isLoading) {
    return (
      <div className="h-[400px] flex items-center justify-center">
         <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-[var(--accent-bg)] border-t-transparent rounded-full animate-spin" />
            <p className="font-mono text-[10px] uppercase font-black opacity-50">Syncing Assets...</p>
         </div>
      </div>
    );
  }

  return (
    <div className="space-y-12 animate-reveal">
      {/* STATS OVERVIEW */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-[var(--bg-panel)] border border-[var(--border)] border-opacity-10 p-8 rounded-xl shadow-[8px_8px_0px_0px_var(--shadow-color)] group hover:translate-y-[-4px] transition-all">
              <p className="font-mono text-[8px] uppercase text-[var(--text-muted)] font-black tracking-widest mb-1">Total Assets</p>
              <div className="flex items-end justify-between">
                  <p className="text-4xl font-black tracking-tighter">{totalProperties}</p>
                  <Building2 className="opacity-10 group-hover:opacity-100 transition-opacity" size={24} />
              </div>
          </div>
          <div className="bg-[var(--bg-panel)] border border-[var(--border)] border-opacity-10 p-8 rounded-xl shadow-[8px_8px_0px_0px_var(--shadow-color)] group hover:translate-y-[-4px] transition-all">
              <p className="font-mono text-[8px] uppercase text-[var(--text-muted)] font-black tracking-widest mb-1">Unit Inventory</p>
              <div className="flex items-end justify-between">
                  <p className="text-4xl font-black tracking-tighter">{totalUnitsCount}</p>
                  <div className="font-mono text-[10px] font-black text-[var(--accent-bg)] mb-1">{(totalOccupiedCount/totalUnitsCount * 100 || 0).toFixed(0)}% OCC</div>
              </div>
          </div>
          <div className="bg-[var(--bg-panel)] border border-[var(--border)] border-opacity-10 p-8 rounded-xl shadow-[8px_8px_0px_0px_var(--shadow-color)] group hover:translate-y-[-4px] transition-all">
              <p className="font-mono text-[8px] uppercase text-[var(--text-muted)] font-black tracking-widest mb-1">Total Rent</p>
              <div className="flex items-end justify-between">
                  <p className="text-4xl font-black tracking-tighter">KES {totalMoney.toLocaleString()}</p>
              </div>
          </div>
          <div className="bg-[var(--bg-panel)] border border-[var(--border)] border-opacity-10 p-8 rounded-xl shadow-[8px_8px_0px_0px_var(--shadow-color)] group hover:translate-y-[-4px] transition-all">
              <p className="font-mono text-[8px] uppercase text-[var(--text-muted)] font-black tracking-widest mb-1">Occupancy</p>
              <div className="flex items-end justify-between">
                  <p className="text-4xl font-black tracking-tighter">{totalOccupiedCount}</p>
                  <Building2 className="opacity-10 group-hover:opacity-100 transition-opacity" size={24} />
              </div>
          </div>
      </div>

      <div className="flex items-center justify-between border-b border-[var(--border)] pb-8 border-opacity-10">
        <div>
          <h2 className="text-5xl font-black uppercase tracking-tighter text-[var(--text-base)] leading-none">My Properties</h2>
          <p className="font-mono text-[10px] text-[var(--text-muted)] uppercase font-bold tracking-[0.2em] mt-3">
            Overview of your managed assets and units
          </p>
        </div>
        <Link href="/dashboard/manager/properties/new" className="bg-[var(--text-base)] text-[var(--bg-panel)] px-8 py-4 font-mono text-[11px] uppercase font-black hover:translate-y-[-2px] active:translate-y-0 transition-all flex items-center gap-3 shadow-[8px_8px_0px_0px_var(--shadow-color)]">
          <Plus size={16} /> New Property
        </Link>
      </div>

      {properties.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {properties.map((p) => {
            const resUnits = JSON.parse(p.residentialUnits || '{}') as Record<string, string>;
            const comUnits = JSON.parse(p.commercialUnits || '{}') as Record<string, string>;
            const totalUnits = Object.values(resUnits).reduce((a: number, b: string) => a + (parseInt(b) || 0), 0) + 
                              Object.values(comUnits).reduce((a: number, b: string) => a + (parseInt(b) || 0), 0);
            
            const config = JSON.parse(p.config || '{}');
            const occupied = config.units?.filter((u: any) => u.status === 'occupied').length || 0;

            return (
              <div key={p.id} className="group relative bg-[var(--bg-panel)] border border-[var(--border)] border-opacity-10 rounded-2xl overflow-hidden hover:shadow-[16px_16px_0px_0px_var(--shadow-color)] transition-all hover:translate-y-[-4px]">
                <div className="aspect-video bg-[var(--bg-ghost)] relative overflow-hidden">
                  <img src={p.imageUrl || "https://images.unsplash.com/photo-1568605114967-8130f3a36994?auto=format&fit=crop&q=80"} alt={p.name} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 group-hover:scale-105" />
                  <div className="absolute top-4 right-4 bg-[var(--bg-panel)] border border-[var(--border)] px-4 py-2 font-mono text-[9px] font-black uppercase tracking-widest shadow-[4px_4px_0px_0px_var(--shadow-color)]">
                    {p.location}
                  </div>
                </div>
                <div className="p-8 space-y-6">
                  <div className="flex justify-between items-start">
                      <div>
                          <h3 className="text-2xl font-black uppercase tracking-tighter text-[var(--text-base)]">{p.name}</h3>
                          <p className="font-mono text-[9px] text-[var(--text-muted)] uppercase font-bold tracking-widest mt-1">{totalUnits} Total Units</p>
                      </div>
                      <Link href={`/dashboard/manager/properties/${p.id}`} className="p-3 bg-[var(--text-base)] text-[var(--bg-panel)] hover:bg-[var(--accent-bg)] hover:text-[var(--accent-text)] transition-all rounded-lg">
                          <ArrowUpRight size={18} />
                      </Link>
                  </div>

                  <div className="space-y-4">
                      <div className="flex justify-between items-center font-mono text-[10px] uppercase font-black">
                          <span className="opacity-50">Occupancy</span>
                          <span className={occupied === totalUnits ? "text-green-500" : ""}>{occupied}/{totalUnits}</span>
                      </div>
                      <div className="w-full h-2 bg-[var(--bg-ghost)] border border-[var(--border)] border-opacity-5 overflow-hidden">
                          <div className="h-full bg-[var(--accent-bg)] transition-all duration-1000" style={{ width: `${(occupied / totalUnits) * 100}%` }} />
                      </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="h-[400px] border-2 border-dashed border-[var(--border)] border-opacity-10 flex flex-col items-center justify-center space-y-6">
          <Building2 size={48} className="text-[var(--text-muted)] opacity-20" />
          <div className="text-center">
            <h4 className="font-black uppercase text-xl text-[var(--text-base)] tracking-tighter">No Active Assets</h4>
            <p className="font-mono text-[10px] text-[var(--text-muted)] uppercase font-bold mt-1">Your management portfolio is currently empty</p>
          </div>
          <Link href="/dashboard/manager/properties/new" className="bg-[var(--bg-ghost)] text-[var(--text-base)] border border-[var(--border)] px-8 py-3 font-mono text-[10px] uppercase font-black hover:bg-[var(--accent-bg)] hover:text-[var(--accent-text)] hover:border-[var(--accent-bg)] transition-all">Start Onboarding</Link>
        </div>
      )}
    </div>
  );
};
