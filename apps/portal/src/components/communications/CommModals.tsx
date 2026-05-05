"use client";

import React from 'react';
import { 
  X, Sparkles, Zap, Power, Mail, MessageSquare, 
  Trash2, Plus, Settings2, Save, Info, Send
} from 'lucide-react';

interface CommModalsProps {
  editingFlow: any;
  setEditingFlow: (f: any) => void;
  templates: any[];
  triggerOptions: any[];
  onSaveFlow: (e: React.FormEvent) => void;
  isPreflight: boolean;
  setIsPreflight: (v: boolean) => void;
  recipients: any[];
  selectedRecipientIds: string[];
  setSelectedRecipientIds: (ids: string[]) => void;
  customSubject: string;
  customContent: string;
  channel: string;
  isSending: boolean;
  handleLaunch: () => void;
  editingTemplate: any;
  setEditingTemplate: (t: any) => void;
  onSaveTemplate: (e: React.FormEvent) => void;
}

export const CommModals = ({
  editingFlow, setEditingFlow, templates, triggerOptions, onSaveFlow,
  isPreflight, setIsPreflight, recipients, selectedRecipientIds, setSelectedRecipientIds,
  customSubject, customContent, channel, isSending, handleLaunch,
  editingTemplate, setEditingTemplate, onSaveTemplate
}: CommModalsProps) => {

  return (
    <>
      {/* FLOW SEQUENCE EDITOR */}
      {editingFlow && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 backdrop-blur-2xl bg-[var(--bg-base)] bg-opacity-80 animate-reveal">
           <div className="bg-[var(--bg-panel)] border border-[var(--border)] border-opacity-20 w-full max-w-2xl rounded shadow-2xl p-16 flex flex-col max-h-[90vh] overflow-hidden">
              <div className="flex justify-between items-center mb-12 shrink-0">
                <div>
                   <h3 className="text-4xl font-black tracking-tighter">{editingFlow.id ? 'Refine Sequence' : 'Compose Sequence'}</h3>
                   <p className="text-[11px] font-black uppercase tracking-[0.3em] text-[var(--text-muted)] mt-2">Designing autonomous message logic</p>
                </div>
                <button onClick={() => setEditingFlow(null)} className="p-4 hover:bg-[var(--bg-ghost)] rounded transition-all"><X size={28} /></button>
              </div>

              <form onSubmit={onSaveFlow} className="flex-1 flex flex-col overflow-hidden">
                 <div className="flex-1 overflow-y-auto custom-scrollbar pr-6 space-y-12">
                    <div className="space-y-4">
                       <label className="text-[10px] font-black uppercase text-[var(--text-muted)] block tracking-[0.2em]">Sequence Name</label>
                       <input 
                        required type="text" value={editingFlow.name}
                        onChange={(e) => setEditingFlow({ ...editingFlow, name: e.target.value })}
                        className="w-full bg-[var(--bg-ghost)] border border-[var(--border)] border-opacity-10 p-6 rounded-sm text-xl font-black outline-none focus:border-opacity-100 transition-all shadow-inner"
                        placeholder="e.g. Welcome Chain (Lavington)"
                       />
                    </div>

                    <div className="grid grid-cols-2 gap-8">
                       <div className="space-y-4">
                          <label className="text-[10px] font-black uppercase text-[var(--text-muted)] block tracking-[0.2em]">Operational Trigger</label>
                          <select 
                             value={editingFlow.trigger}
                             onChange={(e) => setEditingFlow({ ...editingFlow, trigger: e.target.value })}
                             className="w-full bg-[var(--bg-ghost)] border border-[var(--border)] border-opacity-10 p-5 rounded-sm text-sm font-black focus:border-opacity-100 outline-none transition-all shadow-inner"
                          >
                             {triggerOptions.map(o => <option key={o.id} value={o.id}>{o.label}</option>)}
                          </select>
                       </div>
                    </div>

                    <div className="space-y-8 pt-8 border-t border-[var(--border)] border-opacity-5">
                       <div className="flex justify-between items-center">
                          <h4 className="text-sm font-black uppercase tracking-widest">Automation Steps</h4>
                          <button 
                            type="button" 
                            onClick={() => setEditingFlow({ ...editingFlow, steps: [...(editingFlow.steps || []), { templateId: '', channel: 'both', offsetDays: 0 }] })}
                            className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[var(--accent-bg)] hover:underline"
                          >
                             <Plus size={14} /> Add Sequence Step
                          </button>
                       </div>
                       
                       <div className="space-y-6">
                          {editingFlow.steps?.map((step: any, idx: number) => (
                             <div key={idx} className="p-8 bg-[var(--bg-ghost)] rounded border border-[var(--border)] border-opacity-5 relative group">
                                <button 
                                   type="button" 
                                   onClick={() => setEditingFlow({ ...editingFlow, steps: editingFlow.steps.filter((_: any, i: number) => i !== idx) })}
                                   className="absolute top-6 right-6 p-2 text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                                >
                                   <Trash2 size={16} />
                                </button>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                   <div className="space-y-3">
                                      <label className="text-[9px] font-black uppercase text-[var(--text-muted)] tracking-widest">Message Template</label>
                                      <select 
                                         value={step.templateId}
                                         onChange={(e) => {
                                            const next = [...editingFlow.steps];
                                            next[idx].templateId = e.target.value;
                                            setEditingFlow({ ...editingFlow, steps: next });
                                         }}
                                         className="w-full bg-[var(--bg-panel)] border border-[var(--border)] border-opacity-10 p-4 rounded-sm text-xs font-black outline-none"
                                      >
                                         <option value="">Select Template</option>
                                         {templates.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                                      </select>
                                   </div>
                                   <div className="space-y-3">
                                      <label className="text-[9px] font-black uppercase text-[var(--text-muted)] tracking-widest">Time Offset (Days)</label>
                                      <input 
                                         type="number" value={step.offsetDays}
                                         onChange={(e) => {
                                            const next = [...editingFlow.steps];
                                            next[idx].offsetDays = parseInt(e.target.value);
                                            setEditingFlow({ ...editingFlow, steps: next });
                                         }}
                                         className="w-full bg-[var(--bg-panel)] border border-[var(--border)] border-opacity-10 p-4 rounded-sm text-xs font-black outline-none"
                                      />
                                   </div>
                                </div>
                             </div>
                          ))}
                       </div>
                    </div>
                 </div>

                 <button 
                  type="submit"
                  className="w-full bg-[var(--text-base)] text-[var(--bg-panel)] py-8 rounded-sm text-base font-black uppercase tracking-[0.3em] shadow-2xl hover:translate-y-[-4px] transition-all flex items-center justify-center gap-4 mt-8"
                 >
                   Activate Intelligence <Power size={20} />
                 </button>
              </form>
           </div>
        </div>
      )}

      {/* PRE-FLIGHT (Existing) */}
      {isPreflight && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 backdrop-blur-3xl bg-[var(--bg-base)] bg-opacity-90 animate-reveal">
          <div className="bg-[var(--bg-panel)] border border-[var(--border)] border-opacity-20 w-full max-w-6xl rounded shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-16 border-b border-[var(--border)] border-opacity-10 flex justify-between items-center shrink-0">
               <div>
                  <h3 className="text-5xl font-black tracking-tighter">Dispatch Manifest</h3>
                  <p className="text-sm text-[var(--text-muted)] font-medium mt-2">Audit and confirm transmission parameters</p>
               </div>
               <button onClick={() => setIsPreflight(false)} className="p-4 hover:bg-[var(--bg-ghost)] rounded transition-all"><X size={32} /></button>
            </div>

            <div className="flex-1 overflow-y-auto p-16 custom-scrollbar">
               <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
                  <div className="lg:col-span-7 space-y-12">
                     <p className="text-[10px] font-black uppercase text-[var(--text-muted)] tracking-[0.3em] flex items-center gap-3">
                       <Sparkles size={16} className="text-amber-500" /> Synthesized Payload Preview
                     </p>
                     
                     <div className="bg-[var(--bg-panel)] p-12 rounded shadow-2xl border border-[var(--border)] border-opacity-10 relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 to-indigo-600" />
                        <div className="flex justify-between items-center mb-12">
                           <div className="flex gap-3">
                              <div className="w-10 h-10 rounded bg-[var(--bg-ghost)] flex items-center justify-center font-bold text-xs">DP</div>
                              <div>
                                 <p className="text-xs font-black">Dane Properties</p>
                                 <p className="text-[9px] font-medium opacity-50">Enterprise Messaging Hub</p>
                              </div>
                           </div>
                           <div className="text-right">
                              <p className="text-[9px] font-black uppercase opacity-40">Gateway Protocol</p>
                              <p className="text-[10px] font-bold text-[var(--accent-bg)]">{channel.toUpperCase()} Dispatch</p>
                           </div>
                        </div>

                        <div className="space-y-8">
                           {customSubject && (
                              <div>
                                 <p className="text-[9px] font-black uppercase text-[var(--text-muted)] mb-2 tracking-widest">Subject</p>
                                 <p className="text-2xl font-black tracking-tight">{customSubject}</p>
                              </div>
                           )}
                           <div>
                              <p className="text-[9px] font-black uppercase text-[var(--text-muted)] mb-2 tracking-widest">Message Content</p>
                              <div className="bg-[var(--bg-ghost)]/30 p-10 rounded border border-[var(--border)] border-opacity-5 font-medium leading-relaxed whitespace-pre-wrap text-lg">
                                 {customContent}
                              </div>
                           </div>
                        </div>

                        <div className="mt-12 pt-8 border-t border-[var(--border)] border-opacity-5 flex justify-between items-center">
                           <p className="text-[10px] text-[var(--text-muted)] italic leading-relaxed max-w-[250px]">Variable fields will be injected with live tenant data during transmission.</p>
                           <div className="flex -space-x-4">
                              {[1,2,3,4].map(i => <div key={i} className="w-10 h-10 rounded border-2 border-[var(--bg-panel)] bg-[var(--bg-ghost)] flex items-center justify-center font-black text-[10px]">T{i}</div>)}
                           </div>
                        </div>
                     </div>
                  </div>

                  <div className="lg:col-span-5 space-y-12">
                     <div className="bg-[var(--bg-ghost)] p-12 rounded border border-[var(--border)] border-opacity-5 space-y-10">
                        <h4 className="text-xl font-black uppercase tracking-widest">Recipient Density</h4>
                        
                        <div className="space-y-6">
                           <div className="flex justify-between items-center">
                              <span className="text-sm font-black text-[var(--text-muted)] uppercase">Total Selection</span>
                              <span className="text-3xl font-black">{selectedRecipientIds.length}</span>
                           </div>
                           <div className="flex justify-between items-center">
                              <span className="text-sm font-black text-[var(--text-muted)] uppercase">Audience Weight</span>
                              <span className="text-xl font-black">{((selectedRecipientIds.length / (recipients.length || 1)) * 100).toFixed(0)}%</span>
                           </div>
                        </div>

                        <div className="pt-10 border-t border-[var(--border)] border-opacity-5">
                           <p className="text-[10px] font-black uppercase text-[var(--text-muted)] mb-6 tracking-widest">Manual Exclusions</p>
                           <div className="flex flex-wrap gap-3">
                              {recipients.slice(0, 15).map(r => (
                                 <button 
                                   key={r.id}
                                   onClick={() => {
                                      if (selectedRecipientIds.includes(r.id)) setSelectedRecipientIds(selectedRecipientIds.filter(id => id !== r.id));
                                      else setSelectedRecipientIds([...selectedRecipientIds, r.id]);
                                   }}
                                   className={`px-4 py-2 rounded-sm text-[8px] font-black uppercase tracking-widest border transition-all ${selectedRecipientIds.includes(r.id) ? 'bg-[var(--text-base)] text-[var(--bg-panel)] border-transparent shadow-lg' : 'bg-transparent text-[var(--text-muted)] border-[var(--border)] border-opacity-10 opacity-30'}`}
                                 >
                                    {r.name.split(' ')[0]}
                                 </button>
                              ))}
                           </div>
                        </div>
                     </div>
                  </div>
               </div>
            </div>

            <div className="p-16 border-t border-[var(--border)] border-opacity-10 bg-[var(--bg-ghost)]/50 flex justify-center shrink-0">
               <button 
                onClick={handleLaunch}
                disabled={isSending || selectedRecipientIds.length === 0}
                className="bg-[var(--text-base)] text-[var(--bg-panel)] px-20 py-8 rounded-sm text-base font-black uppercase tracking-[0.4em] flex items-center justify-center gap-5 hover:translate-y-[-8px] active:translate-y-0 transition-all shadow-2xl disabled:opacity-30 disabled:cursor-not-allowed group"
               >
                 {isSending ? 'Dispatching...' : 'Initiate Broadcast'}
                 <Send size={24} className="group-hover:translate-x-2 transition-transform" />
               </button>
            </div>
          </div>
        </div>
      )}

      {/* TEMPLATE EDITOR (Existing) */}
      {editingTemplate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 backdrop-blur-2xl bg-[var(--bg-base)] bg-opacity-80 animate-reveal">
           <div className="bg-[var(--bg-panel)] border border-[var(--border)] border-opacity-20 w-full max-w-3xl rounded shadow-2xl p-16">
              <div className="flex justify-between items-center mb-12">
                <h3 className="text-4xl font-black tracking-tighter">{editingTemplate.id ? 'Refine Template' : 'Studio Creation'}</h3>
                <button onClick={() => setEditingTemplate(null)} className="p-4 hover:bg-[var(--bg-ghost)] rounded transition-all"><X size={28} /></button>
              </div>

              <form onSubmit={onSaveTemplate} className="space-y-10">
                 <div className="grid grid-cols-2 gap-8">
                    <div className="space-y-3">
                       <label className="text-[10px] font-black uppercase text-[var(--text-muted)] mb-1 block tracking-[0.2em]">Blueprint Name</label>
                       <input 
                        required type="text"
                        value={editingTemplate.name}
                        onChange={(e) => setEditingTemplate({ ...editingTemplate, name: e.target.value })}
                        placeholder="e.g. Utility Reminder"
                        className="w-full bg-[var(--bg-ghost)] border border-[var(--border)] border-opacity-10 p-5 rounded-sm text-base font-black focus:border-opacity-100 outline-none transition-all shadow-inner"
                       />
                    </div>
                    <div className="space-y-3">
                       <label className="text-[10px] font-black uppercase text-[var(--text-muted)] mb-1 block tracking-[0.2em]">Primary Channel</label>
                       <select 
                        value={editingTemplate.channel}
                        onChange={(e) => setEditingTemplate({ ...editingTemplate, channel: e.target.value })}
                        className="w-full bg-[var(--bg-ghost)] border border-[var(--border)] border-opacity-10 p-5 rounded-sm text-sm font-black focus:border-opacity-100 outline-none transition-all shadow-inner"
                       >
                          <option value="email">Email Core</option>
                          <option value="sms">SMS Relay</option>
                       </select>
                    </div>
                 </div>

                 <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase text-[var(--text-muted)] mb-1 block tracking-[0.2em]">Subject Blueprint</label>
                    <input 
                      type="text"
                      value={editingTemplate.subject || ''}
                      onChange={(e) => setEditingTemplate({ ...editingTemplate, subject: e.target.value })}
                      placeholder="e.g. Your Invoice for {{invoice_month}}"
                      className="w-full bg-[var(--bg-ghost)] border border-[var(--border)] border-opacity-10 p-5 rounded-sm text-base font-black focus:border-opacity-100 outline-none transition-all shadow-inner"
                    />
                 </div>

                 <div>
                    <label className="text-[10px] font-black uppercase text-[var(--text-muted)] mb-3 block tracking-[0.2em]">Message Body</label>
                    <textarea 
                      required rows={10}
                      value={editingTemplate.contentText}
                      onChange={(e) => setEditingTemplate({ ...editingTemplate, contentText: e.target.value })}
                      placeholder="Start drafting the perfect automated message..."
                      className="w-full bg-[var(--bg-ghost)] border border-[var(--border)] border-opacity-10 p-8 rounded-sm text-base font-medium outline-none resize-none shadow-inner leading-relaxed"
                    />
                 </div>

                 <button 
                  type="submit"
                  className="w-full bg-[var(--accent-bg)] text-white py-8 rounded-sm text-base font-black uppercase tracking-[0.3em] shadow-2xl hover:translate-y-[-4px] transition-all flex items-center justify-center gap-4"
                 >
                   Save to Vault <Save size={20} />
                 </button>
              </form>
           </div>
        </div>
      )}
    </>
  );
};
