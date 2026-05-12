import React from 'react';

interface UnitsProps {
  units: any[];
}

export const AdminPropertyUnits = ({ units }: UnitsProps) => {
  if (!units || units.length === 0) {
    return (
      <div className="p-8 text-center border border-[var(--border)] border-dashed rounded-xl text-[var(--text-muted)] text-sm">
        No units configured for this house.
      </div>
    );
  }

  const maxFloor = Math.max(...units.map(u => u.floor || 1), 1);
  const floors = Array.from({ length: maxFloor }, (_, i) => i + 1).reverse();

  return (
    <div className="space-y-8">
      {floors.map(floorNum => {
        const floorUnits = units.filter(u => (u.floor || 1) === floorNum);
        if (floorUnits.length === 0) return null;

        return (
          <div key={floorNum} className="relative">
            <div className="flex items-center gap-4 mb-4">
              <div className="bg-[var(--text-base)] text-[var(--bg-panel)] px-3 py-1 rounded font-mono text-[9px] font-black uppercase tracking-widest">
                Floor {floorNum}
              </div>
              <div className="flex-1 h-[1px] bg-[var(--border)] opacity-30" />
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {floorUnits.map(unit => (
                <div 
                  key={unit.id}
                  className={`p-4 rounded-xl border flex flex-col justify-between h-28 transition-all ${
                    unit.status === 'occupied' 
                      ? 'bg-[var(--admin-accent)]/5 border-[var(--admin-accent)]/30' 
                      : 'bg-[var(--bg-base)] border-[var(--border)] hover:border-[var(--admin-accent)]/50'
                  }`}
                >
                  <div>
                    <div className="font-black font-mono text-sm tracking-tight">{unit.name}</div>
                    <div className="text-[9px] font-mono uppercase text-[var(--text-muted)] mt-1">{unit.type}</div>
                  </div>
                  <div className="mt-auto">
                    <div className={`flex items-center gap-1.5 mb-1 ${unit.status === 'occupied' ? 'text-[var(--admin-accent)]' : 'text-[var(--text-muted)]'}`}>
                      <div className={`w-1.5 h-1.5 rounded-full ${unit.status === 'occupied' ? 'bg-[var(--admin-accent)] shadow-[0_0_8px_var(--admin-accent)]' : 'bg-slate-400'}`} />
                      <span className="font-mono text-[8px] font-black uppercase tracking-widest">{unit.status}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};
