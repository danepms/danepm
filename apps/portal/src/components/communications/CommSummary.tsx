"use client";

import React from 'react';
import { 
  TrendingUp, Zap, ShieldCheck, MousePointer2, 
  History, MessageSquare, Mail, PieChart, BarChart3
} from 'lucide-react';

interface CommSummaryProps {
  analytics: any;
  flows: any[];
  batches: any[];
  setActiveTab: (tab: any) => void;
  setFlowTab: (tab: any) => void;
}

export const CommSummary = ({ analytics, flows, batches, setActiveTab, setFlowTab }: CommSummaryProps) => {
  return (
    <div className="space-y-8 animate-reveal">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Outbound Pulse', val: analytics?.stats?.reduce((acc: any, s: any) => acc + s.count, 0) || 0, icon: TrendingUp, color: 'text-green-500' },
          { label: 'Active Sequences', val: flows.filter(f => f.isActive).length, icon: Zap, color: 'text-blue-500' },
          { label: 'Delivery Success', val: '99.9%', icon: ShieldCheck, color: 'text-emerald-500' },
          { label: 'Manual Nudges', val: batches.length, icon: MousePointer2, color: 'text-amber-500' }
        ].map((s, i) => (
          <div key={i} className="bg-[var(--bg-panel)] p-8 rounded border border-[var(--border)] border-opacity-10 shadow-sm group hover:shadow-xl transition-all">
             <s.icon size={20} className={`${s.color} mb-4 group-hover:scale-110 transition-transform`} />
             <p className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] mb-1">{s.label}</p>
             <p className="text-4xl font-black tracking-tighter">{s.val}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
         <div className="lg:col-span-8 bg-[var(--bg-panel)] rounded border border-[var(--border)] border-opacity-10 p-10">
            <div className="flex justify-between items-center mb-10">
              <h3 className="text-2xl font-black tracking-tight flex items-center gap-3">
                 <History size={20} className="text-[var(--accent-bg)]" /> Activity Timeline
              </h3>
              <div className="flex gap-2">
                 <button className="px-4 py-2 bg-[var(--bg-ghost)] rounded-sm text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] border border-[var(--border)] border-opacity-5">Past 30 Days</button>
                 <button onClick={() => setActiveTab('history')} className="px-4 py-2 bg-[var(--bg-ghost)] rounded-sm text-[10px] font-black uppercase tracking-widest text-[var(--accent-bg)] border border-[var(--border)] border-opacity-5">Full Log</button>
              </div>
            </div>
            <div className="space-y-4">
              {batches.slice(0, 5).map(b => (
                <div key={b.id} className="flex items-center justify-between p-6 bg-[var(--bg-ghost)] rounded border border-[var(--border)] border-opacity-5 hover:border-opacity-100 transition-all group cursor-pointer">
                   <div className="flex items-center gap-6">
                      <div className="w-12 h-12 rounded bg-[var(--bg-panel)] flex items-center justify-center shadow-md">
                         {b.channel === 'sms' ? <MessageSquare size={18} className="text-amber-500" /> : <Mail size={18} className="text-blue-500" />}
                      </div>
                      <div>
                         <p className="text-base font-black tracking-tight truncate max-w-[250px]">{b.name}</p>
                         <div className="flex items-center gap-3 mt-1">
                            <span className="text-[9px] text-[var(--text-muted)] font-black uppercase tracking-widest">{b.totalRecipients} Contacts</span>
                            <div className="w-1 h-1 rounded-full bg-[var(--border)]" />
                            <span className="text-[9px] text-green-500 font-black uppercase tracking-widest">{b.successCount} Delivered</span>
                         </div>
                      </div>
                   </div>
                   <div className="text-right">
                      <p className="text-[11px] font-black uppercase tracking-widest">{new Date(b.createdAt).toLocaleDateString()}</p>
                      <p className="text-[9px] text-[var(--text-muted)] font-bold mt-1 uppercase">Completed</p>
                   </div>
                </div>
              ))}
            </div>
         </div>

         <div className="lg:col-span-4 space-y-8">
            <div className="bg-[var(--bg-panel)] rounded border border-[var(--border)] border-opacity-10 p-10 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-10 opacity-5 -mr-10 -mt-10">
                 <PieChart size={160} />
              </div>
              <h3 className="text-2xl font-black tracking-tight mb-2">Reach Distribution</h3>
              <p className="text-[11px] text-[var(--text-muted)] font-medium mb-10">Outbound density by property</p>
              
              <div className="space-y-8">
                 {analytics?.propertyDist?.slice(0, 4).map((p: any) => (
                   <div key={p.propertyId} className="space-y-3">
                      <div className="flex justify-between items-end">
                         <p className="text-xs font-black uppercase tracking-tight truncate max-w-[150px]">{p.propertyName || "Global"}</p>
                         <p className="text-[10px] font-black">{p.count} Hits</p>
                      </div>
                      <div className="h-1.5 w-full bg-[var(--bg-ghost)] rounded-none overflow-hidden">
                         <div className="h-full bg-[var(--accent-bg)] rounded-none" style={{ width: `${(p.count / (analytics?.stats?.reduce((acc: any, s: any) => acc + s.count, 0) || 1)) * 100}%` }} />
                      </div>
                   </div>
                 ))}
              </div>

              <button onClick={() => setFlowTab('analytics')} className="w-full mt-12 py-4 bg-[var(--bg-ghost)] rounded-sm text-[10px] font-black uppercase tracking-[0.2em] border border-[var(--border)] border-opacity-5 hover:bg-[var(--text-base)] hover:text-[var(--bg-panel)] transition-all">
                 Full Property Insights
              </button>
            </div>
         </div>
      </div>
    </div>
  );
};
