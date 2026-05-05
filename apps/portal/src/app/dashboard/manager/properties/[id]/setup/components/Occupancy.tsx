"use client";

import React from 'react';
import { Users, ToggleRight, ToggleLeft, Check, CheckSquare, X, Coins, UserPlus, AlertCircle } from 'lucide-react';

interface Unit {
  id: string;
  name: string;
  status: 'vacant' | 'occupied';
  tenantId: string | null;
  typeId: string;
  rentOverride?: string;
}

interface Tenant {
  id: string;
  name: string;
  phone: string;
  nextOfKin?: string;
  idNumber?: string;
  arrears: number;
  unitId: string | null;
}

interface NewTenantForm {
  name: string;
  phone: string;
  nextOfKin: string;
  idNumber: string;
  hasArrears: boolean;
  arrearsAmount: string;
}

interface OccupancyProps {
    units: Unit[];
    setUnits: (units: Unit[]) => void;
    tenants: Tenant[];
    setTenants: (tenants: Tenant[]) => void;
    rents: Record<string, string>;
    quickMode: boolean;
    setQuickMode: (mode: boolean) => void;
    activeUnit: Unit | null;
    setActiveUnit: (unit: Unit | null) => void;
    assignTab: 'existing' | 'new';
    setAssignTab: (tab: 'existing' | 'new') => void;
    newTenant: NewTenantForm;
    setNewTenant: (tenant: NewTenantForm) => void;
    onBack: () => void;
    onFinish: () => void;
    isSaving: boolean;
    getTenantName: (id: string) => string;
    setTerminalOverride: (msg: string) => void;
}

