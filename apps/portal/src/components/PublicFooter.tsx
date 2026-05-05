"use client";

import React from 'react';
import { Building2, Globe as Github, Globe as Twitter, Globe as Linkedin, Mail } from 'lucide-react';

export const PublicFooter = () => {
  const currentYear = new Date().getFullYear();

  const sections = [
    {
      title: 'Product',
      links: ['Features', 'How it works', 'Pricing', 'About DanePMS']
    },
    {
      title: 'Company',
      links: ['Talk to us', 'Blog', 'Careers', 'Contact']
    },
    {
      title: 'Legal',
      links: ['Terms of Service', 'Privacy Policy', 'Cookie Policy', 'Licenses']
    },
    {
      title: 'Social',
      links: ['Twitter', 'LinkedIn', 'Github', 'Instagram']
    }
  ];

  return (
    <footer className="w-full bg-[var(--bg-panel)] border-t border-[var(--border)] pt-20 pb-10 px-6 md:px-16 z-10 mt-auto">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-12 mb-20">
          <div className="col-span-2 space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[var(--text-base)] text-[var(--bg-panel)] rounded-lg flex items-center justify-center shadow-lg">
                <Building2 size={20} />
              </div>
              <span className="text-2xl font-black tracking-tighter uppercase text-[var(--text-base)]">Dane.</span>
            </div>
            <p className="text-sm font-mono text-[var(--text-muted)] uppercase font-bold leading-relaxed max-w-xs opacity-70">
              The premium property management system for modern owners and managers.
            </p>
            <div className="flex items-center gap-4 pt-4 text-[var(--text-muted)]">
              {[Twitter, Linkedin, Github, Mail].map((Icon, i) => (
                <button key={i} className="hover:text-[var(--accent-bg)] transition-colors">
                  <Icon size={18} />
                </button>
              ))}
            </div>
          </div>

          {sections.map((section) => (
            <div key={section.title} className="space-y-6">
              <h4 className="font-mono text-[10px] font-black uppercase tracking-[0.3em] text-[var(--text-base)] opacity-40">
                {section.title}
              </h4>
              <ul className="space-y-3">
                {section.links.map((link) => (
                  <li key={link}>
                    <button className="text-sm font-bold text-[var(--text-muted)] hover:text-[var(--accent-bg)] transition-colors">
                      {link}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="flex flex-col md:flex-row items-center justify-between pt-10 border-t border-[var(--border)] border-opacity-30">
          <p className="font-mono text-[10px] text-[var(--text-muted)] uppercase font-bold tracking-widest">
            © {currentYear} DANE PROPERTY MANAGEMENT. ALL RIGHTS RESERVED.
          </p>
          <div className="flex items-center gap-6 mt-4 md:mt-0 font-mono text-[10px] text-[var(--text-muted)] uppercase font-bold tracking-widest">
            <span>Built with precision</span>
            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
            <span>v1.0.0</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
