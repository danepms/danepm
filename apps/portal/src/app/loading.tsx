import { Building2 } from 'lucide-react';

export default function Loading() {
  return (
    <div className="fixed inset-0 z-[200] bg-[var(--bg-base)] flex items-center justify-center">
      {/* Subtle dot grid behind */}
      <div className="dot-grid" />

      <div className="relative z-10 flex flex-col items-center gap-8 animate-fade-in">
        {/* Logo */}
        <div className="relative">
          <div className="w-16 h-16 rounded-2xl bg-[var(--text-base)] text-[var(--bg-base)] flex items-center justify-center shadow-2xl animate-float">
            <Building2 size={28} />
          </div>
          {/* Glow ring */}
          <div className="absolute inset-0 rounded-2xl bg-[var(--accent-bg)] opacity-20 blur-xl animate-pulse" />
        </div>

        {/* Brand */}
        <div className="text-center">
          <h1 className="text-2xl font-black tracking-tighter">Dane.</h1>
          <p className="font-mono text-[9px] uppercase tracking-[0.3em] text-[var(--text-muted)] mt-2">Loading your workspace</p>
        </div>

        {/* Progress bar */}
        <div className="w-48 h-1 bg-[var(--border)] bg-opacity-10 rounded-full loading-bar" />

        {/* Hint */}
        <p className="font-mono text-[8px] text-[var(--text-muted)] opacity-40 mt-4">
          Hang tight, this should only take a moment
        </p>
      </div>
    </div>
  );
}
