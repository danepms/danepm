"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Key, CheckCircle2, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { authClient } from '@/lib/auth-client';
import { useToast } from '@/context/ToastContext';
import { SetupTerminal } from '@/components/SetupTerminal';
import { PublicHeader } from '@/components/PublicHeader';
import { useTheme } from '@/context/ThemeContext';

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { theme } = useTheme();
  const { showToast } = useToast();
  
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check for token on mount
  const token = searchParams.get('token');

  useEffect(() => {
    if (!token) {
      setError("This reset link seems to be missing something. Could you request a new one?");
    }
  }, [token]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      setError("Those passwords don't quite match. Could you check them?");
      return;
    }

    if (password.length < 8) {
      setError("Your new password should be at least 8 characters long.");
      return;
    }

    setLoading(true);
    setError(null);

    const { error: authError } = await authClient.resetPassword({
      newPassword: password,
    });

    setLoading(false);

    if (authError) {
      setError("Something went wrong while updating your password. The link might have expired.");
      showToast("Reset failed. Please try again.", 'error');
    } else {
      setIsSuccess(true);
      showToast("Success! Your password is updated.", 'success');
      setTimeout(() => {
        router.push('/auth?mode=login');
      }, 3000);
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
        <PublicHeader title="Reset Password" />

        <div className="max-w-xl w-full mx-auto flex-1 reveal-step flex flex-col justify-center p-6 md:px-16">
          <div className="space-y-10">
            {isSuccess ? (
              <div className="space-y-8 animate-reveal">
                <div className="w-16 h-16 bg-[var(--accent-bg)] text-[var(--accent-text)] rounded-2xl flex items-center justify-center">
                  <CheckCircle2 size={32} />
                </div>
                <div>
                  <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter mb-4 leading-none text-[var(--text-base)]">
                    You're back in.
                  </h1>
                  <p className="text-sm font-mono text-[var(--text-muted)] uppercase font-medium leading-relaxed">
                    Your password has been updated securely. Redirecting you to sign in now...
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-10">
                <div>
                  <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter mb-4 leading-none text-[var(--text-base)]">
                    New beginnings.
                  </h1>
                  <p className="text-sm font-mono text-[var(--text-muted)] uppercase font-medium">
                    Choose a strong new password to secure your account.
                  </p>
                </div>

                <form className="space-y-6" onSubmit={onSubmit}>
                  <div className="space-y-4">
                    <div>
                      <label className="text-[10px] font-mono text-[var(--text-muted)] uppercase mb-3 block font-bold">New Password</label>
                      <div className="relative group">
                        <div className="absolute left-5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] group-focus-within:text-[var(--accent-bg)] transition-colors">
                          <Key size={18} />
                        </div>
                        <input 
                          type={showPassword ? "text" : "password"}
                          placeholder="Min. 8 characters" 
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                          disabled={!token}
                          className="w-full bg-[var(--bg-input)] border border-[var(--border)] text-[var(--text-base)] p-4 pl-14 font-mono text-lg focus:ring-2 focus:ring-[var(--accent-bg)] outline-none rounded-lg transition-all shadow-sm disabled:opacity-50" 
                        />
                        <button 
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-base)] transition-colors"
                        >
                          {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] font-mono text-[var(--text-muted)] uppercase mb-3 block font-bold">Confirm New Password</label>
                      <div className="relative group">
                        <div className="absolute left-5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] group-focus-within:text-[var(--accent-bg)] transition-colors">
                          <Key size={18} />
                        </div>
                        <input 
                          type={showPassword ? "text" : "password"}
                          placeholder="Repeat new password" 
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          required
                          disabled={!token}
                          className="w-full bg-[var(--bg-input)] border border-[var(--border)] text-[var(--text-base)] p-4 pl-14 font-mono text-lg focus:ring-2 focus:ring-[var(--accent-bg)] outline-none rounded-lg transition-all shadow-sm disabled:opacity-50" 
                        />
                      </div>
                    </div>
                  </div>

                  {error && (
                    <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-[10px] font-mono uppercase font-bold animate-reveal">
                      {error}
                    </div>
                  )}

                  <button 
                    disabled={loading || !token} 
                    type="submit" 
                    className="w-full bg-[var(--accent-bg)] text-[var(--accent-text)] font-extrabold font-mono text-base uppercase py-4 shadow-[6px_6px_0px_0px_var(--shadow-color)] active:translate-y-1 active:shadow-none transition-all flex justify-center items-center gap-3 rounded-lg hover:opacity-90 disabled:opacity-50"
                  >
                    {loading ? "Updating..." : "Update Password"} <ArrowRight size={20} />
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
