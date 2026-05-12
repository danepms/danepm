"use client";

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useSession } from '@/lib/auth-client';
import { api } from '@/lib/api';
import { Shield, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';

export default function InvitePage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const { data: session, isPending } = useSession();
  
  const [inviteData, setInviteData] = useState<any>(null);
  const [inviter, setInviter] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAccepting, setIsAccepting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadInvite() {
      const res = await api.get<any>(`/invites/${id}`);
      if (res.success) {
        setInviteData(res.invite);
        setInviter(res.inviter);
      } else {
        setError(res.message || "Invalid invite");
      }
      setIsLoading(false);
    }
    loadInvite();
  }, [id]);

  const handleAccept = async () => {
    if (!session) {
      // Redirect to login, but keep the invite ID in callback
      router.push(`/auth?callbackUrl=/invite/${id}`);
      return;
    }

    setIsAccepting(true);
    const res = await api.post<any>(`/invites/accept`, { 
      inviteId: id,
      userId: session.user.id, 
      userEmail: session.user.email 
    });
    if (res.success) {
      // Redirect to the appropriate dashboard
      router.push(`/dashboard/${res.role}`);
    } else {
      setError(res.message || "Failed to accept invite");
      setIsAccepting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[var(--bg-base)] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-[var(--accent-bg)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[var(--bg-base)] flex items-center justify-center p-6">
        <div className="bg-[var(--bg-panel)] border border-red-500 border-opacity-20 p-12 text-center max-w-lg shadow-[24px_24px_0px_0px_rgba(239,68,68,0.1)]">
          <AlertCircle size={48} className="text-red-500 mx-auto mb-6" />
          <h2 className="text-3xl font-black uppercase tracking-tighter mb-4">Invite Error</h2>
          <p className="font-mono text-xs text-[var(--text-muted)] uppercase mb-10">{error}</p>
          <button onClick={() => router.push('/')} className="w-full py-4 bg-[var(--text-base)] text-[var(--bg-panel)] font-mono text-[11px] uppercase font-black tracking-widest">Return Home</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg-base)] flex items-center justify-center p-6">
      <div className="bg-[var(--bg-panel)] border border-[var(--border)] border-opacity-10 p-12 max-w-xl w-full shadow-[32px_32px_0px_0px_var(--shadow-color)] animate-reveal">
        <div className="w-16 h-16 bg-[var(--accent-bg)] text-white rounded-2xl flex items-center justify-center shadow-xl mb-10">
          <Shield size={32} />
        </div>

        <h1 className="text-4xl font-black uppercase tracking-tighter leading-none mb-6">
          {inviter?.name || "A Manager"} has invited you
        </h1>
        
        <p className="font-mono text-xs text-[var(--text-muted)] uppercase tracking-widest mb-10 leading-relaxed">
          You have been invited to join <span className="text-[var(--text-base)] font-black">DanePMS</span> as a <span className="text-[var(--accent-bg)] font-black">{inviteData.role}</span>.
          {inviteData.role === 'owner' && " This will grant you overwatch access to property financials and occupancy."}
        </p>

        <div className="space-y-4">
          <button 
            onClick={handleAccept}
            disabled={isAccepting}
            className="w-full py-5 bg-[var(--text-base)] text-[var(--bg-panel)] font-mono text-[12px] uppercase font-black tracking-widest flex items-center justify-center gap-3 hover:bg-[var(--accent-bg)] hover:text-white transition-all shadow-[8px_8px_0px_0px_var(--shadow-color)] group"
          >
            {isAccepting ? "Processing..." : (
              <>
                {session ? "Accept Invitation" : "Sign in to Accept"}
                <ArrowRight size={18} className="group-hover:translate-x-2 transition-transform" />
              </>
            )}
          </button>
          
          <div className="flex items-center gap-2 pt-6 opacity-50 justify-center">
            <CheckCircle2 size={14} />
            <span className="font-mono text-[9px] uppercase font-bold tracking-widest">Secure Smart Link</span>
          </div>
        </div>
      </div>
    </div>
  );
}
