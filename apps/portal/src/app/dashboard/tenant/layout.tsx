"use client";

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { TenantDashboard } from '@/components/TenantDashboard';
import { useSession, signOut } from '@/lib/auth-client';
import { useToast } from '@/context/ToastContext';
import { useTheme } from '@/context/ThemeContext';

export default function TenantLayout({ children }: { children: React.ReactNode }) {
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

    // Role check
    const role = (session.user as any).role;
    if (role !== 'tenant') {
       router.push('/dashboard');
    }
  }, [session, isPending, router]);

  const handleLogout = async () => {
    await signOut();
    showToast("Successfully logged out.", "info");
    router.push('/auth');
  };

  if (isPending || !session) return null;

  return (
    <div className={theme === 'dark' ? 'theme-dark' : ''}>
      <TenantDashboard 
        user={session.user}
        onLogout={handleLogout}
      >
        {children}
      </TenantDashboard>
    </div>
  );
}
