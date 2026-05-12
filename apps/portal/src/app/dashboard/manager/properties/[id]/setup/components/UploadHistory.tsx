"use client";

import React from 'react';
import { FileSpreadsheet, Download } from 'lucide-react';

interface UploadHistoryProps {
  masterUploads: any[];
}

export const UploadHistory = ({ masterUploads }: UploadHistoryProps) => {
  if (!masterUploads || masterUploads.length === 0) return null;

  return (
    <div className="mt-24 space-y-12 reveal-step">
      <div className="flex items-center gap-6">
        <div className="w-12 h-[1px] bg-[var(--border)] border-opacity-20" />
        <h3 className="font-black text-2xl uppercase tracking-tighter text-[var(--text-base)]">Upload History</h3>
        <div className="flex-1 h-[1px] bg-[var(--border)] border-opacity-20" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {masterUploads.slice().reverse().map((upload: any, idx: number) => (
          <div key={idx} className="bg-[var(--bg-panel)] border border-[var(--border)] border-opacity-10 p-8 rounded-base hover:border-opacity-30 transition-all group relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-all">
              <FileSpreadsheet size={64} />
            </div>
            
            <div className="relative z-10 space-y-6">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <p className="font-mono text-[10px] uppercase font-black text-[var(--text-muted)]">
                    {new Date(upload.timestamp).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </p>
                  <h4 className="font-black text-lg uppercase truncate max-w-[180px]">{upload.filename}</h4>
                </div>
                <a 
                  href={upload.fileUrl} 
                  download 
                  className="w-12 h-12 bg-[var(--text-base)] text-[var(--bg-panel)] rounded-lg flex items-center justify-center hover:scale-110 transition-all shadow-lg"
                >
                  <Download size={18} />
                </a>
              </div>

              <div className="flex gap-6 border-t border-[var(--border)] border-opacity-10 pt-6">
                <div>
                  <p className="font-mono text-[8px] uppercase font-black text-[var(--text-muted)] opacity-50 mb-1">Units</p>
                  <p className="font-mono text-sm font-black">{upload.totalUnits || 0}</p>
                </div>
                <div>
                  <p className="font-mono text-[8px] uppercase font-black text-[var(--text-muted)] opacity-50 mb-1">Tenants</p>
                  <p className="font-mono text-sm font-black">{upload.totalTenants || 0}</p>
                </div>
                <div className="ml-auto flex items-center">
                   <div className="px-3 py-1 bg-emerald-500/10 text-emerald-600 rounded-full font-mono text-[8px] font-black uppercase">Stored</div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
