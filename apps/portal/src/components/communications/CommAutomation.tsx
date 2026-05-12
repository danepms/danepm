"use client";

import React from 'react';
import { 
  Zap, Layout, MousePointer2, TrendingUp, Plus, 
  Settings2, Trash2, AlertCircle, ShieldCheck,
  Power, Clock
} from 'lucide-react';

interface CommAutomationProps {
  flows: any[];
  flowTab: 'manage' | 'analytics' | 'nudges' | 'queue';
  setFlowTab: (tab: 'manage' | 'analytics' | 'nudges' | 'queue') => void;
  setEditingFlow: (flow: any) => void;
  triggerOptions: any[];
  saveCommunicationFlow: (flow: any) => Promise<any>;
  loadInitialData: () => void;
  analytics: any;
  overdueTenants: any[];
  selectedRecipientIds: string[];
  setSelectedRecipientIds: (ids: string[]) => void;
  handleManualNudge: () => void;
}

export const CommAutomation = ({
  flows, flowTab, setFlowTab, setEditingFlow,
  triggerOptions, saveCommunicationFlow, loadInitialData,
  analytics, overdueTenants, selectedRecipientIds,
  setSelectedRecipientIds, handleManualNudge
}: CommAutomationProps) => {

  // Ensure system flows exist for display
  const systemFlows = [
    { id: 'sys-1', name: 'Invoice Generated', trigger: 'invoice_generated', isActive: true, isSystem: true, steps: [{ id: 's1', templateName: 'Standard Monthly Invoice', offsetDays: 0, channel: 'email' }] },
    { id: 'sys-2', name: 'Rent Overdue Nudge', trigger: 'manual_nudge', isActive: true, isSystem: true, steps: [{ id: 's2', templateName: 'Overdue Warning', offsetDays: 3, channel: 'both' }] },
    { id: 'sys-3', name: 'Payment Received', trigger: 'payment_received', isActive: true, isSystem: true, steps: [{ id: 's3', templateName: 'Payment Receipt', offsetDays: 0, channel: 'sms' }] }
  ];

  const displayFlows = flows.length > 0 ? flows.map(f => {
     // Mark specific triggers as system if needed
     if (['invoice_generated', 'payment_received', 'manual_nudge'].includes(f.trigger)) {
        return { ...f, isSystem: true };
     }
     return f;
  }) : systemFlows;

  return (
    <div className="space-y-10 animate-reveal">
      
      {/* SUB-TAB NAV */}
      <div className="flex gap-6 border-b border-[var(--border)] border-opacity-10 pb-2">
         {[
           { id: 'manage', label: 'Sequences', icon: Layout },
           { id: 'queue', label: 'Upcoming Queue', icon: Clock },
           { id: 'nudges', label: 'Manual Nudges', icon: MousePointer2 },
           { id: 'analytics', label: 'Performance', icon: TrendingUp }
         ].map(t => (
           <button
             key={t.id}
             onClick={() => setFlowTab(t.id as any)}
             className={`flex items-center gap-2.5 pb-4 px-2 text-xs font-black uppercase tracking-widest border-b-2 transition-all ${flowTab === t.id ? 'border-[var(--text-base)] text-[var(--text-base)]' : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text-base)]'}`}
           >
             <t.icon size={14} />
             {t.label}
           </button>
         ))}
      </div>

      {flowTab === 'manage' && (
         <div className="space-y-8">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-3xl font-black tracking-tighter">Automated Sequences</h3>
                <p className="text-sm text-[var(--text-muted)] font-medium">Lifecycle triggers and time-based messaging</p>
              </div>
              <button 
                onClick={() => setEditingFlow({ name: '', trigger: 'invoice_generated', steps: [{ templateId: '', channel: 'both', offsetDays: 0 }], isActive: true })}
                className="bg-[var(--text-base)] text-[var(--bg-panel)] px-10 py-4 rounded-sm text-[11px] font-black uppercase tracking-[0.2em] shadow-xl hover:translate-y-[-2px] transition-all flex items-center gap-3"
              >
                <Plus size={18} /> New Sequence
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {displayFlows.map(f => (
                <div key={f.id} className={`bg-[var(--bg-panel)] p-10 rounded border border-[var(--border)] ${f.isSystem ? 'border-opacity-30 border-blue-500/30' : 'border-opacity-10'} shadow-sm relative group overflow-hidden hover:shadow-2xl transition-all`}>
                   {!f.isActive && <div className="absolute inset-0 bg-[var(--bg-base)]/60 backdrop-blur-[1px] z-10" />}
                   
                   <div className="flex justify-between items-start mb-8 relative z-20">
                      <div className={`w-12 h-12 rounded flex items-center justify-center ${f.isActive ? (f.isSystem ? 'bg-blue-500 text-white shadow-lg' : 'bg-[var(--accent-bg)] text-white shadow-lg') : 'bg-slate-500/10 text-slate-500'}`}>
                         {f.isSystem ? <ShieldCheck size={22} /> : <Zap size={22} />}
                      </div>
                      <div className="flex gap-2">
                         <button onClick={() => setEditingFlow(f)} className="p-3 hover:bg-[var(--bg-ghost)] rounded-sm transition-all text-[var(--text-muted)] hover:text-[var(--text-base)]"><Settings2 size={18} /></button>
                         {!f.isSystem ? (
                            <button className="p-3 hover:bg-red-500/10 text-[var(--text-muted)] hover:text-red-500 rounded-sm transition-all"><Trash2 size={18} /></button>
                         ) : (
                            <div className="p-2 px-3 bg-blue-500/10 text-blue-500 rounded-sm cursor-not-allowed flex items-center gap-2 text-[9px] uppercase font-black">
                               Core
                            </div>
                         )}
                      </div>
                   </div>

                   <div className="relative z-20">
                      <div className="flex items-center gap-3 mb-1">
                         <h4 className="text-2xl font-black tracking-tight">{f.name}</h4>
                      </div>
                      <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest mb-8">{triggerOptions.find(o => o.id === f.trigger)?.label || 'System Default'}</p>
                      
                      <div className="space-y-4">
                         <p className="text-[9px] font-black uppercase text-[var(--text-muted)] tracking-[0.2em] mb-4">Sequence Steps</p>
                         {f.steps?.map((s: any, idx: number) => (
                           <div key={s.id || idx} className="flex items-center gap-5 p-5 bg-[var(--bg-ghost)] rounded border border-[var(--border)] border-opacity-5">
                              <div className="w-8 h-8 rounded bg-[var(--bg-panel)] flex items-center justify-center text-[10px] font-black shadow-inner">
                                 {idx + 1}
                              </div>
                              <div className="flex-1 min-w-0">
                                 <p className="text-xs font-black truncate">{s.templateName || 'Unassigned Template'}</p>
                                 <p className="text-[9px] text-[var(--text-muted)] font-black uppercase tracking-wider mt-0.5">
                                    {s.offsetDays === 0 ? 'Immediate' : `${Math.abs(s.offsetDays)} Days ${s.offsetDays > 0 ? 'After' : 'Before'}`} • {s.channel}
                                 </p>
                              </div>
                           </div>
                         ))}
                      </div>
                   </div>

                   <div className="mt-10 pt-8 border-t border-[var(--border)] border-opacity-10 flex justify-between items-center relative z-20">
                       <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${f.isActive ? 'bg-green-500 animate-pulse' : 'bg-slate-400'}`} />
                          <span className="text-[10px] font-black uppercase tracking-widest">{f.isActive ? 'Active' : 'Paused'}</span>
                       </div>
                       <button 
                          onClick={async () => {
                            if (!f.managerId) return; // Prevent saving dummy ones
                            const res = await saveCommunicationFlow({ ...f, isActive: !f.isActive, managerId: f.managerId });
                            if (res.success) loadInitialData();
                          }}
                          className={`w-12 h-6 rounded-sm p-1 transition-all ${f.isActive ? 'bg-green-500 shadow-[0_0_15px_rgba(34,197,94,0.3)]' : 'bg-slate-300'}`}
                       >
                          <div className={`w-4 h-4 bg-white rounded-sm shadow-sm transition-all ${f.isActive ? 'translate-x-6' : 'translate-x-0'}`} />
                       </button>
                   </div>
                </div>
              ))}
            </div>
         </div>
      )}

      {flowTab === 'queue' && (
         <div className="space-y-8 animate-reveal">
            <div className="bg-[var(--bg-panel)] p-10 rounded border border-[var(--border)] border-opacity-10 shadow-sm flex items-center gap-6">
               <div className="w-16 h-16 rounded bg-[var(--bg-ghost)] flex items-center justify-center text-[var(--text-muted)]">
                  <Clock size={30} />
               </div>
               <div>
                  <h3 className="text-2xl font-black tracking-tighter">Scheduled Queue Engine</h3>
                  <p className="text-sm text-[var(--text-muted)] font-medium">Messages held in memory before transmission</p>
               </div>
            </div>

            <div className="p-16 border-2 border-dashed border-[var(--border)] border-opacity-10 rounded text-center">
               <Zap size={30} className="mx-auto mb-4 text-[var(--text-muted)] opacity-50" />
               <p className="text-sm font-black text-[var(--text-muted)] tracking-tight">Queue Engine Online</p>
               <p className="text-[10px] uppercase font-black tracking-widest text-[var(--text-muted)] opacity-50 mt-2">Currently 0 pending background tasks.</p>
               <p className="text-[10px] uppercase font-black tracking-widest text-[var(--text-muted)] opacity-50">Real-time scheduling mechanism will hold future offset sequences here.</p>
            </div>
         </div>
      )}

      {flowTab === 'nudges' && (
         <div className="space-y-8 animate-reveal">
            <div className="bg-amber-500/5 border border-amber-500/10 p-10 rounded flex items-center gap-10">
               <div className="w-20 h-20 rounded bg-amber-500/10 flex items-center justify-center text-amber-600 shadow-inner">
                  <AlertCircle size={40} />
               </div>
               <div>
                  <h3 className="text-3xl font-black tracking-tighter">Collection Nudges</h3>
                  <p className="text-sm text-[var(--text-muted)] font-medium max-w-xl leading-relaxed">
                     Manually trigger reminders for tenants in arrears. These nudges use your "Manual Nudge" sequence logic to ensure consistent professional follow-ups.
                  </p>
               </div>
            </div>

            <div className="bg-[var(--bg-panel)] rounded border border-[var(--border)] border-opacity-10 shadow-xl overflow-hidden">
               <div className="p-10 border-b border-[var(--border)] border-opacity-10 flex items-center justify-between">
                  <h3 className="text-xl font-black">Overdue Registry</h3>
                  <div className="flex gap-4">
                     <button 
                       onClick={() => setSelectedRecipientIds(overdueTenants.map(t => t.tenantId))}
                       className="px-6 py-3 bg-[var(--bg-ghost)] rounded-sm text-[10px] font-black uppercase tracking-widest hover:bg-[var(--text-base)] hover:text-[var(--bg-panel)] transition-all"
                     >
                        Select All Overdue
                     </button>
                     <button 
                       onClick={handleManualNudge}
                       disabled={selectedRecipientIds.length === 0}
                       className="px-10 py-3 bg-amber-500 text-white rounded-sm text-[10px] font-black uppercase tracking-widest shadow-lg hover:translate-y-[-2px] transition-all disabled:opacity-30"
                     >
                        Fire Collection Sequence ({selectedRecipientIds.length})
                     </button>
                  </div>
               </div>
               <div className="overflow-x-auto">
                  <table className="w-full text-left">
                     <thead>
                        <tr className="bg-[var(--bg-ghost)]/50">
                           <th className="p-8 text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">Tenant</th>
                           <th className="p-8 text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">Property / Unit</th>
                           <th className="p-8 text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] text-right">Outstanding</th>
                           <th className="p-8 text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] text-right">Last Payment</th>
                           <th className="p-8 text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] text-center">Action</th>
                        </tr>
                     </thead>
                     <tbody className="divide-y divide-[var(--border)] divide-opacity-5">
                        {overdueTenants.map(t => (
                           <tr key={t.tenantId} className="hover:bg-[var(--bg-ghost)]/30 transition-colors">
                              <td className="p-8">
                                 <p className="text-base font-black tracking-tight">{t.tenantName}</p>
                                 <p className="text-[10px] text-[var(--text-muted)] font-medium">{t.tenantPhone}</p>
                              </td>
                              <td className="p-8">
                                 <p className="text-xs font-black uppercase tracking-tight">{t.propertyName}</p>
                                 <p className="text-[10px] text-[var(--text-muted)] font-black uppercase tracking-widest mt-1">Unit {t.unitName}</p>
                              </td>
                              <td className="p-8 text-right">
                                 <p className="text-lg font-black text-red-500">KES {t.totalArrears.toLocaleString()}</p>
                              </td>
                              <td className="p-8 text-right">
                                 <p className="text-xs font-black uppercase">{t.lastPaymentDate ? new Date(t.lastPaymentDate).toLocaleDateString() : 'Never'}</p>
                              </td>
                              <td className="p-8 text-center">
                                 <input 
                                   type="checkbox" 
                                   checked={selectedRecipientIds.includes(t.tenantId)}
                                   onChange={(e) => {
                                      if (e.target.checked) setSelectedRecipientIds([...selectedRecipientIds, t.tenantId]);
                                      else setSelectedRecipientIds(selectedRecipientIds.filter(id => id !== t.tenantId));
                                   }}
                                   className="w-6 h-6 rounded-sm border-[var(--border)]"
                                 />
                              </td>
                           </tr>
                        ))}
                     </tbody>
                  </table>
               </div>
            </div>
         </div>
      )}

      {flowTab === 'analytics' && (
         <div className="space-y-10 animate-reveal">
            {/* Global stats from analytics props can be used here too */}
            <div className="bg-[var(--bg-panel)] p-12 rounded border border-[var(--border)] border-opacity-10 shadow-xl relative overflow-hidden">
               <h3 className="text-3xl font-black tracking-tighter mb-10">Cross-Property Engagement</h3>
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
                  {analytics?.propertyDist?.map((p: any) => (
                     <div key={p.propertyId} className="space-y-5">
                        <div className="flex justify-between items-end">
                           <p className="text-[10px] font-black uppercase tracking-widest truncate max-w-[150px]">{p.propertyName || "Global Portfolio"}</p>
                           <p className="text-3xl font-black">{p.count}</p>
                        </div>
                        <div className="h-2 w-full bg-[var(--bg-ghost)] rounded-none overflow-hidden border border-[var(--border)] border-opacity-5">
                           <div className="h-full bg-[var(--accent-bg)] rounded-none" style={{ width: `${(p.count / (analytics?.stats?.reduce((acc: any, s: any) => acc + s.count, 0) || 1)) * 100}%` }} />
                        </div>
                        <div className="flex justify-between text-[9px] font-black uppercase opacity-40">
                           <span>Reach Weight</span>
                           <span>{((p.count / (analytics?.stats?.reduce((acc: any, s: any) => acc + s.count, 0) || 1)) * 100).toFixed(1)}%</span>
                        </div>
                     </div>
                  ))}
               </div>
            </div>
         </div>
      )}
    </div>
  );
};
