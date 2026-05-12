"use client";

import React, { useState, useEffect } from 'react';
import { X, Building2, UserCircle, ArrowRightLeft, UserMinus, CheckCircle2, ChevronRight, Search, Info, RefreshCw } from 'lucide-react';
import { api } from '@/lib/api';
import { parseConfig } from '@/lib/utils';
import { useToast } from '@/context/ToastContext';

interface MoveTenantModalProps {
  show: boolean;
  onClose: () => void;
  onSuccess: () => void;
  tenant: any;
  properties: any[];
}

export const MoveTenantModal = ({ show, onClose, onSuccess, tenant, properties }: MoveTenantModalProps) => {
  const { showToast } = useToast();
  const [step, setStep] = useState(1); // 1: Select Prop, 2: Select Unit, 3: Conflict Res (if needed), 4: Confirm
  const [selectedPropId, setSelectedPropId] = useState('');
  const [selectedUnitId, setSelectedUnitId] = useState('');
  const [conflictTenant, setConflictTenant] = useState<any>(null);
  const [moveMode, setMoveMode] = useState<'move' | 'swap' | 'displace'>('move');
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'vacant' | 'occupied'>('all');

  if (!show || !tenant) return null;

  const selectedProp = properties.find(p => p.id === selectedPropId);
  const units = selectedProp ? parseConfig(selectedProp.config).units || [] : [];
  const propTenants = selectedProp ? parseConfig(selectedProp.config).tenants || [] : [];
  
  const filteredUnits = units.filter((u: any) => {
    const matchesSearch = u.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         u.typeId.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;
    
    if (filter === 'vacant') return u.status !== 'occupied';
    if (filter === 'occupied') return u.status === 'occupied';
    return true;
  });

  const getUnitTenant = (unitId: string) => {
    return propTenants.find((t: any) => t.unitId === unitId);
  };

  const handleUnitSelect = (unit: any) => {
    setSelectedUnitId(unit.name);
    if (unit.status === 'occupied') {
        const tntInUnit = getUnitTenant(unit.name);
        setConflictTenant(tntInUnit || { name: 'Unknown Resident' });
        setStep(3);
    } else {
        setConflictTenant(null);
        setMoveMode('move');
        setStep(4);
    }
  };

  const handleRelocate = async () => {
    setIsLoading(true);
    try {
      const res = await api.post<any>(`/properties/relocate-tenant`, {
        tenantId: tenant.id,
        propertyId: selectedPropId,
        unitId: selectedUnitId,
        moveMode: moveMode
      });
      if (res.success) {
        showToast(`Tenant successfully ${moveMode === 'swap' ? 'swapped' : moveMode === 'displace' ? 'replaced' : 'relocated'}`, 'success');
        onSuccess();
        reset();
      } else {
        showToast(res.error || 'Failed to relocate', 'error');
      }
    } catch (err) {
      showToast('Network error during relocation', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const reset = () => {
    setStep(1);
    setSelectedPropId('');
    setSelectedUnitId('');
    setConflictTenant(null);
    setMoveMode('move');
    setSearchQuery('');
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={onClose} />
      
      <div className="relative w-full max-w-2xl bg-[#0a0a0a] border border-white/10 rounded-3xl overflow-hidden shadow-[0_0_100px_rgba(0,0,0,1)] animate-in fade-in zoom-in duration-300">
        
        {/* HEADER */}
        <div className="p-8 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
          <div>
            <h2 className="text-2xl font-black uppercase tracking-tighter text-white leading-none">Relocation Wizard</h2>
            <p className="text-[10px] font-mono text-white/40 uppercase tracking-widest mt-2">
              Moving <span className="text-[var(--accent-bg)]">{tenant.name}</span> — Step {step} of 4
            </p>
          </div>
          <button onClick={onClose} className="p-3 hover:bg-white/5 rounded-xl transition-colors text-white/40 hover:text-white">
            <X size={20} />
          </button>
        </div>

        <div className="p-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
          
          {/* STEP 1: PROPERTY SELECT */}
          {step === 1 && (
            <div className="space-y-6">
              <p className="text-sm font-medium text-white/60 mb-6">Select the destination property for this resident.</p>
              <div className="grid grid-cols-1 gap-4">
                {properties.map(p => (
                  <button
                    key={p.id}
                    onClick={() => { setSelectedPropId(p.id); setStep(2); }}
                    className="flex items-center justify-between p-6 bg-white/[0.03] border border-white/5 rounded-2xl hover:bg-white/[0.07] hover:border-white/20 transition-all group"
                  >
                    <div className="flex items-center gap-5">
                      <div className="w-12 h-12 bg-[var(--accent-bg)]/10 text-[var(--accent-bg)] flex items-center justify-center rounded-xl border border-[var(--accent-bg)]/20">
                        <Building2 size={24} />
                      </div>
                      <div className="text-left">
                        <p className="font-black uppercase tracking-tight text-white">{p.name}</p>
                        <p className="text-[10px] text-white/40 font-mono">{p.address}</p>
                      </div>
                    </div>
                    <ChevronRight className="text-white/20 group-hover:text-white group-hover:translate-x-1 transition-all" size={20} />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* STEP 2: UNIT SELECT */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="flex flex-col gap-6 mb-8">
                <div className="flex items-center justify-between">
                    <button onClick={() => setStep(1)} className="text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-white flex items-center gap-2">
                    ← Back to Buildings
                    </button>
                    <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20" size={14} />
                    <input 
                        type="text"
                        placeholder="Search Room..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-xs font-bold text-white focus:outline-none focus:border-[var(--accent-bg)]/50 w-48"
                    />
                    </div>
                </div>

                <div className="flex items-center gap-2 bg-white/5 p-1 rounded-xl w-fit">
                    {(['all', 'vacant', 'occupied'] as const).map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-6 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${filter === f ? 'bg-[var(--accent-bg)] text-[var(--bg-panel)] shadow-lg' : 'text-white/40 hover:text-white'}`}
                        >
                            {f}
                        </button>
                    ))}
                </div>
              </div>
              
              <div className="grid grid-cols-4 gap-3">
                {filteredUnits.map((u: any) => {
                  const tnt = getUnitTenant(u.name);
                  const hasArrears = tnt && parseFloat(tnt.arrears || '0') > 0;
                  
                  return (
                    <button
                        key={u.name}
                        onClick={() => handleUnitSelect(u)}
                        className={`p-5 rounded-2xl border transition-all text-center relative group ${
                            u.status === 'occupied' 
                            ? 'bg-amber-500/5 border-amber-500/20 hover:bg-amber-500/10' 
                            : 'bg-green-500/5 border-green-500/20 hover:bg-green-500/10'
                        }`}
                    >
                        {hasArrears && (
                            <div className="absolute -top-2 -right-2 bg-red-500 text-white text-[7px] font-black px-2 py-1 rounded-full shadow-lg border border-red-400/50 animate-pulse">
                                DEBT
                            </div>
                        )}
                        <p className={`text-xl font-black ${u.status === 'occupied' ? 'text-amber-500' : 'text-green-500'}`}>{u.name}</p>
                        <p className="text-[9px] font-mono uppercase opacity-40 mt-1 tracking-widest">{u.typeId}</p>
                        
                        {u.status === 'occupied' && (
                            <p className="text-[7px] font-black uppercase text-amber-500/60 mt-2 truncate max-w-full">
                                {tnt?.name}
                            </p>
                        )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 3: CONFLICT RESOLUTION */}
          {step === 3 && (
            <div className="space-y-8 py-4">
              <div className="bg-amber-500/10 border border-amber-500/20 p-6 rounded-2xl flex gap-6">
                <div className="w-16 h-16 bg-amber-500/20 text-amber-500 flex items-center justify-center rounded-2xl border border-amber-500/30">
                  <UserCircle size={32} />
                </div>
                <div>
                  <h3 className="text-xl font-black uppercase tracking-tight text-white">Unit {selectedUnitId} is Occupied</h3>
                  <p className="text-sm text-white/60 mt-1">
                    Currently assigned to <span className="text-amber-500 font-bold">{conflictTenant?.name}</span>. How should we proceed?
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4">
                <button 
                  onClick={() => { setMoveMode('swap'); setStep(4); }}
                  className="flex items-center gap-6 p-6 bg-white/[0.03] border border-white/5 rounded-2xl hover:bg-white/[0.06] transition-all group"
                >
                  <div className="w-12 h-12 bg-blue-500/10 text-blue-500 flex items-center justify-center rounded-xl border border-blue-500/20">
                    <ArrowRightLeft size={24} />
                  </div>
                  <div className="text-left">
                    <p className="font-black uppercase tracking-tight text-white">Interchange (Swap)</p>
                    <p className="text-xs text-white/40 mt-1">Move {tenant.name} to {selectedUnitId} and {conflictTenant?.name} to {tenant.unitId}.</p>
                  </div>
                </button>

                <button 
                  onClick={() => { setMoveMode('displace'); setStep(4); }}
                  className="flex items-center gap-6 p-6 bg-white/[0.03] border border-white/5 rounded-2xl hover:bg-white/[0.06] transition-all group"
                >
                  <div className="w-12 h-12 bg-red-500/10 text-red-500 flex items-center justify-center rounded-xl border border-red-500/20">
                    <UserMinus size={24} />
                  </div>
                  <div className="text-left">
                    <p className="font-black uppercase tracking-tight text-white">Replace (Move Out)</p>
                    <p className="text-xs text-white/40 mt-1">Archive {conflictTenant?.name} and move {tenant.name} in immediately.</p>
                  </div>
                </button>
              </div>
              
              <button onClick={() => setStep(2)} className="w-full text-center text-[10px] font-black uppercase tracking-widest text-white/20 hover:text-white py-4 transition-colors">
                Cancel and pick another room
              </button>
            </div>
          )}

          {/* STEP 4: FINAL CONFIRMATION */}
          {step === 4 && (
            <div className="space-y-8 py-6">
              <div className="flex items-center justify-center gap-12">
                <div className="text-center">
                    <div className="w-20 h-20 bg-white/5 border border-white/10 rounded-full flex items-center justify-center mx-auto mb-4 relative">
                        <UserCircle size={40} className="text-white/40" />
                        <div className="absolute -bottom-2 bg-[var(--accent-bg)] text-[var(--bg-panel)] px-3 py-1 rounded-full text-[8px] font-black uppercase">
                            Moving
                        </div>
                    </div>
                    <p className="font-black uppercase tracking-tighter text-white">{tenant.name}</p>
                    <p className="text-[10px] font-mono text-white/40 uppercase">{tenant.unitId || 'Unassigned'}</p>
                </div>

                <div className="flex flex-col items-center gap-2">
                    <div className="h-px w-24 bg-gradient-to-r from-transparent via-[var(--accent-bg)] to-transparent opacity-50" />
                    <span className="text-[8px] font-black uppercase tracking-widest text-[var(--accent-bg)]">{moveMode}</span>
                    <div className="h-px w-24 bg-gradient-to-r from-transparent via-[var(--accent-bg)] to-transparent opacity-50" />
                </div>

                <div className="text-center">
                    <div className="w-20 h-20 bg-[var(--accent-bg)]/10 border border-[var(--accent-bg)]/20 rounded-full flex items-center justify-center mx-auto mb-4 relative">
                        <Building2 size={40} className="text-[var(--accent-bg)]" />
                        <div className="absolute -bottom-2 bg-green-500 text-white px-3 py-1 rounded-full text-[8px] font-black uppercase">
                            Target
                        </div>
                    </div>
                    <p className="font-black uppercase tracking-tighter text-white">{selectedUnitId}</p>
                    <p className="text-[10px] font-mono text-white/40 uppercase">{selectedProp?.name}</p>
                </div>
              </div>

              <div className="bg-white/[0.02] border border-white/5 p-6 rounded-2xl space-y-4">
                <div className="flex items-start gap-4">
                    <Info size={16} className="text-[var(--accent-bg)] mt-0.5" />
                    <div>
                        <p className="text-xs font-bold text-white">Forensic Sync Active</p>
                        <p className="text-[11px] text-white/50 mt-1">
                            Current balance of <span className="text-red-400 font-bold">KES {parseFloat(tenant.arrears).toLocaleString()}</span> will be carried forward.
                            {moveMode === 'swap' && ` ${conflictTenant?.name} will be moved to your current unit automatically.`}
                            {moveMode === 'displace' && ` ${conflictTenant?.name} will be archived as part of this process.`}
                        </p>
                    </div>
                </div>
              </div>

              <div className="flex gap-4">
                <button 
                  onClick={() => setStep(conflictTenant ? 3 : 2)}
                  className="flex-1 py-4 border border-white/10 rounded-xl font-black uppercase text-[10px] tracking-widest text-white/40 hover:bg-white/5 hover:text-white transition-all"
                >
                    Back
                </button>
                <button 
                  onClick={handleRelocate}
                  disabled={isLoading}
                  className="flex-[2] py-4 bg-[var(--accent-bg)] text-[var(--bg-panel)] rounded-xl font-black uppercase text-[10px] tracking-widest hover:translate-y-[-2px] transition-all shadow-[0_10px_40px_rgba(var(--accent-rgb),0.3)] disabled:opacity-50 flex items-center justify-center gap-3"
                >
                    {isLoading ? (
                      <RefreshCw size={16} className="animate-spin" />
                    ) : (
                      <CheckCircle2 size={16} />
                    )}
                    {isLoading ? 'Processing...' : 'Confirm Relocation'}
                </button>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
