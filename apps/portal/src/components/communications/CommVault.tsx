"use client";

import React, { useState } from 'react';
import { 
  Copy, Plus, Mail, MessageSquare, History, Search, 
  Trash2, ArrowUpRight, CheckCircle2, AlertCircle, Clock
} from 'lucide-react';

interface CommVaultProps {
  templates: any[];
  batches: any[];
  activeTab: 'templates' | 'history';
  setActiveTab: (tab: any) => void;
  setEditingTemplate: (template: any) => void;
}

export const CommVault = ({
  templates, batches, activeTab, setActiveTab, setEditingTemplate
}: CommVaultProps) => {

  const [searchQuery, setSearchQuery] = useState('');

  const filteredTemplates = templates.filter(t => 
    t.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredBatches = batches.filter(b => 
    b.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-10 animate-reveal">
      
      {activeTab === 'templates' && (
         <div className="space-y-10">
            <div className="flex justify-between items-center bg-[var(--bg-panel)] p-10 rounded border border-[var(--border)] border-opacity-10 shadow-sm relative overflow-hidden">
               <div className="absolute top-0 left-0 p-10 opacity-5 -ml-6 -mt-6">
                  <Copy size={120} />
               </div>
               <div className="relative z-10">
                  <h3 className="text-3xl font-black tracking-tighter">Template Studio</h3>
                  <p className="text-sm text-[var(--text-muted)] font-medium">Reusable message blueprints for rapid engagement</p>
               </div>
               <div className="flex gap-4 relative z-10">
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={16} />
                    <input 
                      type="text" 
                      placeholder="Search vault..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="bg-[var(--bg-ghost)] border border-[var(--border)] border-opacity-10 pl-12 pr-6 py-4 rounded-sm text-xs font-black uppercase tracking-widest focus:border-opacity-100 outline-none w-64 shadow-inner"
                    />
                  </div>
                  <button 
                    onClick={() => setEditingTemplate({ name: '', subject: '', contentText: '', channel: 'email', isDraft: true })}
                    className="bg-[var(--text-base)] text-[var(--bg-panel)] px-10 py-4 rounded-sm text-[11px] font-black uppercase tracking-[0.2em] shadow-xl hover:translate-y-[-2px] transition-all flex items-center gap-3"
                  >
                    <Plus size={18} /> New Blueprint
                  </button>
               </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
               {filteredTemplates.map(t => (
                 <div key={t.id} className="bg-[var(--bg-panel)] p-10 rounded border border-[var(--border)] border-opacity-10 group relative hover:shadow-2xl transition-all cursor-pointer overflow-hidden" onClick={() => setEditingTemplate(t)}>
                    <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--accent-bg)] opacity-[0.02] -mr-16 -mt-16 rounded-full group-hover:opacity-10 transition-opacity" />
                    <div className="flex justify-between items-start mb-8">
                       <div className={`px-4 py-1.5 rounded-sm text-[10px] font-black uppercase tracking-widest ${t.channel === 'email' ? 'bg-blue-500/10 text-blue-500' : 'bg-amber-500/10 text-amber-500'}`}>
                          {t.channel}
                       </div>
                       {t.isDraft && <span className="text-[8px] font-black uppercase text-amber-600 bg-amber-50 px-2 py-1 rounded-sm">Draft</span>}
                       <div className="opacity-0 group-hover:opacity-100 transition-all flex gap-2">
                          <button className="p-2 hover:bg-[var(--bg-ghost)] rounded-sm"><ArrowUpRight size={14} /></button>
                          <button className="p-2 hover:bg-red-500/10 text-red-500 rounded-sm"><Trash2 size={14} /></button>
                       </div>
                    </div>
                    <h4 className="text-2xl font-black tracking-tight mb-2 group-hover:text-[var(--accent-bg)] transition-colors">{t.name}</h4>
                    <p className="text-[11px] text-[var(--text-muted)] line-clamp-3 leading-relaxed mb-8">{t.contentText}</p>
                    <div className="flex items-center gap-3 mt-auto pt-6 border-t border-[var(--border)] border-opacity-5">
                       <Clock size={12} className="text-[var(--text-muted)]" />
                       <span className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">Updated {new Date(t.createdAt).toLocaleDateString()}</span>
                    </div>
                 </div>
               ))}
            </div>
         </div>
      )}

      {activeTab === 'history' && (
         <div className="bg-[var(--bg-panel)] rounded border border-[var(--border)] border-opacity-10 shadow-xl overflow-hidden animate-reveal relative">
            <div className="p-10 border-b border-[var(--border)] border-opacity-10 flex items-center justify-between relative z-10 bg-[var(--bg-panel)]">
               <div>
                  <h3 className="text-2xl font-black tracking-tighter">Communications Ledger</h3>
                  <p className="text-[11px] text-[var(--text-muted)] font-medium">Historical audit of all outbound dispatches</p>
               </div>
               <div className="relative">
                 <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={16} />
                 <input 
                   type="text" 
                   placeholder="Filter archives..."
                   value={searchQuery}
                   onChange={(e) => setSearchQuery(e.target.value)}
                   className="bg-[var(--bg-ghost)] border border-[var(--border)] border-opacity-10 pl-12 pr-6 py-4 rounded-sm text-xs font-black uppercase tracking-widest focus:border-opacity-100 outline-none w-64 shadow-inner"
                 />
               </div>
            </div>

            <div className="overflow-x-auto relative z-10">
               <table className="w-full text-left">
                  <thead>
                     <tr className="bg-[var(--bg-ghost)]/50">
                        <th className="p-8 text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">Dispatch Event</th>
                        <th className="p-8 text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">Channel</th>
                        <th className="p-8 text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">Scale</th>
                        <th className="p-8 text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">Integrity</th>
                        <th className="p-8 text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] text-right">Timestamp</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border)] divide-opacity-5">
                     {filteredBatches.map(b => (
                        <tr key={b.id} className="hover:bg-[var(--bg-ghost)]/30 transition-colors group cursor-pointer">
                           <td className="p-8">
                              <p className="text-base font-black tracking-tight group-hover:text-[var(--accent-bg)] transition-colors">{b.name}</p>
                              <p className="text-[10px] text-[var(--text-muted)] font-medium mt-0.5">{b.templateName || 'Custom Payload'}</p>
                           </td>
                           <td className="p-8">
                              <div className="flex items-center gap-3">
                                 {b.channel === 'sms' ? <MessageSquare size={14} className="text-amber-500" /> : <Mail size={14} className="text-blue-500" />}
                                 <span className="text-[10px] font-black uppercase tracking-widest">{b.channel}</span>
                              </div>
                           </td>
                           <td className="p-8">
                              <p className="text-xs font-black">{b.totalRecipients} Contacts</p>
                           </td>
                           <td className="p-8">
                              <div className="flex items-center gap-3">
                                 <div className="w-full max-w-[100px] h-1.5 bg-[var(--bg-ghost)] rounded-none overflow-hidden">
                                    <div className="h-full bg-green-500" style={{ width: `${(b.successCount / b.totalRecipients) * 100}%` }} />
                                 </div>
                                 <span className="text-[9px] font-black text-green-600">{((b.successCount / b.totalRecipients) * 100).toFixed(0)}%</span>
                              </div>
                           </td>
                           <td className="p-8 text-right">
                              <p className="text-xs font-black">{new Date(b.createdAt).toLocaleDateString()}</p>
                              <p className="text-[9px] text-[var(--text-muted)] font-medium mt-1">{new Date(b.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                           </td>
                        </tr>
                     ))}
                  </tbody>
               </table>
            </div>
         </div>
      )}
    </div>
  );
};
