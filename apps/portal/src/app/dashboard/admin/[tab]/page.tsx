"use client";

import React from 'react';
import { useParams } from 'next/navigation';
import { useSession } from '@/lib/auth-client';
import { 
  Building2, Users, Wallet, ShieldCheck, 
  Settings, Globe, Activity, TrendingUp,
  AlertCircle, CheckCircle2, Clock
} from 'lucide-react';
import { AdminUsersTab } from '@/components/admin/users/AdminUsersTab';
import { AdminPropertiesTab } from '@/components/admin/properties/AdminPropertiesTab';

export default function AdminTabPage() {
  const params = useParams();
  const tab = params.tab as string;
  const { data: session } = useSession();

  // Placeholder for when I build actual components
  const renderTabContent = () => {
    if (!session) return null;

    switch (tab) {
      case 'overview':
        return <OverviewPlaceholder />;
      case 'users':
        return <AdminUsersTab adminId={session.user.id} />;
      case 'properties':
        return <AdminPropertiesTab adminId={session.user.id} />;
      case 'finance':
        return <TabPlaceholder name="Money" icon={Wallet} color="text-emerald-500" />;
      case 'activity':
        return <TabPlaceholder name="Activity" icon={ShieldCheck} color="text-purple-500" />;
      case 'settings':
        return <TabPlaceholder name="Settings" icon={Settings} color="text-slate-500" />;
      default:
        return <TabPlaceholder name="Loading" icon={Activity} color="text-orange-500" />;
    }
  };

  return (
    <div className="animate-reveal">
      {renderTabContent()}
    </div>
  );
}

function OverviewPlaceholder() {
  return (
    <div className="space-y-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Active Managers', value: '12', change: '+2', icon: Users, color: 'bg-blue-500' },
          { label: 'Houses', value: '48', change: '+5', icon: Building2, color: 'bg-indigo-500' },
          { label: 'Money This Month', value: 'KES 2.4M', change: '+12%', icon: Wallet, color: 'bg-emerald-500' },
          { label: 'System Check', value: '99.9%', change: 'Optimal', icon: Activity, color: 'bg-purple-500' },
        ].map((stat, i) => (
          <div key={i} className="bg-[var(--bg-panel)] p-6 rounded-2xl border border-[var(--border)] shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div className={`${stat.color} w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-lg`}>
                <stat.icon size={24} />
              </div>
              <span className="text-[10px] font-mono font-bold text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded uppercase tracking-wider">
                {stat.change}
              </span>
            </div>
            <h3 className="text-sm font-mono font-bold text-[var(--text-muted)] uppercase tracking-widest mb-1">{stat.label}</h3>
            <p className="text-3xl font-black tracking-tighter">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-[var(--bg-panel)] rounded-2xl border border-[var(--border)] p-8">
          <div className="flex justify-between items-center mb-8">
            <h3 className="font-black text-xl uppercase tracking-tighter flex items-center gap-3">
              <TrendingUp className="text-indigo-500" />
              Money
            </h3>
            <select className="bg-[var(--bg-base)] border border-[var(--border)] rounded-lg px-4 py-2 font-mono text-[10px] uppercase font-bold outline-none">
              <option>Last 30 Days</option>
              <option>Last 6 Months</option>
            </select>
          </div>
          <div className="h-[300px] flex items-center justify-center border-2 border-dashed border-[var(--border)] rounded-xl opacity-40">
             <span className="font-mono text-[10px] uppercase font-bold tracking-widest text-[var(--text-muted)] italic">Loading details...</span>
          </div>
        </div>

        <div className="bg-[var(--bg-panel)] rounded-2xl border border-[var(--border)] p-8">
           <h3 className="font-black text-xl uppercase tracking-tighter flex items-center gap-3 mb-8">
              <Activity className="text-orange-500" />
              Activity
            </h3>
            <div className="space-y-6">
              {[
                { event: 'New manager', time: '2m ago', user: 'James Kamau', status: 'pending' },
                { event: 'Big payment', time: '14m ago', user: 'Sunrise Apts', status: 'success' },
                { event: 'System check', time: '1s ago', user: 'CRON_DAEMON', status: 'success' },
                { event: 'Withdrawal', time: '1h ago', user: 'Elite Mgmt', status: 'warning' },
              ].map((log, i) => (
                <div key={i} className="flex gap-4 items-start pb-6 border-b border-[var(--border)] last:border-0 last:pb-0">
                  <div className={`mt-1 w-2 h-2 rounded-full ${
                    log.status === 'success' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' :
                    log.status === 'warning' ? 'bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.5)]' :
                    'bg-blue-500 animate-pulse'
                  }`} />
                  <div className="flex-1">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-[var(--text-base)]">{log.event}</span>
                      <span className="font-mono text-[9px] text-[var(--text-muted)] font-bold">{log.time}</span>
                    </div>
                    <p className="text-[10px] text-[var(--text-muted)] uppercase font-medium">{log.user}</p>
                  </div>
                </div>
              ))}
            </div>
        </div>
      </div>
    </div>
  );
}

function TabPlaceholder({ name, icon: Icon, color }: { name: string, icon: any, color: string }) {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-6 bg-[var(--bg-panel)] rounded-3xl border border-[var(--border)] border-dashed border-2">
      <div className={`w-20 h-20 ${color} bg-opacity-10 rounded-3xl flex items-center justify-center animate-bounce`}>
        <Icon size={40} className={color} />
      </div>
      <div className="text-center">
        <h3 className="font-black text-2xl uppercase tracking-tighter mb-2 italic text-[var(--text-base)]">{name}</h3>
        <p className="font-mono text-[10px] uppercase font-bold text-[var(--text-muted)] tracking-[0.3em]">
          Loading...
        </p>
      </div>
      <div className="flex items-center gap-2 px-4 py-2 bg-[var(--bg-base)] border border-[var(--border)] rounded-full animate-pulse">
        <div className="w-2 h-2 bg-indigo-500 rounded-full" />
        <span className="font-mono text-[9px] uppercase font-black text-indigo-500 tracking-widest">Checking...</span>
      </div>
    </div>
  );
}
