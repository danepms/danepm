"use client";

import React, { useState, useEffect } from 'react';
import { 
  Shield, Activity, Clock, Search, Filter, 
  ChevronLeft, ChevronRight, Download, Eye,
  Terminal, Database, Zap, AlertCircle, RefreshCw
} from 'lucide-react';
import { api } from '@/lib/api';
import { useToast } from '@/context/ToastContext';
import { resolveDeviceName } from '@/lib/utils';

interface AuditVaultProps {
  managerId: string;
  properties: any[];
}

export const ActivityLog = ({ managerId, properties }: AuditVaultProps) => {
  const { showToast } = useToast();
  const [logs, setLogs] = useState<any[]>([]);
  const [cronLogs, setCronLogs] = useState<any[]>([]);
  const [activeSubTab, setActiveSubTab] = useState<'audit' | 'cron'>('audit');
  const [isLoading, setIsLoading] = useState(true);

  const resolveUnitName = (propertyId: string, unitId: string) => {
    if (!unitId) return 'NONE';
    if (!unitId.startsWith('U_')) return unitId;
    
    const prop = properties.find(p => p.id === propertyId);
    if (!prop || !prop.config) return unitId;
    
    try {
        const config = JSON.parse(prop.config);
        const unit = config.units?.find((u: any) => u.id === unitId || u.name === unitId);
        return unit?.name || unitId;
    } catch (e) {
        return unitId;
    }
  };
  
  // Pagination
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);
  const limit = 50;

  // Filters
  const [filters, setFilters] = useState({ action: '', entityType: '' });

  useEffect(() => {
    loadLogs();
  }, [page, activeSubTab, filters]);

  const loadLogs = async () => {
    setIsLoading(true);
    if (activeSubTab === 'audit') {
      const res = await api.get<any>(`/admin/audit-logs?managerId=${managerId}&page=${page}&limit=${limit}&action=${filters.action}&entityType=${filters.entityType}`);
      if (res.success) {
        setLogs(res.logs || []);
        setTotal(res.total as any || 0);
      }
    } else {
      const res = await api.get<any>(`/admin/cron-logs?managerId=${managerId}&page=${page}&limit=${limit}`);
      if (res.success) {
        setCronLogs(res.logs || []);
        setTotal(res.total as any || 0);
      }
    }
    setIsLoading(false);
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="relative min-h-[80vh] flex flex-col gap-8 animate-reveal">
      
      {/* SCANNING LINE ANIMATION */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0 opacity-[0.03]">
        <div className="w-full h-[2px] bg-[var(--accent-bg)] shadow-[0_0_15px_var(--accent-bg)] absolute animate-scan-y" />
      </div>

      {/* --- HEADER --- */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 bg-[var(--bg-panel)] p-10 rounded border border-[var(--border)] border-opacity-10 shadow-xl relative z-10 overflow-hidden">
        <div className="absolute top-0 right-0 p-10 opacity-5 -mr-8 -mt-8">
           <Shield size={160} />
        </div>
        
        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-2">
             <div className="px-3 py-1 bg-[var(--accent-bg)] text-[var(--accent-text)] rounded-sm text-[8px] font-black uppercase tracking-[0.2em] shadow-lg">
                History
             </div>
             <span className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest flex items-center gap-2">
                <Database size={12} /> Live Sync
             </span>
          </div>
          <h2 className="text-5xl font-black tracking-tighter">Activity</h2>
          <p className="text-sm text-[var(--text-muted)] font-medium mt-1">A record of recent activity</p>
        </div>

        <div className="flex bg-[var(--bg-ghost)] p-1.5 rounded-sm border border-[var(--border)] border-opacity-10 relative z-10">
          <button
            onClick={() => { setActiveSubTab('audit'); setPage(1); }}
            className={`px-8 py-3 rounded-sm text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-3 ${activeSubTab === 'audit' ? 'bg-[var(--text-base)] text-[var(--bg-panel)] shadow-xl' : 'text-[var(--text-muted)] hover:text-[var(--text-base)]'}`}
          >
            <Activity size={14} /> Log
          </button>
          <button
            onClick={() => { setActiveSubTab('cron'); setPage(1); }}
            className={`px-8 py-3 rounded-sm text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-3 ${activeSubTab === 'cron' ? 'bg-[var(--text-base)] text-[var(--bg-panel)] shadow-xl' : 'text-[var(--text-muted)] hover:text-[var(--text-base)]'}`}
          >
            <RefreshCw size={14} /> Updates
          </button>
        </div>
      </div>

      {/* --- FILTER BAR --- */}
      <div className="bg-[var(--bg-panel)] p-6 rounded border border-[var(--border)] border-opacity-10 shadow-sm flex flex-wrap items-center justify-between gap-6 relative z-10">
         <div className="flex items-center gap-6 flex-1">
            <div className="relative flex-1 max-w-sm">
               <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={16} />
               <input 
                 type="text" 
                 placeholder="Search log entries..."
                 className="w-full bg-[var(--bg-ghost)] border border-[var(--border)] border-opacity-5 pl-12 pr-6 py-3 rounded-sm text-xs font-black focus:border-opacity-100 outline-none transition-all shadow-inner uppercase tracking-widest"
               />
            </div>

            {activeSubTab === 'audit' && (
              <div className="flex gap-4">
                 <select 
                   value={filters.entityType}
                   onChange={(e) => setFilters({ ...filters, entityType: e.target.value })}
                   className="bg-[var(--bg-ghost)] border border-[var(--border)] border-opacity-5 px-6 py-3 rounded-sm text-[10px] font-black uppercase tracking-widest outline-none shadow-inner"
                 >
                    <option value="">All Entities</option>
                    <option value="unit">Units</option>
                    <option value="tenant">Tenants</option>
                    <option value="invoice">Invoices</option>
                    <option value="communication">Comms</option>
                 </select>
              </div>
            )}
         </div>

         <div className="flex items-center gap-4">
            <button className="p-3 bg-[var(--bg-ghost)] border border-[var(--border)] border-opacity-5 rounded-sm text-[var(--text-muted)] hover:text-[var(--text-base)] transition-all">
               <Download size={16} />
            </button>
            <div className="flex items-center gap-3 px-4 border-l border-[var(--border)] border-opacity-10 ml-2">
               <button 
                 disabled={page === 1}
                 onClick={() => setPage(p => p - 1)}
                 className="p-2 hover:bg-[var(--bg-ghost)] rounded-sm disabled:opacity-20"
               >
                 <ChevronLeft size={16} />
               </button>
               <span className="text-[10px] font-black uppercase tracking-widest">
                  Page {page} of {totalPages || 1}
               </span>
               <button 
                 disabled={page === totalPages}
                 onClick={() => setPage(p => p + 1)}
                 className="p-2 hover:bg-[var(--bg-ghost)] rounded-sm disabled:opacity-20"
               >
                 <ChevronRight size={16} />
               </button>
            </div>
         </div>
      </div>

      {/* --- CONTENT --- */}
      <div className="bg-[var(--bg-panel)] rounded border border-[var(--border)] border-opacity-10 shadow-2xl overflow-hidden relative z-10">
         <div className="overflow-x-auto">
            <table className="w-full text-left font-mono">
               <thead>
                  <tr className="bg-[var(--bg-ghost)]/50">
                     <th className="p-6 text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] border-b border-[var(--border)] border-opacity-5">Time</th>
                     <th className="p-6 text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] border-b border-[var(--border)] border-opacity-5">Action</th>
                     <th className="p-6 text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] border-b border-[var(--border)] border-opacity-5">Item</th>
                     <th className="p-6 text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] border-b border-[var(--border)] border-opacity-5">Person</th>
                     <th className="p-6 text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] border-b border-[var(--border)] border-opacity-5 text-right">Details</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-[var(--border)] divide-opacity-5">
                  {isLoading ? (
                    <tr>
                      <td colSpan={5} className="p-20 text-center">
                         <div className="flex flex-col items-center gap-4">
                            <Terminal size={32} className="animate-pulse text-[var(--accent-bg)]" />
                            <p className="text-[9px] font-black uppercase tracking-[0.3em] opacity-40">Loading...</p>
                         </div>
                      </td>
                    </tr>
                  ) : (
                    activeSubTab === 'audit' ? (
                      logs.length > 0 ? logs.map((l: any) => (
                        <React.Fragment key={l.id}>
                        <tr className={`hover:bg-[var(--bg-ghost)]/30 transition-colors group ${expandedLogId === l.id ? 'bg-[var(--bg-ghost)]/50' : ''}`}>
                           <td className="p-6 whitespace-nowrap">
                              <div className="flex items-center gap-3">
                                 <Clock size={12} className="text-[var(--text-muted)]" />
                                 <span className="text-[11px] font-bold">{new Date(l.createdAt).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
                                 <span className="text-[9px] opacity-40">{new Date(l.createdAt).toLocaleDateString()}</span>
                              </div>
                           </td>
                           <td className="p-6">
                              <span className={`px-2 py-0.5 rounded-sm text-[10px] font-black ${l.action.includes('DELETED') ? 'bg-red-500/10 text-red-500' : l.action.includes('ADJUSTED') || l.action.includes('UPDATED') ? 'bg-amber-500/10 text-amber-500' : 'bg-green-500/10 text-green-500'}`}>
                                 {l.action}
                              </span>
                           </td>
                           <td className="p-6">
                              <p className="text-[11px] font-black uppercase tracking-tight">{l.entityType}</p>
                              <p className="text-[9px] text-[var(--text-muted)] mt-0.5 truncate max-w-[150px]">{l.entityId}</p>
                           </td>
                           <td className="p-6">
                              <p className="text-[11px] font-bold">{l.actorName || 'System'}</p>
                              <p className="text-[9px] text-[var(--text-muted)] font-medium mt-0.5 opacity-60">{resolveDeviceName(l.userAgent)}</p>
                           </td>
                           <td className="p-6 text-right">
                              <button 
                                onClick={() => setExpandedLogId(expandedLogId === l.id ? null : l.id)}
                                className={`p-2 rounded-sm transition-all ${expandedLogId === l.id ? 'bg-[var(--text-base)] text-[var(--bg-panel)]' : 'hover:bg-[var(--bg-ghost)] text-[var(--text-muted)]'}`}
                              >
                                 <Eye size={14} />
                              </button>
                           </td>
                        </tr>
                        {expandedLogId === l.id && (
                          <tr className="bg-[var(--bg-ghost)]/20">
                            <td colSpan={5} className="p-8">
                               <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                  <div className="space-y-4">
                                     <p className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] mb-2">Technical Info</p>
                                     <div className="grid grid-cols-2 gap-4">
                                        <div className="bg-[var(--bg-panel)] p-4 rounded border border-[var(--border)] border-opacity-5">
                                           <p className="text-[8px] font-bold opacity-40 uppercase mb-1">Source</p>
                                           <p className="text-xs font-bold">{l.ipAddress || '0.0.0.0'}</p>
                                        </div>
                                        <div className="bg-[var(--bg-panel)] p-4 rounded border border-[var(--border)] border-opacity-5">
                                           <p className="text-[8px] font-bold opacity-40 uppercase mb-1">Resolved Device</p>
                                           <p className="text-xs font-bold">{resolveDeviceName(l.userAgent)}</p>
                                        </div>
                                     </div>
                                  </div>
                                  <div className="space-y-4">
                                     <p className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] mb-2">Details</p>
                                     <div className="bg-[var(--bg-panel)] p-6 rounded border border-[var(--border)] border-opacity-5 font-mono text-[10px] overflow-x-auto max-h-60 custom-scrollbar">
                                         {l.payload ? (
                                           <pre className="whitespace-pre-wrap">{JSON.stringify((() => {
                                                const p = { ...l.payload };
                                                if (p.unit) p.unit = resolveUnitName(l.propertyId, p.unit);
                                                if (p.from) p.from = resolveUnitName(l.propertyId, p.from);
                                                if (p.to) p.to = resolveUnitName(l.propertyId, p.to);
                                                return p;
                                           })(), null, 2)}</pre>
                                        ) : (
                                          <span className="opacity-40 italic">No structured data payload recorded for this event.</span>
                                        )}
                                     </div>
                                  </div>
                               </div>
                            </td>
                          </tr>
                        )}
                        </React.Fragment>
                      )) : (
                        <tr><td colSpan={5} className="p-20 text-center opacity-40 italic text-xs">No audit logs found for this period.</td></tr>
                      )
                    ) : (
                      cronLogs.length > 0 ? cronLogs.map((l: any) => (
                        <tr key={l.id} className="hover:bg-[var(--bg-ghost)]/30 transition-colors group">
                           <td className="p-6 whitespace-nowrap">
                              <div className="flex items-center gap-3">
                                 <Clock size={12} className="text-[var(--text-muted)]" />
                                 <span className="text-[11px] font-bold">{new Date(l.createdAt).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
                                 <span className="text-[9px] opacity-40">{new Date(l.createdAt).toLocaleDateString()}</span>
                              </div>
                           </td>
                           <td className="p-6">
                              <div className="flex items-center gap-3">
                                 <div className={`w-1.5 h-1.5 rounded-full ${l.status === 'success' ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]' : l.status === 'failed' ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]' : 'bg-amber-500'}`} />
                                 <span className="text-[10px] font-black uppercase">{l.jobName}</span>
                              </div>
                           </td>
                           <td className="p-6">
                              <span className={`text-[10px] font-black uppercase tracking-widest ${l.status === 'success' ? 'text-green-500' : l.status === 'failed' ? 'text-red-500' : 'text-amber-500'}`}>
                                 {l.status}
                              </span>
                           </td>
                           <td className="p-6">
                              <p className="text-[11px] font-bold">{l.durationMs ? `${l.durationMs}ms` : '---'}</p>
                              <p className="text-[9px] text-[var(--text-muted)] font-medium mt-0.5">Speed</p>
                           </td>
                           <td className="p-6 text-right">
                              <div className="flex items-center justify-end gap-3 text-[var(--text-muted)]">
                                 {l.status === 'failed' && <AlertCircle size={14} className="text-red-500" />}
                                 <span className="text-[9px] font-black uppercase tracking-widest">Details</span>
                              </div>
                           </td>
                        </tr>
                      )) : (
                        <tr><td colSpan={5} className="p-20 text-center opacity-40 italic text-xs">All caught up. No tasks found.</td></tr>
                      )
                    )
                  )}
               </tbody>
            </table>
         </div>
      </div>

      {/* --- FOOTER / PAGINATION --- */}
      <div className="flex justify-between items-center text-[var(--text-muted)] relative z-10 pb-10">
         <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.3)]" />
            <span className="text-[9px] font-black uppercase tracking-[0.2em]">Live</span>
         </div>
         <p className="text-[9px] font-black uppercase tracking-[0.2em]">
            Total entries: {total.toLocaleString()}
         </p>
      </div>

      <style jsx global>{`
        @keyframes scan-y {
          0% { top: 0; }
          100% { top: 100%; }
        }
        .animate-scan-y {
          animation: scan-y 8s linear infinite;
        }
      `}</style>
    </div>
  );
};
