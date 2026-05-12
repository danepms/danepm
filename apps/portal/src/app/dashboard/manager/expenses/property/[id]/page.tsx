"use client";

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  Receipt, TrendingUp, Building2, Home, Users, 
  ArrowLeft, Search, Activity, Wallet, AlertCircle,
  PieChart as PieIcon, BarChart3, ChevronRight,
  ArrowUpRight, Clock, CheckCircle2, MoreHorizontal,
  Download
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, PieChart, Pie, Cell, AreaChart, 
  Area
} from 'recharts';
import { api } from '@/lib/api';
import { useSession } from '@/lib/auth-client';
import Link from 'next/link';

const COLORS = ['#22c55e', '#ef4444', '#f59e0b', '#3b82f6', '#a855f7', '#ec4899', '#06b6d4'];

export default function PropertyExpensesPage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();
  const { data: session } = useSession();
  
  const [property, setProperty] = useState<any>(null);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [requests, setRequests] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'expenses' | 'maintenance' | 'analytics'>('expenses');
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  useEffect(() => {
    const load = async () => {
      if (!session?.user?.id || !id) return;
      setIsLoading(true);
      const [propRes, expRes, reqRes] = await Promise.all([
        api.get<any>(`/properties/${id}?managerId=${session.user.id}`),
        api.get<any>(`/maintenance/expenses?managerId=${session.user.id}&propertyId=${id}`),
        api.get<any>(`/maintenance/requests?managerId=${session.user.id}&propertyId=${id}`)
      ]);

      if (propRes.success) setProperty(propRes.property);
      if (expRes.success) setExpenses(expRes.expenses || []);
      if (reqRes.success) setRequests(reqRes.requests || []);
      setIsLoading(false);
    };
    load();
  }, [id, session?.user?.id]);

  const totalBurn = expenses.reduce((acc, e) => acc + parseFloat(e.amount), 0);
  
  // Grouping by Unit for Expenses Tab
  const unitGroups = expenses.reduce((acc: any, exp) => {
    const uId = exp.u_id || exp.unitId || 'Common Area';
    if (!acc[uId]) acc[uId] = { id: uId, total: 0, count: 0, items: [] };
    acc[uId].total += parseFloat(exp.amount);
    acc[uId].count += 1;
    acc[uId].items.push(exp);
    return acc;
  }, {});

  const filteredExpenses = expenses.filter(e => 
    e.description.toLowerCase().includes(searchTerm.toLowerCase()) || 
    e.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (e.u_id || e.unitId || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const paginatedExpenses = filteredExpenses.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  // Analytics Data
  const categoryData = Object.entries(
    expenses.reduce((acc: any, e) => {
      acc[e.category] = (acc[e.category] || 0) + parseFloat(e.amount);
      return acc;
    }, {})
  ).map(([name, value]) => ({ name: name.toUpperCase(), value }));

  const timeData = expenses
    .reduce((acc: any, e) => {
      const date = new Date(e.paidDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      acc[date] = (acc[date] || 0) + parseFloat(e.amount);
      return acc;
    }, {});
  const timeChartData = Object.entries(timeData).map(([name, value]) => ({ name, value })).reverse();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[var(--bg-base)] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-[var(--accent-bg)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-8 max-w-[1600px] mx-auto space-y-8 animate-reveal">
      
      {/* COMPACT HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-6">
          <button 
            onClick={() => router.back()}
            className="p-3 hover:bg-[var(--bg-ghost)] transition-colors border border-[var(--border)] border-opacity-10 rounded-xl text-[var(--text-muted)]"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-4xl font-black uppercase tracking-tighter leading-none">{property?.name || 'Asset Audit'}</h1>
            <p className="font-mono text-[9px] text-[var(--text-muted)] uppercase font-bold tracking-[0.3em] mt-2">
              Forensic Command Center · {id.slice(0, 8)}
            </p>
          </div>
        </div>

        <div className="flex bg-[var(--bg-ghost)] border border-[var(--border)] border-opacity-10 p-1 rounded-xl">
          {[
            { id: 'expenses', label: 'Expenses', icon: Receipt },
            { id: 'maintenance', label: 'Maintenance', icon: Activity },
            { id: 'analytics', label: 'Analytics', icon: BarChart3 }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id as any); setPage(1); }}
              className={`flex items-center gap-2 px-6 py-2.5 font-mono text-[10px] font-black uppercase transition-all rounded-lg ${activeTab === tab.id ? 'bg-[var(--text-base)] text-[var(--bg-panel)] shadow-lg' : 'text-[var(--text-muted)] hover:text-[var(--text-base)]'}`}
            >
              <tab.icon size={14} />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* QUICK STATS - HIGH DENSITY */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Asset Burn', val: `KES ${totalBurn.toLocaleString()}`, color: 'text-red-500', icon: TrendingUp },
          { label: 'Burn Velocity', val: `${Math.round(totalBurn / Math.max(expenses.length, 1)).toLocaleString()} / rep`, color: 'text-[var(--text-base)]', icon: Activity },
          { label: 'Unit Density', val: `${Object.keys(unitGroups).length} Units`, color: 'text-[var(--text-base)]', icon: Home },
          { label: 'Open Tickets', val: requests.filter(r => r.status !== 'resolved').length, color: 'text-amber-500', icon: AlertCircle }
        ].map((stat, i) => (
          <div key={i} className="glass-card bg-[var(--bg-panel)] border border-[var(--border)] border-opacity-10 p-5 rounded-2xl">
            <p className="font-mono text-[8px] uppercase text-[var(--text-muted)] font-black tracking-widest mb-2 flex items-center gap-2">
              <stat.icon size={10} /> {stat.label}
            </p>
            <h3 className={`text-2xl font-black tracking-tighter ${stat.color}`}>{stat.val}</h3>
          </div>
        ))}
      </div>

      {activeTab === 'expenses' && (
        <div className="space-y-6 animate-reveal">
          <div className="flex items-center justify-between">
            <div className="relative w-full max-w-md">
              <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
              <input 
                type="text"
                placeholder="Filter by description, category, or unit..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-[var(--bg-panel)] border border-[var(--border)] border-opacity-10 pl-12 pr-4 py-3 rounded-2xl font-mono text-[10px] font-black uppercase outline-none focus:border-[var(--accent-bg)] w-full"
              />
            </div>
            <div className="flex gap-2">
              <button className="p-3 bg-[var(--bg-panel)] border border-[var(--border)] border-opacity-10 rounded-xl hover:bg-[var(--bg-ghost)] transition-all">
                <Download size={18} className="text-[var(--text-muted)]" />
              </button>
            </div>
          </div>

          <div className="bg-[var(--bg-panel)] border border-[var(--border)] border-opacity-10 rounded-3xl overflow-hidden shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[var(--bg-ghost)]/50 border-b border-[var(--border)] border-opacity-10">
                    <th className="p-6 font-mono text-[9px] uppercase font-black tracking-widest opacity-40">Date</th>
                    <th className="p-6 font-mono text-[9px] uppercase font-black tracking-widest opacity-40">Unit</th>
                    <th className="p-6 font-mono text-[9px] uppercase font-black tracking-widest opacity-40">Category</th>
                    <th className="p-6 font-mono text-[9px] uppercase font-black tracking-widest opacity-40">Description</th>
                    <th className="p-6 font-mono text-[9px] uppercase font-black tracking-widest opacity-40">Amount</th>
                    <th className="p-6 font-mono text-[9px] uppercase font-black tracking-widest opacity-40 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)] divide-opacity-5">
                  {paginatedExpenses.map((exp) => (
                    <tr key={exp.id} className="hover:bg-[var(--bg-ghost)]/30 transition-colors group">
                      <td className="p-6 font-mono text-[10px] font-black uppercase whitespace-nowrap">
                        {new Date(exp.paidDate || exp.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </td>
                      <td className="p-6">
                        <span className="flex items-center gap-2 font-black text-xs uppercase">
                          <Home size={12} className="text-[var(--text-muted)]" />
                          {exp.u_id || exp.unitId || 'Common Area'}
                        </span>
                      </td>
                      <td className="p-6">
                        <span className="px-3 py-1 bg-[var(--bg-ghost)] border border-[var(--border)] border-opacity-10 rounded-full font-mono text-[8px] font-black uppercase tracking-widest">
                          {exp.category}
                        </span>
                      </td>
                      <td className="p-6">
                        <p className="font-black text-xs uppercase truncate max-w-xs">{exp.description}</p>
                      </td>
                      <td className="p-6 font-mono text-xs font-black text-red-500">
                        KES {parseFloat(exp.amount).toLocaleString()}
                      </td>
                      <td className="p-6 text-right">
                        <Link href={`/dashboard/manager/expenses/${exp.id}`} className="inline-flex p-2 hover:bg-[var(--text-base)] hover:text-[var(--bg-panel)] rounded-lg transition-all">
                          <ArrowUpRight size={16} />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {filteredExpenses.length === 0 && (
              <div className="p-20 text-center">
                <AlertCircle size={40} className="mx-auto mb-4 text-[var(--text-muted)] opacity-20" />
                <p className="font-mono text-xs uppercase font-black tracking-widest opacity-20">No matching records found</p>
              </div>
            )}
            
            {/* PAGINATION */}
            <div className="p-6 border-t border-[var(--border)] border-opacity-5 flex items-center justify-between">
              <p className="font-mono text-[9px] text-[var(--text-muted)] uppercase font-black">
                Showing {Math.min(filteredExpenses.length, (page - 1) * ITEMS_PER_PAGE + 1)} - {Math.min(filteredExpenses.length, page * ITEMS_PER_PAGE)} of {filteredExpenses.length} Records
              </p>
              <div className="flex gap-2">
                <button 
                  disabled={page === 1}
                  onClick={() => setPage(page - 1)}
                  className="px-4 py-2 border border-[var(--border)] border-opacity-10 rounded-lg font-mono text-[9px] font-black uppercase disabled:opacity-20 hover:bg-[var(--bg-ghost)] transition-all"
                >
                  Prev
                </button>
                <button 
                  disabled={page * ITEMS_PER_PAGE >= filteredExpenses.length}
                  onClick={() => setPage(page + 1)}
                  className="px-4 py-2 border border-[var(--border)] border-opacity-10 rounded-lg font-mono text-[9px] font-black uppercase disabled:opacity-20 hover:bg-[var(--bg-ghost)] transition-all"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'maintenance' && (
        <div className="animate-reveal grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* TICKET FEED */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between mb-2">
                <h4 className="font-black uppercase tracking-tighter text-sm flex items-center gap-2">
                    <Activity size={16} className="text-amber-500" />
                    Operational Feed
                </h4>
            </div>
            {requests.map((req: any) => (
              <div key={req.id} className="glass-card bg-[var(--bg-panel)] border border-[var(--border)] border-opacity-5 rounded-2xl p-6 hover:border-[var(--accent-bg)] border-opacity-20 transition-all group">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${req.status === 'resolved' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'}`}>
                      {req.status === 'resolved' ? <CheckCircle2 size={20} /> : <Clock size={20} />}
                    </div>
                    <div>
                      <h5 className="font-black text-xs uppercase tracking-tight">{req.title}</h5>
                      <p className="font-mono text-[8px] text-[var(--text-muted)] uppercase tracking-widest">
                        {req.unitId || 'Common Area'} · {req.category}
                      </p>
                    </div>
                  </div>
                  <div className={`px-3 py-1 rounded-full font-mono text-[8px] font-black uppercase ${req.priority === 'urgent' ? 'bg-red-500 text-white' : 'bg-[var(--bg-ghost)] text-[var(--text-muted)]'}`}>
                    {req.priority}
                  </div>
                </div>
                <p className="text-[10px] text-[var(--text-muted)] mb-6 line-clamp-2 uppercase font-medium">{req.description}</p>
                <div className="flex items-center justify-between pt-4 border-t border-[var(--border)] border-opacity-5">
                   <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-[var(--bg-ghost)] flex items-center justify-center text-[10px] font-bold">
                        {req.tenantName?.charAt(0) || 'M'}
                      </div>
                      <span className="font-mono text-[8px] font-black uppercase opacity-40">By {req.tenantName || 'Manager'}</span>
                   </div>
                   <Link href={`/dashboard/manager/maintenance/${req.id}`} className="text-[10px] font-black uppercase flex items-center gap-1 group-hover:text-[var(--accent-bg)] transition-colors">
                      Deep Audit <ChevronRight size={14} />
                   </Link>
                </div>
              </div>
            ))}
            {requests.length === 0 && (
                <div className="p-20 text-center opacity-20">
                    <p className="font-mono text-xs uppercase font-black tracking-widest">Zero Active Incidents</p>
                </div>
            )}
          </div>

          {/* UNIT BURN RANKING */}
          <div className="space-y-6">
            <div className="glass-card bg-[var(--bg-panel)] border border-[var(--border)] border-opacity-10 rounded-3xl p-8">
              <h4 className="font-black uppercase tracking-tighter text-sm mb-6 flex items-center gap-2">
                <Home size={16} className="text-red-500" />
                Unit Burn Rank
              </h4>
              <div className="space-y-6">
                {Object.values(unitGroups)
                  .sort((a: any, b: any) => b.total - a.total)
                  .slice(0, 5)
                  .map((unit: any, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-[var(--bg-ghost)] flex items-center justify-center font-mono text-[10px] font-black">
                          {i + 1}
                        </div>
                        <div>
                          <p className="font-black text-[10px] uppercase">{unit.id}</p>
                          <p className="font-mono text-[7px] text-[var(--text-muted)] uppercase">{unit.count} Incidents</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-mono text-[10px] font-black text-red-500">KES {unit.total.toLocaleString()}</p>
                        <div className="w-24 h-1 bg-[var(--bg-ghost)] rounded-full mt-1 overflow-hidden">
                          <div 
                            className="h-full bg-red-500" 
                            style={{ width: `${(unit.total / totalBurn) * 100}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'analytics' && (
        <div className="animate-reveal space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="glass-card bg-[var(--bg-panel)] border border-[var(--border)] border-opacity-10 rounded-[2.5rem] p-8">
              <h4 className="font-black uppercase tracking-tighter text-lg mb-8">Burn Velocity</h4>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={timeChartData}>
                    <defs>
                      <linearGradient id="colorBurnProp" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#ef4444" stopOpacity={0.1}/>
                        <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.03} />
                    <XAxis dataKey="name" fontSize={8} axisLine={false} tickLine={false} />
                    <YAxis fontSize={8} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ backgroundColor: 'var(--bg-panel)', border: '1px solid var(--border)', borderRadius: '12px' }} />
                    <Area type="monotone" dataKey="value" stroke="#ef4444" strokeWidth={3} fillOpacity={1} fill="url(#colorBurnProp)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="glass-card bg-[var(--bg-panel)] border border-[var(--border)] border-opacity-10 rounded-[2.5rem] p-8">
              <h4 className="font-black uppercase tracking-tighter text-lg mb-8">Trade Distribution</h4>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={categoryData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={8} dataKey="value" stroke="none">
                      {categoryData.map((_, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: 'var(--bg-panel)', border: '1px solid var(--border)', borderRadius: '12px' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div className="glass-card bg-[var(--bg-panel)] border border-[var(--border)] border-opacity-10 rounded-[2.5rem] p-8">
              <h4 className="font-black uppercase tracking-tighter text-lg mb-8">Asset Maintenance Heatmap</h4>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={Object.values(unitGroups).slice(0, 10)}>
                    <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.03} vertical={false} />
                    <XAxis dataKey="id" fontSize={8} axisLine={false} tickLine={false} />
                    <YAxis fontSize={8} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ backgroundColor: 'var(--bg-panel)', border: '1px solid var(--border)', borderRadius: '12px' }} />
                    <Bar dataKey="total" radius={[6, 6, 0, 0]}>
                      {Object.values(unitGroups).map((_, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} fillOpacity={0.6} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
          </div>
        </div>
      )}

    </div>
  );
}
