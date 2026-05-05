"use client";

import React from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Building2, Sun, Moon, ArrowLeft } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';
import { useSession } from '@/lib/auth-client';

interface PublicHeaderProps {
  title?: string;
  showBack?: boolean;
}

export function PublicHeader({ title, showBack = false }: PublicHeaderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();
  const { data: session } = useSession();

  // Determine title based on path if not provided
  const displayTitle = title || (
    pathname === '/' ? 'Home' :
    pathname === '/auth' ? 'Auth' :
    pathname === '/wizard' ? 'Setup' :
    pathname.split('/').pop()?.toUpperCase() || 'Dane'
  );

  const firstName = session?.user?.name?.split(' ')[0] || 'User';

  return (
    <header className="flex items-center justify-between border-b border-[var(--border)] pb-6 mb-12 shrink-0 p-6 md:px-16 w-full z-50">
      <div className="flex items-center gap-4">
        {showBack ? (
          <button 
            onClick={() => router.back()}
            className="w-10 h-10 border border-[var(--border)] bg-[var(--bg-panel)] rounded-lg flex items-center justify-center hover:bg-[var(--accent-bg)] hover:text-[var(--accent-text)] transition-all shadow-sm"
          >
            <ArrowLeft size={18} />
          </button>
        ) : (
          <div 
            onClick={() => router.push('/')}
            className="w-10 h-10 bg-[var(--accent-bg)] text-[var(--accent-text)] rounded-lg flex items-center justify-center shadow-lg transition-transform hover:scale-105 cursor-pointer"
          >
            <Building2 size={20} />
          </div>
        )}
        <div className="flex flex-col">
          <span className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] opacity-40">
            Dane / {displayTitle}
          </span>
        </div>
      </div>

      {/* Center Nav */}
      <nav className="hidden lg:flex items-center gap-8">
        {['How it works', 'Talk to us', 'About DanePMS'].map((item) => (
          <button 
            key={item}
            className="font-mono text-[10px] uppercase font-bold text-[var(--text-muted)] hover:text-[var(--text-base)] transition-colors tracking-widest"
          >
            {item}
          </button>
        ))}
      </nav>
      
      <div className="flex items-center gap-4">
        <button 
          onClick={toggleTheme}
          className="flex items-center gap-2 px-4 py-2 border border-[var(--border)] bg-[var(--bg-panel)] glass-card rounded-lg hover:bg-[var(--accent-bg)] hover:text-[var(--accent-text)] transition-all group font-mono text-[10px] uppercase text-[var(--text-muted)] font-bold shadow-sm"
        >
          {theme === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
          <span className="hidden sm:inline-block">{theme} MODE</span>
        </button>

        {session ? (
          <button 
            onClick={() => router.push('/dashboard')}
            className="px-6 py-2 bg-[var(--text-base)] text-[var(--bg-base)] rounded-lg font-mono text-[10px] uppercase font-black hover:opacity-90 transition-all shadow-lg flex items-center gap-2"
          >
            <div className="w-4 h-4 bg-[var(--accent-bg)] rounded-full animate-pulse" />
            {firstName}
          </button>
        ) : (
          <button 
            onClick={() => router.push('/auth')}
            className="px-6 py-2 bg-[var(--accent-bg)] text-[var(--accent-text)] rounded-lg font-mono text-[10px] uppercase font-black hover:opacity-90 transition-all shadow-lg"
          >
            Login
          </button>
        )}
      </div>
    </header>
  );
}
