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

    if (role === 'admin') {
      router.replace('/dashboard/admin');
    } else if (role === 'tenant') {
      router.replace('/dashboard/tenant');
    } else if (role === 'owner') {
      router.replace('/dashboard/owner');
    } else {
      router.replace('/dashboard/manager/properties');
    }
  }, [session, isPending, router]);

  if (isPending) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#0a0a0c] font-sans">
        <div className="relative">
          {/* Animated rings */}
          <div className="w-24 h-24 border-2 border-indigo-500/20 rounded-full animate-[ping_2s_linear_infinite]" />
          <div className="absolute inset-0 w-24 h-24 border-t-2 border-indigo-500 rounded-full animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
             <div className="w-12 h-12 bg-indigo-500 rounded-xl flex items-center justify-center shadow-[0_0_30px_rgba(99,102,241,0.4)]">
                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
             </div>
          </div>
        </div>
        
        <div className="mt-12 text-center space-y-3">
          <h2 className="text-white font-black text-2xl uppercase tracking-tighter italic animate-pulse">
            One moment...
          </h2>
          <div className="flex items-center gap-2 justify-center">
            <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.3s]" />
            <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
            <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce" />
          </div>
          <p className="font-mono text-[10px] text-indigo-500/50 uppercase font-bold tracking-[0.3em] mt-4">
            Getting things ready
          </p>
        </div>
      </div>
    );
  }

  return null;
}
