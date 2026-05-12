"use client";

import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { api } from '@/lib/api';

export const AnalyticsTab = ({ managerId }: { managerId: string }) => {
  const [history, setHistory] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      const [histRes, statsRes] = await Promise.all([
        api.get<any>(`/finance/revenue-history?managerId=${managerId}&months=6`),
        api.get<any>(`/tenants/stats?managerId=${managerId}`),
      ]);
      if (histRes.success) setHistory(histRes.history || []);
      if (statsRes.success) setStats(statsRes.stats);
      setIsLoading(false);
    };
    load();
  }, []);

  const maxRevenue = Math.max(...history.map(h => h.expected || 0), 1);

  const formatPeriod = (p: string) => {
    try { return new Date(p + '-01').toLocaleDateString('en-US', { month: 'short' }); } catch { return p; }
  };

  const currentMonth = history[history.length - 1];
  const prevMonth = history[history.length - 2];

  const collectionTrend = currentMonth && prevMonth
    ? ((currentMonth.collected || 0) / Math.max(currentMonth.expected || 1, 1)) * 100 - ((prevMonth.collected || 0) / Math.max(prevMonth.expected || 1, 1)) * 100
    : 0;

  if (isLoading) {
    return <div className="h-96 flex items-center justify-center font-mono text-sm uppercase font-black opacity-20 animate-reveal">Loading analytics...</div>;
  }

  return (
    <div className="space-y-10 animate-reveal">
      {/* HEADER */}
      <div>
        <h2 className="text-5xl font-black uppercase tracking-tighter leading-none">Analytics</h2>
        <p className="font-mono text-[10px] text-[var(--text-muted)] uppercase font-bold tracking-[0.2em] mt-3">Revenue trends and performance insights</p>
      </div>

      {/* TREND CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-[var(--bg-panel)] border border-[var(--border)] border-opacity-10 p-8 rounded-xl shadow-[8px_8px_0px_0px_var(--shadow-color)]">
          <p className="font-mono text-[8px] uppercase text-[var(--text-muted)] font-black tracking-widest mb-2">Collection Trend</p>
          <div className="flex items-end gap-3">
            <p className={`text-3xl font-black tracking-tighter ${collectionTrend > 0 ? 'text-green-500' : collectionTrend < 0 ? 'text-red-500' : ''}`}>
              {collectionTrend > 0 ? '+' : ''}{collectionTrend.toFixed(1)}%
            </p>
            {collectionTrend > 0 ? <TrendingUp size={20} className="text-green-500 mb-1" /> : collectionTrend < 0 ? <TrendingDown size={20} className="text-red-500 mb-1" /> : <Minus size={20} className="opacity-30 mb-1" />}
          </div>
          <p className="font-mono text-[7px] opacity-30 mt-2">vs. previous month</p>
        </div>
        <div className="bg-[var(--bg-panel)] border border-[var(--border)] border-opacity-10 p-8 rounded-xl shadow-[8px_8px_0px_0px_var(--shadow-color)] border-l-amber-500/20">
          <p className="font-mono text-[8px] uppercase text-amber-500 font-black tracking-widest mb-2">Maintenance Burn</p>
          <p className="text-3xl font-black tracking-tighter">KES {(currentMonth?.maintenanceBurn || 0).toLocaleString()}</p>
          <p className="font-mono text-[7px] opacity-30 mt-2">Spent on repairs this month</p>
        </div>
        <div className="bg-[var(--bg-panel)] border border-[var(--border)] border-opacity-10 p-8 rounded-xl shadow-[8px_8px_0px_0px_var(--shadow-color)]">
          <p className="font-mono text-[8px] uppercase text-[var(--text-muted)] font-black tracking-widest mb-2">Net Profit</p>
          <p className="text-3xl font-black tracking-tighter text-green-500">KES {(currentMonth?.netRevenue || 0).toLocaleString()}</p>
          <p className="font-mono text-[7px] opacity-30 mt-2">Collections after repairs</p>
        </div>
        <div className="bg-[var(--bg-panel)] border border-[var(--border)] border-opacity-10 p-8 rounded-xl shadow-[8px_8px_0px_0px_var(--shadow-color)]">
          <p className="font-mono text-[8px] uppercase text-[var(--text-muted)] font-black tracking-widest mb-2">Total Arrears</p>
          <p className="text-3xl font-black tracking-tighter text-red-500">KES {(stats?.arrearsSum || 0).toLocaleString()}</p>
          <p className="font-mono text-[7px] opacity-30 mt-2">Across all tenants</p>
        </div>
      </div>

      {/* REVENUE CHART */}
      <div className="bg-[var(--bg-panel)] border border-[var(--border)] border-opacity-10 rounded-2xl shadow-[8px_8px_0px_0px_var(--shadow-color)] overflow-hidden">
        <div className="p-8 border-b border-[var(--border)] border-opacity-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="font-black uppercase tracking-tighter text-lg">Fiscal Performance — Last 6 Months</h3>
            <p className="font-mono text-[8px] opacity-30 mt-1">Net profit after maintenance deductions</p>
          </div>
          <div className="flex flex-wrap items-center gap-6 font-mono text-[8px] uppercase font-black">
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-sm bg-[var(--text-base)] opacity-10" /> Expected</div>
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-sm bg-amber-500" /> Maintenance Burn</div>
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-sm bg-green-500" /> Net Profit</div>
          </div>
        </div>
        
        {history.length === 0 ? (
          <div className="p-16 text-center font-mono text-sm uppercase font-black opacity-20">No revenue data yet. Generate some invoices first!</div>
        ) : (
          <div className="p-8">
            <div className="flex items-end gap-4 h-72">
              {history.map((h, i) => {
                const expectedHeight = (h.expected / maxRevenue) * 100;
                const burnHeight = (h.maintenanceBurn / maxRevenue) * 100;
                const netHeight = (h.netRevenue / maxRevenue) * 100;
                const collectionRate = h.expected > 0 ? Math.round((h.collected / h.expected) * 100) : 0;

                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
                    <div className="w-full flex items-end gap-1 h-60 relative">
                      {/* Expected bar (Ghost) */}
                      <div className="flex-1 relative group/bar">
                        <div 
                          className="w-full bg-[var(--text-base)] opacity-5 rounded-t-lg transition-all duration-700 ease-out"
                          style={{ height: `${expectedHeight}%`, animationDelay: `${i * 100}ms` }}
                        />
                      </div>
                      {/* Burn bar (Amber) */}
                      <div className="flex-1 relative group/bar">
                        <div 
                          className="w-full bg-amber-500 opacity-60 rounded-t-lg transition-all duration-700 ease-out"
                          style={{ height: `${burnHeight}%`, animationDelay: `${i * 100 + 50}ms` }}
                        />
                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-amber-500 text-black px-2 py-1 rounded-md font-mono text-[6px] font-black opacity-0 group-hover/bar:opacity-100 transition-all whitespace-nowrap z-10">
                          BURN: KES {h.maintenanceBurn.toLocaleString()}
                        </div>
                      </div>
                      {/* Net Revenue bar (Green) */}
                      <div className="flex-1 relative group/bar">
                        <div 
                          className="w-full bg-green-500 rounded-t-lg transition-all duration-700 ease-out shadow-[0_4px_12px_rgba(34,197,94,0.3)]"
                          style={{ height: `${netHeight}%`, animationDelay: `${i * 100 + 100}ms` }}
                        />
                        <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-green-500 text-white px-2 py-1 rounded-md font-mono text-[6px] font-black opacity-0 group-hover/bar:opacity-100 transition-all whitespace-nowrap z-10">
                          NET: KES {h.netRevenue.toLocaleString()}
                        </div>
                      </div>
                    </div>
                    <div className="text-center mt-2">
                      <p className="font-mono text-[10px] font-black">{formatPeriod(h.period)}</p>
                      <p className={`font-mono text-[7px] font-black opacity-40 uppercase tracking-widest`}>{collectionRate}% Collected</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
