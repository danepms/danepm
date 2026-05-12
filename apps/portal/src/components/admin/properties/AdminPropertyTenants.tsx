import React from 'react';
import { format } from 'date-fns';
import { User, Phone } from 'lucide-react';

interface TenantsProps {
  tenants: any[];
  units: any[];
  onNavigateToPerson?: (id: string) => void;
}

export const AdminPropertyTenants = ({ tenants, units, onNavigateToPerson }: TenantsProps) => {
  if (!tenants || tenants.length === 0) {
    return (
      <div className="p-8 text-center border border-[var(--border)] border-dashed rounded-xl text-[var(--text-muted)] text-sm">
        No tenants recorded for this house.
      </div>
    );
  }

  const getUnitName = (unitId: string) => {
    const unit = units.find(u => u.id === unitId);
    return unit ? unit.name : 'Unknown';
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse min-w-[600px]">
        <thead>
          <tr className="border-b border-[var(--border)]">
            <th className="py-4 px-4 font-mono text-[10px] uppercase font-bold text-[var(--text-muted)] tracking-widest">Tenant</th>
            <th className="py-4 px-4 font-mono text-[10px] uppercase font-bold text-[var(--text-muted)] tracking-widest">Unit</th>
            <th className="py-4 px-4 font-mono text-[10px] uppercase font-bold text-[var(--text-muted)] tracking-widest">Arrears</th>
            <th className="py-4 px-4 font-mono text-[10px] uppercase font-bold text-[var(--text-muted)] tracking-widest">Move In</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[var(--border)]">
          {tenants.map(tenant => (
            <tr key={tenant.id} className="hover:bg-[var(--bg-base)] transition-colors">
              <td className="py-3 px-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[var(--bg-panel)] border border-[var(--border)] flex items-center justify-center text-[var(--text-muted)] shrink-0">
                    <User size={14} />
                  </div>
                  <div>
                    <div className="font-bold text-sm text-[var(--text-base)]">{tenant.name}</div>
                    <div className="text-[10px] text-[var(--text-muted)] font-mono flex items-center gap-1 mt-0.5">
                      <Phone size={10} /> {tenant.phone}
                    </div>
                  </div>
                </div>
              </td>
              <td className="py-3 px-4">
                <span className="font-mono text-[11px] font-bold px-2 py-1 rounded bg-[var(--bg-panel)] border border-[var(--border)]">
                  {getUnitName(tenant.unitId)}
                </span>
              </td>
              <td className="py-3 px-4">
                <span className={`font-mono text-[11px] font-bold ${Number(tenant.arrears) > 0 ? 'text-red-500' : 'text-emerald-500'}`}>
                  KES {Number(tenant.arrears).toLocaleString()}
                </span>
              </td>
              <td className="py-3 px-4 text-xs text-[var(--text-muted)]">
                {tenant.moveInDate ? format(new Date(tenant.moveInDate), 'MMM d, yyyy') : 'N/A'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
