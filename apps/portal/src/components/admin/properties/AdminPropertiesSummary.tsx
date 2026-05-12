import React, { useEffect, useState } from 'react';
import { 
  Building2, Activity, Home, Key, UserX, UserCheck, Search, ChevronRight, Zap, PlayCircle 
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar } from 'recharts';
import { api } from '@/lib/api';

interface SummaryProps {
  adminId: string;
  onNavigate: (view: 'list', filter: string) => void;
}

const COLORS = ['#6366f1', '#8b5cf6', '#d946ef', '#f43f5e'];

export const AdminPropertiesSummary = ({ adminId, onNavigate }: SummaryProps) => {
  const [stats, setStats] = useState<any>(null);
  const [timeline, setTimeline] = useState<any[]>([]);
  const [distribution, setDistribution] = useState<any[]>([]);
  const [topOccupancy, setTopOccupancy] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      setIsLoading(true);
      const [statsRes, timelineRes, distRes, topRes] = await Promise.all([
        api.get<any>(`/admin/properties/stats?adminId=${adminId}`),
        api.get<any>(`/admin/properties/timeline?adminId=${adminId}`),
        api.get<any>(`/admin/properties/unit-distribution?adminId=${adminId}`),
        api.get<any>(`/admin/properties/top-occupancy?adminId=${adminId}`)
      ]);
      
      if (isMounted) {
        if (statsRes.success) setStats(statsRes.stats);
        if (timelineRes.success) setTimeline(timelineRes.data || []);
        if (distRes.success) setDistribution(distRes.data || []);
        if (topRes.success) setTopOccupancy(topRes.data || []);
        setIsLoading(false);
      }
    };
    load();
    return () => { isMounted = false; };
  }, [adminId]);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-pulse">
        <div className="lg:col-span-3 flex gap-4 overflow-x-hidden">
          {[1,2,3,4].map(i => <div key={i} className="h-32 w-64 bg-[var(--bg-panel)] rounded-2xl border border-[var(--border)] shrink-0" />)}
        </div>
        <div className="lg:col-span-2 h-[350px] bg-[var(--bg-panel)] rounded-2xl border border-[var(--border)]" />
        <div className="h-[350px] bg-[var(--bg-panel)] rounded-2xl border border-[var(--border)]" />
        <div className="lg:col-span-3 h-[400px] bg-[var(--bg-panel)] rounded-2xl border border-[var(--border)]" />
      </div>
    );
  }

  const statCards = [
    { label: 'Total Houses', value: stats?.total || 0, icon: Building2, color: 'bg-indigo-500' },
    { label: 'Live', value: stats?.live || 0, icon: PlayCircle, color: 'bg-emerald-500' },
    { label: 'In Setup', value: stats?.inSetup || 0, icon: Zap, color: 'bg-orange-500' },
    { label: 'Total Units', value: stats?.totalUnits || 0, icon: Home, color: 'bg-blue-500' },
    { label: 'Occupied', value: stats?.occupiedUnits || 0, icon: Key, color: 'bg-purple-500' },
    { label: 'Vacancy Rate', value: `${(stats?.vacancyRate || 0).toFixed(1)}%`, icon: Activity, color: 'bg-pink-500' },
    { label: 'With Owner', value: stats?.withOwner || 0, icon: UserCheck, color: 'bg-teal-500' },
    { label: 'No Owner', value: stats?.noOwner || 0, icon: UserX, color: 'bg-red-500' },
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
            <Activity className="text-indigo-500" size={20} /> Houses Added
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

        <div className="bg-[var(--bg-panel)] p-6 rounded-2xl border border-[var(--border)] shadow-sm flex flex-col">
           <h3 className="font-black text-lg uppercase tracking-tighter mb-6 flex items-center gap-2">
            <Home className="text-purple-500" size={20} /> Unit Types
          </h3>
          <div className="flex-1 w-full relative min-h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={distribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {distribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: 'var(--bg-panel)', borderColor: 'var(--border)', borderRadius: '8px' }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none flex-col">
               <span className="text-2xl font-black">{stats?.totalUnits || 0}</span>
               <span className="text-[10px] font-mono font-bold text-[var(--text-muted)] uppercase tracking-widest">Total</span>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap justify-center gap-4">
             {distribution.map((entry, index) => (
               <div key={index} className="flex items-center gap-2">
                 <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                 <span className="text-xs font-mono font-bold uppercase">{entry.name}</span>
               </div>
             ))}
          </div>
        </div>
      </div>

      <div className="bg-[var(--bg-panel)] p-6 rounded-2xl border border-[var(--border)] shadow-sm">
        <h3 className="font-black text-lg uppercase tracking-tighter mb-6 flex items-center gap-2">
          <Building2 className="text-pink-500" size={20} /> Top Occupancy
        </h3>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={topOccupancy} layout="vertical" margin={{ top: 0, right: 0, left: 40, bottom: 0 }}>
              <XAxis type="number" domain={[0, 100]} hide />
              <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fill: 'var(--text-base)', fontSize: 11, fontWeight: 'bold' }} width={120} />
              <Tooltip 
                cursor={{ fill: 'var(--bg-base)' }}
                contentStyle={{ backgroundColor: 'var(--bg-panel)', borderColor: 'var(--border)', borderRadius: '8px' }}
                formatter={(value: any) => [`${Number(value).toFixed(1)}%`, 'Occupancy']}
              />
              <Bar dataKey="rate" fill="#d946ef" radius={[0, 4, 4, 0]}>
                {topOccupancy.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={index < 3 ? '#d946ef' : '#8b5cf6'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Filter Navigation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { id: 'live', label: 'Live Houses', desc: 'Fully operational', icon: PlayCircle, color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20' },
          { id: 'setup', label: 'In Setup', desc: 'Incomplete wizard', icon: Zap, color: 'text-orange-500 bg-orange-500/10 border-orange-500/20' },
          { id: 'unowned', label: 'Unowned', desc: 'Needs owner invite', icon: UserX, color: 'text-amber-500 bg-amber-500/10 border-amber-500/20' },
          { id: 'all', label: 'All Houses', desc: 'View complete registry', icon: Building2, color: 'text-indigo-500 bg-indigo-500/10 border-indigo-500/20' },
        ].map((filter) => {
          const Icon = filter.icon;
          return (
            <button 
              key={filter.id}
              onClick={() => onNavigate('list', filter.id)}
              className="group relative bg-[var(--bg-panel)] p-6 rounded-2xl border border-[var(--border)] shadow-sm hover:shadow-lg transition-all text-left overflow-hidden"
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-6 border ${filter.color}`}>
                <Icon size={24} className="group-hover:scale-110 transition-transform" />
              </div>
              <h3 className="font-black text-xl tracking-tighter mb-1 group-hover:text-[var(--admin-accent)] transition-colors">{filter.label}</h3>
              <p className="font-mono text-[10px] text-[var(--text-muted)] uppercase font-bold tracking-widest">{filter.desc}</p>
              
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
