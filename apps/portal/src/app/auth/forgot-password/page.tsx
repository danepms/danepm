"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ArrowRight, Mail, CheckCircle2 } from 'lucide-react';
import { authClient } from '@/lib/auth-client';
import { useToast } from '@/context/ToastContext';
import { SetupTerminal } from '@/components/SetupTerminal';
import { PublicHeader } from '@/components/PublicHeader';
import { useTheme } from '@/context/ThemeContext';
import Link from 'next/link';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const { theme } = useTheme();
  const { showToast } = useToast();
  
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // @ts-ignore
    const { error: authError } = await authClient.forgetPassword({
      email,
      redirectTo: "/auth/reset-password",
    });

    setLoading(false);

    if (authError) {
      setError("We couldn't process that request. Is the email address correct?");
      showToast("Something went wrong. Please try again.", 'error');
    } else {
      setIsSent(true);
      showToast("Reset link sent! Check your inbox.", 'success');
    }
  };

  return (
    <div 
      className={`min-h-screen font-sans flex flex-col md:flex-row transition-none ${theme === 'dark' ? 'theme-dark' : ''}`}
      style={{ backgroundColor: 'var(--bg-base)', color: 'var(--text-base)' }}
    >
      <SetupTerminal 
        mode="login" 
        signupRole={null} 
        wizardStep={1} 
        wizardData={{}} 
      />

      <div className="w-full md:w-2/3 p-0 flex flex-col relative min-h-screen overflow-y-auto z-10">
        <PublicHeader title="Forgot Password" />

        <div className="max-w-xl w-full mx-auto flex-1 reveal-step flex flex-col justify-center p-6 md:px-16">
          <div className="space-y-10">
            <Link 
              href="/auth" 
              className="text-[10px] font-mono text-[var(--text-muted)] uppercase font-bold hover:text-[var(--text-base)] flex items-center gap-2 mb-4"
            >
              <ArrowLeft size={14} /> Back to Sign In
            </Link>

            {isSent ? (
              <div className="space-y-8 animate-reveal">
                <div className="w-16 h-16 bg-green-500/10 text-green-500 rounded-2xl flex items-center justify-center">
                  <CheckCircle2 size={32} />
                </div>
                <div>
                  <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter mb-4 leading-none text-[var(--text-base)]">
                    Check your email.
                  </h1>
                  <p className="text-sm font-mono text-[var(--text-muted)] uppercase font-medium leading-relaxed">
                    We've sent a secure reset link to <span className="text-[var(--text-base)]">{email}</span>. 
                    It should arrive in a few seconds.
                  </p>
                </div>
                <button 
                  onClick={() => setIsSent(false)}
                  className="text-[10px] font-mono uppercase font-bold text-[var(--accent-bg)] hover:underline"
                >
                  Didn't get it? Try again
                </button>
              </div>
            ) : (
              <div className="space-y-10">
                <div>
                  <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter mb-4 leading-none text-[var(--text-base)]">
                    Lost your way?
                  </h1>
                  <p className="text-sm font-mono text-[var(--text-muted)] uppercase font-medium">
                    No worries. Enter your email and we'll send you a link to get back in.
                  </p>
                </div>

                <form className="space-y-8" onSubmit={onSubmit}>
                  <div>
                    <label className="text-[10px] font-mono text-[var(--text-muted)] uppercase mb-3 block font-bold">Email Address</label>
                    <div className="relative group">
                      <div className="absolute left-5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] group-focus-within:text-[var(--accent-bg)] transition-colors">
                        <Mail size={18} />
                      </div>
                      <input 
                        type="email"
                        placeholder="hello@email.com" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="w-full bg-[var(--bg-input)] border border-[var(--border)] text-[var(--text-base)] p-4 pl-14 font-mono text-lg focus:ring-2 focus:ring-[var(--accent-bg)] outline-none rounded-lg transition-all shadow-sm" 
                      />
                    </div>
                  </div>

                  {error && (
                    <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-[10px] font-mono uppercase font-bold animate-reveal">
                      {error}
                    </div>
                  )}

                  <button disabled={loading} type="submit" className="w-full bg-[var(--accent-bg)] text-[var(--accent-text)] font-extrabold font-mono text-base uppercase py-4 shadow-[6px_6px_0px_0px_var(--shadow-color)] active:translate-y-1 active:shadow-none transition-all flex justify-center items-center gap-3 rounded-lg hover:opacity-90 disabled:opacity-50">
                    {loading ? "Sending..." : "Send Reset Link"} <ArrowRight size={20} />
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
