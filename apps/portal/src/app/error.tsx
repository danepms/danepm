"use client";

import { useEffect, useState } from 'react';
import { Building2, RefreshCw, ArrowLeft, Copy, Check, AlertTriangle } from 'lucide-react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const [copied, setCopied] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    console.error('Application error:', error);
  }, [error]);

  const copyError = () => {
    const text = `Error: ${error.message}\n${error.digest ? `Digest: ${error.digest}` : ''}\n${error.stack || ''}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[var(--bg-base)] text-[var(--text-base)] flex items-center justify-center p-8 relative overflow-hidden">
      <div className="dot-grid" />
      <div className="vignette" />

      <div className="relative z-10 max-w-lg w-full text-center animate-fade-in">
        
        {/* Icon */}
        <div className="relative mb-10 flex justify-center">
          <div className="w-20 h-20 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 flex items-center justify-center shadow-2xl animate-float">
            <AlertTriangle size={32} />
          </div>
        </div>

        {/* Message */}
        <h1 className="text-3xl md:text-4xl font-black tracking-tighter mb-4">
          Something went wrong
        </h1>
        <p className="text-[var(--text-muted)] text-sm md:text-base leading-relaxed max-w-sm mx-auto mb-2">
          An unexpected error happened. Don't worry — your data is safe. Try refreshing the page, or go back and try again.
        </p>
        
        {error.message && (
          <p className="font-mono text-[10px] text-red-500/70 bg-red-500/5 border border-red-500/10 rounded-xl px-4 py-3 mt-4 max-w-sm mx-auto text-left break-all">
            {error.message}
          </p>
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-10">
          <button
            onClick={reset}
            className="flex items-center gap-3 px-8 py-4 bg-[var(--text-base)] text-[var(--bg-panel)] rounded-xl font-mono text-[11px] uppercase font-black shadow-[8px_8px_0px_0px_var(--shadow-color)] hover:translate-y-[-2px] active:translate-y-0 transition-all"
          >
            <RefreshCw size={16} />
            Try Again
          </button>
          <a
            href="/"
            className="flex items-center gap-3 px-8 py-4 border border-[var(--border)] border-opacity-10 rounded-xl font-mono text-[11px] uppercase font-black hover:bg-[var(--bg-ghost)] transition-all"
          >
            <ArrowLeft size={16} />
            Back to Home
          </a>
        </div>

        {/* Developer details */}
        <div className="mt-12">
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="font-mono text-[9px] uppercase text-[var(--text-muted)] opacity-40 hover:opacity-100 transition-all tracking-widest"
          >
            {showDetails ? 'Hide' : 'Show'} technical details
          </button>

          {showDetails && (
            <div className="mt-4 bg-[var(--bg-panel)] border border-[var(--border)] border-opacity-10 rounded-2xl p-6 text-left animate-reveal">
              <div className="flex items-center justify-between mb-3">
                <span className="font-mono text-[8px] uppercase font-black opacity-30">Error Stack</span>
                <button onClick={copyError} className="flex items-center gap-1.5 font-mono text-[8px] uppercase font-black text-[var(--accent-bg)] hover:opacity-70 transition-all">
                  {copied ? <><Check size={10} /> Copied</> : <><Copy size={10} /> Copy</>}
                </button>
              </div>
              {error.digest && (
                <p className="font-mono text-[9px] opacity-40 mb-2">Digest: {error.digest}</p>
              )}
              <pre className="font-mono text-[9px] opacity-50 whitespace-pre-wrap break-all max-h-40 overflow-y-auto custom-scrollbar leading-relaxed">
                {error.stack || error.message || 'No stack trace available'}
              </pre>
            </div>
          )}
        </div>

        {/* Footer brand */}
        <div className="mt-12 flex items-center justify-center gap-2 opacity-20">
          <Building2 size={14} />
          <span className="font-mono text-[9px] uppercase font-black tracking-widest">Dane</span>
        </div>
      </div>
    </div>
  );
}
