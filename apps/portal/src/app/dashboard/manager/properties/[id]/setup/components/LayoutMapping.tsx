"use client";

import React, { useState, useEffect } from 'react';
import { Home, Zap, ArrowRight, Trash2, Undo2, Users, Coins, Check, X, AlertCircle, Plus } from 'lucide-react';

interface LayoutConfig {
    floors: number;
    unitsPerFloor: number;
    convention: string;
}

interface Unit {
    id: string;
    name: string;
    status: 'vacant' | 'occupied';
    tenantId: string | null;
    typeId: string;
    floor: number;
    rentOverride?: string;
}

interface Tenant {
    id: string;
    name: string;
    phone: string;
    email?: string;
    idNumber?: string;
    nextOfKin?: string;
    moveInCharges?: string;
    unitId: string | null;
}

interface LayoutMappingProps {
    layoutConfig: LayoutConfig;
    setLayoutConfig: (config: LayoutConfig) => void;
    units: Unit[];
    setUnits: (units: Unit[]) => void;
    autoGenerateLayout: () => void;
    onNext: () => void;
    rents: Record<string, string>;
    setRents: (rents: Record<string, string>) => void;
    tenants: Tenant[];
    setTenants: (tenants: Tenant[]) => void;
    getTenantName: (id: string | null) => string;
}

