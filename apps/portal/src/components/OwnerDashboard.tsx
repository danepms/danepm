"use client";

import React, { useState } from 'react';
import { 
  BarChart3, Building2, Wallet, 
  TrendingUp, Activity, PieChart,
  Shield, LogOut, Sun, Moon, Bell,
  ChevronRight, Search, LayoutDashboard, Menu, Wrench,
  FileText, User
} from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';
import { usePathname } from 'next/navigation';
import Link from 'next/link';

interface OwnerDashboardProps {
  user: any;
  onLogout: () => void;
  children: React.ReactNode;
}

export const OwnerDashboard = ({ user, onLogout, children }: OwnerDashboardProps) => {
  const { theme, toggleTheme } = useTheme();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const pathname = usePathname();

  const TABS = [
    { id: 'overview', label: 'Portfolio Overview', icon: LayoutDashboard, href: '/dashboard/owner/overview' },
    { id: 'properties', label: 'Properties & Units', icon: Building2, href: '/dashboard/owner/properties' },
    { id: 'financials', label: 'Financials & Yields', icon: Wallet, href: '/dashboard/owner/financials' },
    { id: 'maintenance', label: 'Maintenance & Capex', icon: Wrench, href: '/dashboard/owner/maintenance' },
    { id: 'documents', label: 'Legal & Documents', icon: FileText, href: '/dashboard/owner/documents' },
    { id: 'settings', label: 'Account Settings', icon: User, href: '/dashboard/owner/settings' },
  ];

  const activeTab = TABS.find(t => pathname.includes(t.id))?.id || 'overview';

  return (
    <div className={`h-screen w-full font-sans bg-[var(--bg-base)] text-[var(--text-base)] flex flex-row transition-none ${theme === 'dark' ? 'theme-dark' : ''}`}>
      
      {/* --- SIDEBAR --- */}
      <aside className={`bg-[var(--bg-panel)] border-[var(--border)] border-r flex flex-col shrink-0 z-30 shadow-xl relative transition-all duration-300 ${isSidebarCollapsed ? 'w-20' : 'w-64'}`}>
        <div className={`flex items-center h-20 border-b border-[var(--border)] shrink-0 ${isSidebarCollapsed ? 'justify-center px-0' : 'px-6'}`}>
          <div className="w-9 h-9 rounded-lg bg-[var(--accent-bg)] text-[var(--accent-text)] flex items-center justify-center shadow-lg shrink-0">
            <Shield size={18} />
          </div>
          {!isSidebarCollapsed && (
            <div className="ml-3 flex flex-col overflow-hidden whitespace-nowrap">
              <span className="text-lg font-bold text-[var(--text-base)] tracking-tighter leading-none">Dane.</span>
              <span className="text-[9px] font-mono text-[var(--text-muted)] uppercase tracking-widest mt-1 opacity-70">Owner Portal</span>
            </div>
          )}
        </div>

        <nav className="flex-1 overflow-y-auto pt-6 px-4 custom-scrollbar">
          {!isSidebarCollapsed && (
            <p className="px-4 font-mono text-[9px] text-[var(--text-muted)] uppercase tracking-widest mb-4 opacity-50 whitespace-nowrap">Asset Management</p>
          )}
          
          <div className="space-y-1">
            {TABS.map((tab) => (
              <Link
                key={tab.id}
                href={tab.href}
                title={isSidebarCollapsed ? tab.label : undefined}
                className={`w-full flex items-center rounded-lg transition-all px-4 py-3 ${
                  activeTab === tab.id
                    ? 'bg-[var(--bg-ghost)] text-[var(--text-base)] shadow-sm'
                    : 'text-[var(--text-muted)] hover:text-[var(--text-base)] hover:bg-[var(--bg-ghost)]/50'
                }`}
              >
                <div className={`w-6 h-6 flex items-center justify-center shrink-0 transition-all ${
                  activeTab === tab.id ? 'text-[var(--accent-bg)]' : ''
                }`}>
                  <tab.icon size={18} />
                </div>
                {!isSidebarCollapsed && (
                  <span className="ml-3 text-sm font-bold tracking-tight flex-1 text-left whitespace-nowrap">{tab.label}</span>
                )}
              </Link>
            ))}
          </div>
        </nav>

        <div className="p-4 border-t border-[var(--border)] shrink-0">
          <button 
            className="flex items-center justify-between w-full p-2 rounded-lg bg-[var(--bg-ghost)]/50 border border-[var(--border)] hover:border-[var(--text-base)] transition-all"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-lg bg-[var(--text-base)] text-[var(--bg-panel)] flex items-center justify-center font-bold text-sm shrink-0">
                {user?.name?.slice(0, 2) || "IN"}
              </div>
              {!isSidebarCollapsed && (
                <div className="flex-1 min-w-0 text-left">
                  <p className="text-sm font-bold text-[var(--text-base)] truncate leading-tight">{user?.name || "Investor"}</p>
                  <p className="font-mono text-[8px] text-[var(--text-muted)] uppercase tracking-widest truncate">Premium Owner</p>
                </div>
              )}
            </div>
          </button>
        </div>
      </aside>

      {/* --- MAIN STAGE --- */}
      <div className="flex-1 flex flex-col min-w-0 min-h-0 overflow-hidden relative">
        
        {/* --- HEADER --- */}
        <header className="h-20 glass-header border-b border-[var(--border)] flex items-center justify-between px-8 shrink-0 relative z-40 transition-all duration-500">
          <div className="flex items-center gap-4">
             <button onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)} className="p-2 hover:bg-[var(--bg-ghost)] rounded-lg text-[var(--text-muted)]">
               <Menu size={20} />
             </button>
             <h2 className="text-xl font-black uppercase tracking-tighter">
                {TABS.find(t => t.id === activeTab)?.label || 'Overview'}
             </h2>
          </div>

          <div className="flex items-center gap-4 ml-auto">
            <div className="hidden xl:flex items-center gap-3 px-4 h-10 rounded-lg bg-[var(--bg-ghost)]/50 border border-[var(--border)] shadow-sm">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[var(--text-muted)]">Live Data</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button onClick={toggleTheme} className="w-10 h-10 flex items-center justify-center rounded-lg bg-[var(--bg-panel)] border border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text-base)] shadow-sm transition-all">
                {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
              </button>
              <button className="w-10 h-10 flex items-center justify-center rounded-lg bg-[var(--bg-panel)] border border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text-base)] shadow-sm transition-all relative">
                <Bell size={18} />
                <div className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-[var(--alert-bg)] shadow-[0_0_8px_var(--alert-bg)] animate-pulse" />
              </button>
              <button onClick={onLogout} className="w-10 h-10 flex items-center justify-center rounded-lg bg-[var(--bg-panel)] border border-red-500/20 text-red-500 hover:bg-red-500/10 shadow-sm transition-all ml-2">
                 <LogOut size={18} />
              </button>
            </div>
          </div>
        </header>

        {/* --- CONTENT --- */}
        <main className="flex-1 overflow-y-auto p-8 custom-scrollbar bg-[var(--bg-base)]">
          {children}
        </main>
      </div>

      <style jsx>{`
        .glass-header {
          backdrop-filter: blur(12px);
          background: rgba(var(--bg-base-rgb), 0.8);
        }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: var(--border); opacity: 0.1; border-radius: 10px; }
      `}</style>
    </div>
  );
};
