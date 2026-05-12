"use client";

import React, { useState, useEffect } from 'react';
import { History, Search, Filter, Eye, Download, UserMinus, X } from 'lucide-react';
import { api } from '@/lib/api';

interface ArchivedTenantsTabProps {
  managerId: string;
}

export const ArchivedTenantsTab = ({ managerId }: ArchivedTenantsTabProps) => {
  const [tenants, setTenants] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [selectedTenant, setSelectedTenant] = useState<any>(null);

  useEffect(() => {
    fetchArchived();
  }, [page]);

  const fetchArchived = async () => {
    setIsLoading(true);
    const res = await api.get<any>(`/tenants/archived?managerId=${managerId}&page=${page}`);
    if (res.success) {
      setTenants(res.tenants || []);
      setTotal(res.total || 0);
      setHasMore(res.hasMore || false);
    }
    setIsLoading(false);
  };

  return (
    <div className="space-y-12 animate-reveal">
      <div className="flex items-center justify-between border-b border-[var(--border)] pb-8 border-opacity-10">
        <div>
          <h2 className="text-5xl font-black uppercase tracking-tighter text-[var(--text-base)] leading-none">Archives</h2>
          <p className="font-mono text-[10px] text-[var(--text-muted)] uppercase font-bold tracking-[0.2em] mt-3">
            Historical records of past residents
          </p>
        </div>
      </div>

      <div className="bg-[var(--bg-panel)] border border-[var(--border)] border-opacity-10 rounded-2xl shadow-[8px_8px_0px_0px_var(--shadow-color)] overflow-hidden">
          <table className="w-full text-left font-mono text-[10px]">
              <thead className="bg-[var(--bg-ghost)] border-b border-[var(--border)] border-opacity-10">
                  <tr>
                      <th className="p-6 uppercase font-black tracking-widest opacity-50">Resident</th>
                      <th className="p-6 uppercase font-black tracking-widest opacity-50">Timeline</th>
                      <th className="p-6 uppercase font-black tracking-widest opacity-50">Building History</th>
                      <th className="p-6 uppercase font-black tracking-widest opacity-50">Resolution</th>
                      <th className="p-6 uppercase font-black tracking-widest opacity-50 text-right">Details</th>
                  </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)] divide-opacity-5">
                  {isLoading ? (
                      <tr><td colSpan={5} className="p-20 text-center uppercase font-black opacity-20 animate-pulse">Scanning Archives...</td></tr>
                  ) : tenants.length > 0 ? tenants.map((t) => {
                      const statement = JSON.parse(t.finalStatement || '{}');
                      return (
                        <tr key={t.id} className="hover:bg-[var(--bg-ghost)] transition-colors group">
                            <td className="p-6">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 bg-[var(--bg-ghost)] rounded-lg flex items-center justify-center border border-[var(--border)] border-opacity-5">
                                        <UserMinus size={14} className="opacity-40" />
                                    </div>
                                    <div>
                                        <p className="font-black text-xs tracking-tighter">{t.name}</p>
                                        <p className="text-[8px] opacity-40 uppercase">{t.phone}</p>
                                    </div>
                                </div>
                            </td>
                            <td className="p-6 font-bold">
                                <div className="flex flex-col gap-1">
                                    <p className="opacity-40 text-[8px] uppercase">Stayed: {Math.ceil((new Date(t.moveOutDate).getTime() - new Date(t.moveInDate).getTime()) / (1000 * 60 * 60 * 24 * 30))} months</p>
                                    <p className="text-[9px]">Out: {new Date(t.moveOutDate).toLocaleDateString()}</p>
                                </div>
                            </td>
                            <td className="p-6 opacity-60 font-bold uppercase">{t.propertyName}</td>
                            <td className="p-6">
                                <span className={`px-2 py-1 rounded-md text-[8px] font-black uppercase tracking-widest ${statement.finalBalance > 0 ? 'bg-red-500/10 text-red-500' : 'bg-green-500/10 text-green-500'}`}>
                                    {statement.finalBalance > 0 ? `Owed: KES ${statement.finalBalance.toLocaleString()}` : 'Cleared'}
                                </span>
                            </td>
                            <td className="p-6 text-right">
                                <button 
                                  onClick={() => setSelectedTenant(t)}
                                  className="p-2 hover:bg-[var(--text-base)] hover:text-[var(--bg-panel)] transition-all rounded-lg opacity-40 hover:opacity-100"
                                >
                                    <Eye size={16} />
                                </button>
                            </td>
                        </tr>
                      );
                  }) : (
                      <tr><td colSpan={5} className="p-20 text-center uppercase font-black opacity-20 italic">The archives are empty. No past residents found.</td></tr>
                  )}
              </tbody>
          </table>
      </div>

      {/* HISTORICAL DETAILS MODAL */}
      {selectedTenant && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-6 backdrop-blur-xl bg-[var(--bg-base)] bg-opacity-80 animate-reveal">
            <div className="bg-[var(--bg-panel)] border border-[var(--border)] border-opacity-20 w-full max-w-4xl rounded-3xl shadow-[32px_32px_0px_0px_var(--shadow-color)] overflow-hidden">
                <div className="p-8 border-b border-[var(--border)] border-opacity-10 flex justify-between items-center bg-[var(--bg-ghost)]">
                    <div>
                        <h3 className="text-3xl font-black uppercase tracking-tighter">Archived: {selectedTenant.name}</h3>
                        <p className="font-mono text-[9px] opacity-40 uppercase font-black tracking-widest mt-1">Tenant Record ID: {selectedTenant.id}</p>
                    </div>
                    <button onClick={() => setSelectedTenant(null)} className="p-2 hover:bg-red-500 hover:text-white transition-all rounded-lg"><X size={24} /></button>
                </div>
                
                <div className="p-10 grid grid-cols-1 md:grid-cols-2 gap-10 max-h-[70vh] overflow-y-auto custom-scrollbar">
                    <div className="space-y-8">
                        <div>
                            <p className="font-mono text-[8px] uppercase font-black opacity-40 tracking-widest mb-3">Departure Reconciliation</p>
                            <div className="bg-[var(--bg-panel)] p-6 rounded-2xl border border-[var(--border)] border-opacity-10 space-y-4">
                                {(() => {
                                    const s = JSON.parse(selectedTenant.finalStatement || '{}');
                                    return (
                                        <>
                                            <div className="flex justify-between font-mono text-[10px] font-bold">
                                                <span className="opacity-40 uppercase">Exit Date</span>
                                                <span>{new Date(selectedTenant.moveOutDate).toLocaleDateString()}</span>
                                            </div>
                                            <div className="flex justify-between font-mono text-[10px] font-bold">
                                                <span className="opacity-40 uppercase">Outstanding Arrears</span>
                                                <span>KES {s.outstandingArrears?.toLocaleString()}</span>
                                            </div>
                                            <div className="flex justify-between font-mono text-[10px] font-bold">
                                                <span className="opacity-40 uppercase">Damage Charges</span>
                                                <span className="text-red-500">+{s.damageCharges?.toLocaleString()}</span>
                                            </div>
                                            <div className="pt-4 border-t border-[var(--border)] border-opacity-10 flex justify-between font-mono text-sm font-black">
                                                <span className="uppercase">Final Balance</span>
                                                <span className={s.finalBalance > 0 ? 'text-red-500' : 'text-green-500'}>KES {s.finalBalance?.toLocaleString()}</span>
                                            </div>
                                        </>
                                    );
                                })()}
                            </div>
                        </div>

                        <div>
                            <p className="font-mono text-[8px] uppercase font-black opacity-40 tracking-widest mb-3">Inspection Findings</p>
                            <div className="bg-[var(--bg-panel)] p-6 rounded-2xl border border-[var(--border)] border-opacity-10 italic text-[11px] font-bold opacity-60">
                                {JSON.parse(selectedTenant.finalStatement || '{}').damageNotes || "No specific damage notes recorded for this departure."}
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <p className="font-mono text-[8px] uppercase font-black opacity-40 tracking-widest">Inspection Evidence (Exit Snapshots)</p>
                        <div className="grid grid-cols-2 gap-3">
                            {JSON.parse(selectedTenant.moveOutPhotos || '[]').map((url: string, i: number) => (
                                <div key={i} className="aspect-square rounded-xl overflow-hidden border border-[var(--border)] border-opacity-10">
                                    <img src={url} className="w-full h-full object-cover" alt="Exit" />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="p-8 border-t border-[var(--border)] border-opacity-5 flex justify-end gap-4 bg-[var(--bg-ghost)]">
                    <button className="px-8 py-4 border border-[var(--border)] border-opacity-10 rounded-xl font-mono text-[10px] uppercase font-black hover:bg-[var(--text-base)] hover:text-[var(--bg-panel)] transition-all flex items-center gap-2">
                        <Download size={14} /> Export Statement
                    </button>
                    <button onClick={() => setSelectedTenant(null)} className="px-8 py-4 bg-[var(--text-base)] text-[var(--bg-panel)] rounded-xl font-mono text-[10px] uppercase font-black transition-all">Close</button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};
