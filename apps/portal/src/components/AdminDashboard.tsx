"use client";

import React, { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { 
  Building2, Users, Sun, Moon, Bell, 
  Search, CircleDot, LogOut, 
  ChevronRight, ChevronDown, Plus, Activity, Cpu,
  Wallet, Receipt, ArrowLeftRight, BarChart3,
  Wrench, AlertCircle, HardHat, MessageSquare,
  Zap, Copy, Clock, Shield, RefreshCw,
  PanelLeftClose, PanelLeftOpen, LayoutTemplate,
  Globe, ShieldCheck, Settings, Database
} from 'lucide-react';

import { useTheme } from '@/context/ThemeContext';
import { signOut, useSession } from '@/lib/auth-client';

type TabItem = {
  id: string;
  label: string;
  icon: any;
  children?: TabItem[];
};

const ADMIN_TABS: TabItem[] = [
  { id: 'overview', label: 'Everything', icon: Globe },
  { id: 'users', label: 'People', icon: Users },
  { id: 'properties', label: 'Houses', icon: Building2 },
  { id: 'finance', label: 'Money', icon: Wallet },
  { id: 'activity', label: 'Activity', icon: ShieldCheck },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export function AdminDashboard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();
  const { data: session } = useSession();
  
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState(pathname.split('/').pop() || 'overview');

  const handleSignOut = async () => {
    await signOut();
    router.push('/auth');
  };

  const navTo = (id: string) => {
    setActiveTab(id);
    router.push(`/dashboard/admin/${id}`);
  };

  return (
    <div className={`min-h-screen flex transition-colors duration-300 ${theme === 'dark' ? 'theme-dark bg-[#0a0a0c]' : 'bg-[#f4f7fa]'} text-[var(--text-base)]`}>
      {/* Dynamic Indigo/Blue Accent for Admin */}
      <style jsx global>{`
        :root {
          --admin-accent: #6366f1; /* Indigo */
          --admin-accent-soft: rgba(99, 102, 241, 0.1);
        }
      `}</style>

      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'w-72' : 'w-20'} border-r border-[var(--border)] transition-all duration-500 ease-in-out flex flex-col z-50 bg-[var(--bg-panel)] relative shadow-2xl`}>
        <div className="p-6 flex items-center justify-between">
          {sidebarOpen ? (
            <div className="flex items-center gap-3 animate-reveal">
              <div className="w-10 h-10 bg-[var(--admin-accent)] rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
                <Shield size={22} className="text-white" />
              </div>
              <div className="flex flex-col">
                <span className="font-black text-xl tracking-tighter leading-none">DANE.</span>
                <span className="text-[10px] font-mono font-bold uppercase tracking-widest opacity-40">Admin</span>
              </div>
            </div>
          ) : (
            <div className="w-10 h-10 bg-[var(--admin-accent)] rounded-xl flex items-center justify-center mx-auto shadow-lg shadow-indigo-500/20 cursor-pointer" onClick={() => setSidebarOpen(true)}>
              <Shield size={20} className="text-white" />
            </div>
          )}
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-6">
          {ADMIN_TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => navTo(tab.id)}
                className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all group relative ${
                  isActive 
                    ? 'bg-[var(--admin-accent)] text-white shadow-lg shadow-indigo-500/20' 
                    : 'text-[var(--text-muted)] hover:bg-[var(--admin-accent-soft)] hover:text-[var(--admin-accent)]'
                }`}
              >
                <tab.icon size={20} className={isActive ? 'text-white' : 'group-hover:scale-110 transition-transform'} />
                {sidebarOpen && <span className="font-mono text-[10px] uppercase font-bold tracking-widest">{tab.label}</span>}
                {isActive && sidebarOpen && <div className="absolute right-4 w-1.5 h-1.5 rounded-full bg-white animate-pulse" />}
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-[var(--border)] space-y-4">
          <button 
            onClick={toggleTheme}
            className="w-full flex items-center gap-3 p-3 text-[var(--text-muted)] hover:bg-[var(--admin-accent-soft)] hover:text-[var(--admin-accent)] transition-all rounded-xl"
          >
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            {sidebarOpen && <span className="font-mono text-[10px] uppercase font-bold tracking-widest">{theme} Mode</span>}
          </button>
          
          <button 
            onClick={handleSignOut}
            className="w-full flex items-center gap-3 p-3 text-red-500 hover:bg-red-500/10 transition-all rounded-xl"
          >
            <LogOut size={20} />
            {sidebarOpen && <span className="font-mono text-[10px] uppercase font-bold tracking-widest">Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        {/* Top Header */}
        <header className="h-20 border-b border-[var(--border)] flex items-center justify-between px-8 bg-[var(--bg-panel)] z-40">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 hover:bg-[var(--admin-accent-soft)] rounded-lg transition-colors text-[var(--admin-accent)]"
            >
              {sidebarOpen ? <PanelLeftClose size={20} /> : <PanelLeftOpen size={20} />}
            </button>
            <div className="h-6 w-px bg-[var(--border)] mx-2" />
            <h2 className="font-black text-xl uppercase tracking-tighter italic drop-shadow-sm">
              {ADMIN_TABS.find(t => t.id === activeTab)?.label || 'View'}
            </h2>
          </div>

          <div className="flex items-center gap-6">
            <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-[var(--bg-base)] border border-[var(--border)] rounded-full text-[var(--text-muted)] focus-within:border-[var(--admin-accent)] focus-within:text-[var(--admin-accent)] transition-all">
              <Search size={16} />
              <input type="text" placeholder="SEARCH..." className="bg-transparent border-none outline-none font-mono text-[10px] w-48 uppercase font-bold tracking-widest" />
            </div>
            
            <button className="relative p-2 text-[var(--text-muted)] hover:text-[var(--admin-accent)] transition-colors">
              <Bell size={20} />
              <div className="absolute top-1 right-1 w-2 h-2 bg-[var(--admin-accent)] rounded-full border-2 border-[var(--bg-panel)]" />
            </button>

            <div className="flex items-center gap-3 pl-6 border-l border-[var(--border)]">
              <div className="flex flex-col items-end hidden sm:flex">
                <span className="font-black text-[12px] uppercase tracking-tighter">{session?.user?.name || 'User'}</span>
                <span className="text-[10px] font-mono font-bold text-[var(--admin-accent)] uppercase tracking-widest">Admin</span>
              </div>
              <div className="w-10 h-10 rounded-full border-2 border-[var(--admin-accent)] p-0.5 shadow-lg shadow-indigo-500/20">
                <div className="w-full h-full bg-[var(--admin-accent-soft)] rounded-full flex items-center justify-center overflow-hidden">
                   {session?.user?.image ? <img src={session.user.image} alt="avatar" /> : <Shield size={18} className="text-[var(--admin-accent)]" />}
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Dynamic Content */}
        <section className="flex-1 overflow-y-auto p-8 relative">
          {children}
        </section>
      </main>
    </div>
  );
}