export const LayoutMapping = ({
    layoutConfig, setLayoutConfig, units, setUnits,
    autoGenerateLayout, onNext, rents, setRents,
    tenants, setTenants, getTenantName
}: LayoutMappingProps) => {
    const [history, setHistory] = useState<Unit[][]>([]);
    const [editingUnit, setEditingUnit] = useState<Unit | null>(null);
    const [assignTab, setAssignTab] = useState<'existing' | 'new'>('existing');
    const [isSimpleMode, setIsSimpleMode] = useState(true);
    const [newTenant, setNewTenant] = useState<any>({
        name: '', phone: '', email: '', idNumber: '',
        kin: [{ name: '', phone: '', relationship: '' }]
    });

    const saveToHistory = (currentUnits: Unit[]) => {
        setHistory(prev => [currentUnits, ...prev].slice(0, 3));
    };

    const undo = () => {
        if (history.length > 0) {
            const [prev, ...rest] = history;
            setUnits(prev);
            setHistory(rest);
        }
    };

    const toggleUnitStatus = (unit: Unit) => {
        saveToHistory(units);
        setUnits(units.map((u: Unit) => u.id === unit.id ? { ...u, status: u.status === 'vacant' ? 'occupied' : 'vacant', tenantId: null } : u));
    };

    const markAllOccupied = () => {
        saveToHistory(units);
        setUnits(units.map((u: Unit) => ({ ...u, status: 'occupied' })));
    };

    const deleteUnit = (id: string) => {
        saveToHistory(units);
        setUnits(units.filter((u: Unit) => u.id !== id));
    };

    const updateUnit = (id: string, updates: Partial<Unit>) => {
        setUnits(units.map((u: Unit) => u.id === id ? { ...u, ...updates } : u));
        if (editingUnit && editingUnit.id === id) {
            setEditingUnit({ ...editingUnit, ...updates });
        }
    };

    const floorsCount = Math.max(...(units.map((u: Unit) => u.floor) || [0]), layoutConfig.floors);
    const floors = Array.from({ length: floorsCount }, (_, i) => i + 1).reverse();

    const handleSaveTenant = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingUnit) return;
        
        const newId = `t${Date.now()}`;
        
        const validKin = newTenant.kin.filter((k: any) => k.name && k.phone);

        const baseRent = rents[editingUnit.typeId] || 0;
        const rent = parseFloat(baseRent as string) || 0;
        const moveInCharges = (rent * 2).toString();

        const tenantObj = {
            id: newId,
            name: newTenant.name,
            phone: newTenant.phone,
            email: newTenant.email,
            idNumber: newTenant.idNumber,
            nextOfKin: JSON.stringify(validKin),
            moveInCharges,
            unitId: editingUnit.id
        };

        setTenants([...tenants, tenantObj]);
        updateUnit(editingUnit.id, { status: 'occupied', tenantId: newId });
        setNewTenant({ 
            name: '', phone: '', email: '', idNumber: '', 
            kin: [{ name: '', phone: '', relationship: '' }] 
        });
    };

    return (
        <div className="flex flex-col h-full animate-reveal">
            <div className="mb-12">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 mb-10 border-b border-[var(--border)] border-opacity-10 pb-10">
                    <div className="flex items-center gap-6">
                        <div className="w-16 h-16 bg-[var(--text-base)] text-[var(--bg-panel)] flex items-center justify-center shadow-[8px_8px_0px_0px_var(--shadow-color)] shrink-0">
                            <Home size={32} />
                        </div>
                        <div>
                            <h2 className="text-4xl lg:text-6xl font-black uppercase tracking-tighter leading-none text-[var(--text-base)]">
                                Unit Layout
                            </h2>
                            <p className="font-mono text-[10px] text-[var(--text-muted)] uppercase mt-3 font-bold tracking-[0.2em]">
                                Tell us how the rooms are arranged
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 bg-[var(--bg-panel)] p-1.5 border border-[var(--border)] border-opacity-10 self-start lg:self-center shadow-[4px_4px_0px_0px_var(--shadow-color)]">
                        <button
                            onClick={() => setIsSimpleMode(true)}
                            className={`px-6 py-3 font-mono text-[10px] font-black uppercase transition-all ${isSimpleMode ? 'bg-[var(--text-base)] text-[var(--bg-panel)]' : 'text-[var(--text-muted)] hover:text-[var(--text-base)]'}`}
                        >
                            Simple
                        </button>
                        <button
                            onClick={() => setIsSimpleMode(false)}
                            className={`px-6 py-3 font-mono text-[10px] font-black uppercase transition-all ${!isSimpleMode ? 'bg-[var(--text-base)] text-[var(--bg-panel)]' : 'text-[var(--text-muted)] hover:text-[var(--text-base)]'}`}
                        >
                            Detailed
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 bg-[var(--bg-panel)] border border-[var(--border)] border-opacity-10 p-8 shadow-[8px_8px_0px_0px_var(--shadow-color)]">
                    <div>
                        <p className="font-mono text-[8px] uppercase text-[var(--text-muted)] font-black tracking-widest mb-3">Total Floors</p>
                        <input
                            type="number" min="1"
                            value={layoutConfig.floors}
                            onChange={(e) => setLayoutConfig({ ...layoutConfig, floors: parseInt(e.target.value) || 1 })}
                            className="w-full bg-[var(--bg-panel)] border border-[var(--border)] border-opacity-10 text-[var(--text-base)] p-4 font-mono text-sm focus:border-opacity-100 outline-none font-black shadow-[4px_4px_0px_0px_var(--shadow-color)]"
                        />
                    </div>
                    <div>
                        <p className="font-mono text-[8px] uppercase text-[var(--text-muted)] font-black tracking-widest mb-3">Units Per Floor</p>
                        <input
                            type="number" min="1"
                            value={layoutConfig.unitsPerFloor}
                            onChange={(e) => setLayoutConfig({ ...layoutConfig, unitsPerFloor: parseInt(e.target.value) || 1 })}
                            className="w-full bg-[var(--bg-panel)] border border-[var(--border)] border-opacity-10 text-[var(--text-base)] p-4 font-mono text-sm focus:border-opacity-100 outline-none font-black shadow-[4px_4px_0px_0px_var(--shadow-color)]"
                        />
                    </div>
                    <div>
                        <p className="font-mono text-[8px] uppercase text-[var(--text-muted)] font-black tracking-widest mb-3">Convention</p>
                        <select
                            value={layoutConfig.convention}
                            onChange={(e) => setLayoutConfig({ ...layoutConfig, convention: e.target.value })}
                            className="w-full bg-[var(--bg-panel)] border border-[var(--border)] border-opacity-10 text-[var(--text-base)] p-4 font-mono text-sm focus:border-opacity-100 outline-none font-black shadow-[4px_4px_0px_0px_var(--shadow-color)]"
                        >
                            <option value="alphanumeric">A1, A2, B1...</option>
                            <option value="numeric">101, 102, 201...</option>
                            <option value="manual">Manual / Own</option>
                        </select>
                    </div>
                    <div className="flex items-end">
                            <button
                                onClick={autoGenerateLayout}
                                className="w-full bg-[var(--text-base)] text-[var(--bg-panel)] py-4 font-mono text-[10px] uppercase font-black flex items-center justify-center gap-3 shadow-[8px_8px_0px_0px_var(--shadow-color)] hover:translate-y-[-2px] active:translate-y-0 transition-all rounded-xl"
                            >
                                <Zap size={16} /> Auto-fill Building
                            </button>
                    </div>
                </div>
            </div>

            <div className="mb-12 flex flex-col sm:flex-row justify-between items-center gap-8">
                <div className="flex items-center gap-6 bg-[var(--bg-panel)] p-6 border border-[var(--border)] border-opacity-10 w-full sm:w-auto shadow-[4px_4px_0px_0px_var(--shadow-color)] rounded-xl">
                    <span className="font-mono text-[8px] text-[var(--text-muted)] uppercase font-black tracking-widest">Standard Rent</span>
                    <div className="flex gap-8 overflow-x-auto custom-scrollbar pb-1">
                        {Object.entries(rents).map(([type, price]: any) => (
                            <div key={type} className="flex items-center gap-3 shrink-0">
                                <span className="font-mono text-[10px] font-black uppercase text-[var(--text-base)]">{type}</span>
                                <input
                                    type="number"
                                    value={price}
                                    onChange={(e) => setRents({ ...rents, [type]: e.target.value })}
                                    className="w-24 bg-transparent border-b border-[var(--border)] border-opacity-20 font-mono text-[10px] font-black focus:border-opacity-100 outline-none text-[var(--accent-bg)]"
                                />
                            </div>
                        ))}
                    </div>
                </div>

                <div className="flex items-center gap-4 w-full sm:w-auto justify-end">
                    {isSimpleMode && (
                        <button
                            onClick={markAllOccupied}
                            className="px-8 py-4 border border-[var(--border)] border-opacity-10 bg-[var(--bg-panel)] text-[var(--text-base)] font-mono text-[10px] font-black uppercase hover:bg-[var(--text-base)] hover:text-[var(--bg-panel)] transition-all shadow-[4px_4px_0px_0px_var(--shadow-color)]"
                        >
                            Fill All Units
                        </button>
                    )}
                    {history.length > 0 && (
                        <button
                            onClick={undo}
                            className="flex items-center gap-3 px-8 py-4 bg-[var(--bg-panel)] border border-[var(--border)] border-opacity-10 font-mono text-[10px] uppercase font-black hover:bg-[var(--text-base)] hover:text-[var(--bg-panel)] transition-all shadow-[4px_4px_0px_0px_var(--shadow-color)]"
                        >
                            <Undo2 size={16} /> Undo ({history.length})
                        </button>
                    )}
                </div>
            </div>

            <div className="space-y-20 flex-1 pb-32">
                {floors.map(floorNum => (
                    <div key={floorNum} className="relative">
                        <div className="flex items-center gap-6 mb-10">
                            <div className="bg-[var(--text-base)] text-[var(--bg-panel)] px-6 py-3 font-mono text-[10px] font-black uppercase tracking-tighter shadow-[8px_8px_0px_0px_var(--shadow-color)]">
                                Floor {floorNum === 1 ? '1 (Ground)' : floorNum}
                            </div>
                            <div className="flex-1 h-[1px] bg-[var(--border)] opacity-10" />
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-8 gap-6">
                            {units.filter((u: Unit) => u.floor === floorNum).map((unit: Unit) => (
                                <div key={unit.id} className="group relative">
                                    <button
                                        onClick={() => isSimpleMode ? toggleUnitStatus(unit) : setEditingUnit(unit)}
                                        className={`w-full aspect-square border transition-all hover:shadow-[12px_12px_0px_0px_var(--shadow-color)] p-5 text-left flex flex-col justify-between ${unit.status === 'occupied' ? 'bg-[var(--bg-panel)] border-[var(--accent-bg)] border-2 shadow-[8px_8px_0px_0px_var(--shadow-color)]' : 'bg-[var(--bg-panel)] border-[var(--border)] border-opacity-10 hover:border-opacity-100'}`}
                                    >
                                        <div className="flex justify-between items-start">
                                            <span className="font-black font-mono text-xs uppercase tracking-tighter truncate pr-2 text-[var(--text-base)]">{unit.name}</span>
                                            {unit.status === 'occupied' && <div className="w-2 h-2 bg-[var(--accent-bg)] animate-pulse" />}
                                        </div>
                                        <div className="mt-auto">
                                            <p className="font-mono text-[7px] uppercase text-[var(--text-muted)] font-black tracking-widest mb-1">{unit.typeId}</p>
                                            <p className={`text-[10px] font-black tracking-tighter ${unit.status === 'occupied' ? 'text-[var(--accent-bg)]' : 'text-[var(--text-base)]'}`}>
                                                {unit.rentOverride ? `KES ${parseInt(unit.rentOverride).toLocaleString()}` : (rents[unit.typeId] ? `KES ${parseInt(rents[unit.typeId]).toLocaleString()}` : 'Set Rent')}
                                            </p>
                                        </div>
                                    </button>
                                    <button
                                        onClick={() => deleteUnit(unit.id)}
                                        className="absolute -top-3 -right-3 w-8 h-8 bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:scale-110 z-10 shadow-lg"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            ))}
                            <button
                                onClick={() => {
                                    const newUnit: Unit = {
                                        id: `unit-${Date.now()}`,
                                        typeId: Object.keys(rents)[0],
                                        name: `NEW`,
                                        floor: floorNum,
                                        status: 'vacant',
                                        tenantId: null
                                    };
                                    setUnits([...units, newUnit]);
                                }}
                                className="aspect-square border-2 border-dashed border-[var(--border)] border-opacity-10 flex flex-col items-center justify-center text-[var(--text-muted)] hover:border-opacity-100 hover:text-[var(--text-base)] transition-all gap-3 bg-[var(--bg-panel)] bg-opacity-5 hover:bg-opacity-10 shadow-[4px_4px_0px_0px_var(--shadow-color)]"
                            >
                                <Plus size={24} strokeWidth={1} />
                                <span className="font-mono text-[8px] uppercase font-black tracking-widest">Add Unit</span>
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            <div className="fixed bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-[var(--bg-base)] via-[var(--bg-base)] to-transparent z-40">
                <div className="max-w-6xl mx-auto">
                    <button
                        onClick={onNext}
                        className="w-full bg-[var(--text-base)] text-[var(--bg-panel)] py-8 font-mono text-xs uppercase font-black shadow-[12px_12px_0px_0px_var(--shadow-color)] hover:translate-y-[-4px] hover:shadow-[16px_16px_0px_0px_var(--shadow-color)] active:translate-y-0 transition-all flex items-center justify-center gap-4 tracking-[0.3em] rounded-xl"
                    >
                        Save Layout & Prices <ArrowRight size={20} />
                    </button>
                </div>
            </div>

            {/* UNIT EDITING MODAL */}
            {editingUnit && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-6 backdrop-blur-xl bg-[var(--bg-base)] bg-opacity-80 animate-reveal">
                    <div className="bg-[var(--bg-panel)] border border-[var(--border)] border-opacity-20 w-full max-w-2xl shadow-[32px_32px_0px_0px_var(--shadow-color)] overflow-hidden">
                        <div className="p-8 border-b border-[var(--border)] border-opacity-10 flex justify-between items-center bg-[var(--bg-panel)]">
                            <div>
                                <h3 className="text-4xl font-black uppercase tracking-tighter text-[var(--text-base)]">{editingUnit.name}</h3>
                                <p className="font-mono text-[10px] text-[var(--text-muted)] uppercase tracking-[0.2em] mt-2 font-bold">Floor {editingUnit.floor} / {editingUnit.typeId}</p>
                            </div>
                            <button onClick={() => setEditingUnit(null)} className="p-5 border border-[var(--border)] border-opacity-10 hover:bg-[var(--text-base)] hover:text-[var(--bg-panel)] transition-all">
                                <X size={24} />
                            </button>
                        </div>

                        <div className="p-10 space-y-12 max-h-[70vh] overflow-y-auto custom-scrollbar bg-[var(--bg-panel)]">
                            <div className="grid grid-cols-2 gap-8">
                                <div>
                                    <p className="font-mono text-[8px] uppercase text-[var(--text-muted)] font-black tracking-widest mb-3">Unit Label</p>
                                    <input
                                        type="text"
                                        value={editingUnit.name}
                                        onChange={(e) => updateUnit(editingUnit.id, { name: e.target.value })}
                                        className="w-full bg-[var(--bg-panel)] border border-[var(--border)] border-opacity-10 p-4 font-mono text-sm font-black focus:border-opacity-100 outline-none text-[var(--text-base)] shadow-[4px_4px_0px_0px_var(--shadow-color)]"
                                    />
                                </div>
                                <div>
                                    <p className="font-mono text-[8px] uppercase text-[var(--text-muted)] font-black tracking-widest mb-3">Category</p>
                                    <select
                                        value={editingUnit.typeId}
                                        onChange={(e) => updateUnit(editingUnit.id, { typeId: e.target.value })}
                                        className="w-full bg-[var(--bg-panel)] border border-[var(--border)] border-opacity-10 p-4 font-mono text-sm font-black focus:border-opacity-100 outline-none text-[var(--text-base)] shadow-[4px_4px_0px_0px_var(--shadow-color)]"
                                    >
                                        {editingUnit && Object.keys(rents).map(t => <option key={t} value={t}>{t}</option>)}
                                    </select>
                                </div>
                            </div>

                            <div className="bg-[var(--bg-panel)] border border-[var(--border)] border-opacity-10 p-8 shadow-[8px_8px_0px_0px_var(--shadow-color)]">
                                <h4 className="font-black font-mono text-[10px] uppercase text-[var(--text-muted)] tracking-widest mb-6 flex items-center gap-3">
                                    <Coins size={14} className="text-[var(--accent-bg)]" /> Rent Settings
                                </h4>
                                <div className="relative">
                                    <span className="absolute left-6 top-1/2 -translate-y-1/2 font-mono text-[11px] text-[var(--text-muted)] font-black">KES</span>
                                    <input
                                        type="number"
                                        placeholder={rents[editingUnit.typeId] || '0'}
                                        value={editingUnit.rentOverride || ''}
                                        onChange={(e) => updateUnit(editingUnit.id, { rentOverride: e.target.value })}
                                        className="w-full bg-[var(--bg-panel)] border border-[var(--border)] border-opacity-10 py-5 pl-16 pr-6 font-mono text-xl focus:border-opacity-100 outline-none font-black text-[var(--accent-bg)] shadow-[4px_4px_0px_0px_var(--shadow-color)]"
                                    />
                                </div>
                                <p className="font-mono text-[8px] text-[var(--text-muted)] uppercase mt-4 font-bold tracking-tight">Inherits base yield of {editingUnit ? rents[editingUnit.typeId] : '0'} KES if zeroed.</p>
                            </div>

                            <div>
                                <div className="flex items-center justify-between mb-8">
                                    <h4 className="font-black font-mono text-[10px] uppercase text-[var(--text-muted)] tracking-widest flex items-center gap-3">
                                        <Users size={14} className="text-[var(--accent-bg)]" /> Tenants
                                    </h4>
                                    <div className={`px-5 py-2 font-mono text-[10px] font-black uppercase tracking-tighter ${editingUnit.status === 'occupied' ? 'bg-[var(--accent-bg)] text-[var(--accent-text)]' : 'bg-[var(--bg-panel)] border border-[var(--border)] border-opacity-10 text-[var(--text-muted)]'}`}>
                                        {editingUnit.status}
                                    </div>
                                </div>

                                {editingUnit.status === 'occupied' ? (
                                    <div className="space-y-8 animate-reveal">
                                        <div className="bg-[var(--bg-panel)] border border-[var(--border)] border-opacity-10 p-8 shadow-[8px_8px_0px_0px_var(--shadow-color)] rounded-xl">
                                            <p className="font-mono text-[8px] text-[var(--text-muted)] uppercase font-black tracking-widest mb-2">Active Occupant</p>
                                            <p className="text-3xl font-black text-[var(--text-base)] tracking-tighter">{getTenantName(editingUnit.tenantId)}</p>
                                            
                                            {/* MOVE-IN CHARGES SUMMARY */}
                                            <div className="mt-6 pt-6 border-t border-[var(--border)] border-opacity-5 flex justify-between items-end">
                                                <div>
                                                    <p className="font-mono text-[7px] text-[var(--text-muted)] uppercase font-black tracking-widest">Calculated Move-in</p>
                                                    <p className="text-sm font-black text-[var(--accent-bg)] uppercase">KES {parseFloat(tenants.find((t: Tenant) => t.id === editingUnit?.tenantId)?.moveInCharges || '0').toLocaleString()}</p>
                                                </div>
                                                <p className="font-mono text-[6px] text-[var(--text-muted)] uppercase font-bold max-w-[120px] text-right">Includes Rent + 1 Month Security Deposit</p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => updateUnit(editingUnit.id, { status: 'vacant', tenantId: null })}
                                            className="w-full py-6 border border-[var(--border)] border-opacity-10 text-red-500 font-mono text-[10px] font-black uppercase hover:bg-red-500 hover:text-white transition-all shadow-[4px_4px_0px_0px_var(--shadow-color)]"
                                        >
                                            Terminate Assignment
                                        </button>
                                    </div>
                                ) : (
                                    <div className="space-y-8 animate-reveal">
                                        <div className="flex gap-2 p-2 bg-[var(--bg-panel)] border border-[var(--border)] border-opacity-10 shadow-[4px_4px_0px_0px_var(--shadow-color)]">
                                            <button
                                                onClick={() => setAssignTab('existing')}
                                                className={`flex-1 py-3 font-mono text-[10px] uppercase font-black transition-all ${assignTab === 'existing' ? 'bg-[var(--text-base)] text-[var(--bg-panel)] shadow-[4px_4px_0px_0px_var(--shadow-color)]' : 'text-[var(--text-muted)] hover:text-[var(--text-base)]'}`}
                                            >
                                                Existing
                                            </button>
                                            <button
                                                onClick={() => setAssignTab('new')}
                                                className={`flex-1 py-3 font-mono text-[10px] uppercase font-black transition-all ${assignTab === 'new' ? 'bg-[var(--text-base)] text-[var(--bg-panel)] shadow-[4px_4px_0px_0px_var(--shadow-color)]' : 'text-[var(--text-muted)] hover:text-[var(--text-base)]'}`}
                                            >
                                                New Entry
                                            </button>
                                        </div>

                                        {assignTab === 'existing' && (
                                            <div className="space-y-4">
                                                {tenants.filter((t: Tenant) => !t.unitId).map((t: Tenant) => (
                                                    <button
                                                        key={t.id}
                                                        onClick={() => {
                                                            setTenants(tenants.map((tt: Tenant) => tt.id === t.id ? { ...tt, unitId: editingUnit?.id || null } : tt));
                                                            if (editingUnit) updateUnit(editingUnit.id, { status: 'occupied', tenantId: t.id });
                                                        }}
                                                        className="w-full p-6 bg-[var(--bg-panel)] border border-[var(--border)] border-opacity-10 hover:border-opacity-100 transition-all flex justify-between items-center group text-left shadow-[4px_4px_0px_0px_var(--shadow-color)]"
                                                    >
                                                        <div>
                                                            <span className="font-black block text-lg tracking-tighter text-[var(--text-base)]">{t.name}</span>
                                                            <span className="font-mono text-[9px] text-[var(--text-muted)] uppercase tracking-widest font-bold">{t.phone}</span>
                                                        </div>
                                                        <Check size={20} className="text-[var(--accent-bg)] opacity-0 group-hover:opacity-100 transition-opacity" />
                                                    </button>
                                                ))}
                                                {tenants.filter((t: Tenant) => !t.unitId).length === 0 && (
                                                    <div className="text-center py-16 border border-dashed border-[var(--border)] border-opacity-20 bg-[var(--bg-panel)] bg-opacity-5 rounded-xl">
                                                        <Users size={32} className="mx-auto mb-4 opacity-10" />
                                                        <p className="font-mono text-[10px] text-[var(--text-muted)] uppercase font-black">Everyone is moved in</p>
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        {assignTab === 'new' && (
                                            <form onSubmit={handleSaveTenant} className="space-y-6">
                                                <div className="grid grid-cols-1 gap-6">
                                                    <div className="grid grid-cols-2 gap-6">
                                                        <div>
                                                            <p className="font-mono text-[8px] uppercase text-[var(--text-muted)] font-black tracking-widest mb-3">Legal Name</p>
                                                            <input required type="text" placeholder="John Doe" value={newTenant.name} onChange={e => setNewTenant({ ...newTenant, name: e.target.value })} className="w-full bg-[var(--bg-panel)] border border-[var(--border)] border-opacity-10 p-4 font-mono text-xs font-black focus:border-opacity-100 outline-none text-[var(--text-base)] shadow-[4px_4px_0px_0px_var(--shadow-color)]" />
                                                        </div>
                                                        <div>
                                                            <p className="font-mono text-[8px] uppercase text-[var(--text-muted)] font-black tracking-widest mb-3">Email (Opt)</p>
                                                            <input type="email" placeholder="email@..." value={newTenant.email} onChange={e => setNewTenant({ ...newTenant, email: e.target.value })} className="w-full bg-[var(--bg-panel)] border border-[var(--border)] border-opacity-10 p-4 font-mono text-xs font-black focus:border-opacity-100 outline-none text-[var(--text-base)] shadow-[4px_4px_0px_0px_var(--shadow-color)]" />
                                                        </div>
                                                    </div>
                                                    <div className="grid grid-cols-2 gap-6">
                                                        <div>
                                                            <p className="font-mono text-[8px] uppercase text-[var(--text-muted)] font-black tracking-widest mb-3">Phone Number</p>
                                                            <input required type="text" placeholder="07..." value={newTenant.phone} onChange={e => setNewTenant({ ...newTenant, phone: e.target.value })} className="w-full bg-[var(--bg-panel)] border border-[var(--border)] border-opacity-10 p-4 font-mono text-xs font-black focus:border-opacity-100 outline-none text-[var(--text-base)] shadow-[4px_4px_0px_0px_var(--shadow-color)]" />
                                                        </div>
                                                        <div>
                                                            <p className="font-mono text-[8px] uppercase text-[var(--text-muted)] font-black tracking-widest mb-3">ID Number</p>
                                                            <input type="text" placeholder="Ref..." value={newTenant.idNumber} onChange={e => setNewTenant({ ...newTenant, idNumber: e.target.value })} className="w-full bg-[var(--bg-panel)] border border-[var(--border)] border-opacity-10 p-4 font-mono text-xs font-black focus:border-opacity-100 outline-none text-[var(--text-base)] shadow-[4px_4px_0px_0px_var(--shadow-color)]" />
                                                        </div>
                                                    </div>
                                                    <div className="pt-4 border-t border-[var(--border)] border-opacity-5">
                                                        <div className="flex items-center justify-between mb-4">
                                                            <p className="font-mono text-[7px] uppercase text-[var(--accent-bg)] font-black tracking-widest">Emergency Contacts</p>
                                                            {newTenant.kin.length < 3 && (
                                                                <button 
                                                                    type="button" 
                                                                    onClick={() => setNewTenant({...newTenant, kin: [...newTenant.kin, { name: '', phone: '', relationship: '' }]})}
                                                                    className="font-mono text-[7px] uppercase font-black px-3 py-1 border border-[var(--border)] border-opacity-10 rounded-lg hover:bg-[var(--text-base)] hover:text-[var(--bg-panel)] transition-all"
                                                                >
                                                                    + Add More
                                                                </button>
                                                            )}
                                                        </div>
                                                        <div className="space-y-4">
                                                            {newTenant.kin.map((k: any, i: number) => (
                                                                <div key={i} className="p-4 bg-[var(--bg-ghost)] rounded-xl space-y-3 relative">
                                                                    <div className="flex justify-between items-center">
                                                                        <span className="font-mono text-[6px] uppercase font-black opacity-30">Contact {i + 1}</span>
                                                                        {i > 0 && (
                                                                            <button type="button" onClick={() => setNewTenant({...newTenant, kin: newTenant.kin.filter((_: any, idx: number) => idx !== i)})} className="text-red-500 hover:text-red-700">
                                                                                <X size={12} />
                                                                            </button>
                                                                        )}
                                                                    </div>
                                                                    <input 
                                                                        type="text" 
                                                                        placeholder="Name" 
                                                                        value={k.name} 
                                                                        onChange={e => {
                                                                            const next = [...newTenant.kin];
                                                                            next[i].name = e.target.value;
                                                                            setNewTenant({...newTenant, kin: next});
                                                                        }} 
                                                                        className="w-full bg-[var(--bg-panel)] border border-[var(--border)] border-opacity-10 p-3 rounded-xl font-mono text-[10px] font-black focus:border-opacity-100 outline-none"
                                                                    />
                                                                    <div className="grid grid-cols-2 gap-3">
                                                                        <input 
                                                                            type="text" 
                                                                            placeholder="Phone" 
                                                                            value={k.phone} 
                                                                            onChange={e => {
                                                                                const next = [...newTenant.kin];
                                                                                next[i].phone = e.target.value;
                                                                                setNewTenant({...newTenant, kin: next});
                                                                            }} 
                                                                            className="bg-[var(--bg-panel)] border border-[var(--border)] border-opacity-10 p-3 rounded-xl font-mono text-[10px] font-black focus:border-opacity-100 outline-none"
                                                                        />
                                                                        <input 
                                                                            type="text" 
                                                                            placeholder="Relation" 
                                                                            value={k.relationship} 
                                                                            onChange={e => {
                                                                                const next = [...newTenant.kin];
                                                                                next[i].relationship = e.target.value;
                                                                                setNewTenant({...newTenant, kin: next});
                                                                            }} 
                                                                            className="bg-[var(--bg-panel)] border border-[var(--border)] border-opacity-10 p-3 rounded-xl font-mono text-[10px] font-black focus:border-opacity-100 outline-none"
                                                                        />
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                                <button type="submit" className="w-full bg-[var(--text-base)] text-[var(--bg-panel)] py-6 font-mono text-[10px] uppercase font-black shadow-[8px_8px_0px_0px_var(--shadow-color)] active:translate-y-1 transition-all tracking-[0.2em] rounded-xl">Add Person</button>
                                            </form>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="p-10 border-t border-[var(--border)] border-opacity-10 bg-[var(--bg-panel)] flex gap-4">
                            <button
                                onClick={() => setEditingUnit(null)}
                                className="flex-1 bg-[var(--text-base)] text-[var(--bg-panel)] py-5 font-mono text-[11px] uppercase font-black shadow-[8px_8px_0px_0px_var(--shadow-color)] hover:translate-y-[-2px] active:translate-y-0 transition-all tracking-widest"
                            >
                                Apply Configuration
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
