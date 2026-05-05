"use client";

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { LandingPage } from '@/components/LandingPage';
import { PublicHeader } from '@/components/PublicHeader';
import { PublicFooter } from '@/components/PublicFooter';
import { useSession } from '@/lib/auth-client';
import { useTheme } from '@/context/ThemeContext';

export default function RootPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const { theme } = useTheme();

  // If logged in, go straight to dashboard
  useEffect(() => {
    if (session) {
      router.push('/dashboard');
    }
  }, [session, router]);

  return (
    <div 
      className={`min-h-screen font-sans flex flex-col transition-none ${theme === 'dark' ? 'theme-dark' : ''}`}
      style={{ backgroundColor: 'var(--bg-base)', color: 'var(--text-base)' }}
    >
      <div className="w-full flex-1 flex flex-col relative min-h-screen z-10">
        <PublicHeader />
        <main className="max-w-7xl w-full mx-auto flex-1 flex flex-col justify-center p-6 md:px-16 pb-20">
          <LandingPage onStart={() => router.push('/auth?mode=signup')} />
        </main>
        <PublicFooter />
      </div>
    </div>
  );
}


