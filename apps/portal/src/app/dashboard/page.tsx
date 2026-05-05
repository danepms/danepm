"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from '@/lib/auth-client';

export default function DashboardPage() {
  const router = useRouter();
  const { data: session, isPending } = useSession();

  useEffect(() => {
    if (isPending) return;

    if (!session) {
      router.replace('/auth');
      return;
    }

    const role = (session.user as any).role || 'manager';

    if (role === 'tenant') {
      router.replace('/dashboard/tenant');
    } else if (role === 'owner') {
      router.replace('/dashboard/owner');
    } else {
      router.replace('/dashboard/manager/properties');
    }
  }, [session, isPending, router]);

  return null;
}
