"use client";

import React, { useEffect, useRef, useState } from 'react';
import {
  Building2, ArrowRight, Zap, ShieldCheck, Users, BarChart3,
  MessageSquare, Receipt, ChevronRight, Star, CheckCircle2,
  Globe, ArrowUpRight, Mail, Phone, MapPin, Menu, X
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

/* ════════════════════════════════════════
   INTERSECTION OBSERVER HOOK
   ════════════════════════════════════════ */
function useInView(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold });
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, visible };
}

/* ════════════════════════════════════════
   ANIMATED COUNTER
   ════════════════════════════════════════ */
function Counter({ end, suffix = '', prefix = '' }: { end: number; suffix?: string; prefix?: string }) {
  const [val, setVal] = useState(0);
  const { ref, visible } = useInView();
  useEffect(() => {
    if (!visible) return;
    let start = 0;
    const dur = 2000;
    const step = Math.ceil(end / (dur / 16));
    const timer = setInterval(() => {
      start += step;
      if (start >= end) { setVal(end); clearInterval(timer); }
      else setVal(start);
    }, 16);
    return () => clearInterval(timer);
  }, [visible, end]);
  return <span ref={ref}>{prefix}{val.toLocaleString()}{suffix}</span>;
}

/* ════════════════════════════════════════
   MAIN PAGE
   ════════════════════════════════════════ */
