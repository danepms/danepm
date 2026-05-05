"use client";

import React, { useState, useEffect } from 'react';
import { ArrowLeftRight, ChevronLeft, ChevronRight, Building2, TrendingUp, TrendingDown, AlertTriangle, Phone } from 'lucide-react';
import { getReconciliationSummary, getArrearsLedger } from '@/app/actions';

export const ReconciliationTab = ({ managerId }: { managerId: string }) => {
  const [period, setPeriod] = useState(new Date().toISOString().slice(0, 7));
  const [summary, setSummary] = useState<any>(null);
  const [breakdown, setBreakdown] = useState<any[]>([]);
  const [arrears, setArrears] = useState<any[]>([]);
  const [arrearsPage, setArrearsPage] = useState(1);
  const [arrearsHasMore, setArrearsHasMore] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [activeView, setActiveView] = useState<'overview' | 'arrears'>('overview');

  const fetchData = async () => {
    setIsLoading(true);
    const [recRes, arrRes] = await Promise.all([
      getReconciliationSummary(managerId, period),
      getArrearsLedger(managerId, 1),
    ]);
    if (recRes.success) {
      setSummary(recRes.summary);
      setBreakdown(recRes.breakdown || []);
    }
    if (arrRes.success) {
      setArrears(arrRes.tenants || []);
      setArrearsHasMore(arrRes.hasMore || false);
    }
    setIsLoading(false);
  };

  useEffect(() => { fetchData(); }, [period]);

  const fetchArrears = async (p: number) => {
    const res = await getArrearsLedger(managerId, p);
    if (res.success) {
      setArrears(res.tenants || []);
      setArrearsHasMore(res.hasMore || false);
      setArrearsPage(p);
    }
  };

  const shiftPeriod = (direction: number) => {
    const d = new Date(period + '-01');
    d.setMonth(d.getMonth() + direction);
    setPeriod(d.toISOString().slice(0, 7));
  };

  const formatPeriod = (p: string) => {
    try { return new Date(p + '-01').toLocaleDateString('en-US', { month: 'long', year: 'numeric' }); } catch { return p; }
  };

  const collectionRate = summary?.collectionRate || 0;
  const rateColor = collectionRate >= 80 ? 'text-green-500' : collectionRate >= 50 ? 'text-yellow-500' : 'text-red-500';

  return (
    <div className="space-y-10 animate-reveal">
      {/* HEADER + PERIOD NAV */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="text-5xl font-black uppercase tracking-tighter leading-none">Reconciliation</h2>
          <p className="font-mono text-[10px] text-[var(--text-muted)] uppercase font-bold tracking-[0.2em] mt-3">How well you're collecting rent this month</p>
        </div>
        <div className="flex items-center gap-3 bg-[var(--bg-panel)] border border-[var(--border)] border-opacity-10 rounded-xl p-1.5 shadow-sm">
          <button onClick={() => shiftPeriod(-1)} className="p-2.5 hover:bg-[var(--bg-ghost)] rounded-lg transition-all"><ChevronLeft size={16} /></button>
          <span className="font-mono text-sm font-black px-4 min-w-[160px] text-center">{formatPeriod(period)}</span>
          <button onClick={() => shiftPeriod(1)} className="p-2.5 hover:bg-[var(--bg-ghost)] rounded-lg transition-all"><ChevronRight size={16} /></button>
        </div>
      </div>

      {/* VIEW TABS */}
      <div className="flex gap-2">
        {(['overview', 'arrears'] as const).map(v => (
          <button key={v} onClick={() => setActiveView(v)} className={`px-6 py-2.5 rounded-xl font-mono text-[10px] uppercase font-black transition-all ${activeView === v ? 'bg-[var(--text-base)] text-[var(--bg-panel)] shadow-md' : 'bg-[var(--bg-panel)] border border-[var(--border)] border-opacity-10 hover:bg-[var(--bg-ghost)]'}`}>
            {v === 'overview' ? 'Monthly Overview' : 'Arrears Ledger'}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="h-64 flex items-center justify-center font-mono text-sm uppercase font-black opacity-20">Loading...</div>
      ) : activeView === 'overview' ? (
        <>
          {/* SUMMARY CARDS */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="bg-[var(--bg-panel)] border border-[var(--border)] border-opacity-10 p-8 rounded-xl shadow-[8px_8px_0px_0px_var(--shadow-color)]">
              <p className="font-mono text-[8px] uppercase text-[var(--text-muted)] font-black tracking-widest mb-2">Expected</p>
              <p className="text-2xl font-black tracking-tighter">KES {(summary?.expected || 0).toLocaleString()}</p>
              <p className="font-mono text-[7px] opacity-30 mt-1">{summary?.invoiceCount || 0} invoices</p>
            </div>
            <div className="bg-[var(--bg-panel)] border border-[var(--border)] border-opacity-10 p-8 rounded-xl shadow-[8px_8px_0px_0px_var(--shadow-color)]">
              <p className="font-mono text-[8px] uppercase text-[var(--text-muted)] font-black tracking-widest mb-2">Collected</p>
              <p className="text-2xl font-black tracking-tighter text-green-600">KES {(summary?.collected || 0).toLocaleString()}</p>
              <p className="font-mono text-[7px] opacity-30 mt-1">{summary?.paidCount || 0} fully paid</p>
            </div>
            <div className="bg-[var(--bg-panel)] border border-[var(--border)] border-opacity-10 p-8 rounded-xl shadow-[8px_8px_0px_0px_var(--shadow-color)]">
              <p className="font-mono text-[8px] uppercase text-[var(--text-muted)] font-black tracking-widest mb-2">Outstanding</p>
              <p className="text-2xl font-black tracking-tighter text-red-500">KES {(summary?.outstanding || 0).toLocaleString()}</p>
            </div>
            <div className="bg-[var(--bg-panel)] border border-[var(--border)] border-opacity-10 p-8 rounded-xl shadow-[8px_8px_0px_0px_var(--shadow-color)]">
              <p className="font-mono text-[8px] uppercase text-[var(--text-muted)] font-black tracking-widest mb-2">Collection Rate</p>
              <div className="flex items-end gap-3">
                <p className={`text-3xl font-black tracking-tighter ${rateColor}`}>{collectionRate}%</p>
                {collectionRate >= 80 ? <TrendingUp size={20} className="text-green-500 mb-1" /> : <TrendingDown size={20} className="text-red-500 mb-1" />}
              </div>
              <div className="w-full h-2 bg-[var(--bg-ghost)] rounded-full overflow-hidden mt-3">
                <div className={`h-full rounded-full transition-all duration-1000 ${collectionRate >= 80 ? 'bg-green-500' : collectionRate >= 50 ? 'bg-yellow-500' : 'bg-red-500'}`} style={{ width: `${collectionRate}%` }} />
              </div>
            </div>
          </div>

          {/* PROPERTY BREAKDOWN */}
          <div className="bg-[var(--bg-panel)] border border-[var(--border)] border-opacity-10 rounded-2xl shadow-[8px_8px_0px_0px_var(--shadow-color)] overflow-hidden">
            <div className="p-6 border-b border-[var(--border)] border-opacity-5">
              <h3 className="font-black uppercase tracking-tighter text-lg">By Property</h3>
            </div>
            {breakdown.length === 0 ? (
              <div className="p-12 text-center font-mono text-sm uppercase font-black opacity-20">No data for this period</div>
            ) : (
              <div className="divide-y divide-[var(--border)] divide-opacity-5">
                {breakdown.map((b: any, i: number) => {
                  const rate = b.expected > 0 ? Math.round((b.collected / b.expected) * 100) : 0;
                  return (
                    <div key={i} className="p-6 flex flex-col md:flex-row md:items-center gap-4 hover:bg-[var(--bg-ghost)] transition-colors">
                      <div className="flex items-center gap-4 flex-1">
                        <div className="w-10 h-10 bg-[var(--bg-ghost)] rounded-xl flex items-center justify-center"><Building2 size={18} className="opacity-40" /></div>
                        <div>
                          <p className="font-black text-sm tracking-tight">{b.propertyName || 'Unknown'}</p>
                          <p className="font-mono text-[8px] opacity-30">{b.invoiceCount} invoices · {b.paidCount} paid</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-8 font-mono text-[10px]">
                        <div className="text-right"><p className="opacity-30 text-[7px]">Expected</p><p className="font-black">KES {b.expected.toLocaleString()}</p></div>
                        <div className="text-right"><p className="opacity-30 text-[7px]">Collected</p><p className="font-black text-green-600">KES {b.collected.toLocaleString()}</p></div>
                        <div className="text-right"><p className="opacity-30 text-[7px]">Gap</p><p className="font-black text-red-500">KES {b.outstanding.toLocaleString()}</p></div>
                        <div className="w-24">
                          <div className="flex justify-between text-[7px] opacity-40 mb-1"><span>Rate</span><span>{rate}%</span></div>
                          <div className="w-full h-1.5 bg-[var(--bg-ghost)] rounded-full overflow-hidden">
                            <div className={`h-full rounded-full ${rate >= 80 ? 'bg-green-500' : rate >= 50 ? 'bg-yellow-500' : 'bg-red-500'}`} style={{ width: `${rate}%` }} />
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </>
      ) : (
        /* ARREARS LEDGER */
        <div className="bg-[var(--bg-panel)] border border-[var(--border)] border-opacity-10 rounded-2xl shadow-[8px_8px_0px_0px_var(--shadow-color)] overflow-hidden">
          <div className="p-6 border-b border-[var(--border)] border-opacity-5 flex items-center gap-3">
            <AlertTriangle size={16} className="text-red-500" />
            <h3 className="font-black uppercase tracking-tighter text-lg">Tenants with Outstanding Balances</h3>
          </div>
          {arrears.length === 0 ? (
            <div className="p-16 text-center font-mono text-sm uppercase font-black opacity-20">Everyone's up to date! 🎉</div>
          ) : (
            <>
              <div className="divide-y divide-[var(--border)] divide-opacity-5">
                {arrears.map((t: any) => (
                  <div key={t.id} className="p-6 flex items-center justify-between hover:bg-[var(--bg-ghost)] transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-red-500/10 rounded-xl flex items-center justify-center text-red-500 font-black text-xs">{t.name?.slice(0, 2)}</div>
                      <div>
                        <p className="font-black text-sm tracking-tight">{t.name}</p>
                        <p className="font-mono text-[8px] opacity-40">{t.propertyName} · {t.unitId}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <p className="text-xl font-black text-red-500">KES {parseFloat(t.arrears).toLocaleString()}</p>
                      <a href={`tel:${t.phone}`} className="p-2.5 bg-[var(--bg-ghost)] rounded-lg hover:bg-green-500 hover:text-white transition-all"><Phone size={14} /></a>
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-5 bg-[var(--bg-ghost)] border-t border-[var(--border)] border-opacity-10 flex justify-end gap-3">
                <button disabled={arrearsPage === 1} onClick={() => fetchArrears(arrearsPage - 1)} className="px-5 py-2 border border-[var(--border)] border-opacity-10 rounded-lg font-black uppercase text-[8px] disabled:opacity-10 hover:bg-[var(--text-base)] hover:text-[var(--bg-panel)] transition-all">Prev</button>
                <button disabled={!arrearsHasMore} onClick={() => fetchArrears(arrearsPage + 1)} className="px-5 py-2 border border-[var(--border)] border-opacity-10 rounded-lg font-black uppercase text-[8px] disabled:opacity-10 hover:bg-[var(--text-base)] hover:text-[var(--bg-panel)] transition-all">Next</button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};
