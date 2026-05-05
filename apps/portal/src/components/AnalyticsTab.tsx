"use client";

import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { getRevenueHistory, getTenantStats } from '@/app/actions';

export const AnalyticsTab = ({ managerId }: { managerId: string }) => {
  const [history, setHistory] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      const [histRes, statsRes] = await Promise.all([
        getRevenueHistory(managerId, 6),
        getTenantStats(managerId),
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
        <div className="bg-[var(--bg-panel)] border border-[var(--border)] border-opacity-10 p-8 rounded-xl shadow-[8px_8px_0px_0px_var(--shadow-color)]">
          <p className="font-mono text-[8px] uppercase text-[var(--text-muted)] font-black tracking-widest mb-2">Active Tenants</p>
          <p className="text-3xl font-black tracking-tighter">{stats?.total || 0}</p>
          <p className="font-mono text-[7px] opacity-30 mt-2">{stats?.withArrearsCount || 0} with outstanding balance</p>
        </div>
        <div className="bg-[var(--bg-panel)] border border-[var(--border)] border-opacity-10 p-8 rounded-xl shadow-[8px_8px_0px_0px_var(--shadow-color)]">
          <p className="font-mono text-[8px] uppercase text-[var(--text-muted)] font-black tracking-widest mb-2">Total Arrears</p>
          <p className="text-3xl font-black tracking-tighter text-red-500">KES {(stats?.arrearsSum || 0).toLocaleString()}</p>
          <p className="font-mono text-[7px] opacity-30 mt-2">across all tenants</p>
        </div>
      </div>

      {/* REVENUE CHART */}
      <div className="bg-[var(--bg-panel)] border border-[var(--border)] border-opacity-10 rounded-2xl shadow-[8px_8px_0px_0px_var(--shadow-color)] overflow-hidden">
        <div className="p-8 border-b border-[var(--border)] border-opacity-5 flex items-center justify-between">
          <div>
            <h3 className="font-black uppercase tracking-tighter text-lg">Revenue — Last 6 Months</h3>
            <p className="font-mono text-[8px] opacity-30 mt-1">Expected vs. collected rent</p>
          </div>
          <div className="flex items-center gap-6 font-mono text-[8px] uppercase font-black">
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-sm bg-[var(--text-base)] opacity-20" /> Expected</div>
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-sm bg-[var(--accent-bg)]" /> Collected</div>
          </div>
        </div>
        
        {history.length === 0 ? (
          <div className="p-16 text-center font-mono text-sm uppercase font-black opacity-20">No revenue data yet. Generate some invoices first!</div>
        ) : (
          <div className="p-8">
            <div className="flex items-end gap-4 h-64">
              {history.map((h, i) => {
                const expectedHeight = (h.expected / maxRevenue) * 100;
                const collectedHeight = (h.collected / maxRevenue) * 100;
                const rate = h.expected > 0 ? Math.round((h.collected / h.expected) * 100) : 0;

                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
                    <div className="w-full flex items-end gap-1 h-52 relative">
                      {/* Expected bar */}
                      <div className="flex-1 relative group/bar">
                        <div 
                          className="w-full bg-[var(--text-base)] opacity-10 rounded-t-lg transition-all duration-700 ease-out"
                          style={{ height: `${expectedHeight}%`, animationDelay: `${i * 100}ms` }}
                        />
                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-[var(--text-base)] text-[var(--bg-panel)] px-2 py-1 rounded-md font-mono text-[6px] font-black opacity-0 group-hover/bar:opacity-100 transition-all whitespace-nowrap">
                          KES {h.expected.toLocaleString()}
                        </div>
                      </div>
                      {/* Collected bar */}
                      <div className="flex-1 relative group/bar">
                        <div 
                          className="w-full bg-[var(--accent-bg)] rounded-t-lg transition-all duration-700 ease-out"
                          style={{ height: `${collectedHeight}%`, animationDelay: `${i * 100 + 50}ms` }}
                        />
                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-[var(--accent-bg)] text-[var(--accent-text)] px-2 py-1 rounded-md font-mono text-[6px] font-black opacity-0 group-hover/bar:opacity-100 transition-all whitespace-nowrap">
                          KES {h.collected.toLocaleString()}
                        </div>
                      </div>
                    </div>
                    <div className="text-center">
                      <p className="font-mono text-[10px] font-black">{formatPeriod(h.period)}</p>
                      <p className={`font-mono text-[7px] font-black ${rate >= 80 ? 'text-green-500' : rate >= 50 ? 'text-yellow-500' : 'text-red-500'}`}>{rate}%</p>
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
