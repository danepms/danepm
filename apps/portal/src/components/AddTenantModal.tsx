"use client";

import React, { useState, useEffect } from 'react';
import { X, Plus, User, Phone, Mail, IdCard, Calendar, FileText, ChevronRight, Check, Coins, Building2, Users, Camera, Image as ImageIcon, Loader2, Trash2, AlertCircle } from 'lucide-react';
import { api } from '@/lib/api';
import { parseConfig } from '@/lib/utils';

interface AddTenantModalProps {
    show: boolean;
    onClose: () => void;
    onSuccess: () => void;
    managerId: string;
    properties: any[];
    initialUnitId?: string;
}

export const AddTenantModal = ({ show, onClose, onSuccess, managerId, properties, initialUnitId }: AddTenantModalProps) => {
    const [step, setStep] = useState(1);
    const [isSaving, setIsSaving] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        email: '',
        idNumber: '',
        idType: 'National ID',
        propertyId: properties[0]?.id || '',
        unitId: initialUnitId || '',
        moveInDate: new Date().toISOString().split('T')[0],
        notes: '',
        kin: [{ name: '', phone: '', relationship: '' }],
        moveInPhotos: [] as string[],
        deposit: "0",
        otherMoveInFees: "0",
        totalCharges: "0",
        selectedRecurringIds: [] as string[],
        selectedTypeId: ''
    });

    useEffect(() => {
        if (initialUnitId && show) {
            setFormData(prev => ({ ...prev, unitId: initialUnitId }));
        }
    }, [initialUnitId, show]);

    const [isUploading, setIsUploading] = useState(false);
    const [uploadingQueue, setUploadingQueue] = useState<{id: string, name: string, progress: number}[]>([]);

    const [availableUnits, setAvailableUnits] = useState<any[]>([]);
    const [calculatedCharges, setCalculatedCharges] = useState("0");

    // Update units when property changes
    useEffect(() => {
        let currentPropId = formData.propertyId;
        if (properties.length === 1 && !currentPropId) {
            currentPropId = properties[0].id;
            setFormData(prev => ({ ...prev, propertyId: currentPropId }));
        }

        if (currentPropId) {
            const prop = properties.find(p => p.id === currentPropId);
            if (prop && prop.config) {
                const config = parseConfig(prop.config);
                const vacantUnits = config.units?.filter((u: any) => u.status === 'vacant') || [];
                setAvailableUnits(vacantUnits);
                
                // Pre-select ALL recurring fees by default
                const recurringIds = (config.recurring || []).map((r: any) => r.id);
                setFormData(prev => ({ 
                    ...prev, 
                    selectedRecurringIds: recurringIds,
                    // Also reset unit if it's not in the new list
                    unitId: vacantUnits.find((u: any) => u.name === prev.unitId) ? prev.unitId : (initialUnitId || '')
                }));
            }
        } else {
            setAvailableUnits([]);
            setFormData(prev => ({ ...prev, unitId: '' }));
        }
    }, [formData.propertyId, properties, initialUnitId]);

    // Calculate charges when unit or fees change
    useEffect(() => {
        if (formData.propertyId && formData.unitId) {
            const prop = properties.find(p => p.id === formData.propertyId);
            if (prop && prop.config) {
                const config = parseConfig(prop.config);
                const unit = config.units?.find((u: any) => u.name === formData.unitId);
                if (unit) {
                    // 1. Get Base Rent (Source of Truth)
                    let rent = parseFloat(unit.rent?.toString() || "0") || 0;
                    
                    // Fallback to category price matrix if unit rent is missing
                    if (rent === 0) {
                        const typeId = unit.typeId || unit.type || formData.selectedTypeId;
                        const baseRentVal = config.rents?.[typeId] || 0;
                        rent = Array.isArray(baseRentVal) ? (parseFloat(baseRentVal[0]) || 0) : 
                               (typeof baseRentVal === 'object' ? (parseFloat(baseRentVal.min) || 0) : (parseFloat(baseRentVal) || 0));
                    }
                    
                    // 2. Calculate Move-in Fees (Step 3 Rules)
                    const moveInFeesSum = (config.oneTime || []).reduce((acc: number, item: any) => {
                        if (!item.mode || item.mode === 'rent_multiple') {
                            const multiple = parseFloat(item.multiple?.toString() || "1") || 1;
                            return acc + (rent * multiple);
                        }
                        return acc + (parseFloat(item.amount?.toString() || "0") || 0);
                    }, 0);

                    // 3. Get Recurring Fees (Step 2 Rules)
                    const recurringSum = (config.recurring || [])
                        .filter((r: any) => formData.selectedRecurringIds.includes(r.id))
                        .reduce((acc: number, item: any) => acc + (parseFloat(item.amount?.toString() || "0") || 0), 0);
                    
                    const total = rent + moveInFeesSum + recurringSum;
                    setCalculatedCharges(total.toString());
                    setFormData(prev => ({ ...prev, totalCharges: total.toString() }));
                }
            }
        } else {
            setCalculatedCharges("0");
            setFormData(prev => ({ ...prev, totalCharges: "0" }));
        }
    }, [formData.unitId, formData.propertyId, formData.selectedRecurringIds, properties]);

    const handleAddKin = () => {
        if (formData.kin.length < 3) {
            setFormData({ ...formData, kin: [...formData.kin, { name: '', phone: '', relationship: '' }] });
        }
    };

    const handleRemoveKin = (index: number) => {
        setFormData({ ...formData, kin: formData.kin.filter((_, i) => i !== index) });
    };

    const updateKin = (index: number, field: string, value: string) => {
        const next = [...formData.kin];
        (next[index] as any)[field] = value;
        setFormData({ ...formData, kin: next });
    };

    const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        // Limit to 6 total
        const remainingSlots = 6 - formData.moveInPhotos.length;
        const filesToUpload = Array.from(files).slice(0, remainingSlots);

        if (filesToUpload.length === 0) return;

        setIsUploading(true);
        
        // Add to queue
        const newQueueItems = filesToUpload.map(f => ({
            id: Math.random().toString(36).substring(7),
            name: f.name,
            progress: 0
        }));
        setUploadingQueue(prev => [...prev, ...newQueueItems]);

        for (let i = 0; i < filesToUpload.length; i++) {
            const file = filesToUpload[i];
            const queueId = newQueueItems[i].id;

            // Simulate progress
            const progressInterval = setInterval(() => {
                setUploadingQueue(prev => prev.map(item => 
                    item.id === queueId ? { ...item, progress: Math.min(item.progress + 15, 90) } : item
                ));
            }, 200);

            try {
                const formDataUpload = new FormData();
                formDataUpload.append('photo', file);
                const res = await api.post<any>("/tenants/upload-photo", formDataUpload);
                
                clearInterval(progressInterval);

                if (res.success && res.imageUrl) {
                    setUploadingQueue(prev => prev.filter(item => item.id !== queueId));
                    setFormData(prev => ({ ...prev, moveInPhotos: [...prev.moveInPhotos, res.imageUrl!] }));
                } else {
                    // Mark error in queue? For now just remove
                    setUploadingQueue(prev => prev.filter(item => item.id !== queueId));
                }
            } catch (error) {
                clearInterval(progressInterval);
                setUploadingQueue(prev => prev.filter(item => item.id !== queueId));
            }
        }

        setIsUploading(false);
    };

    const handleRemovePhoto = (url: string) => {
        setFormData({ ...formData, moveInPhotos: formData.moveInPhotos.filter(p => p !== url) });
    };

    const handleSubmit = async () => {
        // CRITICAL: Prevent saving if we aren't at the end
        if (step < 4) {
            setStep(prev => prev + 1);
            return;
        }

        setIsSaving(true);
        
        try {
            const validKin = formData.kin.filter(k => k.name && k.phone);
            
            const submissionData = {
                ...formData,
                totalCharges: calculatedCharges,
                nextOfKin: JSON.stringify(validKin),
                moveInPhotos: JSON.stringify(formData.moveInPhotos),
                managerId
            };

            const res = await api.post<any>("/tenants", submissionData);

            if (res.success) {
                onSuccess();
                onClose();
            }
        } catch (error) {
            console.error("Submission Error:", error);
        } finally {
            setIsSaving(false);
        }
    };

    if (!show) return null;

    const property = properties[0];
    let isFull = false;
    if (property && property.config) {
        const config = parseConfig(property.config);
        const vacantUnits = config.units?.filter((u: any) => u.status === 'vacant') || [];
        isFull = vacantUnits.length === 0;
    }

    if (isFull) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-6 backdrop-blur-xl bg-[var(--bg-base)] bg-opacity-80 animate-reveal">
                <div className="bg-[var(--bg-panel)] border border-[var(--border)] border-opacity-20 w-full max-w-lg p-10 rounded-3xl shadow-[32px_32px_0px_0px_var(--shadow-color)] text-center">
                    <div className="w-16 h-16 bg-red-500 bg-opacity-10 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
                        <AlertCircle size={32} />
                    </div>
                    <h3 className="text-2xl font-black uppercase mb-4">Property is Full</h3>
                    <p className="font-mono text-xs text-[var(--text-muted)] uppercase mb-8">You cannot add a new tenant since this property currently has no vacant units available.</p>
                    <button onClick={onClose} className="w-full bg-[var(--text-base)] text-[var(--bg-panel)] py-4 rounded-xl font-mono text-[10px] uppercase font-black hover:translate-y-[-2px] transition-all shadow-md">Close & Go Back</button>
                </div>
            </div>
        );
    }

    const relationshipSuggestions = ["Spouse", "Parent", "Sibling", "Friend", "Guardian"];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 backdrop-blur-xl bg-[var(--bg-base)] bg-opacity-80 animate-reveal">
            <div className="bg-[var(--bg-panel)] border border-[var(--border)] border-opacity-20 w-full max-w-4xl rounded-3xl shadow-[32px_32px_0px_0px_var(--shadow-color)] overflow-hidden flex flex-col md:flex-row h-[90vh] md:h-auto max-h-[90vh]">
                
                {/* LEFT SIDE: PROGRESS & THEME */}
                <div className="w-full md:w-72 bg-[var(--text-base)] p-10 flex flex-col justify-between shrink-0">
                    <div>
                        <div className="w-12 h-12 bg-[var(--accent-bg)] text-[var(--accent-text)] flex items-center justify-center mb-10 rounded-xl">
                            <User size={24} />
                        </div>
                        <h3 className="text-3xl font-black uppercase tracking-tighter text-[var(--bg-panel)] leading-none mb-4">New Tenant</h3>
                        <p className="font-mono text-[10px] text-[var(--bg-panel)] opacity-40 uppercase font-black tracking-widest leading-relaxed">Adding a new tenant to your property</p>
                    </div>

                    <div className="hidden md:block space-y-6">
                        {[
                            { step: 1, label: "Details", icon: <IdCard size={14} /> },
                            { step: 2, label: "Unit", icon: <Building2 size={14} /> },
                            { step: 3, label: "Contact", icon: <Users size={14} /> },
                            { step: 4, label: "Photos", icon: <Camera size={14} /> }
                        ].map((s) => (
                            <div key={s.step} className={`flex items-center gap-4 transition-all ${step === s.step ? 'opacity-100 translate-x-2' : 'opacity-30'}`}>
                                <div className={`w-6 h-6 rounded-full flex items-center justify-center font-mono text-[10px] font-black ${step === s.step ? 'bg-[var(--accent-bg)] text-white' : 'border border-[var(--bg-panel)] text-[var(--bg-panel)]'}`}>
                                    {s.step}
                                </div>
                                <span className="font-mono text-[10px] uppercase font-black text-[var(--bg-panel)] tracking-widest">{s.label}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* RIGHT SIDE: CONTENT */}
                <div className="flex-1 flex flex-col overflow-hidden bg-[var(--bg-panel)]">
                    <div className="p-8 border-b border-[var(--border)] border-opacity-5 flex justify-between items-center">
                        <span className="font-mono text-[10px] uppercase font-black opacity-40 tracking-[0.3em]">Step 0{step} / 04</span>
                        <button type="button" onClick={onClose} className="p-2 hover:bg-red-500 hover:text-white transition-all rounded-lg"><X size={20} /></button>
                    </div>

                    <div className="p-10 flex-1 overflow-y-auto custom-scrollbar space-y-12">
                        {step === 1 && (
                            <div className="space-y-10 animate-reveal">
                                <div>
                                    <h4 className="text-2xl font-black uppercase tracking-tight mb-2">Who are they?</h4>
                                    <p className="font-mono text-[10px] text-[var(--text-muted)] uppercase font-bold tracking-widest">Name and contact details</p>
                                </div>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-3">
                                        <label className="font-mono text-[8px] uppercase text-[var(--text-muted)] font-black tracking-widest flex items-center gap-2">
                                            <User size={10} /> Full Legal Name
                                        </label>
                                        <input required type="text" placeholder="John Doe" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-[var(--bg-input)] border border-[var(--border)] border-opacity-10 p-5 rounded-2xl font-mono text-sm font-black focus:border-opacity-100 outline-none shadow-sm transition-all" />
                                    </div>
                                    <div className="space-y-3">
                                        <label className="font-mono text-[8px] uppercase text-[var(--text-muted)] font-black tracking-widest flex items-center gap-2">
                                            <Phone size={10} /> Phone Number
                                        </label>
                                        <input required type="text" placeholder="07XX..." value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full bg-[var(--bg-input)] border border-[var(--border)] border-opacity-10 p-5 rounded-2xl font-mono text-sm font-black focus:border-opacity-100 outline-none shadow-sm transition-all" />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-3">
                                        <label className="font-mono text-[8px] uppercase text-[var(--text-muted)] font-black tracking-widest flex items-center gap-2">
                                            <Mail size={10} /> Email Address (Opt)
                                        </label>
                                        <input type="email" placeholder="john@example.com" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full bg-[var(--bg-input)] border border-[var(--border)] border-opacity-10 p-5 rounded-2xl font-mono text-sm font-black focus:border-opacity-100 outline-none shadow-sm transition-all" />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-3">
                                            <label className="font-mono text-[8px] uppercase text-[var(--text-muted)] font-black tracking-widest">ID Type</label>
                                            <select value={formData.idType} onChange={e => setFormData({...formData, idType: e.target.value})} className="w-full bg-[var(--bg-input)] border border-[var(--border)] border-opacity-10 p-5 rounded-2xl font-mono text-xs font-black focus:border-opacity-100 outline-none shadow-sm appearance-none">
                                                <option>National ID</option>
                                                <option>Passport</option>
                                                <option>Alien ID</option>
                                            </select>
                                        </div>
                                        <div className="space-y-3">
                                            <label className="font-mono text-[8px] uppercase text-[var(--text-muted)] font-black tracking-widest">ID Number</label>
                                            <input type="text" placeholder="Number" value={formData.idNumber} onChange={e => setFormData({...formData, idNumber: e.target.value})} className="w-full bg-[var(--bg-input)] border border-[var(--border)] border-opacity-10 p-5 rounded-2xl font-mono text-sm font-black focus:border-opacity-100 outline-none shadow-sm transition-all" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {step === 2 && (
                            <div className="space-y-10 animate-reveal">
                                <div>
                                    <h4 className="text-2xl font-black uppercase tracking-tight mb-2">Where are they going?</h4>
                                    <p className="font-mono text-[10px] text-[var(--text-muted)] uppercase font-bold tracking-widest">Assign them to a property and specific unit</p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-8">
                                        <div className="space-y-3">
                                            <label className="font-mono text-[8px] uppercase text-[var(--text-muted)] font-black tracking-widest flex items-center gap-2">
                                                <Building2 size={10} /> Assign Unit / Room
                                            </label>
                                            <select disabled={!formData.propertyId} value={formData.unitId} onChange={e => {
                                                const uName = e.target.value;
                                                const prop = properties.find(p => p.id === formData.propertyId);
                                                const conf = prop ? parseConfig(prop.config) : {};
                                                const u = conf.units?.find((un: any) => un.name === uName);
                                                setFormData({...formData, unitId: uName, selectedTypeId: u?.typeId || u?.type || ''});
                                            }} className="w-full bg-[var(--bg-input)] border border-[var(--border)] border-opacity-10 p-5 rounded-2xl font-mono text-sm font-black focus:border-opacity-100 outline-none shadow-sm appearance-none disabled:opacity-30">
                                                <option value="">Choose Vacant Unit</option>
                                                {availableUnits.map(u => <option key={u.name} value={u.name}>{u.name} ({u.typeId || u.type || 'Type Missing'})</option>)}
                                            </select>
                                        </div>

                                        {/* EMERGENCY FALLBACK: If unit has no type, let them select it to get the rent */}
                                        {(() => {
                                            const prop = properties.find(p => p.id === formData.propertyId);
                                            const config = prop ? parseConfig(prop.config) : {};
                                            const unit = config.units?.find((u: any) => u.name === formData.unitId);
                                            const hasType = !!(unit?.typeId || unit?.type);
                                            
                                            if (formData.unitId && !hasType) {
                                                return (
                                                    <div className="space-y-3 animate-reveal">
                                                        <label className="font-mono text-[8px] uppercase text-red-500 font-black tracking-widest flex items-center gap-2">
                                                            <AlertCircle size={10} /> Missing Unit Type - Select Category to Auto-fill Rent
                                                        </label>
                                                        <select value={formData.selectedTypeId} onChange={e => setFormData({...formData, selectedTypeId: e.target.value})} className="w-full bg-red-500 bg-opacity-5 border border-red-500 border-opacity-20 p-5 rounded-2xl font-mono text-sm font-black focus:border-opacity-100 outline-none shadow-sm appearance-none">
                                                            <option value="">Select Category</option>
                                                            {Object.keys(config.rents || {}).map(t => <option key={t} value={t}>{t}</option>)}
                                                        </select>
                                                    </div>
                                                );
                                            }
                                            return null;
                                        })()}

                                        <div className="space-y-4">
                                            <label className="font-mono text-[8px] uppercase text-[var(--text-muted)] font-black tracking-widest flex items-center gap-2">
                                                <Calendar size={10} /> Move-in Date
                                            </label>
                                            <input 
                                                type="date" 
                                                value={formData.moveInDate} 
                                                onChange={e => setFormData({...formData, moveInDate: e.target.value})} 
                                                className="w-full bg-[var(--bg-input)] border border-[var(--border)] border-opacity-10 p-6 rounded-3xl font-mono text-sm font-black focus:border-opacity-100 outline-none shadow-sm transition-all hover:bg-[var(--bg-ghost)]" 
                                            />
                                        </div>

                                        {/* Financial Note */}
                                        <div className="p-6 bg-[var(--bg-ghost)] border border-[var(--border)] border-opacity-5 rounded-3xl">
                                            <p className="font-mono text-[8px] uppercase font-black text-[var(--text-muted)] mb-3">Automated Billing Enabled</p>
                                            <p className="font-mono text-[10px] font-bold opacity-40 leading-relaxed">Financials are computed automatically from property setup rules. See the sidebar for the full breakdown.</p>
                                        </div>
                                    </div>
                                    <div className="bg-[var(--text-base)] text-[var(--bg-panel)] p-8 rounded-3xl shadow-[12px_12px_0px_0px_var(--accent-bg)] flex flex-col justify-between">
                                        <div>
                                            <p className="font-mono text-[8px] uppercase font-black tracking-widest mb-1 opacity-50">Total Move-in Charge</p>
                                            <div className="flex items-center gap-2">
                                                <p className="text-4xl font-black tracking-tighter">KES {parseFloat(calculatedCharges).toLocaleString()}</p>
                                            </div>
                                        </div>
                                        <div className="mt-6 pt-6 border-t border-white border-opacity-10 space-y-2">
                                            {(() => {
                                                const config = parseConfig(property.config);
                                                const unit = config.units?.find((u: any) => u.name === formData.unitId);
                                                let rent = parseFloat(unit?.rent?.toString() || "0") || 0;
                                                
                                                // Fallback to category price
                                                if (rent === 0) {
                                                    const typeId = unit?.typeId || unit?.type || formData.selectedTypeId || 'N/A';
                                                    if (typeId !== 'N/A') {
                                                        const baseRentVal = config.rents?.[typeId] || 0;
                                                        rent = Array.isArray(baseRentVal) ? (parseFloat(baseRentVal[0]) || 0) : 
                                                               (typeof baseRentVal === 'object' ? (parseFloat(baseRentVal.min) || 0) : (parseFloat(baseRentVal) || 0));
                                                    }
                                                }
                                                
                                                const moveInFees = (config.oneTime || []).map((item: any) => {
                                                    const amount = (!item.mode || item.mode === 'rent_multiple') 
                                                        ? (rent * (parseFloat(item.multiple?.toString() || "1") || 1))
                                                        : (parseFloat(item.amount?.toString() || "0") || 0);
                                                    return { ...item, calculatedAmount: amount };
                                                });

                                                const selectedRecurring = (config.recurring || []).filter((r: any) => formData.selectedRecurringIds.includes(r.id));
                                                
                                                return (
                                                    <>
                                                        <div className="flex justify-between font-mono text-[8px] uppercase font-bold opacity-60">
                                                            <span>Unit Rent</span>
                                                            <span className="text-[var(--accent-bg)]">KES {rent.toLocaleString()}</span>
                                                        </div>
                                                        
                                                        {/* MOVE-IN FEES BREAKDOWN */}
                                                        {moveInFees.map((item: any) => (
                                                            <div key={item.id} className="flex justify-between font-mono text-[8px] uppercase font-bold opacity-60 pt-2 border-t border-white border-opacity-5">
                                                                <span>{item.name}</span>
                                                                <span>+{item.calculatedAmount.toLocaleString()}</span>
                                                            </div>
                                                        ))}
                                                        
                                                        {/* RECURRING BREAKDOWN */}
                                                        {selectedRecurring.map((item: any) => (
                                                            <div key={item.id} className="flex justify-between font-mono text-[8px] uppercase font-bold opacity-60">
                                                                <span>{item.name}</span>
                                                                <span>+{(parseFloat(item.amount?.toString() || "0") || 0).toLocaleString()}</span>
                                                            </div>
                                                        ))}
                                                    </>
                                                )
                                            })()}
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <label className="font-mono text-[8px] uppercase text-[var(--text-muted)] font-black tracking-widest flex items-center gap-2">
                                        <FileText size={10} /> Private Notes
                                    </label>
                                    <textarea rows={3} placeholder="Any specific requirements or background info..." value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} className="w-full bg-[var(--bg-input)] border border-[var(--border)] border-opacity-10 p-5 rounded-2xl font-mono text-sm font-black focus:border-opacity-100 outline-none shadow-sm resize-none" />
                                </div>
                            </div>
                        )}

                        {step === 3 && (
                            <div className="space-y-10 animate-reveal">
                                <div className="flex justify-between items-end">
                                    <div>
                                        <h4 className="text-2xl font-black uppercase tracking-tight mb-2">Emergency Contacts</h4>
                                        <p className="font-mono text-[10px] text-[var(--text-muted)] uppercase font-bold tracking-widest">Who should we contact in case of an incident?</p>
                                    </div>
                                    {formData.kin.length < 3 && (
                                        <button type="button" onClick={handleAddKin} className="font-mono text-[8px] uppercase font-black px-6 py-3 bg-[var(--text-base)] text-[var(--bg-panel)] rounded-xl hover:translate-y-[-2px] transition-all">+ Add Another</button>
                                    )}
                                </div>

                                <div className="space-y-8">
                                    {formData.kin.map((k, i) => (
                                        <div key={i} className="p-8 bg-[var(--bg-ghost)] rounded-3xl border border-[var(--border)] border-opacity-5 relative group">
                                            {i > 0 && (
                                                <button type="button" onClick={() => handleRemoveKin(i)} className="absolute top-6 right-6 p-2 text-red-500 opacity-0 group-hover:opacity-100 transition-all"><X size={16} /></button>
                                            )}
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                                <div className="space-y-2">
                                                    <p className="font-mono text-[7px] uppercase font-black opacity-30">Full Name</p>
                                                    <input required type="text" placeholder="Contact Name" value={k.name} onChange={e => updateKin(i, 'name', e.target.value)} className="w-full bg-transparent border-b border-[var(--border)] border-opacity-10 py-2 font-mono text-xs font-black focus:border-opacity-100 outline-none transition-all" />
                                                </div>
                                                <div className="space-y-2">
                                                    <p className="font-mono text-[7px] uppercase font-black opacity-30">Phone Number</p>
                                                    <input required type="text" placeholder="07..." value={k.phone} onChange={e => updateKin(i, 'phone', e.target.value)} className="w-full bg-transparent border-b border-[var(--border)] border-opacity-10 py-2 font-mono text-xs font-black focus:border-opacity-100 outline-none transition-all" />
                                                </div>
                                                <div className="space-y-2">
                                                    <p className="font-mono text-[7px] uppercase font-black opacity-30">Relationship</p>
                                                    <input required type="text" placeholder="Spouse / Parent..." value={k.relationship} onChange={e => updateKin(i, 'relationship', e.target.value)} className="w-full bg-transparent border-b border-[var(--border)] border-opacity-10 py-2 font-mono text-xs font-black focus:border-opacity-100 outline-none transition-all" />
                                                    <div className="flex flex-wrap gap-1 mt-2">
                                                        {relationshipSuggestions.map(s => (
                                                            <button key={s} type="button" onClick={() => updateKin(i, 'relationship', s)} className="px-2 py-1 bg-[var(--bg-input)] rounded-md font-mono text-[6px] uppercase font-black opacity-50 hover:opacity-100 transition-all border border-[var(--border)] border-opacity-5">{s}</button>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                        {step === 4 && (
                            <div className="space-y-10 animate-reveal">
                                <div>
                                    <h4 className="text-2xl font-black uppercase tracking-tight mb-2">Unit Condition</h4>
                                    <p className="font-mono text-[10px] text-[var(--text-muted)] uppercase font-bold tracking-widest">Snapshot the room before handover to avoid disputes later</p>
                                </div>

                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
                                    {/* EXISTING PHOTOS */}
                                    {formData.moveInPhotos.map((url: string, i: number) => (
                                        <div key={`photo-${i}`} className="aspect-square relative group rounded-2xl overflow-hidden border border-[var(--border)] border-opacity-10 shadow-sm animate-reveal">
                                            <img src={url} alt="Room" className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                                            <button 
                                                type="button" 
                                                onClick={() => handleRemovePhoto(url)}
                                                className="absolute inset-0 bg-red-500 bg-opacity-90 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-all text-white font-mono text-[8px] uppercase font-black"
                                            >
                                                <Trash2 size={16} className="mb-2" />
                                                <span>Delete Shot</span>
                                            </button>
                                            <div className="absolute top-3 left-3 bg-black bg-opacity-50 text-white px-2 py-1 rounded-md font-mono text-[6px] uppercase font-black">
                                                Shot {i + 1}
                                            </div>
                                        </div>
                                    ))}

                                    {/* UPLOADING QUEUE */}
                                    {uploadingQueue.map((item) => (
                                        <div key={item.id} className="aspect-square relative rounded-2xl overflow-hidden bg-[var(--bg-ghost)] border border-[var(--border)] border-opacity-5 flex flex-col items-center justify-center p-6 space-y-4">
                                            <Loader2 className="animate-spin text-[var(--accent-bg)]" size={24} />
                                            <div className="w-full space-y-2">
                                                <div className="flex justify-between font-mono text-[6px] uppercase font-black opacity-40">
                                                    <span>Uploading...</span>
                                                    <span>{item.progress}%</span>
                                                </div>
                                                <div className="w-full h-1 bg-[var(--border)] bg-opacity-5 rounded-full overflow-hidden">
                                                    <div className="h-full bg-[var(--accent-bg)] transition-all duration-300" style={{ width: `${item.progress}%` }} />
                                                </div>
                                            </div>
                                            <span className="font-mono text-[6px] uppercase font-black opacity-30 truncate w-full text-center">{item.name}</span>
                                        </div>
                                    ))}
                                    
                                    {/* UPLOAD SLOTS (EMPTY) */}
                                    {formData.moveInPhotos.length + uploadingQueue.length < 6 && Array.from({ length: 6 - (formData.moveInPhotos.length + uploadingQueue.length) }).map((_, i) => (
                                        i === 0 ? (
                                            <label key="upload-btn" className="aspect-square flex flex-col items-center justify-center border-2 border-dashed border-[var(--border)] border-opacity-10 rounded-2xl cursor-pointer hover:bg-[var(--bg-ghost)] hover:border-opacity-100 transition-all group">
                                                <input type="file" multiple accept="image/*" className="hidden" onChange={handlePhotoUpload} />
                                                <ImageIcon className="text-[var(--text-muted)] group-hover:text-[var(--accent-bg)] transition-colors mb-3" size={32} />
                                                <span className="font-mono text-[8px] uppercase font-black text-[var(--text-muted)]">Add Snapshots</span>
                                            </label>
                                        ) : (
                                            <div key={`empty-${i}`} className="aspect-square border border-dashed border-[var(--border)] border-opacity-5 rounded-2xl flex items-center justify-center opacity-10">
                                                <Camera size={24} />
                                            </div>
                                        )
                                    ))}
                                </div>

                                <div className="p-6 bg-[var(--bg-ghost)] border-l-4 border-yellow-500 rounded-r-2xl">
                                    <p className="font-mono text-[10px] font-black uppercase text-yellow-700 mb-1 flex items-center gap-2">
                                        <AlertCircle size={12} /> Manager Tip
                                    </p>
                                    <p className="font-mono text-[9px] font-bold opacity-60 leading-relaxed italic">"Check the ceilings, floor tiles, and water faucets. A few clear photos now saves hours of arguing when they move out."</p>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="p-10 border-t border-[var(--border)] border-opacity-5 flex gap-4 bg-[var(--bg-ghost)]">
                        {step > 1 && (
                            <button type="button" onClick={() => setStep(prev => prev - 1)} className="px-10 py-6 border border-[var(--border)] border-opacity-10 rounded-2xl font-mono text-[10px] uppercase font-black hover:bg-[var(--text-base)] hover:text-[var(--bg-panel)] transition-all">Back</button>
                        )}
                        {step < 4 ? (
                            <button type="button" onClick={() => setStep(prev => prev + 1)} className="flex-1 bg-[var(--accent-bg)] text-[var(--accent-text)] py-6 rounded-2xl font-mono text-[10px] uppercase font-black shadow-[8px_8px_0px_0px_rgba(67,56,202,0.2)] hover:translate-y-[-2px] transition-all flex items-center justify-center gap-3">
                                Next Step <ChevronRight size={16} />
                            </button>
                        ) : (
                            <button type="button" onClick={handleSubmit} disabled={isSaving} className="flex-1 bg-[var(--text-base)] text-[var(--bg-panel)] py-6 rounded-2xl font-mono text-[10px] uppercase font-black shadow-[8px_8px_0px_0px_var(--shadow-color)] hover:translate-y-[-2px] active:translate-y-0 transition-all flex items-center justify-center gap-3">
                                {isSaving ? "Finalizing..." : <>Done <Check size={16} /></>}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
