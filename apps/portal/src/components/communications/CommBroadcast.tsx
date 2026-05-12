"use client";

import React, { useState } from 'react';
import { 
  Send, Mail, MessageSquare, Sparkles, Zap, 
  Filter, CheckCircle2, ChevronRight, Info, AlertTriangle, Smartphone, Monitor
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

  const smartVariables = [
    ...getVariables(),
    '{{arrears_balance}}', '{{last_payment_date}}', '{{unit_condition_summary}}', '{{due_date_countdown}}'
  ];

  // Dummy data for live preview
  const dummyData: any = {
    tenant_name: 'John Doe',
    unit_name: 'Apt 4B',
    property_name: properties.find(p => p.id === targeting.propertyId)?.name || 'Sunset Heights',
    total_amount: 'KES 25,000',
    arrears_balance: 'KES 15,000',
    due_date: '5th October',
    invoice_month: 'October',
    base_rent: 'KES 25,000',
    utility_total: 'KES 0',
    property_location: properties.find(p => p.id === targeting.propertyId)?.location || 'Westlands',
    last_payment_date: '5th September',
    due_date_countdown: '3 Days',
    unit_condition_summary: 'Good'
  };

  let previewContent = customContent;
  let previewSubject = customSubject || 'No Subject';
  Object.keys(dummyData).forEach(key => {
    const regex = new RegExp(`{{${key}}}`, 'g');
    previewContent = previewContent.replace(regex, dummyData[key]);
    previewSubject = previewSubject.replace(regex, dummyData[key]);
  });

  // Preflight calculations
  const missingEmail = (channel === 'email' || channel === 'both') ? recipients.filter(r => !r.email).length : 0;
  const missingPhone = (channel === 'sms' || channel === 'both') ? recipients.filter(r => !r.phone).length : 0;
  
  const validRecipients = recipients.filter(r => {
    if (channel === 'sms') return !!r.phone;
    if (channel === 'email') return !!r.email;
    return !!r.phone || !!r.email;
  });

  const smsSegments = Math.ceil(previewContent.length / 160) || 1;
  const estSmsCost = validRecipients.length * smsSegments * 1.5; // KES 1.5 per segment

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 animate-reveal">
       
       {/* LEFT COL: COMPOSER (col-7) */}
       <div className="xl:col-span-7 flex flex-col gap-8">
          
          {/* TARGETING PANEL */}
          <div className="bg-[var(--bg-panel)] p-8 rounded border border-[var(--border)] border-opacity-10 shadow-sm relative overflow-hidden">
             <div className="absolute top-0 right-0 p-8 opacity-[0.02] pointer-events-none">
                <Filter size={150} />
             </div>
             
             <div className="flex justify-between items-end mb-8 relative z-10">
                <div>
                   <h3 className="text-xl font-black uppercase tracking-tighter">Audience Setup</h3>
                   <p className="text-[10px] text-[var(--text-muted)] font-mono uppercase tracking-widest mt-1">Define your recipient criteria</p>
                </div>
                
                <button 
                  onClick={refreshRecipients}
                  className="px-6 py-3 bg-[var(--accent-bg)] text-white rounded-sm text-[10px] font-black uppercase tracking-[0.2em] shadow-lg hover:brightness-110 transition-all flex gap-2 items-center"
                >
                  Sync Audience <Zap size={14}/>
                </button>
             </div>
             
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
                <div className="space-y-3">
                   <label className="text-[9px] font-black uppercase text-[var(--text-muted)] block tracking-[0.2em]">Target Property</label>
                   <select 
                     value={targeting.propertyId}
                     onChange={(e) => setTargeting({ ...targeting, propertyId: e.target.value })}
                     className="w-full bg-[var(--bg-ghost)] border border-[var(--border)] border-opacity-10 p-4 rounded-sm text-sm font-black focus:border-opacity-100 outline-none transition-all shadow-inner"
                   >
                      <option value="">All Portfolio Assets</option>
                      {properties.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                   </select>
                </div>

                <div className="space-y-3">
                   <label className="text-[9px] font-black uppercase text-[var(--text-muted)] block tracking-[0.2em]">Quick Segments</label>
                   <div className="flex bg-[var(--bg-ghost)] p-1 rounded-sm border border-[var(--border)] border-opacity-10 h-14">
                      <button 
                        onClick={() => setTargeting({ ...targeting, hasArrears: false })}
                        className={`flex-1 rounded-sm text-[9px] font-black uppercase tracking-widest transition-all ${!targeting.hasArrears ? 'bg-[var(--text-base)] text-[var(--bg-panel)] shadow-md' : 'text-[var(--text-muted)] hover:text-[var(--text-base)]'}`}
                      >
                         Everyone
                      </button>
                      <button 
                        onClick={() => setTargeting({ ...targeting, hasArrears: true })}
                        className={`flex-1 rounded-sm text-[9px] font-black uppercase tracking-widest transition-all ${targeting.hasArrears ? 'bg-amber-500 text-black shadow-md' : 'text-[var(--text-muted)] hover:text-amber-500'}`}
                      >
                         In Arrears
                      </button>
                   </div>
                </div>
             </div>
          </div>

          {/* MESSAGE COMPOSER */}
          <div className="bg-[var(--bg-panel)] p-8 rounded border border-[var(--border)] border-opacity-10 shadow-sm flex flex-col flex-1">
             <div className="flex justify-between items-center mb-8 pb-6 border-b border-[var(--border)] border-opacity-5">
                <h3 className="text-xl font-black uppercase tracking-tighter">Message Studio</h3>
                <div className="flex bg-[var(--bg-ghost)] p-1 rounded-sm border border-[var(--border)] border-opacity-10">
                   {[
                     { id: 'sms', label: 'SMS', icon: MessageSquare },
                     { id: 'email', label: 'Email', icon: Mail },
                     { id: 'both', label: 'Dual', icon: Sparkles }
                   ].map(c => (
                     <button 
                       key={c.id}
                       onClick={() => setChannel(c.id as any)}
                       className={`px-4 py-2 flex items-center gap-2 rounded-sm transition-all ${channel === c.id ? 'bg-[var(--text-base)] text-[var(--bg-panel)] shadow-lg scale-105' : 'text-[var(--text-muted)] hover:text-[var(--text-base)]'}`}
                     >
                        <c.icon size={12} />
                        <span className="text-[9px] font-black uppercase tracking-widest">{c.label}</span>
                     </button>
                   ))}
                </div>
             </div>

             <div className="space-y-6 flex-1 flex flex-col">
                {(channel === 'email' || channel === 'both') && (
                   <div className="space-y-3">
                      <label className="text-[9px] font-black uppercase text-[var(--text-muted)] block tracking-[0.2em]">Subject Line</label>
                      <input 
                       type="text"
                       value={customSubject}
                       onChange={(e) => setCustomSubject(e.target.value)}
                       placeholder="e.g. Action Required: Your Monthly Billing"
                       className="w-full bg-[var(--bg-ghost)] border border-[var(--border)] border-opacity-10 p-5 rounded-sm text-lg font-black outline-none focus:border-opacity-100 transition-all shadow-inner"
                     />
                   </div>
                )}

                <div className="flex-1 flex flex-col min-h-[300px]">
                   <div className="flex justify-between items-end mb-3">
                     <label className="text-[9px] font-black uppercase text-[var(--text-muted)] block tracking-[0.2em]">Payload</label>
                     <div className="flex gap-2">
                        {['{{tenant_name}}', '{{total_amount}}', '{{due_date}}'].map(v => (
                          <button 
                            key={v}
                            onClick={() => setCustomContent(customContent + v)}
                            className="px-3 py-1.5 bg-black/10 border border-[var(--border)] border-opacity-5 rounded text-[8px] font-mono hover:bg-[var(--text-base)] hover:text-[var(--bg-panel)] transition-all"
                          >
                            {v}
                          </button>
                        ))}
                     </div>
                   </div>
                   <textarea 
                     value={customContent}
                     onChange={(e) => setCustomContent(e.target.value)}
                     placeholder="Type your message here..."
                     className="flex-1 w-full bg-[var(--bg-ghost)] border border-[var(--border)] border-opacity-10 p-6 rounded-sm text-sm font-medium focus:border-opacity-100 outline-none resize-none custom-scrollbar shadow-inner leading-relaxed"
                   />

                   <div className="mt-4 pt-4 border-t border-[var(--border)] border-opacity-5 flex gap-6">
                      <label className="flex items-center gap-2 cursor-pointer group">
                        <input 
                          type="checkbox"
                          checked={customContent.includes('{{business_name}}')}
                          onChange={(e) => {
                             if (e.target.checked) setCustomContent(customContent + '\n\n{{business_name}}');
                             else setCustomContent(customContent.replace('\n\n{{business_name}}', '').replace('{{business_name}}', ''));
                          }}
                          className="w-4 h-4 rounded-sm border-[var(--border)] accent-[var(--accent-bg)]"
                        />
                        <span className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] group-hover:text-[var(--text-base)] transition-colors">Append Business Identity</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer group">
                        <input 
                          type="checkbox"
                          checked={customContent.includes('{{due_date}}') || customContent.includes('{{penalty_notice}}')}
                          onChange={(e) => {
                             if (e.target.checked) setCustomContent(customContent + '\n\nDue: {{due_date}} | {{penalty_notice}}');
                             else setCustomContent(customContent.replace('\n\nDue: {{due_date}} | {{penalty_notice}}', '').replace('{{due_date}}', '').replace('{{penalty_notice}}', ''));
                          }}
                          className="w-4 h-4 rounded-sm border-[var(--border)] accent-[var(--accent-bg)]"
                        />
                        <span className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] group-hover:text-[var(--text-base)] transition-colors">Append Property Policy</span>
                      </label>
                   </div>
                   {(customContent.includes('{{business_name}}') || customContent.includes('{{due_date}}')) && channel !== 'email' && (
                      <p className="mt-3 text-[9px] font-black uppercase tracking-widest text-amber-500 flex items-center gap-1">
                         <AlertTriangle size={10} /> Appending extra data may increase SMS segment count.
                      </p>
                   )}
                </div>
             </div>
          </div>

       </div>

       {/* RIGHT COL: PREVIEW & PREFLIGHT (col-5) */}
       <div className="xl:col-span-5 flex flex-col gap-8">
          
          {/* PREFLIGHT CALCULATOR */}
          <div className="bg-[var(--bg-panel)] p-8 rounded border border-[var(--border)] border-opacity-10 shadow-sm space-y-6">
             <h3 className="text-xl font-black uppercase tracking-tighter flex items-center gap-2">
                <Sparkles size={18} className="text-[var(--accent-bg)]" /> Preflight Checks
             </h3>
             
             <div className="grid grid-cols-2 gap-4">
                <div className="bg-black/10 p-4 rounded border border-[var(--border)] border-opacity-5">
                   <p className="text-[9px] font-mono uppercase tracking-widest text-[var(--text-muted)] mb-1">Target Audience</p>
                   <p className="text-3xl font-black">{recipients.length}</p>
                </div>
                <div className="bg-black/10 p-4 rounded border border-[var(--border)] border-opacity-5">
                   <p className="text-[9px] font-mono uppercase tracking-widest text-[var(--text-muted)] mb-1">Valid To Send</p>
                   <p className="text-3xl font-black text-green-500">{validRecipients.length}</p>
                </div>
             </div>

             <div className="space-y-3 text-[10px] font-mono uppercase font-black tracking-widest">
                {(channel === 'email' || channel === 'both') && (
                   <div className="flex justify-between items-center p-3 rounded bg-black/5">
                      <span className="flex items-center gap-2"><Mail size={12}/> Missing Emails</span>
                      <span className={missingEmail > 0 ? 'text-amber-500' : 'text-green-500'}>{missingEmail}</span>
                   </div>
                )}
                {(channel === 'sms' || channel === 'both') && (
                   <div className="flex justify-between items-center p-3 rounded bg-black/5">
                      <span className="flex items-center gap-2"><MessageSquare size={12}/> Missing Phones</span>
                      <span className={missingPhone > 0 ? 'text-amber-500' : 'text-green-500'}>{missingPhone}</span>
                   </div>
                )}
             </div>

             {(channel === 'sms' || channel === 'both') && (
               <div className="pt-4 border-t border-[var(--border)] border-opacity-5 space-y-2">
                  <div className="flex justify-between text-[10px] font-mono uppercase font-black text-[var(--text-muted)]">
                     <span>Est. Segments</span>
                     <span>{smsSegments} per msg</span>
                  </div>
                  <div className="flex justify-between text-[10px] font-mono uppercase font-black text-[var(--text-muted)]">
                     <span>Est. SMS Cost</span>
                     <span className="text-[var(--text-base)]">KES {estSmsCost.toFixed(2)}</span>
                  </div>
               </div>
             )}

             <button 
               onClick={() => setIsPreflight(true)}
               disabled={!customContent || validRecipients.length === 0}
               className="w-full py-5 bg-[var(--text-base)] text-[var(--bg-panel)] rounded-sm text-sm font-black uppercase tracking-[0.2em] shadow-xl hover:translate-y-[-2px] disabled:opacity-30 disabled:cursor-not-allowed transition-all flex justify-center items-center gap-3"
             >
               Launch Sequence <Send size={16} />
             </button>
          </div>

          {/* LIVE DEVICE PREVIEW */}
          <div className="bg-[var(--bg-panel)] p-8 rounded border border-[var(--border)] border-opacity-10 shadow-sm flex-1 flex flex-col">
             <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-black uppercase tracking-tighter flex items-center gap-2">
                   {channel === 'sms' ? <Smartphone size={18}/> : <Monitor size={18}/>} 
                   Live Preview
                </h3>
             </div>

             <div className="flex-1 bg-black/10 rounded border border-[var(--border)] border-opacity-5 p-6 flex flex-col items-center justify-center relative overflow-hidden">
                
                {/* SMS MOCKUP */}
                {(channel === 'sms' || channel === 'both') && (
                   <div className="w-[280px] min-h-[400px] bg-white rounded-[40px] shadow-2xl p-4 border-[8px] border-zinc-800 relative transform transition-all hover:scale-105">
                      <div className="w-24 h-6 bg-zinc-800 absolute top-0 left-1/2 -translate-x-1/2 rounded-b-xl" />
                      <div className="mt-8 bg-gray-100 rounded-2xl p-4 text-black text-sm relative">
                         {previewContent || "Type a message..."}
                         <div className="absolute -bottom-2 -left-2 w-4 h-4 bg-gray-100 rounded-full" style={{ clipPath: 'circle(50% at 100% 0)' }} />
                      </div>
                      <p className="text-[8px] text-gray-400 text-center mt-4 uppercase tracking-widest">Mockup uses demo data</p>
                   </div>
                )}

                {/* EMAIL MOCKUP */}
                {channel === 'email' && (
                   <div className="w-full max-w-sm bg-white rounded shadow-xl border border-gray-200 overflow-hidden transform transition-all hover:scale-105 text-black">
                      <div className="bg-gray-100 border-b border-gray-200 p-3 flex gap-2">
                         <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
                         <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                         <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
                      </div>
                      <div className="p-5 border-b border-gray-100">
                         <p className="text-[10px] text-gray-500 font-medium">Subject</p>
                         <p className="font-bold text-sm truncate">{previewSubject}</p>
                      </div>
                      <div className="p-5 text-sm whitespace-pre-wrap">
                         {previewContent || "Email body preview will appear here..."}
                      </div>
                   </div>
                )}
             </div>
          </div>

       </div>
    </div>
  );
};
