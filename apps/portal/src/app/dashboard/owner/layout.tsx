"use client";

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { OwnerDashboard } from '@/components/OwnerDashboard';
import { useSession, signOut } from '@/lib/auth-client';
import { useToast } from '@/context/ToastContext';
import { useTheme } from '@/context/ThemeContext';

export default function OwnerLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const { showToast } = useToast();
  const { theme } = useTheme();

  useEffect(() => {
    if (isPending) return;

    if (!session) {
      router.push('/auth');
      return;
    }

    const role = (session.user as any).role;
    if (role !== 'owner') {
       router.push('/dashboard');
    }
  }, [session, isPending, router]);

  const handleLogout = async () => {
    await signOut();
    showToast("Successfully logged out.", "info");
    router.push('/auth');
  };

  // Ensure consistent hook count by not returning early
  const shouldRender = !isPending && !!session;

  return (
    <div className={theme === 'dark' ? 'theme-dark' : ''}>
      {shouldRender ? (
        <OwnerDashboard 
          user={session.user}
          onLogout={handleLogout}
        >
          {children}
        </OwnerDashboard>
      ) : (
        <div className="min-h-screen bg-black flex items-center justify-center">
            <div className="w-10 h-10 border-4 border-[var(--accent-bg)] border-t-transparent rounded-full animate-spin" />
        </div>
      )}
    </div>
  );
}
