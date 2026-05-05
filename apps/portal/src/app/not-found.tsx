import Link from 'next/link';
import { Building2, ArrowLeft, Search } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[var(--bg-base)] text-[var(--text-base)] flex items-center justify-center p-8 relative overflow-hidden">
      {/* Background dot grid */}
      <div className="dot-grid" />
      <div className="vignette" />

      <div className="relative z-10 max-w-lg w-full text-center animate-fade-in">
        
        {/* Big 404 */}
        <div className="relative mb-12">
          <p className="text-[160px] md:text-[200px] font-black tracking-tighter leading-none select-none opacity-[0.03]">
            404
          </p>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-20 h-20 rounded-2xl bg-[var(--text-base)] text-[var(--bg-base)] flex items-center justify-center shadow-2xl animate-float">
              <Search size={32} />
            </div>
          </div>
        </div>

        {/* Message */}
        <h1 className="text-3xl md:text-4xl font-black tracking-tighter mb-4">
          Page not found
        </h1>
        <p className="text-[var(--text-muted)] text-sm md:text-base leading-relaxed max-w-sm mx-auto mb-2">
          We looked everywhere but couldn't find this page. It might have been moved or doesn't exist.
        </p>
        <p className="font-mono text-[9px] text-[var(--text-muted)] opacity-40 mb-10">
          Double-check the URL or head back to somewhere safe
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/"
            className="flex items-center gap-3 px-8 py-4 bg-[var(--text-base)] text-[var(--bg-panel)] rounded-xl font-mono text-[11px] uppercase font-black shadow-[8px_8px_0px_0px_var(--shadow-color)] hover:translate-y-[-2px] active:translate-y-0 transition-all"
          >
            <ArrowLeft size={16} />
            Back to Home
          </Link>
          <Link
            href="/dashboard/manager/properties"
            className="flex items-center gap-3 px-8 py-4 border border-[var(--border)] border-opacity-10 rounded-xl font-mono text-[11px] uppercase font-black hover:bg-[var(--bg-ghost)] transition-all"
          >
            <Building2 size={16} />
            Go to Dashboard
          </Link>
        </div>

        {/* Footer brand */}
        <div className="mt-16 flex items-center justify-center gap-2 opacity-20">
          <Building2 size={14} />
          <span className="font-mono text-[9px] uppercase font-black tracking-widest">Dane</span>
        </div>
      </div>
    </div>
  );
}