export const Occupancy = ({ 
    units, setUnits, tenants, setTenants, rents, 
    quickMode, setQuickMode, activeUnit, setActiveUnit,
    assignTab, setAssignTab, newTenant, setNewTenant,
    onBack, onFinish, isSaving, getTenantName, setTerminalOverride
}: OccupancyProps) => {

  const handleUnitClick = (unit: Unit) => {
    if (quickMode) {
      const newStatus = unit.status === 'vacant' ? 'occupied' : 'vacant';
      setUnits(units.map((u: Unit) => u.id === unit.id ? { ...u, status: newStatus, tenantId: null } : u));
      setTerminalOverride(`> Unit ${unit.name} marked as ${newStatus.toUpperCase()}`);
    } else {
      setActiveUnit(unit);
      setAssignTab('existing');
    }
  };

  const assignExistingTenant = (tenantId: string) => {
    setUnits(units.map((u: Unit) => u.id === activeUnit?.id ? { ...u, status: 'occupied', tenantId } : u));
    setTenants(tenants.map((t: Tenant) => t.id === tenantId ? { ...t, unitId: activeUnit?.id || null } : t));
    setTerminalOverride(`> Existing tenant assigned to ${activeUnit?.name || 'unit'}`);
    setActiveUnit(null);
  };

  const saveNewTenant = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeUnit) return;
    
    const newId = `t${Date.now()}`;
    const arrearsVal = newTenant.hasArrears ? (parseFloat(newTenant.arrearsAmount) || 0) : 0;
    
    const tenantObj = {
      id: newId,
      name: newTenant.name,
      phone: newTenant.phone,
      nextOfKin: newTenant.nextOfKin,
      idNumber: newTenant.idNumber,
      arrears: arrearsVal,
      unitId: activeUnit.id
    };

    setTenants([...tenants, tenantObj]);
    setUnits(units.map((u: Unit) => u.id === activeUnit?.id ? { ...u, status: 'occupied', tenantId: newId } : u));
    setTerminalOverride(`> New tenant ${tenantObj.name} registered and assigned to ${activeUnit?.name || 'unit'}`);
    
    setNewTenant({ name: '', phone: '', nextOfKin: '', idNumber: '', hasArrears: false, arrearsAmount: '' });
    setActiveUnit(null);
  };

  const unassignUnit = () => {
    if (activeUnit && activeUnit.tenantId) {
      setTenants(tenants.map((t: Tenant) => t.id === activeUnit.tenantId ? { ...t, unitId: null } : t));
    }
    setUnits(units.map((u: Unit) => u.id === activeUnit?.id ? { ...u, status: 'vacant', tenantId: null } : u));
    setTerminalOverride(`> Unit ${activeUnit?.name} is now VACANT.`);
    setActiveUnit(null);
  };

  return (
    <div className="flex flex-col h-full relative">
      <div className="mb-8">
        <button type="button" onClick={onBack} className="font-mono text-[10px] text-[var(--text-muted)] hover:text-[var(--text-base)] uppercase mb-6 flex items-center gap-2 transition-colors">
          ← Go Back
        </button>
        <div className="flex justify-between items-end mb-4 border-b border-[var(--border)] pb-6">
          <div>
            <div className="w-12 h-12 bg-[var(--text-base)] text-[var(--bg-base)] flex items-center justify-center mb-6 shadow-[4px_4px_0px_0px_var(--shadow-color)]">
              <Users size={24} />
            </div>
            <h2 className="text-4xl md:text-5xl font-bold uppercase tracking-tighter mb-2 leading-none text-[var(--text-base)]">
              Occupancy.
            </h2>
            <p className="text-sm font-mono text-[var(--text-muted)] uppercase">
              Mark units as occupied or assign specific tenants.
            </p>
          </div>

          <div className="flex flex-col items-end">
            <span className="font-mono text-[9px] text-[var(--text-muted)] uppercase mb-2">Quick Mode</span>
            <button 
              onClick={() => setQuickMode(!quickMode)}
              className={`flex items-center gap-2 px-4 py-2 border font-mono text-xs uppercase transition-colors shadow-[2px_2px_0px_0px_var(--shadow-color)] ${quickMode ? 'bg-[var(--accent-bg)] text-[var(--accent-text)] border-[var(--accent-bg)]' : 'bg-[var(--bg-panel)] text-[var(--text-base)] border-[var(--border)]'}`}
            >
              {quickMode ? <ToggleRight size={18} /> : <ToggleLeft size={18} />}
              {quickMode ? 'ON' : 'OFF'}
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 space-y-12">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {units.map((unit: Unit) => (
            <button
              key={unit.id}
              onClick={() => handleUnitClick(unit)}
              className={`p-4 border text-left flex flex-col justify-between h-24 transition-all duration-200 ${
                unit.status === 'occupied'
                ? (unit.tenantId ? 'bg-[var(--accent-bg)] border-[var(--accent-bg)] text-[var(--accent-text)] shadow-[4px_4px_0px_0px_var(--shadow-color)]' : 'bg-[var(--text-base)] border-[var(--text-base)] text-[var(--bg-base)] shadow-[4px_4px_0px_0px_var(--shadow-color)]')
                : 'bg-[var(--bg-panel)] border-[var(--border)] text-[var(--text-base)] hover:border-[var(--accent-bg)] hover:shadow-[4px_4px_0px_0px_var(--shadow-color)]'
              }`}
            >
              <span className="font-bold font-mono text-sm">{unit.name}</span>
              <span className="text-[10px] font-mono uppercase opacity-80 mt-auto flex items-center gap-1">
                {unit.status === 'occupied' ? (
                  <>
                    <Check size={12} />
                    {unit.tenantId ? getTenantName(unit.tenantId) : 'Occupied'}
                  </>
                ) : 'Vacant'}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="pt-8 shrink-0 border-t border-[var(--border)] mt-8">
        <button 
          onClick={onFinish} 
          disabled={isSaving}
          className="w-full bg-[var(--accent-bg)] text-[var(--accent-text)] font-bold font-mono text-sm uppercase py-6 border border-[var(--accent-bg)] shadow-[4px_4px_0px_0px_var(--shadow-color)] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_var(--shadow-color)] active:translate-y-1 active:shadow-none transition-all flex justify-center gap-3"
        >
          {isSaving ? "Finalizing..." : "Finish Setup"} <CheckSquare size={16} />
        </button>
      </div>

      {activeUnit && (
        <div className="absolute inset-0 bg-[var(--bg-base)] z-20 flex flex-col border-l-4 border-[var(--accent-bg)] p-6 shadow-[-8px_0px_0px_0px_var(--shadow-color)] reveal-step overflow-y-auto">
          <div className="flex justify-between items-center mb-8 border-b border-[var(--border)] pb-4">
            <div>
              <h3 className="font-bold text-2xl uppercase">{activeUnit.name}</h3>
              <p className="font-mono text-[10px] text-[var(--text-muted)] uppercase">Status: {activeUnit.status}</p>
            </div>
            <button onClick={() => setActiveUnit(null)} className="p-2 border border-[var(--border)] hover:bg-[var(--text-base)] hover:text-[var(--bg-base)] transition-colors">
              <X size={16} />
            </button>
          </div>

          {activeUnit.status === 'occupied' ? (
            <div className="flex-1 flex-col">
              <div className="bg-[var(--bg-panel)] border border-[var(--border)] p-6 mb-6">
                <h4 className="font-bold uppercase text-[var(--text-base)] mb-4 flex items-center gap-2"><Check size={18} className="text-[var(--accent-bg)]"/> Currently Occupied</h4>
                {activeUnit.tenantId ? (
                  <div className="space-y-2 font-mono text-xs uppercase">
                    <p className="text-[var(--text-muted)]">Tenant Name: <span className="text-[var(--text-base)] font-bold">{getTenantName(activeUnit.tenantId)}</span></p>
                    <p className="text-[var(--text-muted)]">Phone: <span className="text-[var(--text-base)]">{tenants.find((t: Tenant)=>t.id===activeUnit.tenantId)?.phone || 'N/A'}</span></p>
                    <p className="text-[var(--text-muted)] flex items-center gap-2">Arrears: 
                      {(tenants.find((t: Tenant)=>t.id===activeUnit.tenantId)?.arrears || 0) > 0 
                        ? <span className="text-red-500 font-bold">{tenants.find((t: Tenant)=>t.id===activeUnit.tenantId)?.arrears} KES</span>
                        : <span className="text-green-600 font-bold">Cleared</span>
                      }
                    </p>
                  </div>
                ) : (
                  <p className="font-mono text-xs text-[var(--text-muted)] uppercase">Marked as occupied without a specific tenant profile.</p>
                )}
              </div>
              
              <div className="bg-[var(--bg-panel)] border border-[var(--border)] p-6 mb-6">
                <h4 className="font-bold uppercase text-[var(--text-base)] mb-4 flex items-center gap-2"><Coins size={18} className="text-[var(--accent-bg)]"/> Unit Pricing</h4>
                <div className="space-y-3">
                  <label className="font-mono text-[9px] text-[var(--text-muted)] uppercase block">Monthly Rent (Override)</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 font-mono text-[10px] text-[var(--text-muted)] font-bold">KES</span>
                    <input 
                      type="number" 
                      placeholder={rents[activeUnit.typeId] || '0'} 
                      value={activeUnit.rentOverride || ''}
                      onChange={(e) => {
                        setUnits(units.map(u => u.id === activeUnit.id ? { ...u, rentOverride: e.target.value } : u));
                        setActiveUnit({ ...activeUnit, rentOverride: e.target.value });
                      }}
                      className="w-full bg-[var(--bg-base)] border border-[var(--border)] text-[var(--text-base)] py-3 pl-12 pr-4 font-mono text-sm focus:border-[var(--accent-bg)] outline-none transition-all font-bold" 
                    />
                  </div>
                  <p className="text-[8px] font-mono text-[var(--text-muted)] uppercase">Inherits {rents[activeUnit.typeId] || '0'} KES from base settings if left empty.</p>
                </div>
              </div>

              <div className="mt-auto">
                <button onClick={unassignUnit} className="w-full py-4 border-2 border-[var(--text-base)] text-[var(--text-base)] hover:bg-[var(--text-base)] hover:text-[var(--bg-base)] font-bold font-mono text-xs uppercase transition-colors">
                  Vacate / Remove Occupant
                </button>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col">
              <div className="bg-[var(--bg-panel)] border border-[var(--border)] p-6 mb-6">
                <h4 className="font-bold uppercase text-[var(--text-base)] mb-4 flex items-center gap-2"><Coins size={18} className="text-[var(--accent-bg)]"/> Unit Pricing</h4>
                <div className="space-y-3">
                  <label className="font-mono text-[9px] text-[var(--text-muted)] uppercase block">Monthly Rent (Override)</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 font-mono text-[10px] text-[var(--text-muted)] font-bold">KES</span>
                    <input 
                      type="number" 
                      placeholder={rents[activeUnit.typeId] || '0'} 
                      value={activeUnit.rentOverride || ''}
                      onChange={(e) => {
                        setUnits(units.map(u => u.id === activeUnit.id ? { ...u, rentOverride: e.target.value } : u));
                        setActiveUnit({ ...activeUnit, rentOverride: e.target.value });
                      }}
                      className="w-full bg-[var(--bg-base)] border border-[var(--border)] text-[var(--text-base)] py-3 pl-12 pr-4 font-mono text-sm focus:border-[var(--accent-bg)] outline-none transition-all font-bold" 
                    />
                  </div>
                  <p className="text-[8px] font-mono text-[var(--text-muted)] uppercase">Inherits {rents[activeUnit.typeId] || '0'} KES from base settings if left empty.</p>
                </div>
              </div>

              <div className="flex gap-2 mb-6 bg-[var(--bg-panel)] p-1 border border-[var(--border)]">
                <button 
                  onClick={() => setAssignTab('existing')}
                  className={`flex-1 py-2 font-mono text-[10px] uppercase font-bold transition-colors ${assignTab === 'existing' ? 'bg-[var(--text-base)] text-[var(--bg-base)]' : 'text-[var(--text-muted)] hover:text-[var(--text-base)]'}`}
                >
                  Select Existing
                </button>
                <button 
                  onClick={() => setAssignTab('new')}
                  className={`flex-1 py-2 font-mono text-[10px] uppercase font-bold transition-colors ${assignTab === 'new' ? 'bg-[var(--text-base)] text-[var(--bg-base)]' : 'text-[var(--text-muted)] hover:text-[var(--text-base)]'}`}
                >
                  Add New Tenant
                </button>
              </div>

              {assignTab === 'existing' && (
                <div className="space-y-3">
                  {tenants.filter((t: Tenant) => !t.unitId).length === 0 ? (
                    <div className="p-6 border border-dashed border-[var(--border)] text-center font-mono text-xs text-[var(--text-muted)] uppercase">
                      No unassigned tenants found.
                    </div>
                  ) : (
                    tenants.filter((t: Tenant) => !t.unitId).map((t: Tenant) => (
                      <button 
                        key={t.id} 
                        onClick={() => assignExistingTenant(t.id)}
                        className="w-full text-left p-4 bg-[var(--bg-panel)] border border-[var(--border)] hover:border-[var(--accent-bg)] hover:shadow-[4px_4px_0px_0px_var(--shadow-color)] transition-all flex justify-between items-center group"
                      >
                        <div>
                          <span className="font-bold block text-sm">{t.name}</span>
                          <span className="font-mono text-[10px] text-[var(--text-muted)] uppercase">{t.phone}</span>
                        </div>
                        <UserPlus size={16} className="text-[var(--text-muted)] group-hover:text-[var(--accent-bg)]" />
                      </button>
                    ))
                  )}
                </div>
              )}

              {assignTab === 'new' && (
                <form onSubmit={saveNewTenant} className="space-y-4 flex-1 flex flex-col">
                  <div>
                    <label className="font-mono text-[9px] text-[var(--text-muted)] uppercase mb-1 block">Full Name</label>
                    <input required type="text" placeholder="John Doe" value={newTenant.name} onChange={e => setNewTenant({...newTenant, name: e.target.value})} className="w-full bg-[var(--bg-panel)] border border-[var(--border)] p-3 font-mono text-sm focus:border-[var(--accent-bg)] outline-none" />
                  </div>
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <label className="font-mono text-[9px] text-[var(--text-muted)] uppercase mb-1 block">Phone Number</label>
                      <input required type="text" placeholder="07XX XXX XXX" value={newTenant.phone} onChange={e => setNewTenant({...newTenant, phone: e.target.value})} className="w-full bg-[var(--bg-panel)] border border-[var(--border)] p-3 font-mono text-sm focus:border-[var(--accent-bg)] outline-none" />
                    </div>
                    <div className="flex-1">
                      <label className="font-mono text-[9px] text-[var(--text-muted)] uppercase mb-1 block">ID Number (Optional)</label>
                      <input type="text" placeholder="12345678" value={newTenant.idNumber} onChange={e => setNewTenant({...newTenant, idNumber: e.target.value})} className="w-full bg-[var(--bg-panel)] border border-[var(--border)] p-3 font-mono text-sm focus:border-[var(--accent-bg)] outline-none" />
                    </div>
                  </div>
                  <div>
                    <label className="font-mono text-[9px] text-[var(--text-muted)] uppercase mb-1 block">Next of Kin (Name & Phone)</label>
                    <input required type="text" placeholder="Jane Doe - 07XX" value={newTenant.nextOfKin} onChange={e => setNewTenant({...newTenant, nextOfKin: e.target.value})} className="w-full bg-[var(--bg-panel)] border border-[var(--border)] p-3 font-mono text-sm focus:border-[var(--accent-bg)] outline-none" />
                  </div>
                  
                  <div className="border border-[var(--border)] bg-[var(--bg-ghost)] p-4 mt-2">
                    <div className="flex items-center justify-between mb-3">
                      <label className="font-mono text-[10px] font-bold uppercase flex items-center gap-2 text-[var(--text-base)]">
                        <AlertCircle size={14} className={newTenant.hasArrears ? "text-red-500" : "text-[var(--text-muted)]"} />
                        Rent Arrears Status
                      </label>
                      <button type="button" onClick={() => setNewTenant({...newTenant, hasArrears: !newTenant.hasArrears})} className={`px-2 py-1 font-mono text-[9px] uppercase border ${newTenant.hasArrears ? 'bg-red-500 text-white border-red-500' : 'bg-transparent text-[var(--text-muted)] border-[var(--border)]'}`}>
                        {newTenant.hasArrears ? 'Has Arrears' : 'Fully Paid'}
                      </button>
                    </div>
                    {newTenant.hasArrears && (
                      <div className="mt-2 reveal-step">
                        <label className="font-mono text-[9px] text-[var(--text-muted)] uppercase mb-1 block">Arrears Amount (KES)</label>
                        <input required type="number" placeholder="0" value={newTenant.arrearsAmount} onChange={e => setNewTenant({...newTenant, arrearsAmount: e.target.value})} className="w-full bg-[var(--bg-panel)] border border-red-500 text-red-500 p-3 font-mono text-sm focus:outline-none" />
                      </div>
                    )}
                  </div>

                  <div className="mt-auto pt-6">
                    <button type="submit" className="w-full bg-[var(--text-base)] text-[var(--bg-base)] font-bold font-mono text-xs uppercase py-4 border border-[var(--text-base)] shadow-[4px_4px_0px_0px_var(--shadow-color)] active:translate-y-1 active:shadow-none transition-all">
                      Save & Assign Tenant
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
