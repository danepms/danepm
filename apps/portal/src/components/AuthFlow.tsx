"use client";

import React, { useState } from 'react';
import {
  ArrowRight, Eye, EyeOff, Key, Contact,
  Briefcase, Home, User, Check, Fingerprint
} from 'lucide-react';

import { signIn, signUp } from '@/lib/auth-client';
import { useToast } from '@/context/ToastContext';
import Link from 'next/link';

const getAuthErrorMessage = (error: any) => {
  if (!error) return null;

  // Debug log to help identify missing codes
  console.warn("[Auth Error Details]:", error);

  // Try to find a code in all possible locations
  const rawCode = error.code || error.data?.code || error.statusText || error.error || "";
  const code = rawCode.toString().toUpperCase();

  switch (code) {
    case "INVALID_PASSWORD":
    case "WRONG_PASSWORD":
      return "That password doesn't seem right. Would you like to reset it?";
    case "USER_NOT_FOUND":
    case "USER_DOES_NOT_EXIST":
      return "We couldn't find an account with that email address. Did you use a different one?";
    case "INVALID_EMAIL":
      return "That email address doesn't look quite right. Could you check for typos?";
    case "INVALID_EMAIL_OR_PASSWORD":
      return "We couldn't find an account with those details. Please double-check your email and password.";
    case "EMAIL_ALREADY_IN_USE":
    case "USER_ALREADY_EXISTS":
    case "EMAIL_EXISTS":
      return "This email is already registered. Try signing in instead?";
    case "PASSWORD_TOO_SHORT":
    case "VALIDATION_ERROR":
      if (error.message?.toLowerCase().includes("password")) {
        return "Your password is a bit too short. Try making it at least 8 characters.";
      }
      return error.message || "Please check your details and try again.";
    case "UNAUTHORIZED":
      return "We couldn't verify your details. Please try again.";
    case "RATE_LIMIT_EXCEEDED":
      return "Whoa there! You've tried a few too many times. Please wait a bit before trying again.";
    default:
      // If the error object has a usable message string, use it
      if (error.message && typeof error.message === 'string' && error.message.length > 3 && !error.message.includes("[object")) {
        return error.message;
      }
      // If we have a code but no mapping, show the code (better than nothing)
      if (code && code.length > 2) return `Error: ${code.toLowerCase().replace(/_/g, ' ')}`;

      return "Something didn't quite work on our end. Could you try again in a moment?";
  }
};

interface AuthFlowProps {
  view: 'login' | 'signup';
  setView: (view: 'login' | 'signup') => void;
  handleSignInSuccess: (user: any) => void;
  handleSignupSuccess: (user: any) => void;
  signupRole: 'manager' | 'owner' | 'tenant' | null;
  setSignupRole: (role: 'manager' | 'owner' | 'tenant' | null) => void;
}

