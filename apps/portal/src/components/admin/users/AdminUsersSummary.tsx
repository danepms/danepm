"use client";

import React, { useEffect, useState } from 'react';
import { 
  Users, ShieldCheck, Mail, Smartphone, AlertTriangle, UserCheck, Activity, ChevronRight, Building2, Wallet, PieChart as PieIcon
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { api } from '@/lib/api';

interface SummaryProps {
  adminId: string;
  onNavigate: (view: 'list', role: string) => void;
}

const COLORS = ['#6366f1', '#8b5cf6', '#d946ef', '#f43f5e', '#ef4444'];

export const AdminUsersSummary = ({ adminId, onNavigate }: SummaryProps) => {
  const [stats, setStats] = useState<any>(null);
  const [timeline, setTimeline] = useState<any[]>([]);
  const [roleData, setRoleData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      setIsLoading(true);
      const [statsRes, timelineRes, roleRes] = await Promise.all([
        api.get<any>(`/admin/users/stats?adminId=${adminId}`),
        api.get<any>(`/admin/users/timeline?adminId=${adminId}`),
        api.get<any>(`/admin/users/roles?adminId=${adminId}`)
      ]);
      
      if (isMounted) {
        if (statsRes.success) setStats(statsRes.stats);
        if (timelineRes.success) setTimeline(timelineRes.data || []);
        if (roleRes.success) setRoleData(roleRes.data || []);
        setIsLoading(false);
      }
    };
    load();
    return () => { isMounted = false; };
  }, [adminId]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const statCards = [
    { label: 'Total People', value: stats?.total || 0, icon: Users, color: 'bg-indigo-500' },
    { label: 'Managers', value: stats?.managers || 0, icon: Building2, color: 'bg-blue-500' },
    { label: 'Owners', value: stats?.owners || 0, icon: Activity, color: 'bg-purple-500' },
    { label: 'Admins', value: stats?.admins || 0, icon: ShieldCheck, color: 'bg-emerald-500' },
    { label: 'Verified Email', value: stats?.verified || 0, icon: Mail, color: 'bg-teal-500' },
    { label: '2FA Enabled', value: stats?.twoFactor || 0, icon: Smartphone, color: 'bg-cyan-500' },
    { label: 'Suspended', value: stats?.suspended || 0, icon: AlertTriangle, color: 'bg-red-500' },
  ];

  return (
    <div className="space-y-8 animate-reveal">
      {/* Stats Row */}
      <div className="flex overflow-x-auto pb-4 gap-4 scrollbar-hide snap-x">
        {statCards.map((stat, i) => (
          <div key={i} className="min-w-[200px] bg-[var(--bg-panel)] p-6 rounded-2xl border border-[var(--border)] shadow-sm snap-start shrink-0">
            <div className="flex justify-between items-start mb-4">
              <div className={`${stat.color} w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-lg`}>
                <stat.icon size={20} />
              </div>
            </div>
            <h3 className="text-[10px] font-mono font-bold text-[var(--text-muted)] uppercase tracking-widest mb-1">{stat.label}</h3>
            <p className="text-3xl font-black tracking-tighter">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-[var(--bg-panel)] p-6 rounded-2xl border border-[var(--border)] shadow-sm">
          <h3 className="font-black text-lg uppercase tracking-tighter mb-6 flex items-center gap-2">
            <Activity className="text-indigo-500" size={20} /> Signups Over Time
          </h3>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={timeline} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" tick={{ fill: 'var(--text-muted)', fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'var(--bg-panel)', borderColor: 'var(--border)', borderRadius: '8px' }}
                  itemStyle={{ color: 'var(--text-base)' }}
                />
                <Area type="monotone" dataKey="count" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorCount)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-[var(--bg-panel)] p-6 rounded-2xl border border-[var(--border)] shadow-sm">
           <h3 className="font-black text-lg uppercase tracking-tighter mb-6 flex items-center gap-2">
            <PieIcon className="text-purple-500" size={20} /> Role Breakdown
          </h3>
          <div className="h-[200px] w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={roleData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {roleData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: 'var(--bg-panel)', borderColor: 'var(--border)', borderRadius: '8px' }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none flex-col">
               <span className="text-2xl font-black">{stats?.total || 0}</span>
               <span className="text-[10px] font-mono font-bold text-[var(--text-muted)] uppercase tracking-widest">Total</span>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap justify-center gap-4">
             {roleData.map((entry, index) => (
               <div key={index} className="flex items-center gap-2">
                 <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                 <span className="text-xs font-mono font-bold uppercase">{entry.name}</span>
               </div>
             ))}
          </div>
        </div>
      </div>

      {/* Role Navigation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { id: 'manager', label: 'Managers', desc: 'Property Operators', icon: Building2, color: 'text-blue-500 bg-blue-500/10 border-blue-500/20' },
          { id: 'owner', label: 'Owners', desc: 'Portfolio Holders', icon: Wallet, color: 'text-purple-500 bg-purple-500/10 border-purple-500/20' },
          { id: 'admin', label: 'Admins', desc: 'System Overseers', icon: ShieldCheck, color: 'text-indigo-500 bg-indigo-500/10 border-indigo-500/20' },
          { id: 'suspended', label: 'Suspended', desc: 'Restricted Access', icon: AlertTriangle, color: 'text-red-500 bg-red-500/10 border-red-500/20' },
        ].map((role) => {
          const Icon = role.icon;
          return (
            <button 
              key={role.id}
              onClick={() => onNavigate('list', role.id)}
              className="group relative bg-[var(--bg-panel)] p-6 rounded-2xl border border-[var(--border)] shadow-sm hover:shadow-lg transition-all text-left overflow-hidden"
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-6 border ${role.color}`}>
                <Icon size={24} className="group-hover:scale-110 transition-transform" />
              </div>
              <h3 className="font-black text-xl tracking-tighter mb-1 group-hover:text-[var(--admin-accent)] transition-colors">{role.label}</h3>
              <p className="font-mono text-[10px] text-[var(--text-muted)] uppercase font-bold tracking-widest">{role.desc}</p>
              
              <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all text-[var(--admin-accent)]">
                 <ChevronRight size={24} />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
