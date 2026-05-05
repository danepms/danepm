"use client";

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { 
  Building2, MapPin, Users, Plus, ArrowUpRight, 
  AlertCircle, ChevronLeft, CreditCard, Receipt, 
  TrendingUp, Home, Settings, UserPlus, LogOut,
  Zap, Droplets, Trash2, Edit3, Terminal, Check
} from 'lucide-react';
import Link from 'next/link';
import { getPropertyById } from '@/app/actions';
import { sendPropertyInvite } from '@/app/actions/invites';
import { useToast } from '@/context/ToastContext';
import { useSession } from '@/lib/auth-client';

export default function PropertyDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const { showToast } = useToast();
  const { data: session } = useSession();

  const [property, setProperty] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'pulse' | 'finance' | 'admin'>('pulse');

  useEffect(() => {
    const fetchProperty = async () => {
      if (!session?.user?.id) return;
      const res = await getPropertyById(id, session.user.id);
      if (res.success && res.property) {
        setProperty(res.property);
      } else {
        showToast("Asset not found in registry", "error");
        router.push('/dashboard/manager/properties');
      }
      setIsLoading(false);
    };
    fetchProperty();
  }, [id, router, showToast]);

  if (isLoading || !property) {
    return (
        <div className="min-h-screen bg-[var(--bg-base)] flex items-center justify-center">
            <div className="w-12 h-12 border-4 border-[var(--accent-bg)] border-t-transparent rounded-full animate-spin" />
        </div>
    );
  }

  const config = JSON.parse(property.config || '{}');
  const resUnits = JSON.parse(property.residentialUnits || '{}') as Record<string, string>;
  const comUnits = JSON.parse(property.commercialUnits || '{}') as Record<string, string>;
  
  const totalUnits = Object.values(resUnits).reduce((a: number, b: string) => a + (parseInt(b) || 0), 0) + 
                    Object.values(comUnits).reduce((a: number, b: string) => a + (parseInt(b) || 0), 0);
  
  const occupiedCount = config.units?.filter((u: any) => u.status === 'occupied').length || 0;
  const occupancyRate = totalUnits > 0 ? Math.round((occupiedCount / totalUnits) * 100) : 0;

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
              <h1 className="text-xl font-black uppercase tracking-tighter leading-none">{property.name}</h1>
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
                <p className="font-mono text-[8px] uppercase text-[var(--text-muted)] font-black tracking-widest mb-4">Money</p>
                <div className="flex items-end justify-between">
                    <h3 className="text-3xl font-black tracking-tighter leading-none text-[var(--accent-bg)]">KES 1.2M</h3>
                </div>
            </div>
            <div className="glass-card bg-[var(--bg-panel)] border border-[var(--border)] border-opacity-10 p-6 shadow-[8px_8px_0px_0px_var(--shadow-color)]">
                <p className="font-mono text-[8px] uppercase text-[var(--text-muted)] font-black tracking-widest mb-4">Pending Bills</p>
                <div className="flex items-end justify-between">
                    <h3 className="text-3xl font-black tracking-tighter leading-none text-red-500 uppercase">KES 40K</h3>
                </div>
            </div>
        </div>

        {/* INTERACTIVE TERMINAL */}
        <div className="flex flex-col lg:flex-row gap-10">
            
            {/* SIDEBAR NAVIGATION */}
            <div className="lg:w-64 shrink-0 flex lg:flex-col gap-2 bg-[var(--bg-panel)] border border-[var(--border)] border-opacity-10 p-3 shadow-[8px_8px_0px_0px_var(--shadow-color)]">
                {[
                    { id: 'pulse', label: 'Units', icon: Home },
                    { id: 'finance', label: 'Money', icon: CreditCard },
                    { id: 'admin', label: 'Settings', icon: Settings }
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`flex items-center gap-3 px-6 py-4 font-mono text-[10px] font-black uppercase transition-all border ${activeTab === tab.id ? 'bg-[var(--text-base)] text-[var(--bg-panel)] border-[var(--text-base)] shadow-[4px_4px_0px_0px_var(--shadow-color)]' : 'text-[var(--text-muted)] hover:bg-[var(--bg-ghost)] border-transparent'}`}
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
                        <div className="flex items-center justify-between mb-10 border-b border-[var(--border)] pb-8 border-opacity-10">
                            <div>
                                <h2 className="text-3xl font-black uppercase tracking-tighter">Units</h2>
                                <p className="font-mono text-[9px] text-[var(--text-muted)] uppercase tracking-widest mt-2">Manage your {totalUnits} rooms and shops</p>
                            </div>
                            <button className="flex items-center gap-2 px-6 py-3 bg-[var(--accent-bg)] text-white font-mono text-[10px] font-black uppercase shadow-[4px_4px_0px_0px_var(--shadow-color)] hover:translate-y-[-2px] transition-all">
                                <UserPlus size={16} /> Add Tenant
                            </button>
                        </div>

                        <div className="space-y-12">
                            {Array.from({ length: Math.max(...(config.units?.map((u: any) => u.floor || 1) || [1])) }, (_, i) => i + 1).reverse().map(floorNum => (
                                <div key={floorNum} className="relative">
                                    <div className="flex items-center gap-4 mb-6">
                                        <div className="bg-[var(--text-base)] text-[var(--bg-panel)] px-3 py-1 font-mono text-[9px] font-black uppercase">Floor {floorNum}</div>
                                        <div className="flex-1 h-[1px] bg-[var(--border)] opacity-10" />
                                    </div>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-4">
                                        {config.units?.filter((u: any) => (u.floor || 1) === floorNum).map((unit: any) => (
                                            <button 
                                                key={unit.id}
                                                className={`p-4 border text-left flex flex-col justify-between h-32 transition-all duration-300 relative group overflow-hidden ${unit.status === 'occupied' ? 'border-[var(--accent-bg)] bg-[var(--accent-bg)] bg-opacity-5' : 'border-[var(--border)] border-opacity-20 hover:border-[var(--accent-bg)]'}`}
                                            >
                                                <div className="font-black font-mono text-sm tracking-tight text-[var(--text-base)]">{unit.name}</div>
                                                <div className="mt-auto">
                                                    <div className={`flex items-center gap-1.5 mb-1 ${unit.status === 'occupied' ? 'text-[var(--accent-bg)]' : 'text-[var(--text-muted)]'}`}>
                                                        <div className={`w-1.5 h-1.5 rounded-full ${unit.status === 'occupied' ? 'bg-[var(--accent-bg)] animate-pulse' : 'bg-gray-300'}`} />
                                                        <span className="font-mono text-[8px] font-black uppercase">{unit.status}</span>
                                                    </div>
                                                    {unit.tenantId && (
                                                        <p className="text-[9px] font-black uppercase truncate text-[var(--text-base)]">
                                                            Active Tenant
                                                        </p>
                                                    )}
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            ))}
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
                                            const count = (parseInt(resUnits[type]) || 0) + (parseInt(comUnits[type]) || 0);
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
                                    const count = (parseInt(resUnits[type]) || 0) + (parseInt(comUnits[type]) || 0);
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
                                                    const res = await sendPropertyInvite(id, email, property.userId);
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
    </div>
  );
}
