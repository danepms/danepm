"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { X, Cookie } from 'lucide-react';

export function CookieBanner() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if the user has already accepted or declined cookies
    const cookieConsent = localStorage.getItem('dane_cookie_consent');
    if (!cookieConsent) {
      // Small delay for better UX
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('dane_cookie_consent', 'accepted');
    setIsVisible(false);
  };

  const handleDecline = () => {
    localStorage.setItem('dane_cookie_consent', 'declined');
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 inset-x-0 z-[100] p-4 sm:p-6 pointer-events-none flex justify-center animate-fade-up">
      <div className="bg-[var(--bg-panel)] border border-[var(--border)] shadow-2xl rounded-2xl p-6 w-full max-w-2xl pointer-events-auto flex flex-col sm:flex-row gap-6 items-start sm:items-center relative">
        <button 
          onClick={handleDecline}
          className="absolute top-4 right-4 text-[var(--text-muted)] hover:text-white transition-colors"
        >
          <X size={18} />
        </button>

        <div className="w-12 h-12 rounded-full bg-[var(--accent-soft)] flex-shrink-0 flex items-center justify-center border border-[var(--accent)] border-opacity-20">
          <Cookie size={20} className="text-[var(--accent)]" />
        </div>

        <div className="flex-1">
          <h4 className="text-lg font-black tracking-tight mb-2">We value your privacy</h4>
          <p className="text-sm text-[var(--text-muted)] leading-relaxed mb-1">
            We use essential cookies to make Dane work. We'd also like to use performance cookies to understand how you use our site and improve it. 
          </p>
          <p className="text-xs text-[var(--text-dim)]">
            Read our <Link href="/cookies" className="text-[var(--accent)] hover:underline">Cookie Policy</Link> for full details.
          </p>
        </div>

        <div className="flex flex-row sm:flex-col gap-3 w-full sm:w-auto mt-4 sm:mt-0 flex-shrink-0">
          <button 
            onClick={handleAccept}
            className="flex-1 sm:w-32 py-3 bg-[var(--accent)] text-black rounded-lg text-xs font-black uppercase tracking-widest hover:brightness-110 transition-all shadow-lg"
          >
            Accept All
          </button>
          <button 
            onClick={handleDecline}
            className="flex-1 sm:w-32 py-3 bg-[var(--bg-ghost)] text-white rounded-lg text-xs font-black uppercase tracking-widest hover:bg-[var(--border)] transition-all border border-[var(--border)] border-opacity-10"
          >
            Essential Only
          </button>
        </div>
      </div>
    </div>
  );
}
