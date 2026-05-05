"use client";

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Sun, Moon, X } from 'lucide-react';
import { getPropertyById, completePropertySetup } from '@/app/actions';
import { useToast } from '@/context/ToastContext';
import { useSession } from '@/lib/auth-client';

// Components
import { SetupTerminal } from './components/SetupTerminal';
import { LayoutMapping } from './components/LayoutMapping';
import { BaseRent } from './components/BaseRent';
import { BillingHub } from './components/BillingHub';
import { MoveInFees } from './components/MoveInFees';
import { Occupancy } from './components/Occupancy';
import { Success } from './components/Success';

export default function PropertySetupPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const { showToast } = useToast();

  const [property, setProperty] = useState<any>(null);
  const [theme, setTheme] = useState('light');
  const [step, setStep] = useState(1);
  const [terminalOverride, setTerminalOverride] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  const TOTAL_STEPS = 5;

  const [rents, setRents] = useState<any>({});
  const [utilities, setUtilities] = useState({ 
    electricity: 'token', electricityPrice: '', 
    water: 'extra', waterPrice: '' 
  });
  const [recurring, setRecurring] = useState([{ id: 1, name: 'Garbage Collection', amount: '', frequency: '1' }]);
  const [oneTime, setOneTime] = useState([{ id: 1, name: 'Security Deposit', amount: '' }]);
  const [units, setUnits] = useState<any[]>([]);
  const [layoutConfig, setLayoutConfig] = useState({
    floors: 1,
    unitsPerFloor: 10,
    convention: 'alphanumeric',
  });
  
  const [tenants, setTenants] = useState<any[]>([
    { id: 't1', name: 'Alice Wambui', phone: '0711223344', arrears: 0, unitId: null },
    { id: 't2', name: 'Brian Ochieng', phone: '0722334455', arrears: 5000, unitId: null },
    { id: 't3', name: 'Catherine Mutua', phone: '0733445566', arrears: 0, unitId: null },
  ]);

  const [quickMode, setQuickMode] = useState(false);
  const [activeUnit, setActiveUnit] = useState<any>(null);
  const [assignTab, setAssignTab] = useState<'existing' | 'new'>('existing');
  const [newTenant, setNewTenant] = useState({
    name: '', phone: '', nextOfKin: '', idNumber: '', hasArrears: false, arrearsAmount: ''
  });

  const { data: session, isPending: isSessionPending } = useSession();
  
  useEffect(() => {
    if (isSessionPending || !session) return;
    const fetchProperty = async () => {
      const res = await getPropertyById(id, session.user.id);
      if (res.success && res.property) {
        setProperty(res.property);
        const resUnits = JSON.parse(res.property.residentialUnits || '{}');
        const comUnits = JSON.parse(res.property.commercialUnits || '{}');
        
        const initialRents: any = {};
        Object.keys(resUnits).forEach(k => initialRents[k] = '');
        Object.keys(comUnits).forEach(k => initialRents[k] = '');
        setRents(initialRents);
      } else {
        showToast("Property not found", "error");
        router.push('/dashboard/manager/properties');
      }
      setIsLoading(false);
    };
    fetchProperty();
  }, [id, router, showToast, session, isSessionPending]);

  const autoGenerateLayout = () => {
    const floorLetters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    let newUnits: any[] = [];
    
    // We use the first rent type as default for auto-gen
    const defaultType = Object.keys(rents)[0] || 'Unit';

    for (let f = 1; f <= layoutConfig.floors; f++) {
      for (let u = 1; u <= layoutConfig.unitsPerFloor; u++) {
        let name = "";
        if (layoutConfig.convention === 'alphanumeric') {
            name = `${floorLetters[(f-1)%26]}${u}`;
        } else if (layoutConfig.convention === 'numeric') {
            name = `${f}${u.toString().padStart(2, '0')}`;
        } else {
            name = `Unit ${f}-${u}`;
        }

        newUnits.push({
          id: `unit-${Date.now()}-${f}-${u}`,
          typeId: defaultType,
          category: 'residential',
          name: name,
          floor: f,
          status: 'vacant',
          tenantId: null
        });
      }
    }
    setUnits(newUnits);
    setTerminalOverride(`> Generated ${newUnits.length} units across ${layoutConfig.floors} floors.`);
  };

  const handleNext = () => {
    if (step < TOTAL_STEPS) {
      setStep(prev => prev + 1);
      setTerminalOverride(null);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      finalizeSetup();
    }
  };

  const finalizeSetup = async () => {
    setIsSaving(true);
    const config = {
      rents, utilities, recurring, oneTime,
      units: units.map(u => ({ id: u.id, name: u.name, floor: u.floor, typeId: u.typeId, category: u.category, status: u.status, tenantId: u.tenantId })),
      tenants, layout: layoutConfig
    };

    const res = await completePropertySetup(id, config);
    if (res.success) setStep(6);
    else showToast("Failed to save configuration", "error");
    setIsSaving(false);
  };

  const getTenantName = (tid: string | null) => {
    if (!tid) return 'Vacant';
    return tenants.find(t => t.id === tid)?.name || 'Unknown';
  };

  const renderProgressBar = () => {
    const blocks = [];
    for (let i = 1; i <= TOTAL_STEPS; i++) blocks.push(i <= step ? '█' : '░');
    return `[${blocks.join('')}]`;
  };

  if (isLoading) return null;

  return (
    <div className={`min-h-screen font-sans bg-[var(--bg-base)] text-[var(--text-base)] selection:bg-[var(--accent-bg)] selection:text-[var(--accent-text)] flex flex-col transition-colors duration-300 ${theme === 'dark' ? 'theme-dark' : ''}`}>
      
      <div className="w-full max-w-6xl mx-auto p-6 md:p-12 lg:p-16 flex flex-col relative min-h-screen">
        <div className="flex items-center justify-between border-b border-[var(--border)] pb-6 mb-10 shrink-0">
          <div className="font-mono text-[10px] text-[var(--text-muted)] uppercase tracking-widest flex items-center gap-4">
            <span className="w-6 h-6 border border-[var(--border)] flex items-center justify-center bg-[var(--bg-panel)] text-[var(--text-base)] font-bold">0{step < 6 ? step : 5}</span>
            <span>Step <span className="mx-1 text-[var(--text-muted)] opacity-50">/</span> 0{TOTAL_STEPS}</span>
            <span className="hidden sm:inline-block tracking-widest text-[var(--text-muted)] ml-2">{renderProgressBar()}</span>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={() => setTheme(t => t === 'dark' ? 'light' : 'dark')} className="flex items-center gap-2 px-3 py-1.5 border border-[var(--border)] hover:bg-[var(--accent-bg)] hover:text-[var(--accent-text)] transition-colors group font-mono text-[10px] uppercase text-[var(--text-muted)]">
              {theme === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
              <span className="hidden sm:inline-block">{theme} MODE</span>
            </button>
            <button onClick={() => router.push('/dashboard/manager/properties')} className="flex items-center gap-1 font-mono text-[10px] uppercase text-[var(--text-muted)] hover:text-red-500 transition-colors"><X size={14} /> Exit</button>
          </div>
        </div>

        <div key={`step-${step}`} className="w-full mx-auto flex-1 reveal-step pb-12">
          {step === 1 && (
            <LayoutMapping 
                layoutConfig={layoutConfig} 
                setLayoutConfig={setLayoutConfig} 
                units={units} 
                setUnits={setUnits} 
                autoGenerateLayout={autoGenerateLayout} 
                onNext={handleNext} 
                rents={rents}
                setRents={setRents}
                tenants={tenants}
                setTenants={setTenants}
                getTenantName={getTenantName}
            />
          )}
          {step === 2 && <BaseRent rents={rents} setRents={setRents} onNext={handleNext} onBack={() => setStep(1)} />}
          {step === 3 && <BillingHub utilities={utilities} setUtilities={setUtilities} recurring={recurring} setRecurring={setRecurring} onNext={handleNext} onBack={() => setStep(2)} />}
          {step === 4 && <MoveInFees oneTime={oneTime} setOneTime={setOneTime} onNext={handleNext} onBack={() => setStep(3)} />}
          {step === 5 && (
            <Occupancy 
                units={units} setUnits={setUnits} tenants={tenants} setTenants={setTenants} rents={rents}
                quickMode={quickMode} setQuickMode={setQuickMode} activeUnit={activeUnit} setActiveUnit={setActiveUnit}
                assignTab={assignTab} setAssignTab={setAssignTab} newTenant={newTenant} setNewTenant={setNewTenant}
                onBack={() => setStep(4)} onFinish={finalizeSetup} isSaving={isSaving} getTenantName={getTenantName}
                setTerminalOverride={setTerminalOverride}
            />
          )}
          {step === 6 && <Success units={units} />}
        </div>
      </div>
    </div>
  );
}
