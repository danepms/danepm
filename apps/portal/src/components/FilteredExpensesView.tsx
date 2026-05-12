"use client";

import React, { useState, useEffect } from 'react';
import { 
  Receipt, TrendingUp, Building2, Home, Users, 
  ArrowLeft, Search, Activity, Wallet, AlertCircle,
  PieChart as PieIcon
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, PieChart, Pie, Cell, AreaChart, 
  Area
} from 'recharts';
import { api } from '@/lib/api';
import { useSession } from '@/lib/auth-client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const COLORS = ['#22c55e', '#ef4444', '#f59e0b', '#3b82f6', '#a855f7', '#ec4899', '#06b6d4'];

interface FilteredExpensesViewProps {
  title: string;
  subtitle: string;
  filter: {
    propertyId?: string;
    unitId?: string;
    tenantId?: string;
  };
}

export const FilteredExpensesView = ({ title, subtitle, filter }: FilteredExpensesViewProps) => {
  const router = useRouter();
  const { data: session } = useSession();
  const [expenses, setExpenses] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      if (!session?.user?.id) return;
      setIsLoading(true);
      const query = new URLSearchParams({ managerId: session.user.id, ...filter }).toString();
      const res = await api.get<any>(`/maintenance/expenses?${query}`);
      if (res.success) setExpenses(res.expenses);
      setIsLoading(false);
    };
    load();
  }, [session?.user?.id, JSON.stringify(filter)]);

  const totalBurn = expenses.reduce((acc, e) => acc + parseFloat(e.amount), 0);
  
  const categoryData = Object.entries(
    expenses.reduce((acc: any, e) => {
      acc[e.category] = (acc[e.category] || 0) + parseFloat(e.amount);
      return acc;
    }, {})
  ).map(([name, value]) => ({ name: name.toUpperCase(), value }));

  const timeData = expenses
    .reduce((acc: any, e) => {
      const date = new Date(e.paidDate).toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
      acc[date] = (acc[date] || 0) + parseFloat(e.amount);
      return acc;
    }, {});
  const timeChartData = Object.entries(timeData).map(([name, value]) => ({ name, value })).reverse();

  if (isLoading) {
    return (
      <div className="h-96 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-[var(--accent-bg)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-12 animate-reveal">
      {/* HEADER */}
      <div className="flex items-center gap-6">
        <button 
          onClick={() => router.back()}
          className="p-3 hover:bg-[var(--bg-ghost)] transition-colors border border-[var(--border)] border-opacity-10 rounded-xl text-[var(--text-muted)] shadow-sm"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-4xl font-black uppercase tracking-tighter leading-none">{title}</h1>
          <p className="font-mono text-[9px] text-[var(--text-muted)] uppercase font-bold tracking-[0.2em] mt-2">{subtitle}</p>
        </div>
      </div>

      {/* MINI STATS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-[var(--bg-panel)] border border-[var(--border)] border-opacity-10 p-8 rounded-3xl shadow-[12px_12px_0px_0px_var(--shadow-color)]">
            <p className="font-mono text-[8px] uppercase text-[var(--text-muted)] font-black tracking-widest mb-3">Total Asset Burn</p>
            <h3 className="text-4xl font-black tracking-tighter leading-none text-red-500">KES {totalBurn.toLocaleString()}</h3>
        </div>
        <div className="bg-[var(--bg-panel)] border border-[var(--border)] border-opacity-10 p-8 rounded-3xl shadow-[12px_12px_0px_0px_var(--shadow-color)]">
            <p className="font-mono text-[8px] uppercase text-[var(--text-muted)] font-black tracking-widest mb-3">Transaction Count</p>
            <h3 className="text-4xl font-black tracking-tighter leading-none">{expenses.length}</h3>
        </div>
        <div className="bg-[var(--bg-panel)] border border-[var(--border)] border-opacity-10 p-8 rounded-3xl shadow-[12px_12px_0px_0px_var(--shadow-color)]">
            <p className="font-mono text-[8px] uppercase text-[var(--text-muted)] font-black tracking-widest mb-3">Largest Settlement</p>
            <h3 className="text-4xl font-black tracking-tighter leading-none">KES {Math.max(...expenses.map(e => parseFloat(e.amount)), 0).toLocaleString()}</h3>
        </div>
      </div>

      {/* GRAPHS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <div className="bg-[var(--bg-panel)] border border-[var(--border)] border-opacity-10 rounded-[40px] shadow-[20px_20px_0px_0px_var(--shadow-color)] overflow-hidden">
          <div className="p-8 border-b border-[var(--border)] border-opacity-5 flex items-center justify-between bg-[var(--bg-ghost)]/30">
            <h4 className="font-black uppercase tracking-tighter text-lg">History</h4>
            <Activity size={18} className="text-red-500 opacity-50" />
          </div>
          <div className="p-8 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={timeChartData}>
                <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.05} />
                <XAxis dataKey="name" fontSize={8} axisLine={false} tickLine={false} />
                <YAxis fontSize={8} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ backgroundColor: 'var(--bg-panel)', border: '1px solid var(--border)', borderRadius: '12px' }} />
                <Area type="monotone" dataKey="value" stroke="#ef4444" strokeWidth={3} fill="#ef4444" fillOpacity={0.1} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-[var(--bg-panel)] border border-[var(--border)] border-opacity-10 rounded-[40px] shadow-[20px_20px_0px_0px_var(--shadow-color)] overflow-hidden">
          <div className="p-8 border-b border-[var(--border)] border-opacity-5 flex items-center justify-between">
             <h4 className="font-black uppercase tracking-tighter text-lg">Allocation</h4>
             <PieIcon size={18} className="opacity-20" />
          </div>
          <div className="p-8 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: 'var(--bg-panel)', border: '1px solid var(--border)', borderRadius: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* LEDGER */}
      <div className="bg-[var(--bg-panel)] border border-[var(--border)] border-opacity-10 rounded-3xl overflow-hidden shadow-2xl">
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="bg-[var(--bg-ghost)]/50 border-b border-[var(--border)] border-opacity-10">
                        <th className="p-6 font-mono text-[9px] uppercase font-black tracking-widest opacity-40">Date</th>
                        <th className="p-6 font-mono text-[9px] uppercase font-black tracking-widest opacity-40">Category</th>
                        <th className="p-6 font-mono text-[9px] uppercase font-black tracking-widest opacity-40">Description</th>
                        <th className="p-6 font-mono text-[9px] uppercase font-black tracking-widest opacity-40">Amount</th>
                        <th className="p-6 font-mono text-[9px] uppercase font-black tracking-widest opacity-40">Vendor</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)] divide-opacity-5">
                    {expenses.map((exp) => (
                        <tr key={exp.id} className="hover:bg-[var(--bg-ghost)]/30 transition-colors group">
                            <td className="p-6 font-mono text-[10px] font-black uppercase whitespace-nowrap">
                                {new Date(exp.paidDate).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </td>
                            <td className="p-6">
                                <span className="px-3 py-1 bg-[var(--bg-ghost)] border border-[var(--border)] border-opacity-10 rounded-full font-mono text-[8px] font-black uppercase tracking-widest">
                                    {exp.category}
                                </span>
                            </td>
                            <td className="p-6">
                                <p className="font-black text-xs uppercase">{exp.description}</p>
                                <p className="font-mono text-[8px] opacity-40 mt-1 uppercase tracking-widest">ID: {exp.id.slice(0, 8)}</p>
                            </td>
                            <td className="p-6 font-mono text-xs font-black">KES {parseFloat(exp.amount).toLocaleString()}</td>
                            <td className="p-6 font-black text-[10px] uppercase">{exp.vendorName || 'Independent'}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
            {expenses.length === 0 && (
                <div className="p-20 text-center opacity-20">
                    <p className="font-mono text-xs uppercase font-black tracking-widest">Clean Ledger - No Expenses</p>
                </div>
            )}
        </div>
    </div>
  );
};