export default function LandingPage() {
  const [mobileMenu, setMobileMenu] = useState(false);
  const feat = useInView();
  const stats = useInView();
  const how = useInView();
  const test = useInView();
  const cta = useInView();

  const PORTAL = "https://portal.danesproperties.com";

  return (
    <div className="min-h-screen flex flex-col relative">

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
            {['Features', 'How It Works', 'Testimonials'].map(l => (
              <a key={l} href={`#${l.toLowerCase().replace(/ /g, '-')}`}
                className="text-[11px] font-bold uppercase tracking-[0.15em] hover:text-white transition-colors"
                style={{ color: 'var(--text-muted)' }}>{l}</a>
            ))}
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
            {['Features', 'How It Works', 'Testimonials'].map(l => (
              <a key={l} href={`#${l.toLowerCase().replace(/ /g, '-')}`}
                onClick={() => setMobileMenu(false)}
                className="block py-3 text-sm font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>{l}</a>
            ))}
            <a href={`${PORTAL}/auth?mode=signup`}
              className="block w-full text-center py-4 rounded-lg text-sm font-black uppercase"
              style={{ background: 'var(--accent)', color: '#000' }}>
              Get Started
            </a>
          </div>
        )}
      </nav>

      {/* ── HERO ── */}
      <section className="relative min-h-screen flex items-center pt-[72px] overflow-hidden">
        {/* Background image */}
        <div className="absolute inset-0 z-0">
          <Image src="/images/hero.png" alt="" fill className="object-cover" priority />
          <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, rgba(10,10,10,0.7) 0%, rgba(10,10,10,0.85) 50%, var(--bg-base) 100%)' }} />
        </div>

        {/* Grid pattern overlay */}
        <div className="absolute inset-0 grid-dot-pattern opacity-40 z-[1]" />

        <div className="relative z-10 max-w-7xl mx-auto px-6 py-24 md:py-32 w-full">
          <div className="max-w-4xl">
            {/* Badge */}
            <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full glass mb-10 animate-fade-up" style={{ animationFillMode: 'both' }}>
              <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: 'var(--accent)' }} />
              <span className="text-[10px] font-bold uppercase tracking-[0.2em]" style={{ color: 'var(--text-muted)' }}>
                Trusted by 50+ property managers in Kenya
              </span>
            </div>

            {/* Heading */}
            <h1 className="hero-heading animate-fade-up delay-100" style={{ fontSize: 'clamp(3rem, 8vw, 6rem)', fontWeight: 900, letterSpacing: '-0.04em', lineHeight: 0.9, animationFillMode: 'both' }}>
              Property<br />management,<br />
              <span className="text-gradient">simplified.</span>
            </h1>

            {/* Subhead */}
            <p className="mt-8 text-lg md:text-xl leading-relaxed max-w-xl animate-fade-up delay-200" style={{ color: 'var(--text-muted)', animationFillMode: 'both' }}>
              Track rent, manage tenants, send reminders, reconcile finances — all from one clean dashboard. Built for the way real managers actually work.
            </p>

            {/* CTA */}
            <div className="flex flex-col sm:flex-row gap-4 mt-12 animate-fade-up delay-300" style={{ animationFillMode: 'both' }}>
              <a href={`${PORTAL}/auth?mode=signup`}
                className="px-10 py-5 rounded-xl text-sm font-black uppercase tracking-widest flex items-center justify-center gap-3 group hover-lift"
                style={{ background: 'var(--accent)', color: '#000' }}>
                Start Free <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </a>
              <a href="#features"
                className="px-10 py-5 rounded-xl text-sm font-bold uppercase tracking-widest flex items-center justify-center gap-3 glass hover-lift">
                See Features
              </a>
            </div>

            {/* Social proof */}
            <div className="flex items-center gap-6 mt-14 animate-fade-up delay-400" style={{ animationFillMode: 'both' }}>
              <div className="flex -space-x-3">
                {['JM', 'AW', 'BO', 'CM'].map((i, idx) => (
                  <div key={idx} className="w-10 h-10 rounded-full flex items-center justify-center text-[10px] font-black border-2"
                    style={{ background: idx % 2 === 0 ? '#27272a' : '#3f3f46', borderColor: 'var(--bg-base)', color: 'var(--text-muted)' }}>
                    {i}
                  </div>
                ))}
              </div>
              <div>
                <div className="flex gap-0.5 mb-1">
                  {[1,2,3,4,5].map(s => <Star key={s} size={14} fill="var(--accent)" color="var(--accent)" />)}
                </div>
                <p className="text-[11px] font-bold" style={{ color: 'var(--text-muted)' }}>Loved by managers across Nairobi</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS BAR ── */}
      <section ref={stats.ref} className="relative z-10 -mt-1" style={{ background: 'var(--bg-base)' }}>
        <div className="max-w-7xl mx-auto px-6">
          <div className={`grid grid-cols-2 md:grid-cols-4 gap-6 py-16 ${stats.visible ? 'animate-fade-up' : 'opacity-0'}`}
            style={{ animationFillMode: 'both' }}>
            {[
              { val: 500, suffix: '+', label: 'Units Managed' },
              { val: 98, suffix: '%', label: 'Rent Collected On Time' },
              { val: 12, suffix: 'K+', label: 'Messages Sent' },
              { val: 50, suffix: '+', label: 'Happy Managers' },
            ].map((s, i) => (
              <div key={i} className="text-center p-6 rounded-2xl glass hover-lift" style={{ animationDelay: `${i * 0.1}s` }}>
                <p className="text-3xl md:text-4xl font-black tracking-tighter" style={{ color: 'var(--accent)' }}>
                  <Counter end={s.val} suffix={s.suffix} />
                </p>
                <p className="text-[10px] font-bold uppercase tracking-[0.15em] mt-2" style={{ color: 'var(--text-muted)' }}>{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section id="features" ref={feat.ref} className="py-28 md:py-36 relative" style={{ background: 'var(--bg-base)' }}>
        <div className="absolute inset-0 grid-pattern opacity-30" />
        <div className="max-w-7xl mx-auto px-6 relative z-10">

          <div className={`text-center mb-20 ${feat.visible ? 'animate-fade-up' : 'opacity-0'}`} style={{ animationFillMode: 'both' }}>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-6">
              <Zap size={14} style={{ color: 'var(--accent)' }} />
              <span className="text-[10px] font-bold uppercase tracking-[0.2em]" style={{ color: 'var(--text-muted)' }}>Everything You Need</span>
            </div>
            <h2 className="section-heading text-4xl md:text-6xl font-black tracking-tighter">
              One platform.<br /><span style={{ color: 'var(--text-dim)' }}>Zero headaches.</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: Building2, title: 'Property Setup', desc: 'Add buildings, map units by floor, set rent types — get fully operational in under 10 minutes.' },
              { icon: Users, title: 'Tenant Records', desc: 'Store contacts, ID copies, move-in photos, next of kin, and arrears — all searchable and organized.' },
              { icon: Receipt, title: 'Invoicing & Payments', desc: 'Generate monthly invoices with one click. Record M-Pesa, bank, or cash payments and auto-clear balances.' },
              { icon: BarChart3, title: 'Financial Reports', desc: 'See exactly what you collected vs what you\'re owed. Property-level breakdowns, monthly trends, and exports.' },
              { icon: MessageSquare, title: 'SMS & Email Reminders', desc: 'Send rent reminders, receipts, and announcements to tenants via SMS or email — individually or in bulk.' },
              { icon: ShieldCheck, title: 'Owner Access', desc: 'Invite property owners to view their portfolio, occupancy rates, and earnings — with their own secure login.' },
            ].map((f, i) => (
              <div key={i}
                className={`group p-8 md:p-10 rounded-2xl glass hover-lift cursor-default ${feat.visible ? 'animate-fade-up' : 'opacity-0'}`}
                style={{ animationDelay: `${0.1 + i * 0.08}s`, animationFillMode: 'both' }}>
                <div className="w-14 h-14 rounded-xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110"
                  style={{ background: 'var(--accent-soft)' }}>
                  <f.icon size={24} style={{ color: 'var(--accent)' }} />
                </div>
                <h3 className="text-xl font-black tracking-tight mb-3">{f.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── DASHBOARD PREVIEW ── */}
      <section className="py-20 relative overflow-hidden" style={{ background: 'var(--bg-base)' }}>
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <div className="rounded-3xl overflow-hidden border glow-accent relative" style={{ borderColor: 'var(--border-strong)' }}>
            <div className="absolute top-0 left-0 right-0 h-10 flex items-center px-4 gap-2 z-10"
              style={{ background: 'rgba(10,10,10,0.9)', borderBottom: '1px solid var(--border)' }}>
              <div className="w-3 h-3 rounded-full" style={{ background: '#ef4444' }} />
              <div className="w-3 h-3 rounded-full" style={{ background: '#eab308' }} />
              <div className="w-3 h-3 rounded-full" style={{ background: '#22c55e' }} />
              <span className="ml-4 text-[10px] font-mono font-bold" style={{ color: 'var(--text-dim)' }}>portal.danesproperties.com</span>
            </div>
            <Image src="/images/dashboard.png" alt="Dane dashboard" width={1200} height={700}
              className="w-full h-auto" style={{ marginTop: '40px' }} />
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="how-it-works" ref={how.ref} className="py-28 md:py-36 relative" style={{ background: 'var(--bg-base)' }}>
        <div className="max-w-7xl mx-auto px-6">
          <div className={`text-center mb-20 ${how.visible ? 'animate-fade-up' : 'opacity-0'}`} style={{ animationFillMode: 'both' }}>
            <h2 className="section-heading text-4xl md:text-6xl font-black tracking-tighter">
              Up and running<br /><span style={{ color: 'var(--text-dim)' }}>in three steps.</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { step: '01', title: 'Add Your Buildings', desc: 'Enter your properties, define unit types, floors, and base rents. The system auto-generates your unit matrix.', icon: Building2 },
              { step: '02', title: 'Onboard Tenants', desc: 'Add tenant details, assign them to units, and record their move-in info. Arrears are calculated automatically.', icon: Users },
              { step: '03', title: 'Manage Everything', desc: 'Generate invoices, record payments, send reminders, track expenses, and share reports with owners.', icon: BarChart3 },
            ].map((s, i) => (
              <div key={i}
                className={`relative p-10 rounded-2xl glass hover-lift ${how.visible ? 'animate-fade-up' : 'opacity-0'}`}
                style={{ animationDelay: `${0.15 + i * 0.15}s`, animationFillMode: 'both' }}>
                <div className="text-[80px] font-black leading-none absolute top-6 right-8 select-none"
                  style={{ color: 'var(--accent)', opacity: 0.08 }}>{s.step}</div>
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-6"
                  style={{ background: 'var(--accent-soft)' }}>
                  <s.icon size={22} style={{ color: 'var(--accent)' }} />
                </div>
                <p className="text-[11px] font-black uppercase tracking-[0.2em] mb-3" style={{ color: 'var(--accent)' }}>Step {s.step}</p>
                <h3 className="text-2xl font-black tracking-tight mb-4">{s.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section id="testimonials" ref={test.ref} className="py-28 md:py-36 relative" style={{ background: 'var(--bg-base)' }}>
        <div className="max-w-7xl mx-auto px-6">
          <div className={`text-center mb-16 ${test.visible ? 'animate-fade-up' : 'opacity-0'}`} style={{ animationFillMode: 'both' }}>
            <h2 className="section-heading text-4xl md:text-6xl font-black tracking-tighter">
              Managers love<br /><span style={{ color: 'var(--text-dim)' }}>using Dane.</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { name: 'James Mwangi', role: 'Manages 3 properties in Lavington', quote: 'I used to track everything on paper. Dane literally changed how I run my business. Invoices, reminders, arrears — it\'s all automatic now.' },
              { name: 'Alice Wanjiku', role: 'Manages 45 units in Kileleshwa', quote: 'The reconciliation feature alone saved me 8 hours a month. I can see exactly who has paid and who hasn\'t, instantly.' },
              { name: 'Brian Ochieng', role: 'Property owner, 2 buildings', quote: 'As an owner, I can log in and see my occupancy, revenue, and maintenance costs without calling my manager. That transparency is priceless.' },
            ].map((t, i) => (
              <div key={i}
                className={`p-10 rounded-2xl glass hover-lift ${test.visible ? 'animate-fade-up' : 'opacity-0'}`}
                style={{ animationDelay: `${0.1 + i * 0.12}s`, animationFillMode: 'both' }}>
                <div className="flex gap-1 mb-6">
                  {[1,2,3,4,5].map(s => <Star key={s} size={16} fill="var(--accent)" color="var(--accent)" />)}
                </div>
                <p className="text-base leading-relaxed mb-8" style={{ color: 'var(--text-muted)' }}>"{t.quote}"</p>
                <div className="flex items-center gap-4">
                  <div className="w-11 h-11 rounded-full flex items-center justify-center text-[11px] font-black"
                    style={{ background: '#27272a', color: 'var(--text-muted)' }}>
                    {t.name.split(' ').map(w => w[0]).join('')}
                  </div>
                  <div>
                    <p className="text-sm font-bold">{t.name}</p>
                    <p className="text-[11px]" style={{ color: 'var(--text-dim)' }}>{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section ref={cta.ref} className="py-28 md:py-36 relative overflow-hidden" style={{ background: 'var(--bg-base)' }}>
        <div className="absolute inset-0 grid-dot-pattern opacity-30" />
        <div className={`max-w-4xl mx-auto px-6 text-center relative z-10 ${cta.visible ? 'animate-fade-up' : 'opacity-0'}`}
          style={{ animationFillMode: 'both' }}>

          <div className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-10 animate-pulse-glow"
            style={{ background: 'var(--accent)' }}>
            <Building2 size={36} color="#000" />
          </div>

          <h2 className="text-4xl md:text-7xl font-black tracking-tighter leading-[0.9] mb-8">
            Ready to take<br />control?
          </h2>
          <p className="text-lg md:text-xl leading-relaxed max-w-2xl mx-auto mb-14" style={{ color: 'var(--text-muted)' }}>
            Join property managers across Kenya who are spending less time on admin and more time growing their portfolio.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href={`${PORTAL}/auth?mode=signup`}
              className="px-12 py-6 rounded-xl text-base font-black uppercase tracking-widest flex items-center justify-center gap-3 group hover-lift"
              style={{ background: 'var(--accent)', color: '#000' }}>
              Start Using Dane <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </a>
          </div>

          <p className="mt-8 text-[11px] font-bold uppercase tracking-[0.15em]" style={{ color: 'var(--text-dim)' }}>
            Free to start · No credit card required
          </p>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ background: 'var(--bg-base)', borderTop: '1px solid var(--border)' }}>
        <div className="max-w-7xl mx-auto px-6 py-16">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
            {/* Brand */}
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

            {/* Links */}
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] mb-5" style={{ color: 'var(--text-dim)' }}>Product</p>
              <div className="space-y-3">
                {['Features', 'How It Works', 'Vacancies'].map(l => (
                  <a key={l} href={l === 'Vacancies' ? '/vacancies' : `#${l.toLowerCase().replace(/ /g, '-')}`}
                    className="block text-sm font-medium hover:text-white transition-colors" style={{ color: 'var(--text-muted)' }}>{l}</a>
                ))}
              </div>
            </div>

            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] mb-5" style={{ color: 'var(--text-dim)' }}>Access</p>
              <div className="space-y-3">
                {[
                  { label: 'Manager Portal', href: PORTAL },
                  { label: 'Owner Portal', href: PORTAL },
                  { label: 'Sign Up', href: `${PORTAL}/auth?mode=signup` },
                ].map(l => (
                  <a key={l.label} href={l.href}
                    className="block text-sm font-medium hover:text-white transition-colors flex items-center gap-1" style={{ color: 'var(--text-muted)' }}>
                    {l.label} <ArrowUpRight size={12} />
                  </a>
                ))}
              </div>
            </div>
          </div>

          <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4" style={{ borderTop: '1px solid var(--border)' }}>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em]" style={{ color: 'var(--text-dim)' }}>
              © {new Date().getFullYear()} Dane Properties Limited · All rights reserved
            </p>
            <div className="flex gap-6">
              {['Privacy', 'Terms'].map(l => (
                <a key={l} href="#" className="text-[10px] font-bold uppercase tracking-[0.15em] hover:text-white transition-colors" style={{ color: 'var(--text-dim)' }}>{l}</a>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
