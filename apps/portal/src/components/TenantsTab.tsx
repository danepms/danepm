"use client";

import React, { useState } from 'react';
import { Plus, X, Building2 } from 'lucide-react';
import { AddTenantModal } from './AddTenantModal';
import { updateTenantAssignment } from '@/app/actions';

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

  const handleMoveTenant = async (propertyId: string, unitId: string) => {
    if (!movingTenant) return;
    const res = await updateTenantAssignment(movingTenant.id, propertyId, unitId);
    if (res.success) {
      setMovingTenant(null);
      onRefresh();
    }
  };

  return (
    <div className="space-y-12 animate-reveal">
      {/* TENANT STATS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 bg-[var(--bg-panel)] border border-[var(--border)] border-opacity-10 p-8 rounded-xl shadow-[8px_8px_0px_0px_var(--shadow-color)]">
        <div>
            <p className="font-mono text-[8px] uppercase text-[var(--text-muted)] font-black tracking-widest mb-1">Total People</p>
            <p className="text-2xl font-black tracking-tighter">{stats?.total || 0}</p>
        </div>
        <div>
            <p className="font-mono text-[8px] uppercase text-[var(--text-muted)] font-black tracking-widest mb-1">With Arrears</p>
            <p className="text-2xl font-black tracking-tighter text-red-500">{stats?.withArrearsCount || 0}</p>
        </div>
        <div>
            <p className="font-mono text-[8px] uppercase text-[var(--text-muted)] font-black tracking-widest mb-1">Total Owed</p>
            <p className="text-2xl font-black tracking-tighter">KES {stats?.arrearsSum?.toLocaleString() || 0}</p>
        </div>
        <div>
            <p className="font-mono text-[8px] uppercase text-[var(--text-muted)] font-black tracking-widest mb-1">Health Index</p>
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
                      <tr><td colSpan={6} className="p-20 text-center uppercase font-black opacity-20 animate-pulse">Accessing tenant records...</td></tr>
                  ) : tenants.length > 0 ? tenants.map((t) => (
                      <tr key={t.id} className="hover:bg-[var(--bg-ghost)] transition-colors group">
                          <td className="p-6 font-black text-xs tracking-tighter">
                              {t.name}
                              <div className="text-[8px] opacity-30 mt-1 uppercase">{t.idType}: {t.idNumber}</div>
                          </td>
                          <td className="p-6 opacity-60 font-bold">{t.phone}</td>
                          <td className="p-6 opacity-60 font-bold uppercase">{t.propertyName || 'Unassigned'}</td>
                          <td className="p-6 font-black uppercase text-[var(--accent-bg)]">{t.unitId || 'NONE'}</td>
                          <td className="p-6 font-black tracking-tighter text-red-500">KES {parseFloat(t.arrears).toLocaleString()}</td>
                          <td className="p-6">
                              <div className="flex gap-2">
                                  <button 
                                    onClick={() => setMovingTenant(t)}
                                    className="px-4 py-2 border border-[var(--border)] border-opacity-10 rounded-lg hover:bg-[var(--text-base)] hover:text-[var(--bg-panel)] transition-all font-black uppercase text-[8px]"
                                  >
                                      Move
                                  </button>
                              </div>
                          </td>
                      </tr>
                  )) : (
                      <tr><td colSpan={6} className="p-20 text-center uppercase font-black opacity-20">No active tenants found in database</td></tr>
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

      {/* MOVE TENANT MODAL */}
      {movingTenant && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 backdrop-blur-xl bg-[var(--bg-base)] bg-opacity-80 animate-reveal">
              <div className="bg-[var(--bg-panel)] border border-[var(--border)] border-opacity-20 w-full max-w-xl rounded-3xl shadow-[32px_32px_0px_0px_var(--shadow-color)] overflow-hidden">
                  <div className="p-8 border-b border-[var(--border)] border-opacity-10 flex justify-between items-center">
                      <h3 className="text-3xl font-black uppercase tracking-tighter text-[var(--text-base)]">Move: {movingTenant.name}</h3>
                      <button onClick={() => setMovingTenant(null)}><X size={24} /></button>
                  </div>
                  <div className="p-10 space-y-4 max-h-[60vh] overflow-y-auto custom-scrollbar">
                      {properties.map(p => {
                          const config = JSON.parse(p.config || '{}');
                          const units = config.units || [];
                          return (
                              <div key={p.id} className="space-y-4">
                                  <div className="flex items-center gap-4 bg-[var(--bg-ghost)] p-4 border border-[var(--border)] border-opacity-10 rounded-xl shadow-[4px_4px_0px_0px_var(--shadow-color)]">
                                      <Building2 size={16} />
                                      <span className="font-black uppercase tracking-tighter">{p.name}</span>
                                  </div>
                                  <div className="grid grid-cols-4 gap-2">
                                      {units.map((u: any) => (
                                          <button 
                                            key={u.id}
                                            onClick={() => handleMoveTenant(p.id, u.name)}
                                            className="p-3 border border-[var(--border)] border-opacity-10 rounded-lg font-black text-[9px] uppercase tracking-tighter hover:bg-[var(--text-base)] hover:text-[var(--bg-panel)] transition-all shadow-[2px_2px_0px_0px_var(--shadow-color)]"
                                          >
                                              {u.name}
                                          </button>
                                      ))}
                                  </div>
                              </div>
                          );
                      })}
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};