export const AuthFlow = ({
  view, setView, handleSignInSuccess, handleSignupSuccess,
  signupRole, setSignupRole
}: AuthFlowProps) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isBiometricScanning, setIsBiometricScanning] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { showToast } = useToast();

  const onSubmitLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const { data, error: authError } = await signIn.email({ email, password });
    setLoading(false);
    if (authError) {
      setError(getAuthErrorMessage(authError));
      showToast("Verification failed. Please check your details.", 'error');
    } else {
      showToast("Welcome back!", 'success');
      handleSignInSuccess(data.user);
    }
  };

  const onSubmitPasskey = async () => {
    setIsBiometricScanning(true);
    setError(null);
    const { data, error: authError } = await signIn.passkey();
    setIsBiometricScanning(false);

    if (authError) {
      setError("Biometric sign-in failed or was cancelled.");
      showToast("Passkey verification failed.", 'error');
    } else {
      showToast("Welcome back!", 'success');
      if (data?.user) handleSignInSuccess(data.user);
    }
  };

  const onSubmitSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setError("Your passwords do not match.");
      showToast("Passwords must match to proceed.", 'error');

      return;
    }

    if (!acceptedTerms) {
      setError("Please accept the terms to continue.");
      showToast("You must agree to our terms and privacy policy.", 'error');

      return;
    }

    setLoading(true);
    setError(null);
    const { data, error: authError } = await signUp.email({
      email,
      password,
      name,
      role: signupRole || 'manager'
    });
    setLoading(false);
    if (authError) {
      setError(getAuthErrorMessage(authError));
      showToast("Registration failed. Please check your details.", 'error');
    } else {
      showToast("You're all set! Welcome to the family.", 'success');
      handleSignupSuccess({ ...data.user, role: signupRole });
    }
  };

  return (
    <div className="max-w-xl w-full mx-auto flex-1 reveal-step pb-12 flex flex-col justify-center">
      {view === 'login' && (
        <div className="space-y-10">
          <div>
            <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter mb-4 leading-none text-[var(--text-base)]">
              Welcome back.
            </h1>
            <p className="text-sm font-mono text-[var(--text-muted)] uppercase font-medium">
              We're so happy to have you here. Please sign in below.
            </p>
          </div>

          <form className="space-y-6" onSubmit={onSubmitLogin}>
            <div>
              <label className="text-[10px] font-mono text-[var(--text-muted)] uppercase mb-3 block font-bold">Email Address</label>
              <div className="relative group">
                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] group-focus-within:text-[var(--accent-bg)] transition-colors">
                  <Contact size={18} />
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

            <div>
              <label className="text-[10px] font-mono text-[var(--text-muted)] uppercase mb-3 block font-bold">Password</label>
              <div className="relative group">
                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] group-focus-within:text-[var(--accent-bg)] transition-colors">
                  <Key size={18} />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Your secret code"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full bg-[var(--bg-input)] border border-[var(--border)] text-[var(--text-base)] p-4 pl-14 font-mono text-lg focus:ring-2 focus:ring-[var(--accent-bg)] outline-none rounded-lg transition-all shadow-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-base)] transition-colors"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              <div className="flex justify-end mt-2">
                <Link
                  href="/auth/forgot-password"
                  className="text-[10px] font-mono uppercase font-bold text-[var(--text-muted)] hover:text-[var(--accent-bg)] transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
            </div>

            {error && (
              <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-[10px] font-mono uppercase font-bold animate-reveal">
                Error: {error}
              </div>
            )}

            <button disabled={loading} type="submit" className="w-full bg-[var(--accent-bg)] text-[var(--accent-text)] font-extrabold font-mono text-base uppercase py-4 shadow-[6px_6px_0px_0px_var(--shadow-color)] active:translate-y-1 active:shadow-none transition-all flex justify-center items-center gap-3 rounded-lg hover:opacity-90 disabled:opacity-50">
              {loading ? "Authenticating..." : "Let's Sign In"} <ArrowRight size={20} />
            </button>

            <div className="relative py-4">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-[var(--border)] opacity-20"></div></div>
              <div className="relative flex justify-center text-[10px] font-mono uppercase"><span className="bg-[var(--bg-base)] px-4 text-[var(--text-muted)]">Or use a passkey</span></div>
            </div>

            <button
              type="button"
              onClick={onSubmitPasskey}
              disabled={loading}
              className="w-full bg-[var(--bg-panel)] glass-card border border-[var(--border)] text-[var(--text-base)] font-bold font-mono text-sm uppercase py-4 flex justify-center items-center gap-3 rounded-lg hover:bg-[var(--accent-bg)] hover:text-[var(--accent-text)] transition-all disabled:opacity-50"
            >
              <Fingerprint size={20} /> Sign in with Passkey
            </button>
          </form>

          <p className="text-center font-mono text-[11px] text-[var(--text-muted)] uppercase font-medium">
            Not a member yet? <button onClick={() => setView('signup')} className="text-[var(--accent-bg)] font-bold hover:underline">Create a free account</button>
          </p>
        </div>
      )}

      {view === 'signup' && (
        <div className="space-y-10">
          <div>
            <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter mb-4 leading-none text-[var(--text-base)]">
              Start here.
            </h1>
            <p className="text-sm font-mono text-[var(--text-muted)] uppercase font-medium">
              We're excited to help you get your property journey started.
            </p>
          </div>

          {!signupRole ? (
            <div className="space-y-4 reveal-step">
              <p className="text-[11px] font-mono text-[var(--text-muted)] uppercase font-bold mb-6">First, how will you be using this?</p>

              <button
                onClick={() => setSignupRole('manager')}
                className="w-full group p-6 bg-[var(--bg-panel)] border border-[var(--border)] rounded-xl flex items-center gap-6 hover:border-[var(--accent-bg)] transition-all text-left glass-card"
              >
                <div className="w-14 h-14 bg-[var(--accent-bg)] text-[var(--accent-text)] rounded-lg flex items-center justify-center shrink-0 shadow-lg">
                  <Briefcase size={28} />
                </div>
                <div>
                  <h3 className="font-bold uppercase text-lg leading-tight">Property Manager</h3>
                  <p className="text-[10px] font-mono uppercase text-[var(--text-muted)] mt-1">Managing multiple homes or units? I'll prepare your tools.</p>
                </div>
              </button>

              <button
                onClick={() => setSignupRole('owner')}
                className="w-full group p-6 bg-[var(--bg-panel)] border border-[var(--border)] rounded-xl flex items-center gap-6 hover:border-[var(--accent-bg)] transition-all text-left glass-card"
              >
                <div className="w-14 h-14 bg-blue-500 text-white rounded-lg flex items-center justify-center shrink-0 shadow-lg">
                  <Home size={28} />
                </div>
                <div>
                  <h3 className="font-bold uppercase text-lg leading-tight">Property Owner</h3>
                  <p className="text-[10px] font-mono uppercase text-[var(--text-muted)] mt-1">Track your portfolio's performance and financial yields in real-time.</p>
                </div>
              </button>

              <button
                disabled
                className="w-full group p-6 bg-[var(--bg-panel)] border border-[var(--border)] rounded-xl flex items-center gap-6 text-left glass-card opacity-50 cursor-not-allowed grayscale"
              >
                <div className="w-14 h-14 bg-emerald-500 text-white rounded-lg flex items-center justify-center shrink-0 shadow-lg">
                  <User size={28} />
                </div>
                <div>
                  <h3 className="font-bold uppercase text-lg leading-tight">I am a Tenant</h3>
                  <p className="text-[10px] font-mono uppercase text-[var(--text-muted)] mt-1">Coming soon. We'll ensure your stay is perfectly organized.</p>
                </div>
              </button>

              <p className="text-center pt-6 font-mono text-[11px] text-[var(--text-muted)] uppercase">
                Already part of the family? <button onClick={() => setView('login')} className="text-[var(--accent-bg)] font-bold hover:underline">Sign back in</button>
              </p>
            </div>
          ) : (
            <form className="space-y-6 reveal-step" onSubmit={onSubmitSignup}>
              <button
                type="button"
                onClick={() => setSignupRole(null)}
                className="text-[10px] font-mono text-[var(--text-muted)] uppercase font-bold hover:text-[var(--text-base)] flex items-center gap-2 mb-4"
              >
                ← Choose a different role
              </button>

              <div>
                <label className="text-[10px] font-mono text-[var(--text-muted)] uppercase mb-3 block font-bold">Your Full Name</label>
                <div className="relative group">
                  <div className="absolute left-5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] group-focus-within:text-[var(--accent-bg)] transition-colors">
                    <User size={18} />
                  </div>
                  <input
                    type="text"
                    placeholder="e.g. John Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="w-full bg-[var(--bg-input)] border border-[var(--border)] text-[var(--text-base)] p-4 pl-14 font-mono focus:ring-2 focus:ring-[var(--accent-bg)] outline-none rounded-lg transition-all shadow-sm"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-mono text-[var(--text-muted)] uppercase mb-3 block font-bold">Email Address</label>
                <div className="relative group">
                  <div className="absolute left-5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] group-focus-within:text-[var(--accent-bg)] transition-colors">
                    <Contact size={18} />
                  </div>
                  <input
                    type="email"
                    placeholder="hello@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full bg-[var(--bg-input)] border border-[var(--border)] text-[var(--text-base)] p-4 pl-14 font-mono focus:ring-2 focus:ring-[var(--accent-bg)] outline-none rounded-lg transition-all shadow-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-mono text-[var(--text-muted)] uppercase mb-3 block font-bold">Password</label>
                  <div className="relative group">
                    <div className="absolute left-5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] group-focus-within:text-[var(--accent-bg)] transition-colors">
                      <Key size={18} />
                    </div>
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="Min. 8 chars"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="w-full bg-[var(--bg-input)] border border-[var(--border)] text-[var(--text-base)] p-4 pl-14 font-mono focus:ring-2 focus:ring-[var(--accent-bg)] outline-none rounded-lg transition-all shadow-sm"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-base)] transition-colors"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-mono text-[var(--text-muted)] uppercase mb-3 block font-bold">Confirm</label>
                  <div className="relative group">
                    <div className="absolute left-5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] group-focus-within:text-[var(--accent-bg)] transition-colors">
                      <Key size={18} />
                    </div>
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Repeat password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      className="w-full bg-[var(--bg-input)] border border-[var(--border)] text-[var(--text-base)] p-4 pl-14 font-mono focus:ring-2 focus:ring-[var(--accent-bg)] outline-none rounded-lg transition-all shadow-sm"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-base)] transition-colors"
                    >
                      {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
              </div>

              <div
                className="group flex items-start gap-4 p-4 border border-[var(--border)] rounded-xl glass-card cursor-pointer hover:border-[var(--accent-bg)] transition-all"
                onClick={() => setAcceptedTerms(!acceptedTerms)}
              >
                <div className={`mt-0.5 w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${acceptedTerms ? 'bg-[var(--accent-bg)] border-[var(--accent-bg)]' : 'border-[var(--border)] group-hover:border-[var(--accent-bg)]'}`}>
                  {acceptedTerms && <Check size={14} className="text-[var(--accent-text)]" />}
                </div>
                <div className="flex-1">
                  <p className="text-[10px] font-mono uppercase text-[var(--text-muted)] font-bold leading-relaxed">
                    I agree to the <button className="text-[var(--text-base)] hover:underline decoration-[var(--accent-bg)]">Terms of Service</button> and <button className="text-[var(--text-base)] hover:underline decoration-[var(--accent-bg)]">Privacy Policy</button>.
                  </p>
                </div>
              </div>

              {error && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-[10px] font-mono uppercase font-bold animate-reveal">
                  Error: {error}
                </div>
              )}

              <button disabled={loading} type="submit" className="w-full bg-[var(--accent-bg)] text-[var(--accent-text)] font-extrabold font-mono text-base uppercase py-3.5 shadow-[6px_6px_0px_0px_var(--shadow-color)] active:translate-y-1 active:shadow-none transition-all rounded-xl hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-3">
                {loading ? "Creating..." : "Create My Free Account"} <Check size={20} />
              </button>
            </form>
          )}
        </div>
      )}

      {/* --- BIOMETRIC SCANNING OVERLAY --- */}
      {isBiometricScanning && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
          <div className="relative w-full max-w-xs bg-[var(--bg-panel)] border border-[var(--border)] border-opacity-20 rounded-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-10 text-center space-y-8">
              <div className="relative w-24 h-24 mx-auto">
                <div className="absolute inset-0 border-2 border-[var(--accent-bg)] border-t-transparent rounded-full animate-spin" style={{ animationDuration: '3s' }} />
                <div className="absolute inset-2 border-2 border-[var(--accent-bg)] opacity-30 border-b-transparent rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '2s' }} />
                <div className="absolute inset-0 flex items-center justify-center text-[var(--accent-bg)] animate-pulse">
                  <Fingerprint size={40} />
                </div>
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-black uppercase tracking-tight text-[var(--text-base)]">Ready to scan</h3>
                <p className="text-[10px] text-[var(--text-muted)] font-mono uppercase font-bold leading-relaxed px-4">
                  Use your fingerprint or face to sign in.
                </p>
              </div>
            </div>
            {/* Ambient scanning line */}
            <div className="absolute top-0 left-0 w-full h-[2px] bg-[var(--accent-bg)] opacity-50 blur-[2px] animate-scan" />
          </div>
        </div>
      )}
    </div>
  );
};
