"use client";

import React, { useState } from 'react';
import { 
  Building2, ArrowRight, ChevronDown, 
  Monitor, Settings, Compass, Users, ClipboardList,
  HelpCircle as HelpIcon 
} from 'lucide-react';

import OverviewTab from '../components/OverviewTab';
import TenantLifecycleTab from '../components/TenantLifecycleTab';
import RentBillingTab from '../components/RentBillingTab';
import OperationsTab from '../components/OperationsTab';
import LoaderOverlay from '../components/LoaderOverlay';

type ActiveTab = 'overview' | 'lifecycle' | 'rent' | 'operations';

export default function LandingPage() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('overview');
  const [pendingTab, setPendingTab] = useState<ActiveTab | null>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const PORTAL = "https://portal.danesproperties.com";

  const handleTabSwitch = (tab: ActiveTab) => {
    if (tab === activeTab) return;
    setPendingTab(tab);
  };

  const onLoaderComplete = () => {
    if (pendingTab) {
      setActiveTab(pendingTab);
      setPendingTab(null);
    }
  };

  const faqs = [
    {
      q: "How does automated M-Pesa collection work?",
      a: "Tenants pay via your Safaricom M-Pesa Till or Paybill. Dane instantly detects the transaction, matches it using the tenant's registered phone number or their Unit ID reference, clears outstanding invoices from oldest to newest (FIFO), updates arrears, and dispatches a WhatsApp/SMS payment receipt automatically."
    },
    {
      q: "Can I migrate my existing tenant records from Excel?",
      a: "Yes! Dane includes a bulk Excel importer template. You can download the format, fill in your active properties, units, tenant names, phone numbers, and current arrears, and upload them to be operational in minutes."
    },
    {
      q: "What access do landlords and property owners get?",
      a: "You can invite property owners to their own read-only portal. They can review month-over-month occupancy trends, monitor active rent collections, track logged caretaker expenses, and download statements without needing status updates."
    },
    {
      q: "How are system SMS alerts billed?",
      a: "All transactional email reports are free. SMS alerts are charged at wholesale rates (typically KES 0.85 per SMS) deducted directly from your prepaid wallet balance."
    }
  ];

  return (
    <div className="min-h-screen bg-[#060606] text-white flex flex-col relative overflow-x-hidden selection:bg-[var(--accent)] selection:text-black font-sans">
      
      {/* Dynamic Loading Screen transition */}
      {pendingTab && (
        <LoaderOverlay onComplete={onLoaderComplete} />
      )}

      {/* Cyber Grid Background */}
      <div className="absolute inset-0 grid-dot-pattern opacity-[0.12] pointer-events-none z-0" />
      <div className="absolute top-0 inset-x-0 h-[600px] bg-gradient-to-b from-[rgba(200,255,0,0.03)] to-transparent pointer-events-none z-0" />

      {/* ── TOP TELEMETRY PANEL ── */}
      <header className="border-b border-[#151515] bg-[#090909]/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 md:px-6 h-[28px] border-b border-[#121212] flex items-center justify-between text-[8px] font-mono text-[var(--text-dim)]">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] animate-pulse" /> SYSTEM STATUS: ONLINE</span>
            <span className="hidden sm:inline">M-PESA MATCHING ENGINE: ONLINE</span>
          </div>
          <div className="flex items-center gap-4">
            <span>DANE SYSTEM OVERWATCH</span>
            <span>SECURE SESSION</span>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 md:px-6 h-[64px] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-[var(--accent)] flex items-center justify-center">
              <Building2 size={16} color="#000" />
            </div>
            <span className="text-lg font-black tracking-tighter uppercase font-mono">DANE <span className="text-[9px] font-bold text-[var(--text-muted)] tracking-wider">PMS</span></span>
          </div>

          {/* Desktop Tab Switcher */}
          <nav className="hidden md:flex items-center gap-1">
            {[
              { id: 'overview', label: 'SYSTEM OVERVIEW', icon: Monitor },
              { id: 'lifecycle', label: 'TENANT LIFE CYCLE', icon: Users },
              { id: 'rent', label: 'RENT & INVOICING', icon: Compass },
              { id: 'operations', label: 'PROPERTY OPERATIONS', icon: ClipboardList }
            ].map(t => (
              <button
                key={t.id}
                onClick={() => handleTabSwitch(t.id as ActiveTab)}
                className={`px-4 py-2 rounded-lg font-mono text-[9px] font-bold tracking-wider transition-all flex items-center gap-1.5 border ${
                  activeTab === t.id
                    ? 'bg-[var(--accent)] text-black border-transparent shadow-[0_0_20px_rgba(200,255,0,0.15)]'
                    : 'text-[var(--text-muted)] border-transparent hover:border-[#222] hover:text-white'
                }`}
              >
                <t.icon size={12} />
                {t.label}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <a 
              href={PORTAL} 
              className="text-[9px] font-mono font-bold uppercase tracking-wider text-[var(--text-muted)] hover:text-white px-3 py-1.5 rounded transition-all"
            >
              Log In
            </a>
            <a 
              href={`${PORTAL}/auth?mode=signup`}
              className="bg-white text-black font-black uppercase text-[9px] tracking-widest px-4 py-2 rounded-md hover:opacity-90 transition-all"
            >
              START
            </a>
          </div>
        </div>

        {/* Mobile Tab Switcher Grid */}
        <div className="grid grid-cols-4 md:hidden border-t border-[#121212] bg-[#070707] text-[8px] font-mono font-bold">
          {[
            { id: 'overview', label: 'OVERVIEW' },
            { id: 'lifecycle', label: 'TENANTS' },
            { id: 'rent', label: 'BILLING' },
            { id: 'operations', label: 'OPERATIONS' }
          ].map(t => (
            <button
              key={t.id}
              onClick={() => handleTabSwitch(t.id as ActiveTab)}
              className={`py-3 text-center transition-all ${
                activeTab === t.id
                  ? 'bg-[#151515] text-[var(--accent)]'
                  : 'text-[var(--text-muted)]'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </header>

      {/* ── MAIN CONTENT ZONE ── */}
      <main className="flex-1 max-w-7xl mx-auto px-4 md:px-6 py-8 w-full relative z-10 space-y-12">
        
        {/* Render Active Tab Screen */}
        <div className="min-h-[450px]">
          {activeTab === 'overview' && <OverviewTab onGoToSignup={() => window.location.href = `${PORTAL}/auth?mode=signup`} />}
          {activeTab === 'lifecycle' && <TenantLifecycleTab />}
          {activeTab === 'rent' && <RentBillingTab />}
          {activeTab === 'operations' && <OperationsTab />}
        </div>

        {/* ── TECHNICAL FAQ DIAGNOSTICS ── */}
        <section className="border-t border-[#1a1a1a] pt-12 space-y-6">
          <div className="text-center max-w-xl mx-auto">
            <h3 className="text-xl font-black uppercase tracking-tight font-mono text-white flex items-center justify-center gap-2">
              <HelpIcon size={16} className="text-[var(--accent)]" /> PROPERTY MANAGEMENT FAQ
            </h3>
            <p className="text-[11px] text-[var(--text-muted)] mt-1">
              Factual, direct answers on onboarding, M-Pesa setups, and platform capabilities.
            </p>
          </div>

          <div className="max-w-3xl mx-auto space-y-2">
            {faqs.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div 
                  key={idx} 
                  className="bg-[#0b0b0b] rounded-xl border border-[#141414] overflow-hidden transition-all duration-200"
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full px-5 py-4 flex items-center justify-between text-left focus:outline-none"
                  >
                    <span className="text-[11px] font-mono font-bold uppercase tracking-tight text-white">{faq.q}</span>
                    <ChevronDown
                      size={12}
                      className={`text-[var(--text-muted)] transition-transform duration-200 ${isOpen ? 'rotate-180 text-[var(--accent)]' : ''}`}
                    />
                  </button>
                  <div
                    className={`transition-all duration-200 ease-in-out ${
                      isOpen ? 'max-h-40 border-t border-[#141414]' : 'max-h-0'
                    } overflow-hidden`}
                  >
                    <div className="p-5 text-[11px] leading-relaxed text-[var(--text-muted)] font-mono">
                      {faq.a}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

      </main>

      {/* ── FOOTER TELEMETRY ── */}
      <footer className="border-t border-[#151515] bg-[#070707] py-8 text-xs font-mono text-[var(--text-muted)]">
        <div className="max-w-7xl mx-auto px-4 md:px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 rounded bg-[var(--accent)] flex items-center justify-center">
              <Building2 size={12} color="#000" />
            </div>
            <span className="text-xs font-black uppercase text-white">DANE PMS</span>
          </div>

          <div className="flex items-center gap-6 text-[10px]">
            <a href="/terms" className="hover:text-white transition-colors">TERMS</a>
            <a href="/privacy" className="hover:text-white transition-colors">PRIVACY</a>
            <a href="/cookies" className="hover:text-white transition-colors">COOKIES</a>
          </div>

          <div className="text-[9px] text-[var(--text-dim)]">
            © {new Date().getFullYear()} DANE PMS. ALL RIGHTS RESERVED.
          </div>
        </div>
      </footer>

    </div>
  );
}
