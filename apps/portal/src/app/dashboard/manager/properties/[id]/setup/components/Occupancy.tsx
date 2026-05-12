"use client";

import React, { useState } from 'react';
import { Users, ToggleRight, ToggleLeft, Check, CheckSquare, FileSpreadsheet } from 'lucide-react';
import { BulkOnboard } from './BulkOnboard';

interface Unit {
  id: string;
  name: string;
  status: 'vacant' | 'occupied';
  tenantId: string | null;
  typeId: string;
  floor?: number;
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

interface OccupancyProps {
    units: Unit[];
    setUnits: (units: Unit[]) => void;
    tenants: Tenant[];
    setTenants: (tenants: Tenant[]) => void;
    rents: Record<string, string>;
    quickMode: boolean;
    setQuickMode: (mode: boolean) => void;
    onBack: () => void;
    onFinish: () => void;
    isSaving: boolean;
    getTenantName: (id: string) => string;
    setTerminalOverride: (msg: string) => void;
}

export const Occupancy = ({ 
    units, setUnits, tenants, setTenants, 
    quickMode, setQuickMode, 
    onBack, onFinish, isSaving, getTenantName, setTerminalOverride
}: OccupancyProps) => {
  const [showBulkOnboard, setShowBulkOnboard] = useState(false);

  const handleUnitClick = (unit: Unit) => {
    if (quickMode) {
      const newStatus = unit.status === 'vacant' ? 'occupied' : 'vacant';
      setUnits(units.map((u: Unit) => u.id === unit.id ? { ...u, status: newStatus, tenantId: null } : u));
      setTerminalOverride(`> Unit ${unit.name} marked as ${newStatus.toUpperCase()}`);
    } else {
      setShowBulkOnboard(true);
    }
  };

  const handleBulkApply = (newUnits: Unit[], newTenants: Tenant[]) => {
    setUnits(newUnits);
    setTenants(newTenants);
    setShowBulkOnboard(false);
    setTerminalOverride(`> Bulk import complete: ${newTenants.length - tenants.length} new tenants added.`);
  };

  const maxFloor = Math.max(...units.map((u: Unit) => u.floor || 1), 1);
  const floors = Array.from({ length: maxFloor }, (_, i) => i + 1).reverse();

  return (
    <div className="flex flex-col h-full relative">
      {showBulkOnboard && (
        <div className="absolute inset-0 z-30 bg-[var(--bg-base)]">
          <BulkOnboard 
            units={units} 
            tenants={tenants} 
            onApply={handleBulkApply} 
            onCancel={() => setShowBulkOnboard(false)} 
          />
        </div>
      )}

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
              Bulk import tenants from Excel, or toggle quick-mode for vacant units.
            </p>
          </div>

          <div className="flex flex-col items-end gap-3">
            <button 
              onClick={() => setShowBulkOnboard(true)}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white font-mono text-xs uppercase font-bold shadow-[2px_2px_0px_0px_var(--shadow-color)] hover:translate-y-[-1px] transition-all"
            >
              <FileSpreadsheet size={16} /> Magic Paste (Excel)
            </button>
            <div className="flex items-center gap-2 mt-2">
              <span className="font-mono text-[9px] text-[var(--text-muted)] uppercase">Quick Vacant Toggle</span>
              <button 
                onClick={() => setQuickMode(!quickMode)}
                className={`flex items-center gap-2 px-3 py-1.5 border font-mono text-xs uppercase transition-colors shadow-[2px_2px_0px_0px_var(--shadow-color)] ${quickMode ? 'bg-[var(--accent-bg)] text-[var(--accent-text)] border-[var(--accent-bg)]' : 'bg-[var(--bg-panel)] text-[var(--text-base)] border-[var(--border)]'}`}
              >
                {quickMode ? <ToggleRight size={18} /> : <ToggleLeft size={18} />}
                {quickMode ? 'ON' : 'OFF'}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 space-y-12 pb-8">
        {floors.map(floorNum => {
          const floorUnits = units.filter((u: Unit) => (u.floor || 1) === floorNum);
          if (floorUnits.length === 0) return null;

          return (
            <div key={floorNum} className="relative">
              <div className="flex items-center gap-4 mb-6">
                <div className="bg-[var(--text-base)] text-[var(--bg-panel)] px-3 py-1 font-mono text-[9px] font-black uppercase tracking-widest shadow-[2px_2px_0px_0px_var(--shadow-color)]">
                  Floor {floorNum}
                </div>
                <div className="flex-1 h-px bg-[var(--border)]" />
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                {floorUnits.map((unit: Unit) => (
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
          );
        })}
      </div>

      <div className="pt-8 shrink-0 border-t border-[var(--border)] mt-auto">
        <button 
          onClick={onFinish} 
          disabled={isSaving}
          className="w-full bg-[var(--accent-bg)] text-[var(--accent-text)] font-bold font-mono text-sm uppercase py-6 border border-[var(--accent-bg)] shadow-[4px_4px_0px_0px_var(--shadow-color)] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_var(--shadow-color)] active:translate-y-1 active:shadow-none transition-all flex justify-center gap-3"
        >
          {isSaving ? "Finalizing..." : "Finish Setup"} <CheckSquare size={16} />
        </button>
      </div>
    </div>
  );
};
