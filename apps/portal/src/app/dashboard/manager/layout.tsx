"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { ManagerDashboard } from '@/components/ManagerDashboard';
import { useSession, signOut } from '@/lib/auth-client';
import { useToast } from '@/context/ToastContext';
import { useTheme } from '@/context/ThemeContext';
import { api } from '@/lib/api';

export default function ManagerLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session, isPending } = useSession();
  const { showToast } = useToast();
  const { theme } = useTheme();

  const [hasProperties, setHasProperties] = useState(true); // Default to true to prevent flash
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    if (isPending) return;

    if (!session) {
      router.push('/auth');
      return;
    }

    const checkProperties = async () => {
      setIsChecking(true);
      const res = await api.get<any>(`/properties/count?managerId=${session.user.id}`);
      if (res.success) {
        const count = res.count;
        setHasProperties(count > 0);
        
        if (count === 0 && pathname !== '/dashboard/manager/properties/new') {
          showToast("Access Restricted: Please onboard your first property to continue.", "info");
          router.push('/dashboard/manager/properties/new');
        }
      }
      setIsChecking(false);
    };

    checkProperties();
  }, [session, isPending, router, pathname, showToast]);

  const handleLogout = async () => {
    await signOut();
    showToast("Successfully logged out.", "info");
    router.push('/auth');
  };

  const handleUnlock = () => {
    router.push('/dashboard/manager/properties/new');
  };

  if (isPending || !session) return null;

  return (
    <div className={theme === 'dark' ? 'theme-dark' : ''}>
      <ManagerDashboard 
        user={session.user}
        onLogout={handleLogout}
        hasProperties={hasProperties}
        onUnlock={handleUnlock}
      >
        {children}
      </ManagerDashboard>
    </div>
  );
}
