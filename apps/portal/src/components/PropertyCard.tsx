"use client";

import React from 'react';
import { Building2, ArrowUpRight, CircleSlash, DollarSign, Zap, AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import { parseConfig } from '@/lib/utils';

interface PropertyCardProps {
  property: any;
}

const CompactDonut = ({ value, total, color }: { value: number, total: number, color: string }) => {
    const radius = 18;
    const circ = 2 * Math.PI * radius;
    const perc = Math.min(100, (value / total) * 100) || 0;
    const offset = circ - (perc / 100) * circ;
    
    return (
        <div className="relative w-12 h-12 shrink-0">
            <svg className="w-full h-full -rotate-90">
                <circle cx="24" cy="24" r={radius} fill="transparent" stroke="currentColor" strokeWidth="3" className="text-white/[0.03]" />
                <circle cx="24" cy="24" r={radius} fill="transparent" stroke={color} strokeWidth="4" 
                    strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="square"
                    className="transition-all duration-1000" />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-[8px] font-black opacity-40">{perc.toFixed(0)}%</span>
            </div>
        </div>
    );
};

export const PropertyCard = ({ property }: PropertyCardProps) => {
    const config = parseConfig(property.config);
    const isLive = property.isLive;
    
    // UNIFIED SOURCE OF TRUTH: UNIT REGISTRY
    const units = config.units || [];
    const getAccurateUnits = () => {
        // 1. Priority: Live Unit Registry
        if (config.units?.length > 0) return config.units.length;

        // 2. Priority: Excel upload records
        if (config.masterUploads?.length > 0) {
            const latest = config.masterUploads[config.masterUploads.length - 1];
            return parseInt(latest.totalUnits) || 0;
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
    const totalUnits = getAccurateUnits();
    const occupied = units.filter((u: any) => u.status === 'occupied').length || 0;
    const vacant = Math.max(0, totalUnits - occupied);
    const arrears = config.tenants?.reduce((s: number, t: any) => s + (parseFloat(t.arrears) || 0), 0) || 0;
    
    // REVENUE CALCULATION (MIRRORING DETAILS PAGE)
    const rents = config.rents || {};
    const totalPotentialRent = Object.entries(rents).reduce((acc, [type, priceVal]) => {
        const count = units.filter((u: any) => u.typeId === type).length;
        let price = 0;
        if (Array.isArray(priceVal)) price = parseFloat(priceVal[0]) || 0;
        else if (typeof priceVal === 'object' && priceVal !== null) price = (parseFloat((priceVal as any).min) || 0);
        else price = parseFloat(priceVal as string) || 0;
        return acc + (count * price);
    }, 0);
    
    const totalPaid = Math.max(0, totalPotentialRent - arrears);
    const debtRatio = totalPotentialRent > 0 ? (arrears / totalPotentialRent) : 0;
    
    const getDebtColor = (ratio: number) => {
        if (ratio === 0) return 'rgb(34, 197, 94)'; 
        if (ratio < 0.1) return 'rgb(234, 179, 8)'; 
        if (ratio < 0.3) return 'rgb(249, 115, 22)'; 
        return 'rgb(239, 68, 68)'; 
    };

    return (
        <div className={`flex bg-[var(--bg-panel)] border rounded-none overflow-hidden transition-all duration-300 group h-44 shadow-2xl relative ${isLive ? 'border-white/5 hover:border-white/20' : 'border-amber-500/40 bg-amber-500/[0.03]'}`}>
            
            {/* 1/3 IMAGE SECTION */}
            <div className="w-1/3 h-full relative overflow-hidden border-r border-white/5">
                <img src={property.imageUrl} alt="" className={`w-full h-full object-cover transition-transform duration-[4s] group-hover:scale-110 ${!isLive ? 'grayscale opacity-20' : ''}`} />
                {!isLive && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                         <div className="bg-amber-500 text-black text-[8px] font-black px-2 py-1 uppercase tracking-widest">Setup</div>
                    </div>
                )}
            </div>

            {/* 2/3 DATA COCKPIT */}
            <div className="w-2/3 h-full p-4 flex flex-col justify-between">
                
                <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2 max-w-[80%]">
                        <h3 className="text-lg font-black uppercase tracking-tighter truncate leading-tight">{property.name}</h3>
                        {!isLive && <AlertTriangle size={14} className="text-amber-500 shrink-0 animate-pulse" />}
                    </div>
                    <Link href={`/dashboard/manager/properties/${property.id}`} className={`shrink-0 p-2 transition-all ${!isLive ? 'bg-amber-500 text-black hover:bg-amber-400' : 'opacity-20 group-hover:opacity-100 hover:text-[var(--accent-bg)]'}`}>
                        {isLive ? <ArrowUpRight size={16} /> : <Zap size={14} fill="currentColor" />}
                    </Link>
                </div>

                <div className="flex items-center gap-6">
                    <div className="flex gap-4">
                        {/* Donut 1: Occupancy */}
                        <CompactDonut value={occupied} total={totalUnits} color={isLive ? "var(--accent-bg)" : "rgba(245,158,11,0.2)"} />
                        {/* Donut 2: Collection */}
                        <CompactDonut value={totalPaid} total={totalPotentialRent} color={isLive ? getDebtColor(debtRatio) : "rgba(245,158,11,0.2)"} />
                    </div>

                    <div className="flex-1 grid grid-cols-1 gap-2">
                        <div className="flex items-center justify-between">
                            <Building2 size={12} className="opacity-20" />
                            <span className="font-mono text-[10px] font-black">{totalUnits}</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <CircleSlash size={12} className="opacity-20" />
                            <span className="font-mono text-[10px] font-black text-red-500">{vacant}</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <DollarSign size={12} className="opacity-20" />
                            <span className="font-mono text-[10px] font-black text-green-500">{(totalPaid / 1000).toFixed(1)}K</span>
                        </div>
                    </div>
                </div>

                {/* DEBT RATIO INDICATOR */}
                <div className="space-y-1.5 pt-2 border-t border-white/5">
                    <div className="h-1 w-full bg-white/5 overflow-hidden">
                        <div 
                            className="h-full transition-all duration-1000 shadow-[0_0_8px_rgba(255,255,255,0.1)]" 
                            style={{ 
                                width: `${Math.min(100, debtRatio * 100)}%`,
                                backgroundColor: isLive ? getDebtColor(debtRatio) : 'rgba(245,158,11,0.2)'
                            }} 
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};
