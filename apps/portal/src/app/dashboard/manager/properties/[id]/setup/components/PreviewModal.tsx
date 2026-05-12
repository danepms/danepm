"use client";

import React from 'react';
import { Check, Loader2, X } from 'lucide-react';

interface PreviewModalProps {
  show: boolean;
  onClose: () => void;
  onConfirm: () => void;
  units: any[];
  isUploading: boolean;
}

export const PreviewModal = ({ 
  show, 
  onClose, 
  onConfirm, 
  units, 
  isUploading 
}: PreviewModalProps) => {
  if (!show) return null;

  // Generate type-price summary string: "Bedsitter: 6,000 | 1BR: 10,000"
  const typeMap: Record<string, Set<number>> = {};
  units.forEach(u => {
    const t = u.typeId || u.type || 'Unknown';
    if (!typeMap[t]) typeMap[t] = new Set();
    typeMap[t].add(parseInt(u.rent) || 0);
  });

  const typeSummary = Object.entries(typeMap)
    .map(([type, prices]) => `${type.toUpperCase()} @ ${Array.from(prices).map(p => p.toLocaleString()).join('/')}`)
    .join(' | ');

  // Group units by floor
  const floorsMap: Record<string, any[]> = {};
  units.forEach(u => {
    const f = u.floor || '1';
    if (!floorsMap[f]) floorsMap[f] = [];
    floorsMap[f].push(u);
  });

  const sortedFloors = Object.keys(floorsMap).sort((a, b) => parseInt(b) - parseInt(a));

  const stats = {
    total: units.length,
    vacant: units.filter(u => u.status === 'vacant').length,
    arrears: units.filter(u => u.status !== 'vacant' && parseFloat(u.arrears || '0') > 0).length,
    paid: units.filter(u => u.status !== 'vacant' && parseFloat(u.arrears || '0') <= 0).length
  };

  return (
    <div className="fixed inset-0 z-[999] flex justify-center items-start overflow-y-auto px-4 py-8 md:py-20 backdrop-blur-3xl bg-[var(--bg-base)]/90 animate-reveal">
      <div className="relative bg-[var(--bg-panel)] border border-[var(--border)] border-opacity-10 w-full max-w-5xl rounded-base shadow-[0_64px_128px_-32px_var(--shadow-color)] overflow-hidden flex flex-col min-h-[50vh] max-h-fit">
        
        {/* Header */}
        <div className="p-8 md:p-10 border-b border-[var(--border)] border-opacity-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shrink-0 bg-[var(--bg-panel)] sticky top-0 z-10">
          <div>
            <h3 className="text-3xl font-black uppercase tracking-tighter mb-2 text-[var(--text-base)]">Import Preview</h3>
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="font-mono text-[10px] uppercase font-black opacity-60 text-[var(--text-base)]">Paid: {stats.paid}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-red-500" />
                <span className="font-mono text-[10px] uppercase font-black opacity-60 text-[var(--text-base)]">Arrears: {stats.arrears}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-yellow-500" />
                <span className="font-mono text-[10px] uppercase font-black opacity-60 text-[var(--text-base)]">Vacant: {stats.vacant}</span>
              </div>
              {typeSummary && (
                <div className="border-l border-[var(--border)] border-opacity-10 pl-4 ml-2">
                   <p className="font-mono text-[10px] uppercase font-black text-[var(--accent-bg)] tracking-tight">
                     {typeSummary}
                   </p>
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-4 w-full md:w-auto">
            <button onClick={onClose} className="px-8 py-5 border border-[var(--border)] border-opacity-20 rounded-base font-mono text-[10px] uppercase font-black hover:bg-[var(--bg-input)] transition-all text-[var(--text-base)]">Cancel</button>
            <button 
              onClick={onConfirm} 
              disabled={isUploading}
              className="flex-1 md:flex-none px-10 py-5 bg-[var(--text-base)] text-[var(--bg-panel)] rounded-base font-mono text-[10px] uppercase font-black hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 shadow-xl"
            >
              {isUploading ? <><Loader2 className="animate-spin" size={14} /> Cloud Backup...</> : <>Apply Changes <Check size={14} /></>}
            </button>
          </div>
        </div>

        {/* Content - Visualization */}
        <div className="p-10 bg-[var(--bg-base)]">
          <div className="space-y-12">
            {sortedFloors.map(floor => (
              <div key={floor} className="space-y-6">
                <div className="flex items-center gap-4">
                  <span className="font-mono text-[10px] uppercase font-black opacity-30 tracking-[0.4em] text-[var(--text-base)]">Floor {floor}</span>
                  <div className="h-[1px] flex-1 bg-[var(--border)] border-opacity-10" />
                </div>
                <div className="flex flex-wrap gap-3">
                  {floorsMap[floor].map((unit, idx) => {
                    const isVacant = unit.status === 'vacant';
                    const hasArrears = parseFloat(unit.arrears || '0') > 0;
                    
                    let colorClass = "bg-emerald-500/10 border-emerald-500/30 text-emerald-600";
                    if (isVacant) colorClass = "bg-yellow-500/10 border-yellow-500/30 text-yellow-700";
                    else if (hasArrears) colorClass = "bg-red-500/10 border-red-500/30 text-red-600";

                    return (
                      <div 
                        key={idx} 
                        className={`w-12 h-12 rounded-lg border-2 flex items-center justify-center transition-all hover:scale-125 hover:z-10 cursor-default group relative shadow-sm ${colorClass}`}
                      >
                        <span className="font-mono text-[9px] font-black opacity-80 group-hover:opacity-100">{unit.name}</span>
                        
                        {/* Tooltip */}
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 px-4 py-3 bg-[var(--text-base)] text-[var(--bg-panel)] rounded-lg text-[9px] font-black uppercase opacity-0 group-hover:opacity-100 pointer-events-none transition-all whitespace-nowrap z-50 shadow-2xl border border-[var(--border)] border-opacity-10 translate-y-2 group-hover:translate-y-0">
                          {unit.name} • {unit.typeId || unit.type || 'N/A'} • {isVacant ? 'Vacant' : (hasArrears ? `Arrears: KES ${unit.arrears}` : 'Paid')}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
