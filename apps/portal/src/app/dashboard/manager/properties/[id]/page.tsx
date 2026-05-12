"use client";

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { 
  Building2, MapPin, Users, Plus, ArrowUpRight, 
  AlertCircle, ChevronLeft, CreditCard, Receipt, 
  TrendingUp, Home, Settings, UserPlus, LogOut,
  Zap, Droplets, Trash2, Edit3, Terminal, Check, X
} from 'lucide-react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { useToast } from '@/context/ToastContext';
import { useSession } from '@/lib/auth-client';
import { AddTenantModal } from '@/components/AddTenantModal';
import { MoveOutModal } from '@/components/MoveOutModal';
import { CreateMaintenanceModal } from '@/components/CreateMaintenanceModal';
import { Wrench } from 'lucide-react';

export default function PropertyDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const { showToast } = useToast();
  const { data: session } = useSession();

  const [property, setProperty] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'pulse' | 'finance' | 'admin'>('pulse');
  const [selectedUnit, setSelectedUnit] = useState<any>(null);
  const [pulseFilter, setPulseFilter] = useState<'all' | 'paid' | 'arrears' | 'vacant'>('all');
  const [showAddTenant, setShowAddTenant] = useState(false);
  const [showMaintenance, setShowMaintenance] = useState(false);
  const [archivingTenant, setArchivingTenant] = useState<any>(null);
  const [tenants, setTenants] = useState<any[]>([]);

  // Policy Override State
  const [overrideDueDay, setOverrideDueDay] = useState<number | null>(null);
  const [overridePenaltyValue, setOverridePenaltyValue] = useState<number | null>(null);
  const [overridePenaltyType, setOverridePenaltyType] = useState<'percent' | 'flat' | null>(null);

  const reloadData = async () => {
    if (!session?.user?.id) return;
    const [propRes, tenantRes] = await Promise.all([
        api.get<any>(`/properties/${id}?managerId=${session.user.id}`),
        api.get<any>(`/tenants?propertyId=${id}&managerId=${session.user.id}`)
    ]);
    if (propRes.success && propRes.property) setProperty(propRes.property);
    if (tenantRes.success) setTenants(tenantRes.tenants);
  };

  useEffect(() => {
    const fetchPropertyData = async () => {
      if (!session?.user?.id) return;
      const [propRes, tenantRes] = await Promise.all([
          api.get<any>(`/properties/${id}?managerId=${session.user.id}`),
          api.get<any>(`/tenants?propertyId=${id}&managerId=${session.user.id}`)
      ]);

      if (propRes.success && propRes.property) {
        setProperty(propRes.property);
        const cfg = typeof propRes.property.config === 'string' ? JSON.parse(propRes.property.config) : propRes.property.config;
        if (cfg?.finance) {
            setOverrideDueDay(cfg.finance.rentDueDay);
            setOverridePenaltyValue(cfg.finance.penaltyValue);
            setOverridePenaltyType(cfg.finance.penaltyType);
        }
      } else {
        showToast("Asset not found in registry", "error");
        router.push('/dashboard/manager/properties');
      }

      if (tenantRes.success) {
          setTenants(tenantRes.tenants);
      }

      setIsLoading(false);
    };
    fetchPropertyData();
  }, [id, router, showToast, session?.user?.id]);

  if (isLoading || !property) {
    return (
        <div className="min-h-screen bg-[var(--bg-base)] flex items-center justify-center">
            <div className="w-12 h-12 border-4 border-[var(--accent-bg)] border-t-transparent rounded-full animate-spin" />
        </div>
    );
  }

  const config = typeof property.config === 'string' ? JSON.parse(property.config || '{}') : (property.config || {});
  const units = config.units || [];
  const totalUnits = units.length;
  
  const occupiedCount = units.filter((u: any) => u.status === 'occupied').length || 0;
  const occupancyRate = totalUnits > 0 ? Math.round((occupiedCount / totalUnits) * 100) : 0;

  // Check if property is initialized
  const hasUnits = units.length > 0;
  const hasPrices = Object.keys(config.rents || {}).length > 0;
  const isNotLive = !hasUnits || !hasPrices;

  return (
    <div className="min-h-screen bg-[var(--bg-base)] text-[var(--text-base)] pb-20">
      
      {/* GLOBAL HEADER */}
      <div className="border-b border-[var(--border)] border-opacity-10 bg-[var(--bg-panel)] sticky top-0 z-30 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <button 
              onClick={() => router.push('/dashboard/manager/properties')}
              className="p-2 hover:bg-[var(--bg-ghost)] transition-colors border border-transparent hover:border-[var(--border)] rounded-lg text-[var(--text-muted)]"
            >
              <ChevronLeft size={20} />
            </button>
            <div className="h-10 w-[1px] bg-[var(--border)] opacity-10" />
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-xl font-black uppercase tracking-tighter leading-none">{property.name}</h1>
                {isNotLive && (
                  <span className="px-2 py-0.5 bg-amber-500/10 text-amber-500 border border-amber-500/20 text-[8px] font-black uppercase tracking-widest rounded-sm">Draft</span>
                )}
              </div>
              <div className="flex items-center gap-2 mt-1">
                <span className="font-mono text-[8px] uppercase font-bold text-[var(--text-muted)] tracking-widest">{property.location} <span className="mx-2">|</span> ID: {property.id.slice(0, 8)}</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
             <Link 
              href={`/dashboard/manager/properties/${id}/setup`}
              className="flex items-center gap-2 px-4 py-2 border border-[var(--border)] hover:bg-[var(--text-base)] hover:text-[var(--bg-panel)] transition-all font-mono text-[10px] font-black uppercase shadow-[4px_4px_0px_0px_var(--shadow-color)]"
             >
                <Edit3 size={14} /> Edit Property
             </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 mt-10">

        {/* NOT LIVE WARNING BANNER */}
        {isNotLive && (
          <div className="bg-amber-500/5 border border-amber-500/20 p-8 mb-12 flex flex-col md:flex-row items-center justify-between rounded-lg backdrop-blur-xl gap-6 animate-in fade-in slide-in-from-top-4 duration-700">
            <div className="flex items-center gap-6">
              <div className="w-14 h-14 bg-amber-500 text-black flex items-center justify-center rounded-lg shadow-[0_8px_30px_rgb(245,158,11,0.2)] shrink-0">
                <AlertCircle size={28} strokeWidth={2.5} />
              </div>
              <div>
                <h4 className="text-lg font-black uppercase tracking-tight text-amber-500">Property Not Live</h4>
                <p className="text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-widest mt-1">
                  {!hasUnits ? "Unit registry is empty" : ""} {!hasUnits && !hasPrices ? "&" : ""} {!hasPrices ? "Rent pricing not set" : ""}. Complete initialization to enable management.
                </p>
              </div>
            </div>
            <Link 
              href={`/dashboard/manager/properties/${id}/setup`}
              className="w-full md:w-auto px-8 py-4 bg-amber-500 text-black font-black uppercase text-[10px] tracking-widest hover:bg-amber-400 transition-all shadow-[0_10px_20px_-5px_rgba(245,158,11,0.3)] text-center"
            >
              Initialize Asset
            </Link>
          </div>
        )}
        
        {/* STATS HUD */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
            <div className="glass-card bg-[var(--bg-panel)] border border-[var(--border)] border-opacity-10 p-6 shadow-[8px_8px_0px_0px_var(--shadow-color)]">
                <p className="font-mono text-[8px] uppercase text-[var(--text-muted)] font-black tracking-widest mb-4">Total Units</p>
                <div className="flex items-end justify-between">
                    <h3 className="text-4xl font-black tracking-tighter leading-none">{totalUnits}</h3>
                </div>
            </div>
            <div className="glass-card bg-[var(--bg-panel)] border border-[var(--border)] border-opacity-10 p-6 shadow-[8px_8px_0px_0px_var(--shadow-color)]">
                <p className="font-mono text-[8px] uppercase text-[var(--text-muted)] font-black tracking-widest mb-4">Occupied</p>
                <div className="flex items-end justify-between">
                    <h3 className="text-4xl font-black tracking-tighter leading-none">{occupancyRate}%</h3>
                    <div className="text-right">
                        <span className="text-[10px] font-mono font-black text-[var(--accent-bg)] uppercase">{occupiedCount} Units</span>
                    </div>
                </div>
            </div>
            <div className="glass-card bg-[var(--bg-panel)] border border-[var(--border)] border-opacity-10 p-6 shadow-[8px_8px_0px_0px_var(--shadow-color)]">
                <p className="font-mono text-[8px] uppercase text-[var(--text-muted)] font-black tracking-widest mb-4">Monthly Rent Roll</p>
                <div className="flex items-end justify-between">
                    <h3 className="text-3xl font-black tracking-tighter leading-none text-[var(--accent-bg)]">
                        KES {(() => {
                            const totalPotential = Object.entries(config.rents || {}).reduce((acc, [type, priceVal]) => {
                                const count = units.filter((u: any) => u.typeId === type).length;
                                let price = 0;
                                if (Array.isArray(priceVal)) price = parseFloat(priceVal[0]) || 0;
                                else if (typeof priceVal === 'object' && priceVal !== null) price = (parseFloat((priceVal as any).min) || 0);
                                else price = parseFloat(priceVal as string) || 0;
                                return acc + (count * price);
                            }, 0);
                            return (totalPotential / 1000).toFixed(1) + 'K';
                        })()}
                    </h3>
                </div>
            </div>
            <div className="glass-card bg-[var(--bg-panel)] border border-[var(--border)] border-opacity-10 p-6 shadow-[8px_8px_0px_0px_var(--shadow-color)]">
                <p className="font-mono text-[8px] uppercase text-[var(--text-muted)] font-black tracking-widest mb-4">Total Arrears</p>
                <div className="flex items-end justify-between">
                    <h3 className="text-3xl font-black tracking-tighter leading-none text-red-500 uppercase">
                        KES {(() => {
                            const totalArrears = tenants.reduce((acc, t) => acc + (parseFloat(t.arrears) || 0), 0);
                            return totalArrears >= 1000 ? (totalArrears / 1000).toFixed(1) + 'K' : totalArrears.toLocaleString();
                        })()}
                    </h3>
                </div>
            </div>
        </div>

        {/* INTERACTIVE TERMINAL */}
        <div className="flex flex-col gap-10">
            
            {/* TOP NAVIGATION */}
            <div className="flex flex-wrap gap-2 bg-[var(--bg-panel)] border border-[var(--border)] border-opacity-10 p-3 shadow-[8px_8px_0px_0px_var(--shadow-color)]">
                {[
                    { id: 'pulse', label: 'Units', icon: Home },
                    { id: 'finance', label: 'Money', icon: CreditCard },
                    { id: 'admin', label: 'Settings', icon: Settings }
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`flex items-center gap-3 px-8 py-4 font-mono text-[10px] font-black uppercase transition-all border ${activeTab === tab.id ? 'bg-[var(--text-base)] text-[var(--bg-panel)] border-[var(--text-base)] shadow-[4px_4px_0px_0px_var(--shadow-color)]' : 'text-[var(--text-muted)] hover:bg-[var(--bg-ghost)] border-transparent'}`}
                    >
                        <tab.icon size={16} />
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* MAIN CONTENT AREA */}
            <div className="flex-1 min-h-[600px] glass-card bg-[var(--bg-panel)] border border-[var(--border)] border-opacity-10 p-10 shadow-[8px_8px_0px_0px_var(--shadow-color)] animate-reveal">
                
                {activeTab === 'pulse' && (
                    <div>
                        <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 border-b border-[var(--border)] pb-8 border-opacity-10 gap-4">
                            <div>
                                <h2 className="text-4xl font-black uppercase tracking-tighter">Units</h2>
                                <p className="font-mono text-[8px] uppercase text-[var(--text-muted)] font-black tracking-widest mb-1">Manage your {totalUnits} rooms and shops</p>
                            </div>
                            
                            <div className="flex flex-wrap items-center gap-4">
                                <div className="flex bg-[var(--bg-ghost)] border border-[var(--border)] border-opacity-20 p-1">
                                    {['all', 'paid', 'arrears', 'vacant'].map((f) => (
                                        <button 
                                            key={f}
                                            onClick={() => setPulseFilter(f as any)}
                                            className={`px-4 py-2 font-mono text-[9px] font-black uppercase transition-colors ${pulseFilter === f ? 'bg-[var(--text-base)] text-[var(--bg-panel)] shadow-[2px_2px_0px_0px_var(--shadow-color)]' : 'text-[var(--text-muted)] hover:text-[var(--text-base)]'}`}
                                        >
                                            {f}
                                        </button>
                                    ))}
                                </div>
                                <button onClick={() => setShowAddTenant(true)} className="flex items-center gap-2 px-6 py-3 bg-[var(--accent-bg)] text-white font-mono text-[10px] font-black uppercase shadow-[4px_4px_0px_0px_var(--shadow-color)] hover:translate-y-[-2px] transition-all">
                                    <UserPlus size={16} /> Add Tenant
                                </button>
                            </div>
                        </div>

                        <div className="space-y-12">
                            {(() => {
                                const floors = Array.from(new Set(units.map((u: any) => parseInt(u.floor) || 1))).sort((a: any, b: any) => b - a);
                                return floors.map((floorNum: any) => {
                                    const floorUnits = units.filter((u: any) => {
                                        if ((parseInt(u.floor) || 1) !== floorNum) return false;
                                        
                                        if (pulseFilter === 'all') return true;
                                        if (pulseFilter === 'vacant') return u.status === 'vacant';
                                        
                                        if (u.status === 'occupied') {
                                            const tenant = tenants.find((t: any) => t.unitId === u.name);
                                            const hasArrears = parseFloat(tenant?.arrears || "0") > 0;
                                            if (pulseFilter === 'paid') return !hasArrears;
                                            if (pulseFilter === 'arrears') return hasArrears;
                                        }
                                        
                                        return false;
                                    });

                                    if (floorUnits.length === 0) return null;

                                return (
                                <div key={floorNum} className="relative">
                                    <div className="flex items-center gap-4 mb-6">
                                        <div className="bg-[var(--text-base)] text-[var(--bg-panel)] px-3 py-1 font-mono text-[9px] font-black uppercase">Floor {floorNum}</div>
                                        <div className="flex-1 h-[1px] bg-[var(--border)] opacity-10" />
                                    </div>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-4">
                                        {floorUnits.map((unit: any) => (
                                            <button 
                                                key={unit.id}
                                                onClick={() => setSelectedUnit(unit)}
                                                className="p-4 text-left flex flex-col justify-between h-32 transition-all duration-300 relative group overflow-hidden bg-[var(--bg-ghost)] border border-[var(--border)] border-opacity-20 hover:border-opacity-50"
                                            >
                                                {unit.status === 'occupied' ? (() => {
                                                    const tenant = config.tenants?.find((t: any) => t.id === unit.tenantId);
                                                    const isArrears = (tenant?.arrears || 0) > 0;
                                                    return (
                                                        <>
                                                            <div className={`absolute top-0 left-0 w-1 h-full ${isArrears ? 'bg-red-500' : 'bg-emerald-500'}`} />
                                                            <div className="flex justify-between items-start pl-2">
                                                                <div className="font-black font-mono text-sm tracking-tight text-[var(--text-base)]">{unit.name}</div>
                                                                <div className={`px-2 py-1 font-mono text-[8px] font-black uppercase ${isArrears ? 'bg-red-500 bg-opacity-10 text-red-500' : 'bg-emerald-500 bg-opacity-10 text-emerald-500'}`}>
                                                                    {isArrears ? `-${tenant.arrears.toLocaleString()}` : 'PAID'}
                                                                </div>
                                                            </div>
                                                            <div className="mt-auto pl-2">
                                                                <p className="text-[10px] font-black uppercase truncate text-[var(--text-base)] mb-1">
                                                                    {tenant?.name || 'Active Tenant'}
                                                                </p>
                                                                <p className="font-mono text-[8px] text-[var(--text-muted)] uppercase tracking-widest">{unit.typeId}</p>
                                                            </div>
                                                        </>
                                                    )
                                                })() : (
                                                    <>
                                                        <div className="absolute top-0 left-0 w-1 h-full bg-gray-600 opacity-20" />
                                                        <div className="flex justify-between items-start pl-2">
                                                            <div className="font-black font-mono text-sm tracking-tight text-[var(--text-muted)]">{unit.name}</div>
                                                            <div className="px-2 py-1 font-mono text-[8px] font-black uppercase bg-gray-500 bg-opacity-10 text-gray-500">VACANT</div>
                                                        </div>
                                                        <div className="mt-auto pl-2">
                                                            <p className="font-mono text-[8px] text-[var(--text-muted)] uppercase tracking-widest">{unit.typeId}</p>
                                                        </div>
                                                    </>
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                );
                            });
                            })()}
                        </div>
                    </div>
                )}

                {activeTab === 'finance' && (
                    <div className="h-full flex flex-col">
                        <div className="flex items-center justify-between mb-10 border-b border-[var(--border)] pb-8 border-opacity-10">
                            <div>
                                <h2 className="text-3xl font-black uppercase tracking-tighter">Money</h2>
                                <p className="font-mono text-[9px] text-[var(--text-muted)] uppercase tracking-widest mt-2">Rent and Bills Analysis</p>
                            </div>
                            <button className="flex items-center gap-2 px-6 py-3 border border-[var(--border)] text-[var(--text-base)] font-mono text-[10px] font-black uppercase shadow-[4px_4px_0px_0px_var(--shadow-color)] hover:bg-[var(--text-base)] hover:text-[var(--bg-panel)] transition-all">
                                <Receipt size={16} /> New Bill
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 flex-1">
                            <div className="space-y-8">
                                <div className="p-8 border border-[var(--border)] border-opacity-10 bg-[var(--bg-ghost)] bg-opacity-30">
                                    <h4 className="font-black text-xs uppercase mb-6 flex items-center gap-2 text-[var(--text-muted)] tracking-widest">Expected Income Matrix</h4>
                                    <div className="space-y-4">
                                        {Object.entries(config.rents || {}).map(([type, price]: any) => {
                                            const count = units.filter((u: any) => u.typeId === type).length;
                                            return (
                                                <div key={type} className="flex justify-between items-center font-mono uppercase">
                                                    <span className="text-[10px] font-bold">{type} ({count} units)</span>
                                                    <span className="text-xs font-black">KES {(count * parseFloat(price)).toLocaleString()}</span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                                <div className="p-8 border border-[var(--border)] border-opacity-10 bg-[var(--bg-ghost)] bg-opacity-30">
                                    <h4 className="font-black text-xs uppercase mb-6 flex items-center gap-2 text-[var(--text-muted)] tracking-widest">Regular Bills</h4>
                                    <div className="space-y-4">
                                        {config.recurring?.length > 0 ? config.recurring.map((item: any) => (
                                            <div key={item.id} className="flex justify-between items-center font-mono uppercase">
                                                <span className="text-[10px] font-bold">{item.name}</span>
                                                <span className="text-xs font-black text-red-500">- KES {parseInt(item.amount).toLocaleString()}</span>
                                            </div>
                                        )) : (
                                            <p className="text-[9px] font-mono uppercase opacity-30">No recurring expenses logged</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                            
                             {(() => {
                                const totalPotentialRent = Object.entries(config.rents || {}).reduce((acc, [type, price]) => {
                                    const count = units.filter((u: any) => u.typeId === type).length;
                                    return acc + (count * parseFloat(price as string));
                                }, 0);
                                const totalBills = (config.recurring || []).reduce((acc: number, item: any) => acc + (parseInt(item.amount) || 0), 0);
                                const netProfit = totalPotentialRent - totalBills;

                                return (
                                    <div className="bg-[var(--text-base)] p-10 text-[var(--bg-panel)] flex flex-col justify-between shadow-[12px_12px_0px_0px_var(--accent-bg)]">
                                        <div>
                                            <p className="font-mono text-[9px] uppercase font-black tracking-[0.3em] opacity-50 mb-10">Monthly Potential Net</p>
                                            <h5 className="text-6xl font-black tracking-tighter leading-none mb-4">KES {(netProfit / 1000).toFixed(0)}K</h5>
                                        </div>
                                        <div className="pt-10 border-t border-white border-opacity-10 space-y-4">
                                            <div className="flex justify-between font-mono text-[10px] uppercase font-bold">
                                                <span>Total Rent Potential</span>
                                                <span>KES {totalPotentialRent.toLocaleString()}</span>
                                            </div>
                                            <div className="flex justify-between font-mono text-[10px] uppercase font-bold">
                                                <span>Recurring Bills</span>
                                                <span className="text-red-400">KES {totalBills.toLocaleString()}</span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })()}
                        </div>
                    </div>
                )}

                {activeTab === 'admin' && (
                    <div className="space-y-12">
                        <div>
                            <div className="flex items-center justify-between mb-10 border-b border-[var(--border)] pb-8 border-opacity-10">
                                <div>
                                    <h2 className="text-3xl font-black uppercase tracking-tighter">Asset Ownership</h2>
                                    <p className="font-mono text-[9px] text-[var(--text-muted)] uppercase tracking-widest mt-2">Assign and manage the property owner</p>
                                </div>
                            </div>

                            <div className="max-w-2xl">
                                {property.ownerId ? (
                                    <div className="p-8 border border-[var(--accent-bg)] border-opacity-20 bg-[var(--accent-bg)] bg-opacity-5 rounded-xl flex items-center justify-between">
                                        <div>
                                            <p className="font-mono text-[8px] uppercase font-black text-[var(--accent-bg)] tracking-[0.2em] mb-2">Verified Owner Assigned</p>
                                            <h4 className="font-black text-xl uppercase tracking-tighter">ID: {property.ownerId.slice(0, 12)}...</h4>
                                        </div>
                                        <button className="px-6 py-3 border border-red-500 text-red-500 font-mono text-[10px] font-black uppercase hover:bg-red-500 hover:text-white transition-all">Revoke Access</button>
                                    </div>
                                ) : (
                                    <div className="bg-[var(--bg-panel)] border border-[var(--border)] border-opacity-10 p-10 shadow-[12px_12px_0px_0px_var(--shadow-color)]">
                                        <h4 className="font-black text-sm uppercase mb-6 tracking-widest">Invite Property Owner</h4>
                                        <div className="flex gap-4">
                                            <input 
                                                type="email" 
                                                id="owner-email"
                                                placeholder="OWNER@EMAIL.COM" 
                                                className="flex-1 bg-[var(--bg-ghost)] border border-[var(--border)] border-opacity-20 px-6 py-4 font-mono text-xs uppercase font-black focus:border-[var(--accent-bg)] outline-none"
                                            />
                                            <button 
                                                onClick={async () => {
                                                    const email = (document.getElementById('owner-email') as HTMLInputElement).value;
                                                    if (!email) return;
                                                    const res = await api.post<any>("/invites/send", { propertyId: id, email, inviterId: property.userId });
                                                    if (res.success) {
                                                        showToast("Invite generated! See console for link.", "success");
                                                        // In a real app, this console log would be an email sent
                                                        console.log("SMART LINK:", res.inviteLink);
                                                    }
                                                }}
                                                className="bg-[var(--text-base)] text-[var(--bg-panel)] px-8 font-mono text-[11px] uppercase font-black hover:bg-[var(--accent-bg)] hover:text-white transition-all"
                                            >
                                                Send Invite
                                            </button>
                                        </div>
                                        <p className="mt-6 font-mono text-[9px] text-[var(--text-muted)] uppercase leading-relaxed">
                                            The owner will receive a smart link to join DanePMS. Once they sign in, they will automatically gain overwatch access to this asset.
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div>
                            <div className="flex items-center justify-between mb-10 border-b border-[var(--border)] pb-8 border-opacity-10 pt-10">
                                <div>
                                    <h2 className="text-3xl font-black uppercase tracking-tighter">Marketing & Vacancies</h2>
                                    <p className="font-mono text-[9px] text-[var(--text-muted)] uppercase tracking-widest mt-2">Control visibility on the public vacancies portal</p>
                                </div>
                            </div>

                            <div className="bg-[var(--bg-panel)] border border-[var(--border)] border-opacity-10 p-10 shadow-[12px_12px_0px_0px_var(--shadow-color)] max-w-2xl flex items-center justify-between">
                                <div className="space-y-2">
                                    <h4 className="font-black text-sm uppercase tracking-widest">Public Listing Enabled</h4>
                                    <p className="text-[10px] font-mono text-[var(--text-muted)] uppercase max-w-sm">When active, vacant units in this property will be visible on your marketing site.</p>
                                </div>
                                <button 
                                    onClick={async () => {
                                        const res = await api.post<any>(`/properties/${id}/marketing`, { enabled: !property.marketingEnabled, managerId: session?.user?.id || '' });
                                        if (res.success) {
                                            setProperty({ ...property, marketingEnabled: !property.marketingEnabled });
                                            showToast("Marketing visibility updated", "success");
                                        }
                                    }}
                                    className={`px-8 py-4 font-mono text-[10px] font-black uppercase transition-all ${property.marketingEnabled ? 'bg-green-500 text-black shadow-[4px_4px_0px_0px_rgba(34,197,94,0.3)]' : 'bg-red-500/10 text-red-500 border border-red-500/20'}`}
                                >
                                    {property.marketingEnabled ? 'Visible' : 'Hidden'}
                                </button>
                            </div>
                        </div>

                        <div>
                            <div className="flex items-center justify-between mb-10 border-b border-[var(--border)] pb-8 border-opacity-10 pt-10">
                                <div>
                                    <h2 className="text-3xl font-black uppercase tracking-tighter">Policy Overrides</h2>
                                    <p className="font-mono text-[9px] text-[var(--text-muted)] uppercase tracking-widest mt-2">supersede global manager rules for this specific asset</p>
                                </div>
                            </div>

                            <div className="bg-[var(--bg-panel)] border border-[var(--border)] border-opacity-10 p-10 shadow-[12px_12px_0px_0px_var(--shadow-color)] space-y-10 max-w-2xl">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-1">
                                        <label className="text-[9px] font-black uppercase text-[var(--text-muted)] tracking-widest">Rent Due Day</label>
                                        <input 
                                            type="number" 
                                            min={1} max={28}
                                            value={overrideDueDay || ''}
                                            onChange={(e) => setOverrideDueDay(e.target.value ? parseInt(e.target.value) : null)}
                                            className="w-full bg-black border border-[var(--border)] border-opacity-10 p-4 rounded-lg font-black text-xl outline-none"
                                            placeholder="USE GLOBAL"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[9px] font-black uppercase text-[var(--text-muted)] tracking-widest">Penalty Value</label>
                                        <input 
                                            type="number" 
                                            value={overridePenaltyValue || ''}
                                            onChange={(e) => setOverridePenaltyValue(e.target.value ? parseFloat(e.target.value) : null)}
                                            className="w-full bg-black border border-[var(--border)] border-opacity-10 p-4 rounded-lg font-black text-xl outline-none"
                                            placeholder="USE GLOBAL"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <label className="text-[9px] font-black uppercase text-[var(--text-muted)] tracking-widest">Late Fee Type</label>
                                    <div className="flex gap-2 p-1 bg-black rounded-lg border border-[var(--border)] border-opacity-10">
                                        <button 
                                            onClick={() => setOverridePenaltyType('percent')}
                                            className={`flex-1 py-3 text-[9px] font-black uppercase tracking-widest rounded ${overridePenaltyType === 'percent' ? 'bg-[var(--accent-bg)] text-[var(--accent-text)]' : 'text-[var(--text-muted)]'}`}
                                        >Percentage (%)</button>
                                        <button 
                                            onClick={() => setOverridePenaltyType('flat')}
                                            className={`flex-1 py-3 text-[9px] font-black uppercase tracking-widest rounded ${overridePenaltyType === 'flat' ? 'bg-[var(--accent-bg)] text-[var(--accent-text)]' : 'text-[var(--text-muted)]'}`}
                                        >Flat Rate (KES)</button>
                                        <button 
                                            onClick={() => setOverridePenaltyType(null)}
                                            className={`flex-1 py-3 text-[9px] font-black uppercase tracking-widest rounded ${overridePenaltyType === null ? 'bg-red-500/10 text-red-500' : 'text-[var(--text-muted)]'}`}
                                        >None</button>
                                    </div>
                                </div>

                                <div className="flex justify-end pt-4 border-t border-[var(--border)] border-opacity-5">
                                    <button 
                                        onClick={async () => {
                                            const newConfig = {
                                                ...config,
                                                finance: {
                                                    rentDueDay: overrideDueDay,
                                                    penaltyValue: overridePenaltyValue,
                                                    penaltyType: overridePenaltyType
                                                }
                                            };
                                            const res = await api.post<any>(`/properties/${id}/config`, { configData: newConfig, managerId: session?.user?.id || '' });
                                            if (res.success) showToast("Policy overrides saved", "success");
                                            else showToast("Failed to save overrides", "error");
                                        }}
                                        className="px-10 py-4 bg-[var(--text-base)] text-[var(--bg-panel)] font-mono text-[11px] uppercase font-black hover:bg-[var(--accent-bg)] hover:text-white transition-all shadow-xl"
                                    >
                                        Save Overrides
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div>
                            <div className="flex items-center justify-between mb-10 border-b border-[var(--border)] pb-8 border-opacity-10 pt-10">
                                <div>
                                    <h2 className="text-3xl font-black uppercase tracking-tighter text-red-500">Danger Zone</h2>
                                    <p className="font-mono text-[9px] text-[var(--text-muted)] uppercase tracking-widest mt-2">Critical Asset Management Operations</p>
                                </div>
                            </div>

                            <div className="space-y-6 max-w-2xl">
                                 <div className="p-8 border border-red-500 border-opacity-20 bg-red-500 bg-opacity-5 flex items-center justify-between group">
                                    <div>
                                        <h4 className="font-black text-sm uppercase mb-1">Archive Asset</h4>
                                        <p className="text-[10px] font-mono text-[var(--text-muted)] uppercase max-w-sm">Move this property to the cold storage registry. All lease cycles will be paused.</p>
                                    </div>
                                    <button className="px-6 py-3 border-2 border-red-500 text-red-500 font-mono text-[10px] font-black uppercase hover:bg-red-500 hover:text-white transition-all">Archive</button>
                                 </div>
                                 <div className="p-8 border border-red-500 border-opacity-20 bg-red-500 bg-opacity-5 flex items-center justify-between group">
                                    <div>
                                        <h4 className="font-black text-sm uppercase mb-1">Purge Asset Record</h4>
                                        <p className="text-[10px] font-mono text-[var(--text-muted)] uppercase max-w-sm">Permanent deletion of this asset and all associated unit data. This action is IRREVERSIBLE.</p>
                                    </div>
                                    <button className="px-6 py-3 bg-red-500 text-white font-mono text-[10px] font-black uppercase hover:opacity-90 transition-all">TERMINATE</button>
                                 </div>
                            </div>
                        </div>
                    </div>
                )}

            </div>
        </div>
      </div>
      {/* UNIT DETAIL MODAL */}
      {selectedUnit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 sm:p-10">
          <div className="absolute inset-0 bg-black bg-opacity-80 backdrop-blur-md" onClick={() => setSelectedUnit(null)} />
          <div className="relative w-full max-w-2xl bg-[var(--bg-panel)] border border-[var(--border)] border-opacity-20 shadow-[20px_20px_0px_0px_var(--shadow-color)] animate-reveal overflow-hidden">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between p-8 border-b border-[var(--border)] border-opacity-10">
              <div>
                <h3 className="text-4xl font-black uppercase tracking-tighter leading-none">{selectedUnit.name}</h3>
                <p className="font-mono text-[10px] text-[var(--text-muted)] uppercase tracking-widest mt-2">Floor {selectedUnit.floor} <span className="mx-2">|</span> {selectedUnit.typeId}</p>
              </div>
              <button 
                onClick={() => setSelectedUnit(null)}
                className="p-3 hover:bg-[var(--bg-ghost)] transition-colors border border-[var(--border)] border-opacity-10 rounded-lg text-[var(--text-muted)]"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-10 space-y-10">
              {/* STATUS BAR */}
              <div className="flex items-center gap-6">
                <div className={`px-6 py-2 font-mono text-[10px] font-black uppercase border-2 ${selectedUnit.status === 'occupied' ? 'border-[var(--accent-bg)] text-[var(--accent-bg)]' : 'border-gray-500 text-gray-500'}`}>
                    {selectedUnit.status}
                </div>
                <div className="flex-1 h-[2px] bg-[var(--border)] opacity-10" />
                <div className="font-mono text-xl font-black uppercase tracking-tighter">
                    KES {parseFloat(selectedUnit.rentOverride || config.rents?.[selectedUnit.typeId] || '0').toLocaleString()}
                </div>
              </div>

              {/* TENANT INFO */}
              {selectedUnit.status === 'occupied' ? (() => {
                const tenant = config.tenants?.find((t: any) => t.id === selectedUnit.tenantId);
                return (
                  <div className="space-y-8">
                    <div className="flex items-center justify-between bg-amber-500/5 border border-amber-500/10 p-4 rounded-xl">
                      <div className="flex items-center gap-3">
                        <Wrench size={18} className="text-amber-500" />
                        <span className="font-mono text-[9px] uppercase font-black text-amber-600">Maintenance Triage</span>
                      </div>
                      <button 
                        onClick={() => setShowMaintenance(true)}
                        className="px-4 py-2 bg-amber-500 text-black font-mono text-[8px] font-black uppercase hover:bg-amber-400 transition-all rounded shadow-sm"
                      >
                        Report Issue
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                      <div className="space-y-4">
                        <p className="font-mono text-[8px] uppercase text-[var(--text-muted)] font-black tracking-widest">Active Tenant</p>
                        <h4 className="text-2xl font-black uppercase tracking-tight">{tenant?.name || 'Loading...'}</h4>
                        <div className="space-y-2">
                           <div className="flex items-center gap-2 text-[var(--text-muted)] font-mono text-[10px] uppercase font-bold">
                             <Zap size={12} className="text-[var(--accent-bg)]" /> {tenant?.phone || 'NO PHONE'}
                           </div>
                           <div className="flex items-center gap-2 text-[var(--text-muted)] font-mono text-[10px] uppercase font-bold">
                             <Terminal size={12} className="text-[var(--accent-bg)]" /> ID: {tenant?.idNumber || 'NOT RECORDED'}
                           </div>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <p className="font-mono text-[8px] uppercase text-[var(--text-muted)] font-black tracking-widest">Arrears Balance</p>
                        <div className={`text-3xl font-black font-mono tracking-tighter ${tenant?.arrears > 0 ? 'text-red-500' : 'text-emerald-500'}`}>
                          KES {(tenant?.arrears || 0).toLocaleString()}
                        </div>
                        <div className="p-3 bg-red-500 bg-opacity-5 border border-red-500 border-opacity-20 font-mono text-[8px] uppercase font-black text-red-400">
                          Account requires reconciliation
                        </div>
                      </div>
                    </div>

                    <div className="p-6 bg-[var(--bg-ghost)] border border-[var(--border)] border-opacity-10 space-y-4">
                      <p className="font-mono text-[8px] uppercase text-[var(--text-muted)] font-black tracking-widest">Next of Kin Details</p>
                      <p className="font-mono text-xs uppercase font-black">{tenant?.nextOfKin || 'NO RECORDED NEXT OF KIN'}</p>
                    </div>

                    <div className="flex gap-4 pt-4">
                      <button 
                        onClick={() => window.location.href = `/dashboard/manager/tenants/${tenant?.id}`}
                        className="flex-1 px-8 py-5 bg-[var(--text-base)] text-[var(--bg-panel)] font-mono text-[10px] font-black uppercase shadow-[8px_8px_0px_0px_var(--shadow-color)] hover:bg-[var(--accent-bg)] hover:text-white transition-all"
                      >
                        View Full Profile
                      </button>
                      <button 
                        onClick={() => {
                            const fullTenant = tenants.find((t: any) => t.id === selectedUnit.tenantId);
                            setArchivingTenant(fullTenant || tenant);
                        }}
                        className="flex-1 px-8 py-5 border-2 border-red-500 text-red-500 font-mono text-[10px] font-black uppercase hover:bg-red-500 hover:text-white transition-all"
                      >
                        Vacate Unit
                      </button>
                    </div>
                  </div>
                );
              })() : (
                <div className="py-20 text-center border-2 border-dashed border-[var(--border)] border-opacity-10 flex flex-col items-center justify-center">
                    <Home size={40} className="text-[var(--text-muted)] opacity-20 mb-6" />
                    <p className="font-mono text-xs uppercase font-black text-[var(--text-muted)]">This unit is currently vacant</p>
                    <div className="flex gap-4 mt-8">
                      <button onClick={() => { setShowAddTenant(true); }} className="px-10 py-4 bg-[var(--accent-bg)] text-white font-mono text-[10px] font-black uppercase shadow-[8px_8px_0px_0px_var(--shadow-color)] hover:translate-y-[-2px] transition-all flex items-center gap-3">
                          <UserPlus size={16} /> Assign New Tenant
                      </button>
                      <button onClick={() => setShowMaintenance(true)} className="px-10 py-4 border border-[var(--border)] text-[var(--text-base)] font-mono text-[10px] font-black uppercase shadow-[8px_8px_0px_0px_var(--shadow-color)] hover:translate-y-[-2px] transition-all flex items-center gap-3">
                          <Wrench size={16} /> Schedule Prep
                      </button>
                    </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      {/* ADD TENANT MODAL */}
      <AddTenantModal 
        show={showAddTenant} 
        onClose={() => setShowAddTenant(false)} 
        onSuccess={() => { showToast("Tenant onboarded successfully", "success"); reloadData(); }} 
        managerId={session?.user?.id || ''} 
        properties={[property]} 
        initialUnitId={selectedUnit?.name}
      />

      {/* MOVE OUT MODAL */}
      <MoveOutModal 
        show={!!archivingTenant}
        onClose={() => setArchivingTenant(null)}
        onSuccess={() => {
            showToast("Tenant vacated and archived", "success");
            reloadData();
            setSelectedUnit(null);
        }}
        tenant={archivingTenant}
        managerId={session?.user?.id || ''}
      />

      {/* MAINTENANCE MODAL */}
      <CreateMaintenanceModal 
        show={showMaintenance}
        onClose={() => setShowMaintenance(false)}
        onSuccess={() => { showToast("Maintenance request logged", "success"); }}
        managerId={session?.user?.id || ''}
        propertyId={property.id}
        propertyName={property.name}
        unitId={selectedUnit?.name}
        tenantId={tenants.find(t => t.unitId === selectedUnit?.name)?.id}
      />
    </div>
  );
}
