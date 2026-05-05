"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { AuthFlow } from '@/components/AuthFlow';
import { SetupTerminal } from '@/components/SetupTerminal';
import { PublicHeader } from '@/components/PublicHeader';
import { useSession } from '@/lib/auth-client';
import { useTheme } from '@/context/ThemeContext';

export default function AuthPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session } = useSession();
  const { theme } = useTheme();
  
  const [view, setView] = useState<'login' | 'signup'>('login');
  const [signupRole, setSignupRole] = useState<'manager' | 'owner' | 'tenant' | null>(null);

  // Sync view from query param if present
  useEffect(() => {
    const mode = searchParams.get('mode');
    if (mode === 'signup') setView('signup');
    else setView('login');
  }, [searchParams]);

  // If already logged in, go to dashboard
  useEffect(() => {
    if (session) {
      router.push('/dashboard');
    }
  }, [session, router]);

  const handleAuthSuccess = () => {
    router.refresh(); 
  };

  return (
    <div 
      className={`min-h-screen font-sans flex flex-col md:flex-row transition-none ${theme === 'dark' ? 'theme-dark' : ''}`}
      style={{ backgroundColor: 'var(--bg-base)', color: 'var(--text-base)' }}
    >
      <SetupTerminal 
        mode={view} 
        signupRole={signupRole} 
        wizardStep={1} 
        wizardData={{}} 
      />

      <div className="w-full md:w-2/3 p-0 flex flex-col relative min-h-screen overflow-y-auto z-10">
        <PublicHeader title={view} />

        <div className="max-w-xl w-full mx-auto flex-1 reveal-step flex flex-col justify-center p-6 md:px-16">
          <AuthFlow 
            view={view} 
            setView={(v) => setView(v as any)} 
            handleSignInSuccess={handleAuthSuccess} 
            handleSignupSuccess={handleAuthSuccess}
            signupRole={signupRole}
            setSignupRole={setSignupRole}
          />
        </div>
      </div>
    </div>
  );
}

