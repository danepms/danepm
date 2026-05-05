"use client";

import React, { useState } from 'react';
import { 
  Send, Users, Mail, MessageSquare, Sparkles, Zap, 
  Search, Filter, CheckCircle2, Clock, Calendar, 
  ChevronRight, X, Info, TrendingUp
} from 'lucide-react';

interface CommBroadcastProps {
  managerId: string;
  properties: any[];
  templates: any[];
  refreshRecipients: () => void;
  targeting: any;
  setTargeting: (t: any) => void;
  channel: string;
  setChannel: (c: any) => void;
  recipients: any[];
  selectedRecipientIds: string[];
  setSelectedRecipientIds: (ids: string[]) => void;
  customSubject: string;
  setCustomSubject: (s: string) => void;
  customContent: string;
  setCustomContent: (c: string) => void;
  setIsPreflight: (v: boolean) => void;
  getVariables: () => string[];
}

export const CommBroadcast = ({
  managerId, properties, templates, refreshRecipients,
  targeting, setTargeting, channel, setChannel,
  recipients, selectedRecipientIds, setSelectedRecipientIds,
  customSubject, setCustomSubject, customContent, setCustomContent,
  setIsPreflight, getVariables
}: CommBroadcastProps) => {

  const [sendMode, setSendMode] = useState<'now' | 'scheduled'>('now');
  const [scheduledDate, setScheduledDate] = useState('');
  const [toneRefiner, setToneRefiner] = useState<'neutral' | 'urgent' | 'friendly'>('neutral');

  const smartVariables = [
    ...getVariables(),
    '{{arrears_balance}}', '{{last_payment_date}}', '{{unit_condition_summary}}', '{{due_date_countdown}}'
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 animate-reveal">
       
       {/* TARGETING PANEL */}
       <div className="lg:col-span-4 bg-[var(--bg-panel)] p-10 rounded border border-[var(--border)] border-opacity-10 shadow-xl h-fit">
          <div className="flex justify-between items-center mb-10">
             <h3 className="text-xl font-black tracking-tight flex items-center gap-3">
                <Filter size={18} /> Audience Setup
             </h3>
          </div>
          
          <div className="space-y-8">
             <div className="space-y-3">
                <label className="text-[9px] font-black uppercase text-[var(--text-muted)] block tracking-[0.2em]">Target Property</label>
                <select 
                  value={targeting.propertyId}
                  onChange={(e) => setTargeting({ ...targeting, propertyId: e.target.value })}
                  className="w-full bg-[var(--bg-ghost)] border border-[var(--border)] border-opacity-10 p-5 rounded-sm text-sm font-black focus:border-opacity-100 outline-none transition-all shadow-inner"
                >
                   <option value="">All Portfolio Assets</option>
                   {properties.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
             </div>

             <div className="space-y-3">
                <label className="text-[9px] font-black uppercase text-[var(--text-muted)] block tracking-[0.2em]">Engagement Channel</label>
                <div className="flex bg-[var(--bg-ghost)] p-1.5 rounded-sm border border-[var(--border)] border-opacity-5">
                   {[
                     { id: 'sms', label: 'SMS', icon: MessageSquare },
                     { id: 'email', label: 'Email', icon: Mail },
                     { id: 'both', label: 'Dual', icon: Sparkles }
                   ].map(c => (
                     <button 
                       key={c.id}
                       onClick={() => setChannel(c.id as any)}
                       className={`flex-1 flex flex-col items-center gap-1.5 py-4 rounded-sm transition-all ${channel === c.id ? 'bg-[var(--text-base)] text-[var(--bg-panel)] shadow-xl' : 'text-[var(--text-muted)] hover:text-[var(--text-base)]'}`}
                     >
                        <c.icon size={16} />
                        <span className="text-[8px] font-black uppercase tracking-widest">{c.label}</span>
                     </button>
                   ))}
                </div>
             </div>

             <div className="pt-6 border-t border-[var(--border)] border-opacity-5">
                <label className="flex items-center gap-4 cursor-pointer group">
                  <div 
                    onClick={() => setTargeting({ ...targeting, hasArrears: !targeting.hasArrears })}
                    className={`w-12 h-6 rounded-sm p-1 transition-all ${targeting.hasArrears ? 'bg-amber-500' : 'bg-[var(--bg-ghost)]'}`}
                  >
                     <div className={`w-4 h-4 bg-white rounded-sm shadow-sm transition-all ${targeting.hasArrears ? 'translate-x-6' : 'translate-x-0'}`} />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] group-hover:text-[var(--text-base)] transition-colors">Target Arrears Only</span>
                </label>
             </div>

             <button 
              onClick={refreshRecipients}
              className="w-full mt-6 py-6 bg-[var(--text-base)] text-[var(--bg-panel)] rounded-sm text-[10px] font-black uppercase tracking-[0.3em] hover:translate-y-[-2px] transition-all shadow-xl"
             >
               Filter Audience
             </button>
          </div>
       </div>

       {/* MESSAGE COMPOSER */}
       <div className="lg:col-span-8 bg-[var(--bg-panel)] p-12 rounded border border-[var(--border)] border-opacity-10 shadow-2xl flex flex-col min-h-[650px] relative overflow-hidden">
          <div className="absolute bottom-0 right-0 p-12 opacity-[0.02] pointer-events-none">
             <Send size={300} />
          </div>

          <div className="flex justify-between items-center mb-12 relative z-10">
             <div className="flex items-center gap-5">
                <div className="w-14 h-14 rounded bg-[var(--accent-bg)] text-[var(--accent-text)] flex items-center justify-center shadow-lg">
                   <Mail size={24} />
                </div>
                <div>
                   <h3 className="text-3xl font-black tracking-tighter">Broadcast Studio</h3>
                   <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-muted)]">Crafting message for {selectedRecipientIds.length} recipients</p>
                </div>
             </div>
             
             <div className="flex bg-[var(--bg-ghost)] p-1 rounded-sm border border-[var(--border)] border-opacity-5">
                <button 
                  onClick={() => setSendMode('now')}
                  className={`px-6 py-3 rounded-sm text-[10px] font-black uppercase tracking-widest transition-all ${sendMode === 'now' ? 'bg-[var(--text-base)] text-[var(--bg-panel)]' : 'text-[var(--text-muted)]'}`}
                >
                   Now
                </button>
                <button 
                  onClick={() => setSendMode('scheduled')}
                  className={`px-6 py-3 rounded-sm text-[10px] font-black uppercase tracking-widest transition-all ${sendMode === 'scheduled' ? 'bg-[var(--text-base)] text-[var(--bg-panel)]' : 'text-[var(--text-muted)]'}`}
                >
                   Scheduled
                </button>
             </div>
          </div>

          <div className="flex-1 flex flex-col gap-10 relative z-10">
             
             {sendMode === 'scheduled' && (
               <div className="animate-reveal space-y-4">
                  <label className="text-[9px] font-black uppercase text-[var(--text-muted)] block tracking-[0.2em]">Scheduled Date & Time</label>
                  <input 
                    type="datetime-local" 
                    value={scheduledDate}
                    onChange={(e) => setScheduledDate(e.target.value)}
                    className="w-full bg-[var(--bg-ghost)] border border-[var(--border)] border-opacity-10 p-5 rounded-sm text-sm font-black focus:border-opacity-100 outline-none transition-all shadow-inner"
                  />
               </div>
             )}

             {channel !== 'sms' && (
                <div className="space-y-4">
                   <label className="text-[9px] font-black uppercase text-[var(--text-muted)] block tracking-[0.2em]">Subject Line</label>
                   <input 
                    type="text"
                    value={customSubject}
                    onChange={(e) => setCustomSubject(e.target.value)}
                    placeholder="e.g. Action Required: Your Monthly Billing"
                    className="w-full bg-[var(--bg-ghost)] border border-[var(--border)] border-opacity-10 p-6 rounded-sm text-xl font-black outline-none focus:border-opacity-100 transition-all shadow-inner"
                  />
                </div>
             )}

             <div className="flex-1 flex flex-col min-h-[350px]">
                <div className="flex justify-between items-center mb-4">
                  <label className="text-[10px] font-black uppercase text-[var(--text-muted)] block tracking-[0.2em]">Message Payload</label>
                  <div className="flex flex-wrap gap-2">
                     {smartVariables.map(v => (
                       <button 
                         key={v}
                         onClick={() => setCustomContent(customContent + v)}
                         className="px-4 py-2 bg-[var(--bg-ghost)] border border-[var(--border)] border-opacity-10 rounded-sm text-[9px] font-black hover:bg-[var(--text-base)] hover:text-[var(--bg-panel)] transition-all uppercase tracking-widest shadow-sm"
                       >
                         {v.replace('{{', '').replace('}}', '')}
                       </button>
                     ))}
                  </div>
                </div>
                <textarea 
                  value={customContent}
                  onChange={(e) => setCustomContent(e.target.value)}
                  placeholder="Start typing your broadcast message or select a variable from above..."
                  className="flex-1 w-full bg-[var(--bg-ghost)] border border-[var(--border)] border-opacity-10 p-10 rounded-sm text-base font-medium focus:border-opacity-100 outline-none resize-none custom-scrollbar shadow-inner leading-relaxed"
                />
             </div>

             <div className="flex items-center justify-between pt-6 border-t border-[var(--border)] border-opacity-5">
                <div className="flex gap-4">
                   {[
                     { id: 'neutral', label: 'Neutral', icon: Info },
                     { id: 'urgent', label: 'Urgent', icon: Zap },
                     { id: 'friendly', label: 'Friendly', icon: Sparkles }
                   ].map(t => (
                     <button 
                       key={t.id}
                       onClick={() => setToneRefiner(t.id as any)}
                       className={`flex items-center gap-2 px-6 py-3 rounded-sm text-[9px] font-black uppercase tracking-widest transition-all ${toneRefiner === t.id ? 'bg-[var(--accent-bg)] text-white shadow-lg' : 'bg-[var(--bg-ghost)] text-[var(--text-muted)]'}`}
                     >
                        <t.icon size={12} /> {t.label}
                     </button>
                   ))}
                </div>

                <button 
                  onClick={() => setIsPreflight(true)}
                  disabled={!customContent || recipients.length === 0}
                  className="px-16 py-8 bg-[var(--text-base)] text-[var(--bg-panel)] rounded-sm text-base font-black uppercase tracking-[0.3em] flex items-center justify-center gap-5 hover:translate-y-[-6px] active:translate-y-0 transition-all shadow-2xl disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  Preview & Launch <Zap size={24} />
                </button>
             </div>
          </div>
       </div>
    </div>
  );
};
