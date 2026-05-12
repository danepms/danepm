import React from 'react';
import { Wallet, TrendingDown, AlertTriangle } from 'lucide-react';

interface FinancialsProps {
  stats: any;
  rents: any;
  recurring: any[];
  resUnits: any;
  comUnits: any;
}

export const AdminPropertyFinancials = ({ stats, rents, recurring, resUnits, comUnits }: FinancialsProps) => {
  const totalBills = recurring.reduce((acc: number, item: any) => acc + (parseInt(item.amount) || 0), 0);
  const netProfit = stats.revenue - totalBills;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      {/* Left Column: Breakdowns */}
      <div className="space-y-6">
        <div className="p-6 border border-[var(--border)] rounded-xl bg-[var(--bg-base)]">
          <h4 className="font-black text-xs uppercase mb-4 flex items-center gap-2 text-[var(--text-muted)] tracking-widest">
            <Wallet size={14} /> Expected Rent Matrix
          </h4>
          {Object.keys(rents).length === 0 ? (
            <p className="text-[10px] font-mono text-[var(--text-muted)] uppercase">No rents configured</p>
          ) : (
            <div className="space-y-3">
              {Object.entries(rents).map(([type, price]: any) => {
                const count = (parseInt(resUnits[type]) || 0) + (parseInt(comUnits[type]) || 0);
                if (count === 0) return null;
                return (
                  <div key={type} className="flex justify-between items-center font-mono uppercase text-[11px]">
                    <span className="font-bold">{type} ({count} units)</span>
                    <span>KES {(count * parseFloat(price)).toLocaleString()}</span>
                  </div>
                );
              })}
            </div>
          )}
          <div className="mt-4 pt-4 border-t border-[var(--border)] flex justify-between font-mono font-black text-xs uppercase">
            <span>Gross Potential</span>
            <span className="text-emerald-500">KES {stats.revenue.toLocaleString()}</span>
          </div>
        </div>

        <div className="p-6 border border-[var(--border)] rounded-xl bg-[var(--bg-base)]">
          <h4 className="font-black text-xs uppercase mb-4 flex items-center gap-2 text-[var(--text-muted)] tracking-widest">
            <TrendingDown size={14} /> Recurring Bills
          </h4>
          {recurring.length === 0 ? (
            <p className="text-[10px] font-mono text-[var(--text-muted)] uppercase">No recurring bills configured</p>
          ) : (
            <div className="space-y-3">
              {recurring.map((item: any) => (
                <div key={item.id} className="flex justify-between items-center font-mono uppercase text-[11px]">
                  <span className="font-bold">{item.name}</span>
                  <span className="text-red-500">- KES {parseInt(item.amount).toLocaleString()}</span>
                </div>
              ))}
            </div>
          )}
          <div className="mt-4 pt-4 border-t border-[var(--border)] flex justify-between font-mono font-black text-xs uppercase">
            <span>Total Bills</span>
            <span className="text-red-500">KES {totalBills.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Right Column: Totals */}
      <div className="space-y-6 flex flex-col">
        <div className="bg-[var(--bg-panel)] border border-[var(--border)] rounded-xl p-8 flex flex-col justify-center flex-1 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-[var(--admin-accent)]" />
          <p className="font-mono text-[10px] uppercase font-bold tracking-[0.2em] text-[var(--text-muted)] mb-2">Monthly Potential Net</p>
          <h5 className="text-5xl font-black tracking-tighter leading-none mb-1 text-[var(--text-base)]">
            KES {Math.max(0, netProfit).toLocaleString()}
          </h5>
          <p className="font-mono text-[9px] text-[var(--text-muted)] uppercase mt-2">Gross Rent minus Recurring Bills</p>
        </div>

        <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-8 flex items-center justify-between">
          <div>
            <h4 className="font-black text-sm uppercase text-red-500 flex items-center gap-2 mb-1">
              <AlertTriangle size={16} /> Outstanding Arrears
            </h4>
            <p className="font-mono text-[9px] text-[var(--text-muted)] uppercase">Total unpaid by current tenants</p>
          </div>
          <span className="text-2xl font-black text-red-500 tracking-tighter">
            KES {stats.arrears.toLocaleString()}
          </span>
        </div>
      </div>
    </div>
  );
};
