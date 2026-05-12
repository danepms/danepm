import React, { useState } from 'react';
import { Upload, Download, Copy, Check, AlertTriangle, FileSpreadsheet } from 'lucide-react';

interface Unit {
  id: string;
  name: string;
  status: 'vacant' | 'occupied';
  tenantId: string | null;
  typeId: string;
  floor?: number;
}

interface Tenant {
  id: string;
  name: string;
  phone: string;
  nextOfKin?: string;
  idNumber?: string;
  arrears: number;
  unitId: string | null;
}

interface BulkOnboardProps {
  units: Unit[];
  tenants: Tenant[];
  onApply: (newUnits: Unit[], newTenants: Tenant[]) => void;
  onCancel: () => void;
}

export const BulkOnboard = ({ units, tenants, onApply, onCancel }: BulkOnboardProps) => {
  const [pasteData, setPasteData] = useState('');
  const [parsedRows, setParsedRows] = useState<any[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [step, setStep] = useState<1 | 2>(1);

  const downloadTemplate = () => {
    // Generate CSV template ordered by floor, then name
    const sortedUnits = [...units].sort((a, b) => {
      if ((a.floor || 1) !== (b.floor || 1)) return (a.floor || 1) - (b.floor || 1);
      return a.name.localeCompare(b.name);
    });

    const headers = ['Floor', 'Unit Name', 'Tenant Name', 'Phone', 'ID Number', 'Next of Kin', 'Arrears (KES)'];
    const rows = sortedUnits.map(u => [
      u.floor || 1,
      u.name,
      '', // Name
      '', // Phone
      '', // ID
      '', // Next of Kin
      ''  // Arrears
    ]);

    const csvContent = [headers.join('\t'), ...rows.map(r => r.join('\t'))].join('\n');
    
    // Copy to clipboard for easy paste into Excel, or trigger download
    navigator.clipboard.writeText(csvContent);
    alert('Template copied to clipboard! Paste it into Excel or Google Sheets.');
  };

  const handleParse = () => {
    if (!pasteData.trim()) return;

    const rows = pasteData.trim().split('\n').map(r => r.split('\t'));
    const newErrors: string[] = [];
    const parsed: any[] = [];

    // Simple heuristic: if first row has "Unit Name" or "Floor", skip it
    let startIndex = 0;
    if (rows[0] && (rows[0][0]?.toLowerCase().includes('floor') || rows[0][1]?.toLowerCase().includes('unit'))) {
      startIndex = 1;
    }

    for (let i = startIndex; i < rows.length; i++) {
      const cols = rows[i];
      if (cols.length < 3) continue; // Skip empty/invalid rows

      const floor = cols[0]?.trim();
      const unitName = cols[1]?.trim();
      const tenantName = cols[2]?.trim();
      const phone = cols[3]?.trim() || '';
      const idNumber = cols[4]?.trim() || '';
      const nextOfKin = cols[5]?.trim() || '';
      const arrears = parseFloat(cols[6]?.trim() || '0') || 0;

      if (!unitName) continue; // Must have unit name

      // Check if unit exists
      const targetUnit = units.find(u => u.name.toLowerCase() === unitName.toLowerCase());
      
      if (!targetUnit) {
        newErrors.push(`Row ${i + 1}: Unit '${unitName}' not found in inventory.`);
        continue;
      }

      if (tenantName) {
        parsed.push({
          unitId: targetUnit.id,
          unitName: targetUnit.name,
          tenantName,
          phone,
          idNumber,
          nextOfKin,
          arrears
        });
      }
    }

    setParsedRows(parsed);
    setErrors(newErrors);
    setStep(2);
  };

  const handleApply = () => {
    let currentTenants = [...tenants];
    let currentUnits = [...units];

    parsedRows.forEach(row => {
      const newId = `t${Date.now()}${Math.random().toString(36).substring(7)}`;
      
      const newTenant: Tenant = {
        id: newId,
        name: row.tenantName,
        phone: row.phone,
        idNumber: row.idNumber,
        nextOfKin: row.nextOfKin,
        arrears: row.arrears,
        unitId: row.unitId
      };

      currentTenants.push(newTenant);
      
      currentUnits = currentUnits.map(u => 
        u.id === row.unitId 
          ? { ...u, status: 'occupied', tenantId: newId } 
          : u
      );
    });

    onApply(currentUnits, currentTenants);
  };

  return (
    <div className="bg-[var(--bg-panel)] border border-[var(--border)] p-6 md:p-10 shadow-[8px_8px_0px_0px_var(--shadow-color)] reveal-step">
      {step === 1 ? (
        <div className="space-y-8">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-black text-2xl uppercase tracking-tighter flex items-center gap-2">
                <FileSpreadsheet size={24} className="text-emerald-500" /> Magic Paste
              </h3>
              <p className="font-mono text-[10px] text-[var(--text-muted)] uppercase tracking-widest mt-2">
                Copy from Excel/Sheets and paste directly here.
              </p>
            </div>
            <button onClick={onCancel} className="p-2 border border-[var(--border)] hover:bg-[var(--text-base)] hover:text-[var(--bg-base)] transition-colors">
              <Check size={16} /> Close
            </button>
          </div>

          <div className="bg-[var(--bg-base)] border border-[var(--border)] p-6 rounded-lg text-center">
            <p className="font-mono text-xs uppercase mb-4">Don't have a spreadsheet yet?</p>
            <button onClick={downloadTemplate} className="inline-flex items-center gap-2 px-6 py-3 border border-[var(--accent-bg)] text-[var(--accent-bg)] hover:bg-[var(--accent-bg)] hover:text-[var(--accent-text)] font-mono text-xs font-bold uppercase transition-colors">
              <Copy size={16} /> Copy Template Headers
            </button>
            <p className="font-mono text-[9px] text-[var(--text-muted)] uppercase mt-3">
              We'll copy the template to your clipboard. Just paste it into cell A1 in Excel.
            </p>
          </div>

          <div>
            <textarea
              value={pasteData}
              onChange={e => setPasteData(e.target.value)}
              placeholder="Paste your copied rows from Excel here..."
              className="w-full h-48 bg-[var(--bg-base)] border border-[var(--border)] p-4 font-mono text-xs text-[var(--text-base)] focus:border-emerald-500 outline-none whitespace-pre"
            />
          </div>

          <button 
            onClick={handleParse}
            disabled={!pasteData.trim()}
            className="w-full bg-emerald-500 text-white font-bold font-mono text-sm uppercase py-4 shadow-[4px_4px_0px_0px_var(--shadow-color)] disabled:opacity-50 transition-all hover:translate-y-[-2px]"
          >
            Preview Data
          </button>
        </div>
      ) : (
        <div className="space-y-8">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-black text-2xl uppercase tracking-tighter">Review & Import</h3>
              <p className="font-mono text-[10px] text-[var(--text-muted)] uppercase tracking-widest mt-2">
                Found {parsedRows.length} valid tenants.
              </p>
            </div>
            <button onClick={() => setStep(1)} className="font-mono text-[10px] uppercase underline text-[var(--text-muted)]">
              Back to Paste
            </button>
          </div>

          {errors.length > 0 && (
            <div className="bg-red-500/10 border border-red-500/30 p-4">
              <h4 className="font-bold text-red-500 uppercase text-xs flex items-center gap-2 mb-2">
                <AlertTriangle size={14} /> Issues Found
              </h4>
              <ul className="list-disc list-inside font-mono text-[10px] text-red-400 space-y-1">
                {errors.map((e, i) => <li key={i}>{e}</li>)}
              </ul>
            </div>
          )}

          <div className="max-h-64 overflow-y-auto border border-[var(--border)]">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-[var(--bg-base)] sticky top-0">
                <tr>
                  <th className="p-3 border-b border-[var(--border)]">Unit</th>
                  <th className="p-3 border-b border-[var(--border)]">Tenant</th>
                  <th className="p-3 border-b border-[var(--border)]">Phone</th>
                  <th className="p-3 border-b border-[var(--border)]">Arrears</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {parsedRows.map((r, i) => (
                  <tr key={i} className="hover:bg-[var(--bg-base)]">
                    <td className="p-3 font-bold">{r.unitName}</td>
                    <td className="p-3">{r.tenantName}</td>
                    <td className="p-3">{r.phone || '-'}</td>
                    <td className="p-3 text-red-500">{r.arrears > 0 ? r.arrears : '-'}</td>
                  </tr>
                ))}
                {parsedRows.length === 0 && (
                  <tr>
                    <td colSpan={4} className="p-6 text-center text-[var(--text-muted)] uppercase">No valid rows found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="flex gap-4 pt-4">
            <button onClick={onCancel} className="flex-1 py-4 border border-[var(--border)] hover:bg-[var(--bg-base)] font-mono text-xs uppercase font-bold transition-colors">
              Cancel
            </button>
            <button 
              onClick={handleApply}
              disabled={parsedRows.length === 0}
              className="flex-1 bg-emerald-500 text-white py-4 font-mono text-xs uppercase font-bold shadow-[4px_4px_0px_0px_var(--shadow-color)] disabled:opacity-50 transition-transform hover:translate-y-[-2px]"
            >
              Import {parsedRows.length} Tenants
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
