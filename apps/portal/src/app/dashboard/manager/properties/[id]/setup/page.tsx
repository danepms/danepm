"use client";

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Sun, Moon, X } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';
import { api } from '@/lib/api';
import { useToast } from '@/context/ToastContext';
import { useSession } from '@/lib/auth-client';

// Components
import { MasterSetup } from './components/MasterSetup';
import { BillingHub } from './components/BillingHub';
import { MoveInFees } from './components/MoveInFees';
import { Success } from './components/Success';

export default function PropertySetupPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const { showToast } = useToast();

  const [property, setProperty] = useState<any>(null);
  const { theme, toggleTheme } = useTheme();
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  const TOTAL_STEPS = 3;

  const [rents, setRents] = useState<any>({});
  const [utilities, setUtilities] = useState({ 
    electricity: 'token', electricityPrice: '', 
    water: 'extra', waterPrice: '' 
  });
  const [recurring, setRecurring] = useState([{ id: 1, name: 'Garbage Collection', amount: '', frequency: '1' }]);
  const [oneTime, setOneTime] = useState([{ id: 1, name: 'Security Deposit', amount: '' }]);
  const [units, setUnits] = useState<any[]>([]);
  const [layoutConfig, setLayoutConfig] = useState<{ floors: number | string, unitsPerFloor: number | string, convention: string }>({
    floors: '',
    unitsPerFloor: '',
    convention: 'alphanumeric',
  });
  
  const [tenants, setTenants] = useState<any[]>([]);

  const { data: session, isPending: isSessionPending } = useSession();
  
  useEffect(() => {
    if (isSessionPending || !session) return;
    const fetchProperty = async () => {
      const res = await api.get<any>(`/properties/${id}?managerId=${session.user.id}`);
      if (res.success && res.property) {
        setProperty(res.property);
        const resUnits = JSON.parse(res.property.residentialUnits || '{}');
        const comUnits = JSON.parse(res.property.commercialUnits || '{}');
        
        const initialRents: Record<string, number[]> = {};
        Object.keys(resUnits).forEach(k => initialRents[k] = [parseInt(resUnits[k].rent) || 0]);
        Object.keys(comUnits).forEach(k => initialRents[k] = [parseInt(comUnits[k].rent) || 0]);
        setRents(initialRents);
      } else {
        showToast("Property not found", "error");
        router.push('/dashboard/manager/properties');
      }
      setIsLoading(false);
    };
    fetchProperty();
  }, [id, router, showToast, session, isSessionPending]);

  const handleNext = () => {
    if (step < TOTAL_STEPS) {
      setStep(prev => prev + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      finalizeSetup();
    }
  };

  const finalizeSetup = async () => {
    setIsSaving(true);
    const config = {
      rents, utilities, recurring, oneTime,
      units: units.map(u => ({ 
        ...u,
        rent: u.rent || u.rentOverride || "0"
      })),
      tenants, layout: layoutConfig
    };

    const res = await api.post<any>(`/properties/${id}/setup`, config);
    if (res.success) setStep(4);
    else showToast("Failed to save configuration", "error");
    setIsSaving(false);
  };

  const renderProgressBar = () => {
    const blocks = [];
    for (let i = 1; i <= TOTAL_STEPS; i++) blocks.push(i <= step ? '█' : '░');
    return `[${blocks.join('')}]`;
  };

  if (isLoading) return null;

  return (
    <div className={`min-h-screen font-sans bg-[var(--bg-base)] text-[var(--text-base)] selection:bg-[var(--accent-bg)] selection:text-[var(--accent-text)] flex flex-col transition-colors duration-500`}>
      
      <div className="w-full max-w-4xl mx-auto p-4 md:p-8 flex flex-col relative min-h-screen">
        <div className="flex items-center justify-between border-b border-[var(--border)] border-opacity-10 pb-4 mb-6 shrink-0">
          <div className="font-mono text-[10px] text-[var(--text-muted)] uppercase tracking-widest flex items-center gap-3">
            <span className="w-6 h-6 border border-[var(--border)] border-opacity-20 flex items-center justify-center bg-[var(--bg-panel)] text-[var(--text-base)] font-black">0{step < 4 ? step : 3}</span>
            <span>Step <span className="mx-1 opacity-20">/</span> 0{TOTAL_STEPS}</span>
            <span className="hidden sm:inline-block tracking-tighter opacity-30 ml-2 font-black">{renderProgressBar()}</span>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={toggleTheme} className="flex items-center gap-2 px-3 py-1 border border-[var(--border)] border-opacity-10 hover:border-opacity-40 transition-all font-mono text-[9px] uppercase text-[var(--text-muted)] rounded-sm">
              {theme === 'dark' ? <Sun size={12} /> : <Moon size={12} />}
              <span>{theme}</span>
            </button>
            <button onClick={() => router.push('/dashboard/manager/properties')} className="flex items-center gap-1 font-mono text-[9px] uppercase text-[var(--text-muted)] hover:text-red-500 transition-colors"><X size={12} /> Exit</button>
          </div>
        </div>

        <div key={`step-${step}`} className="w-full mx-auto flex-1 animate-reveal pb-8">
          {step === 1 && (
            <MasterSetup 
                propertyId={id}
                property={property}
                layoutConfig={layoutConfig} 
                setLayoutConfig={setLayoutConfig} 
                units={units} 
                setUnits={setUnits} 
                tenants={tenants} 
                setTenants={setTenants} 
                rents={rents} 
                setRents={setRents} 
                onNext={handleNext} 
            />
          )}
          {step === 2 && <BillingHub utilities={utilities} setUtilities={setUtilities} recurring={recurring} setRecurring={setRecurring} onNext={handleNext} onBack={() => setStep(1)} />}
          {step === 3 && (
            <MoveInFees units={units} rents={rents} oneTime={oneTime} setOneTime={setOneTime} onNext={finalizeSetup} onBack={() => setStep(2)} />
          )}
          {step === 4 && <Success property={property} units={units} tenants={tenants} recurring={recurring} utilities={utilities} />}
        </div>
      </div>
    </div>
  );
}
