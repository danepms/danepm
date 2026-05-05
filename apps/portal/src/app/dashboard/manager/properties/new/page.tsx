"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { PropertyWizard } from '@/components/PropertyWizard';
import { useSession } from '@/lib/auth-client';
import { useToast } from '@/context/ToastContext';

export default function NewPropertyPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const { showToast } = useToast();
  
  const [wizardStep, setWizardStep] = useState(1);
  const [wizardData, setWizardData] = useState({ 
    name: '', 
    location: '', 
    hasPhoto: false,
    hasResidential: false,
    hasCommercial: false,
    residentialUnits: {},
    commercialUnits: {}
  });

  const handleComplete = () => {
    showToast("Property listed successfully!", "success");
    router.push('/dashboard/manager/properties');
  };

  if (!session) return null;

  return (
    <div className="max-w-4xl mx-auto py-12">
      <PropertyWizard 
        onComplete={handleComplete} 
        userId={session.user.id} 
        wizardStep={wizardStep}
        setWizardStep={setWizardStep}
        formData={wizardData}
        setFormData={setWizardData as any}
      />
    </div>
  );
}
