"use client";

import React, { useState } from 'react';
import { Plus, X, Building2 } from 'lucide-react';
import { AddTenantModal } from './AddTenantModal';
import { MoveOutModal } from './MoveOutModal';
import { MoveTenantModal } from './MoveTenantModal';
import { parseConfig } from '@/lib/utils';

interface TenantsTabProps {
  tenants: any[];
  stats: any;
  isLoading: boolean;
  currentPage: number;
  hasMore: boolean;
  onPageChange: (page: number) => void;
  onRefresh: () => void;
  properties: any[];
  managerId: string;
}

export const TenantsTab = ({ 
  tenants, 
  stats, 
  isLoading, 
  currentPage, 
  hasMore, 
  onPageChange, 
  onRefresh,
  properties,
  managerId
}: TenantsTabProps) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [movingTenant, setMovingTenant] = useState<any>(null);
  const [archivingTenant, setArchivingTenant] = useState<any>(null);

  const resolveUnitName = (propertyId: string, unitId: string) => {
    if (!unitId) return 'NONE';
    if (!unitId.startsWith('U_')) return unitId; // Already a friendly name
    
    const prop = properties.find(p => p.id === propertyId);
    if (!prop || !prop.config) return unitId;
    
    try {
        const config = parseConfig(prop.config);
        const unit = config.units?.find((u: any) => u.id === unitId || u.name === unitId);
        return unit?.name || unitId;
    } catch (e) {
        return unitId;
    }
  };

  return (
    <div className="space-y-12 animate-reveal">
      {/* TENANT STATS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 bg-[var(--bg-panel)] border border-[var(--border)] border-opacity-10 p-8 rounded-xl shadow-[8px_8px_0px_0px_var(--shadow-color)]">
        <div>
            <p className="font-mono text-[8px] uppercase text-[var(--text-muted)] font-black tracking-widest mb-1">Total Tenants</p>
            <p className="text-2xl font-black tracking-tighter">{stats?.total || 0}</p>
        </div>
        <div>
            <p className="font-mono text-[8px] uppercase text-[var(--text-muted)] font-black tracking-widest mb-1">Overdue</p>
            <p className="text-2xl font-black tracking-tighter text-red-500">{stats?.withArrearsCount || 0}</p>
        </div>
        <div>
            <p className="font-mono text-[8px] uppercase text-[var(--text-muted)] font-black tracking-widest mb-1">Owed</p>
            <p className="text-2xl font-black tracking-tighter">KES {stats?.arrearsSum?.toLocaleString() || 0}</p>
        </div>
        <div>
            <p className="font-mono text-[8px] uppercase text-[var(--text-muted)] font-black tracking-widest mb-1">Status</p>
            <p className="text-2xl font-black tracking-tighter text-[var(--accent-bg)]">98%</p>
        </div>
      </div>

      <div className="flex items-center justify-between border-b border-[var(--border)] pb-8 border-opacity-10">
        <div>
          <h2 className="text-5xl font-black uppercase tracking-tighter text-[var(--text-base)] leading-none">Tenants</h2>
          <p className="font-mono text-[10px] text-[var(--text-muted)] uppercase font-bold tracking-[0.2em] mt-3">
            Everyone living in your buildings
          </p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="bg-[var(--text-base)] text-[var(--bg-panel)] px-8 py-4 font-mono text-[11px] uppercase font-black hover:translate-y-[-2px] active:translate-y-0 transition-all flex items-center gap-3 shadow-[8px_8px_0px_0px_var(--shadow-color)]"
        >
          <Plus size={16} /> Add a Person
        </button>
      </div>

      <div className="bg-[var(--bg-panel)] border border-[var(--border)] border-opacity-10 rounded-2xl shadow-[8px_8px_0px_0px_var(--shadow-color)] overflow-hidden">
          <table className="w-full text-left font-mono text-[10px]">
              <thead className="bg-[var(--bg-ghost)] border-b border-[var(--border)] border-opacity-10">
                  <tr>
                      <th className="p-6 uppercase font-black tracking-widest opacity-50">Name</th>
                      <th className="p-6 uppercase font-black tracking-widest opacity-50">Contact</th>
                      <th className="p-6 uppercase font-black tracking-widest opacity-50">Building</th>
                      <th className="p-6 uppercase font-black tracking-widest opacity-50">Room</th>
                      <th className="p-6 uppercase font-black tracking-widest opacity-50">Balance</th>
                      <th className="p-6 uppercase font-black tracking-widest opacity-50">Status</th>
                  </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)] divide-opacity-5">
                  {isLoading ? (
                      <tr><td colSpan={6} className="p-20 text-center uppercase font-black opacity-20 animate-pulse">Loading...</td></tr>
                  ) : tenants.length > 0 ? tenants.map((t) => (
                      <tr key={t.id} className="hover:bg-[var(--bg-ghost)] transition-colors group">
                          <td className="p-6 font-black text-xs tracking-tighter">
                              {t.name}
                              <div className="text-[8px] opacity-30 mt-1 uppercase">{t.idType}: {t.idNumber}</div>
                          </td>
                          <td className="p-6 opacity-60 font-bold">{t.phone}</td>
                          <td className="p-6 opacity-60 font-bold uppercase">{t.propertyName || 'Unassigned'}</td>
                          <td className="p-6 font-black uppercase text-[var(--accent-bg)]">{resolveUnitName(t.propertyId, t.unitId)}</td>
                          <td className="p-6 font-black tracking-tighter text-red-500">KES {parseFloat(t.arrears).toLocaleString()}</td>
                          <td className="p-6">
                              <div className="flex gap-2">
                                  <button 
                                    onClick={() => window.location.href = `/dashboard/manager/tenants/${t.id}`}
                                    className="px-4 py-2 bg-[var(--text-base)] text-[var(--bg-panel)] rounded-lg hover:bg-[var(--accent-bg)] hover:text-white transition-all font-black uppercase text-[8px]"
                                  >
                                      Profile
                                  </button>
                                  <button 
                                    onClick={() => setMovingTenant(t)}
                                    className="px-4 py-2 border border-[var(--border)] border-opacity-10 rounded-lg hover:bg-[var(--text-base)] hover:text-[var(--bg-panel)] transition-all font-black uppercase text-[8px]"
                                  >
                                      Relocate
                                  </button>
                                  <button 
                                    onClick={() => setArchivingTenant(t)}
                                    className="px-4 py-2 bg-red-500 bg-opacity-10 text-red-500 border border-red-500 border-opacity-20 rounded-lg hover:bg-red-500 hover:text-white transition-all font-black uppercase text-[8px]"
                                  >
                                      Move Out
                                  </button>
                              </div>
                          </td>
                      </tr>
                  )) : (
                      <tr><td colSpan={6} className="p-20 text-center uppercase font-black opacity-20">No tenants found</td></tr>
                  )}
              </tbody>
          </table>
          <div className="p-6 bg-[var(--bg-ghost)] border-t border-[var(--border)] border-opacity-10 flex items-center justify-between">
              <span className="font-black uppercase tracking-widest text-[8px] opacity-50">Page {currentPage}</span>
              <div className="flex gap-4">
                  <button 
                    disabled={currentPage === 1}
                    onClick={() => onPageChange(currentPage - 1)}
                    className="px-6 py-2 border border-[var(--border)] border-opacity-10 rounded-lg font-black uppercase tracking-widest text-[8px] disabled:opacity-10 hover:bg-[var(--text-base)] hover:text-[var(--bg-panel)] transition-all"
                  >
                      Prev
                  </button>
                  <button 
                    disabled={!hasMore}
                    onClick={() => onPageChange(currentPage + 1)}
                    className="px-6 py-2 border border-[var(--border)] border-opacity-10 rounded-lg font-black uppercase tracking-widest text-[8px] disabled:opacity-10 hover:bg-[var(--text-base)] hover:text-[var(--bg-panel)] transition-all"
                  >
                      Next
                  </button>
              </div>
          </div>
      </div>

      <AddTenantModal 
        show={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSuccess={onRefresh}
        managerId={managerId}
        properties={properties}
      />

      <MoveTenantModal 
        show={!!movingTenant}
        onClose={() => setMovingTenant(null)}
        onSuccess={onRefresh}
        tenant={movingTenant}
        properties={properties}
      />
      <MoveOutModal 
        show={!!archivingTenant}
        onClose={() => setArchivingTenant(null)}
        onSuccess={onRefresh}
        tenant={archivingTenant}
        managerId={managerId}
      />
    </div>
  );
};
