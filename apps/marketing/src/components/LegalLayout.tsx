"use client";

import React, { useState } from 'react';
import { Building2, ArrowRight, Menu, X, Mail, ArrowUpRight } from 'lucide-react';
import Link from 'next/link';

export function LegalLayout({ children }: { children: React.ReactNode }) {
  const [mobileMenu, setMobileMenu] = useState(false);
  const PORTAL = "https://portal.danesproperties.com";

  return (
    <div className="min-h-screen flex flex-col relative" style={{ background: 'var(--bg-base)' }}>
      {/* ── NAV ── */}
      <nav className="fixed top-0 inset-x-0 z-50 glass-strong" style={{ borderBottom: '1px solid var(--border)' }}>
        <div className="max-w-7xl mx-auto h-[72px] px-6 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: 'var(--accent)' }}>
              <Building2 size={18} color="#000" />
            </div>
            <span className="text-xl font-black tracking-tighter">Dane.</span>
          </Link>

          <div className="hidden md:flex items-center gap-10">
            <Link href="/privacy" className="text-[11px] font-bold uppercase tracking-[0.15em] hover:text-white transition-colors" style={{ color: 'var(--text-muted)' }}>Privacy Policy</Link>
            <Link href="/terms" className="text-[11px] font-bold uppercase tracking-[0.15em] hover:text-white transition-colors" style={{ color: 'var(--text-muted)' }}>Terms of Service</Link>
            <Link href="/cookies" className="text-[11px] font-bold uppercase tracking-[0.15em] hover:text-white transition-colors" style={{ color: 'var(--text-muted)' }}>Cookie Policy</Link>
          </div>

          <div className="hidden md:flex items-center gap-4">
            <a href={PORTAL} className="px-5 py-2.5 text-[11px] font-bold uppercase tracking-widest hover:text-white transition-colors" style={{ color: 'var(--text-muted)' }}>
              Log In
            </a>
            <a href={`${PORTAL}/auth?mode=signup`}
              className="px-6 py-2.5 rounded-lg text-[11px] font-black uppercase tracking-widest transition-all hover:opacity-90 flex items-center gap-2"
              style={{ background: 'var(--accent)', color: '#000' }}>
              Get Started <ArrowRight size={14} />
            </a>
          </div>

          <button className="md:hidden p-2" onClick={() => setMobileMenu(!mobileMenu)}>
            {mobileMenu ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {mobileMenu && (
          <div className="md:hidden px-6 pb-6 space-y-4 animate-fade-up" style={{ background: 'var(--bg-base)' }}>
            <Link href="/privacy" onClick={() => setMobileMenu(false)} className="block py-3 text-sm font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Privacy Policy</Link>
            <Link href="/terms" onClick={() => setMobileMenu(false)} className="block py-3 text-sm font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Terms of Service</Link>
            <Link href="/cookies" onClick={() => setMobileMenu(false)} className="block py-3 text-sm font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Cookie Policy</Link>
            <a href={`${PORTAL}/auth?mode=signup`}
              className="block w-full text-center py-4 rounded-lg text-sm font-black uppercase"
              style={{ background: 'var(--accent)', color: '#000' }}>
              Get Started
            </a>
          </div>
        )}
      </nav>

      {/* ── CONTENT ── */}
      <main className="flex-1 pt-[120px] pb-24 relative z-10">
        <div className="absolute inset-0 grid-dot-pattern opacity-10 pointer-events-none" />
        <article className="max-w-4xl mx-auto px-6 relative z-10">
          <div className="prose prose-invert prose-p:text-[var(--text-muted)] prose-p:leading-relaxed prose-headings:font-black prose-headings:tracking-tight prose-a:text-[var(--accent)] hover:prose-a:text-white max-w-none">
             {children}
          </div>
        </article>
      </main>

      {/* ── FOOTER ── */}
      <footer style={{ background: 'var(--bg-base)', borderTop: '1px solid var(--border)' }}>
        <div className="max-w-7xl mx-auto px-6 py-16">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
            <div className="md:col-span-2">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: 'var(--accent)' }}>
                  <Building2 size={18} color="#000" />
                </div>
                <span className="text-xl font-black tracking-tighter">Dane.</span>
              </div>
              <p className="text-sm leading-relaxed max-w-sm mb-6" style={{ color: 'var(--text-muted)' }}>
                The modern property management platform for managers and owners in Kenya. Simple tools, real results.
              </p>
              <div className="flex items-center gap-4">
                <a href="mailto:hello@danesproperties.com" className="flex items-center gap-2 text-[11px] font-bold hover:text-white transition-colors" style={{ color: 'var(--text-muted)' }}>
                  <Mail size={14} /> hello@danesproperties.com
                </a>
              </div>
            </div>

            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] mb-5" style={{ color: 'var(--text-dim)' }}>Product</p>
              <div className="space-y-3">
                <Link href="/" className="block text-sm font-medium hover:text-white transition-colors" style={{ color: 'var(--text-muted)' }}>Home</Link>
              </div>
            </div>

            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] mb-5" style={{ color: 'var(--text-dim)' }}>Access</p>
              <div className="space-y-3">
                <a href={PORTAL} className="block text-sm font-medium hover:text-white transition-colors flex items-center gap-1" style={{ color: 'var(--text-muted)' }}>
                  Manager Portal <ArrowUpRight size={12} />
                </a>
                <a href={PORTAL} className="block text-sm font-medium hover:text-white transition-colors flex items-center gap-1" style={{ color: 'var(--text-muted)' }}>
                  Owner Portal <ArrowUpRight size={12} />
                </a>
              </div>
            </div>
          </div>

          <div className="pt-8 flex flex-col items-center md:items-start gap-6" style={{ borderTop: '1px solid var(--border)' }}>
            <div className="w-full flex flex-col md:flex-row items-center justify-between gap-4">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em]" style={{ color: 'var(--text-dim)' }}>
                © {new Date().getFullYear()} Dane Properties Limited · All rights reserved
              </p>
              <div className="flex gap-6">
                <Link href="/privacy" className="text-[10px] font-bold uppercase tracking-[0.15em] hover:text-white transition-colors" style={{ color: 'var(--text-dim)' }}>Privacy</Link>
                <Link href="/terms" className="text-[10px] font-bold uppercase tracking-[0.15em] hover:text-white transition-colors" style={{ color: 'var(--text-dim)' }}>Terms</Link>
                <Link href="/cookies" className="text-[10px] font-bold uppercase tracking-[0.15em] hover:text-white transition-colors" style={{ color: 'var(--text-dim)' }}>Cookies</Link>
              </div>
            </div>
            
            <div className="w-full flex justify-center md:justify-start">
              <a 
                href="https://kihumba.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="group flex items-center gap-2 text-[9px] font-mono uppercase tracking-widest text-[var(--text-dim)] hover:text-white transition-all"
              >
                <span className="opacity-40">Crafted by</span>
                <span className="font-bold relative">
                  Kihumba
                  <span className="absolute -bottom-1 left-0 w-0 h-[1px] bg-[var(--accent)] transition-all group-hover:w-full"></span>
                </span>
                <ArrowUpRight size={10} className="opacity-0 -translate-x-2 text-[var(--accent)] group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
