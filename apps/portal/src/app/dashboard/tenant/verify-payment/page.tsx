"use client";

import React, { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { api } from '@/lib/api';
import { CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

function VerifyPaymentContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'verifying' | 'success' | 'failed'>('verifying');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const reference = searchParams.get('reference');
    if (!reference) {
      setStatus('failed');
      setErrorMsg('No payment reference found.');
      return;
    }

    const verify = async () => {
      try {
        const res = await api.get<any>(`/portal/paystack/verify?reference=${reference}`);
        if (res.success) {
          setStatus('success');
          setTimeout(() => {
            router.push('/dashboard/tenant');
          }, 3000);
        } else {
          setStatus('failed');
          setErrorMsg(res.error || 'Verification failed on server.');
        }
      } catch (err) {
        setStatus('failed');
        setErrorMsg('Network error during verification.');
      }
    };

    verify();
  }, [searchParams, router]);

  return (
    <div className="h-screen w-full max-w-md mx-auto bg-[var(--bg-base)] text-[var(--text-base)] flex flex-col items-center justify-center p-8">
      {status === 'verifying' && (
        <div className="flex flex-col items-center animate-pulse">
          <Loader2 size={48} className="animate-spin text-[var(--accent-bg)] mb-6" />
          <h2 className="text-2xl font-black uppercase tracking-tighter">Verifying Payment...</h2>
          <p className="font-mono text-[10px] text-[var(--text-muted)] uppercase mt-2">Please wait, contacting payment gateway</p>
        </div>
      )}

      {status === 'success' && (
        <div className="flex flex-col items-center animate-in zoom-in-95 duration-500">
          <div className="w-24 h-24 bg-emerald-500 text-white rounded-full flex items-center justify-center shadow-[0_0_40px_rgba(16,185,129,0.3)] mb-6">
            <CheckCircle2 size={48} />
          </div>
          <h2 className="text-3xl font-black uppercase tracking-tighter text-emerald-500">Payment Cleared!</h2>
          <p className="font-mono text-[10px] text-[var(--text-muted)] uppercase mt-2 mb-8 text-center">Your account balance has been updated immediately.</p>
          <p className="font-mono text-[8px] opacity-50 uppercase">Redirecting to Dashboard...</p>
        </div>
      )}

      {status === 'failed' && (
        <div className="flex flex-col items-center animate-in zoom-in-95 duration-500">
          <div className="w-24 h-24 bg-red-500 text-white rounded-3xl flex items-center justify-center shadow-[0_0_40px_rgba(239,68,68,0.3)] mb-6">
            <AlertCircle size={48} />
          </div>
          <h2 className="text-3xl font-black uppercase tracking-tighter text-red-500">Verification Failed</h2>
          <p className="font-mono text-[10px] text-red-500/70 uppercase mt-2 mb-8 text-center">{errorMsg}</p>
          <button 
            onClick={() => router.push('/dashboard/tenant')}
            className="px-8 py-4 bg-[var(--bg-panel)] border border-[var(--border)] rounded-lg font-mono text-[10px] uppercase font-black"
          >
            Return to Dashboard
          </button>
        </div>
      )}
    </div>
  );
}

export default function VerifyPaymentPage() {
  return (
    <Suspense fallback={<div className="h-screen flex items-center justify-center font-mono text-[10px] uppercase">Loading...</div>}>
      <VerifyPaymentContent />
    </Suspense>
  );
}
