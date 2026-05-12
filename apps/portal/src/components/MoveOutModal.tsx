"use client";

import React, { useState, useEffect } from 'react';
import { 
    X, Calendar, ChevronRight, Check, Camera, Image as ImageIcon, 
    Loader2, Trash2, AlertCircle, Coins, ShieldAlert, History, Plus
} from 'lucide-react';
import { api } from '@/lib/api';

interface MoveOutModalProps {
    show: boolean;
    onClose: () => void;
    onSuccess: () => void;
    tenant: any;
    managerId: string;
}

export const MoveOutModal = ({ show, onClose, onSuccess, tenant, managerId }: MoveOutModalProps) => {
    const [step, setStep] = useState(1);
    const [isSaving, setIsSaving] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    
    const [moveOutDate, setMoveOutDate] = useState(new Date().toISOString().split('T')[0]);
    const [moveOutPhotos, setMoveOutPhotos] = useState<string[]>([]);
    const [damageCharges, setDamageCharges] = useState("0");
    const [damageNotes, setDamageNotes] = useState("");

    if (!show || !tenant) return null;

    const moveInPhotos = JSON.parse(tenant.moveInPhotos || '[]');
    const currentArrears = parseFloat(tenant.arrears || "0");
    const totalDue = currentArrears + parseFloat(damageCharges);

    const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files) return;
        setIsUploading(true);
        
        try {
            for (let i = 0; i < files.length; i++) {
                const formData = new FormData();
                formData.append('photo', files[i]);
                const res = await api.post<any>("/tenants/upload-photo", formData);
                if (res.success && res.imageUrl) {
                    setMoveOutPhotos(prev => [...prev, res.imageUrl]);
                }
            }
        } catch (error) {
            console.error("Photo upload failed:", error);
        } finally {
            setIsUploading(false);
        }
    };

    const handleFinalize = async () => {
        setIsSaving(true);
        try {
            const finalStatement = {
                departureDate: moveOutDate,
                outstandingArrears: currentArrears,
                damageCharges: parseFloat(damageCharges),
                damageNotes,
                finalBalance: totalDue,
                moveInPhotos,
                moveOutPhotos
            };

            const res = await api.post<any>(`/tenants/${tenant.id}/archive`, {
                moveOutDate,
                moveOutPhotos,
                finalStatement,
                managerId
            });

            if (res.success) {
                onSuccess();
                onClose();
            }
        } catch (error) {
            console.error("Archive failed:", error);
        } finally {
            setIsSaving(false);
        }
    };

    const steps = [
        { id: 1, name: 'Departure', icon: Calendar },
        { id: 2, name: 'Inspection', icon: Camera },
        { id: 3, name: 'Reconciliation', icon: Coins },
        { id: 4, name: 'Finalize', icon: Check },
    ];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 backdrop-blur-xl bg-[var(--bg-base)] bg-opacity-80 animate-reveal">
            <div className="bg-[var(--bg-panel)] border border-[var(--border)] border-opacity-20 w-full max-w-5xl rounded-3xl shadow-[32px_32px_0px_0px_var(--shadow-color)] overflow-hidden flex flex-col md:flex-row h-[90vh] md:h-auto max-h-[90vh]">
                
                {/* LEFT SIDE: PROGRESS */}
                <div className="w-full md:w-72 bg-[var(--text-base)] p-10 flex flex-col justify-between shrink-0">
                    <div>
                        <div className="w-12 h-12 bg-[var(--accent-bg)] rounded-2xl flex items-center justify-center mb-8 shadow-lg">
                            <ShieldAlert className="text-[var(--accent-text)]" size={24} />
                        </div>
                        <h3 className="text-2xl font-black text-[var(--bg-panel)] leading-tight mb-2 uppercase tracking-tighter">Exit Protocol</h3>
                        <p className="text-[var(--bg-panel)] opacity-40 font-mono text-[9px] uppercase font-bold tracking-widest leading-relaxed">
                            Formally vacating unit {tenant.unitId} and reconciling accounts for {tenant.name}.
                        </p>
                    </div>

                    <div className="space-y-6">
                        {steps.map((s) => {
                            const Icon = s.icon;
                            const isActive = step === s.id;
                            const isDone = step > s.id;
                            return (
                                <div key={s.id} className="flex items-center gap-4 group">
                                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-500 ${isActive ? 'bg-[var(--accent-bg)] scale-110 shadow-lg' : isDone ? 'bg-green-500' : 'bg-[var(--bg-panel)] opacity-20'}`}>
                                        <Icon size={14} className={isActive || isDone ? 'text-white' : 'text-[var(--text-base)]'} />
                                    </div>
                                    <span className={`font-mono text-[10px] uppercase font-black tracking-widest transition-all ${isActive ? 'text-[var(--accent-bg)]' : isDone ? 'text-green-500' : 'text-[var(--bg-panel)] opacity-20'}`}>
                                        {s.name}
                                    </span>
                                </div>
                            );
                        })}
                    </div>

                    <div className="pt-8 border-t border-[var(--bg-panel)] border-opacity-10">
                        <p className="text-[var(--bg-panel)] opacity-30 font-mono text-[8px] uppercase font-bold leading-relaxed tracking-widest">
                            All departure records are permanently archived for legal compliance and financial history.
                        </p>
                    </div>
                </div>

                {/* RIGHT SIDE: CONTENT */}
                <div className="flex-1 flex flex-col overflow-hidden bg-[var(--bg-panel)]">
                    <div className="p-8 border-b border-[var(--border)] border-opacity-5 flex justify-between items-center">
                        <span className="font-mono text-[10px] uppercase font-black opacity-40 tracking-[0.3em]">Protocol Phase 0{step} / 04</span>
                        <button onClick={onClose} className="p-2 hover:bg-red-500 hover:text-white transition-all rounded-lg"><X size={20} /></button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-10 custom-scrollbar">
                        {step === 1 && (
                            <div className="space-y-10 animate-reveal">
                                <div>
                                    <h4 className="text-3xl font-black uppercase tracking-tight mb-2">When are they leaving?</h4>
                                    <p className="font-mono text-[10px] text-[var(--text-muted)] uppercase font-bold tracking-widest">Set the official move-out date to calculate final prorated amounts</p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-4">
                                        <label className="font-mono text-[8px] uppercase text-[var(--text-muted)] font-black tracking-widest flex items-center gap-2">
                                            <Calendar size={10} /> Departure Date
                                        </label>
                                        <input 
                                            type="date" 
                                            value={moveOutDate} 
                                            onChange={e => setMoveOutDate(e.target.value)} 
                                            className="w-full bg-[var(--bg-input)] border border-[var(--border)] border-opacity-10 p-6 rounded-3xl font-mono text-sm font-black focus:border-opacity-100 outline-none transition-all shadow-sm" 
                                        />
                                    </div>
                                    <div className="bg-[var(--bg-ghost)] p-8 rounded-3xl border border-[var(--border)] border-opacity-5 flex flex-col justify-center">
                                        <p className="font-mono text-[8px] uppercase font-black text-[var(--text-muted)] mb-2">Current Occupancy</p>
                                        <p className="text-xl font-black tracking-tighter uppercase">{tenant.propertyName} — {tenant.unitId}</p>
                                        <p className="font-mono text-[9px] opacity-40 mt-1 uppercase font-bold">Moved in: {new Date(tenant.moveInDate).toLocaleDateString()}</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {step === 2 && (
                            <div className="space-y-10 animate-reveal">
                                <div>
                                    <h4 className="text-3xl font-black uppercase tracking-tight mb-2">Exit Inspection</h4>
                                    <p className="font-mono text-[10px] text-[var(--text-muted)] uppercase font-bold tracking-widest">Compare move-in snapshots with current unit condition</p>
                                </div>

                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                    {/* MOVE-IN PHOTOS (REFERENCE) */}
                                    <div className="space-y-4">
                                        <label className="font-mono text-[8px] uppercase text-[var(--text-muted)] font-black tracking-widest flex items-center gap-2">
                                            <History size={10} /> Move-in Reference ({moveInPhotos.length})
                                        </label>
                                        <div className="grid grid-cols-2 gap-3 h-[300px] overflow-y-auto p-4 bg-[var(--bg-ghost)] rounded-3xl border border-[var(--border)] border-opacity-5 custom-scrollbar">
                                            {moveInPhotos.length > 0 ? moveInPhotos.map((url: string, i: number) => (
                                                <div key={i} className="aspect-square rounded-2xl overflow-hidden border border-white border-opacity-10 bg-black group relative">
                                                    <img src={url} className="w-full h-full object-cover transition-all group-hover:scale-110" alt={`Move-in ${i}`} />
                                                </div>
                                            )) : (
                                                <div className="col-span-2 flex flex-col items-center justify-center opacity-20 py-10">
                                                    <ImageIcon size={32} />
                                                    <p className="font-mono text-[8px] uppercase font-black mt-2">No move-in photos</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* MOVE-OUT PHOTOS (UPLOAD) */}
                                    <div className="space-y-4">
                                        <label className="font-mono text-[8px] uppercase text-[var(--text-muted)] font-black tracking-widest flex items-center gap-2">
                                            <Camera size={10} /> Exit Snapshots ({moveOutPhotos.length})
                                        </label>
                                        <div className="grid grid-cols-2 gap-3 h-[300px] overflow-y-auto p-4 bg-[var(--bg-ghost)] rounded-3xl border border-[var(--border)] border-opacity-5 custom-scrollbar relative">
                                            {moveOutPhotos.map((url, i) => (
                                                <div key={i} className="aspect-square rounded-2xl overflow-hidden border border-white border-opacity-10 bg-black group relative">
                                                    <img src={url} className="w-full h-full object-cover" alt={`Move-out ${i}`} />
                                                    <button onClick={() => setMoveOutPhotos(prev => prev.filter(p => p !== url))} className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-all"><Trash2 size={12} /></button>
                                                </div>
                                            ))}
                                            <label className="aspect-square rounded-2xl border-2 border-dashed border-[var(--border)] border-opacity-20 flex flex-col items-center justify-center cursor-pointer hover:border-opacity-100 hover:bg-[var(--bg-panel)] transition-all gap-2 group">
                                                <input type="file" multiple className="hidden" onChange={handlePhotoUpload} accept="image/*" />
                                                {isUploading ? <Loader2 size={24} className="animate-spin text-[var(--accent-bg)]" /> : <Plus size={24} className="group-hover:scale-110 transition-all" />}
                                                <span className="font-mono text-[8px] uppercase font-black opacity-40 group-hover:opacity-100">Add Snapshots</span>
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {step === 3 && (
                            <div className="space-y-10 animate-reveal">
                                <div>
                                    <h4 className="text-3xl font-black uppercase tracking-tight mb-2">Final Reconciliation</h4>
                                    <p className="font-mono text-[10px] text-[var(--text-muted)] uppercase font-bold tracking-widest">Calculate damages and final account balance</p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                    <div className="space-y-8">
                                        <div className="space-y-4">
                                            <label className="font-mono text-[8px] uppercase text-[var(--text-muted)] font-black tracking-widest flex items-center gap-2">
                                                <ShieldAlert size={10} /> Damage Charges (KES)
                                            </label>
                                            <input 
                                                type="number" 
                                                value={damageCharges} 
                                                onChange={e => setDamageCharges(e.target.value)} 
                                                placeholder="0.00"
                                                className="w-full bg-[var(--bg-input)] border border-[var(--border)] border-opacity-10 p-6 rounded-3xl font-mono text-xl font-black focus:border-opacity-100 outline-none transition-all shadow-sm" 
                                            />
                                        </div>
                                        <div className="space-y-4">
                                            <label className="font-mono text-[8px] uppercase text-[var(--text-muted)] font-black tracking-widest flex items-center gap-2">
                                                <AlertCircle size={10} /> Damage Notes / Findings
                                            </label>
                                            <textarea 
                                                value={damageNotes} 
                                                onChange={e => setDamageNotes(e.target.value)}
                                                placeholder="Describe any issues found during inspection..."
                                                className="w-full bg-[var(--bg-input)] border border-[var(--border)] border-opacity-10 p-6 rounded-3xl font-mono text-xs font-bold focus:border-opacity-100 outline-none transition-all h-32 resize-none"
                                            />
                                        </div>
                                    </div>

                                    <div className="bg-[var(--text-base)] text-[var(--bg-panel)] p-10 rounded-[40px] shadow-[16px_16px_0px_0px_var(--accent-bg)] flex flex-col justify-between">
                                        <div>
                                            <p className="font-mono text-[10px] uppercase font-black tracking-widest mb-2 opacity-50">Final Closing Balance</p>
                                            <p className="text-5xl font-black tracking-tighter">KES {totalDue.toLocaleString()}</p>
                                        </div>
                                        
                                        <div className="mt-8 pt-8 border-t border-white border-opacity-10 space-y-4">
                                            <div className="flex justify-between font-mono text-[9px] uppercase font-bold opacity-60">
                                                <span>Outstanding Arrears</span>
                                                <span>KES {currentArrears.toLocaleString()}</span>
                                            </div>
                                            <div className="flex justify-between font-mono text-[9px] uppercase font-bold opacity-60">
                                                <span>Damage Charges</span>
                                                <span className="text-red-500">+{parseFloat(damageCharges || "0").toLocaleString()}</span>
                                            </div>
                                            <div className="flex justify-between font-mono text-[11px] uppercase font-black pt-4 border-t border-white border-opacity-10 mt-2">
                                                <span>Total to Resolve</span>
                                                <span className="text-[var(--accent-bg)]">KES {totalDue.toLocaleString()}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {step === 4 && (
                            <div className="flex flex-col items-center justify-center text-center py-20 space-y-10 animate-reveal">
                                <div className="w-24 h-24 bg-green-500 rounded-[40px] flex items-center justify-center shadow-[0_0_50px_rgba(34,197,94,0.3)]">
                                    <Check size={40} className="text-white" />
                                </div>
                                <div>
                                    <h4 className="text-4xl font-black uppercase tracking-tight mb-4">Protocol Ready</h4>
                                    <p className="max-w-md font-mono text-xs font-bold text-[var(--text-muted)] leading-relaxed uppercase tracking-wider">
                                        You are about to formally archive <span className="text-[var(--text-base)]">{tenant.name}</span>. 
                                        This will vacate unit <span className="text-[var(--text-base)]">{tenant.unitId}</span> and send the final closing statement.
                                    </p>
                                </div>

                                <div className="p-8 bg-[var(--bg-ghost)] border border-l-4 border-red-500 rounded-2xl text-left max-w-md">
                                    <p className="font-mono text-[10px] font-black uppercase text-red-500 mb-2 flex items-center gap-2">
                                        <ShieldAlert size={14} /> Final Warning
                                    </p>
                                    <p className="font-mono text-[9px] font-bold opacity-60 leading-relaxed uppercase">
                                        This action is permanent. The unit status will be updated immediately across all dashboards.
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="p-10 border-t border-[var(--border)] border-opacity-5 flex gap-4 bg-[var(--bg-ghost)]">
                        {step > 1 && (
                            <button onClick={() => setStep(prev => prev - 1)} className="px-10 py-6 border border-[var(--border)] border-opacity-10 rounded-2xl font-mono text-[10px] uppercase font-black hover:bg-[var(--text-base)] hover:text-[var(--bg-panel)] transition-all">Back</button>
                        )}
                        {step < 4 ? (
                            <button onClick={() => setStep(prev => prev + 1)} className="flex-1 bg-[var(--accent-bg)] text-[var(--accent-text)] py-6 rounded-2xl font-mono text-[10px] uppercase font-black shadow-[8px_8px_0px_0px_rgba(67,56,202,0.2)] hover:translate-y-[-2px] transition-all flex items-center justify-center gap-3">
                                Review Inspection <ChevronRight size={16} />
                            </button>
                        ) : (
                            <button onClick={handleFinalize} disabled={isSaving} className="flex-1 bg-[var(--text-base)] text-[var(--bg-panel)] py-6 rounded-2xl font-mono text-[10px] uppercase font-black shadow-[8px_8px_0px_0px_var(--shadow-color)] hover:translate-y-[-2px] active:translate-y-0 transition-all flex items-center justify-center gap-3">
                                {isSaving ? "Archiving..." : <>Finalize Departure <Check size={16} /></>}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
