"use client";

import React, { useState, useRef } from 'react';
import { Download, Upload, Check, FileSpreadsheet, AlertTriangle, ChevronRight, LayoutGrid, Loader2 } from 'lucide-react';
import * as XLSX from 'xlsx';
import { api } from '@/lib/api';
import { parseConfig } from '@/lib/utils';
import { PreviewModal } from './PreviewModal';
import { UploadHistory } from './UploadHistory';

const REQUIRED_HEADERS = [
  'Floor', 'Unit Name', 'Unit Type', 'Rent (KES)', 
  'Tenant Name', 'Tenant Phone', 'Tenant Email', 'Tenant ID Number', 
  'Kin 1 Name', 'Kin 1 Phone', 'Kin 1 Relation', 
  'Kin 2 Name', 'Kin 2 Phone', 'Kin 2 Relation', 
  'Kin 3 Name', 'Kin 3 Phone', 'Kin 3 Relation', 
  'Move-in Date', 'Arrears (KES)'
];

interface LayoutConfig {
  floors: number | string;
  unitsPerFloor: number | string;
  convention: string;
}

interface MasterSetupProps {
  propertyId?: string;
  property?: any;
  layoutConfig: LayoutConfig;
  setLayoutConfig: (config: LayoutConfig) => void;
  units: any[];
  setUnits: (units: any[]) => void;
  tenants: any[];
  setTenants: (tenants: any[]) => void;
  rents: Record<string, number[]>;
  setRents: (rents: Record<string, number[]>) => void;
  onNext: () => void;
}

export const MasterSetup = ({
  propertyId, property,
  layoutConfig, setLayoutConfig,
  units, setUnits,
  tenants, setTenants,
  rents, setRents,
  onNext
}: MasterSetupProps) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [showEditAnyway, setShowEditAnyway] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [downloadMsg, setDownloadMsg] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const availableTypes = Object.keys(rents);
  const defaultType = availableTypes[0] || 'Unit';
  const propConfig = parseConfig(property?.config);
  const hasConfig = propConfig.units?.length > 0;
  const masterUploads = propConfig.masterUploads || [];

  const generateExcel = () => {
    setIsGenerating(true);
    const floorLetters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const rows = [];
    const floors = parseInt(layoutConfig.floors.toString()) || 0;
    const unitsPerFloor = parseInt(layoutConfig.unitsPerFloor.toString()) || 0;

    const createBlankRow = () => {
      const row: any = {
        "Floor": "", "Unit Name": "", "Unit Type": defaultType, "Rent (KES)": rents[defaultType] || "0", "Arrears (KES)": "0",
        "Tenant Name": "", "Tenant Phone": "", "Tenant Email": "", "Tenant ID Number": "", "Move-in Date": "", "Since when": ""
      };
      for(let k=1; k<=3; k++) {
        row[`Kin ${k} Name`] = ""; row[`Kin ${k} Relation`] = ""; row[`Kin ${k} Phone`] = "";
      }
      return row;
    };

    if (floors > 0 && unitsPerFloor > 0) {
      for (let f = 1; f <= floors; f++) {
        for (let u = 1; u <= unitsPerFloor; u++) {
          let name = layoutConfig.convention === 'alphanumeric' ? `${floorLetters[(f-1)%26]}${u}` : layoutConfig.convention === 'numeric' ? `${f}${u.toString().padStart(2, '0')}` : `Unit ${f}-${u}`;
          const row = createBlankRow(); row["Floor"] = f.toString(); row["Unit Name"] = name; rows.push(row);
        }
      }
    } else { for (let i = 0; i < 5; i++) rows.push(createBlankRow()); }

    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Property Layout");
    XLSX.writeFile(workbook, `${property?.name || 'Property'}_Setup.xlsx`);
    setIsGenerating(false);
    setDownloadMsg('Template downloaded!');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    setSelectedFile(file);
    const reader = new FileReader();
    reader.onload = (evt) => {
      const bstr = evt.target?.result;
      const wb = XLSX.read(bstr, { type: 'binary' });
      const wsname = wb.SheetNames[0];
      const data = XLSX.utils.sheet_to_json(wb.Sheets[wsname]);
      processExcelData(data);
    };
    reader.readAsBinaryString(file);
  };

  const processExcelData = (data: any[]) => {
    if (data.length === 0) return;
    
    const fileHeaders = Object.keys(data[0]);
    const missingHeaders = REQUIRED_HEADERS.filter(h => !fileHeaders.includes(h));
    
    if (missingHeaders.length > 0) {
      setErrors([`Invalid Template: Missing or misspelled columns: ${missingHeaders.join(', ')}`]);
      return;
    }

    const newErrors: string[] = []; const newUnits: any[] = []; const newTenants: any[] = [];
    const newRents: Record<string, number[]> = {};
    data.forEach((row: any, i: number) => {
      const floor = parseInt(row['Floor'] || row['floor']) || 1;
      const unitName = (row['Unit Name'] || row['unit'] || row['Name'])?.toString().trim();
      if (!unitName) { newErrors.push(`Row ${i + 2}: Missing Unit Name`); return; }
      
      // Robust Column Detection for Unit Type
      const type = (
        row['Unit Type'] || row['unit_type'] || row['Unit type'] || 
        row['Type'] || row['type'] || 
        row['Category'] || row['category'] ||
        row['Class'] || row['class']
      )?.toString().trim();
      
      const finalType = type || defaultType;

      const rawPrice = row['Rent (KES)'] || row['Rent'] || row['Price'] || row['rent'] || row['Amount'] || row['amount'];
      let priceVal = 0;
      if (typeof rawPrice === 'number') {
        priceVal = rawPrice;
      } else if (rawPrice) {
        const cleaned = rawPrice.toString().replace(/[^\d.-]/g, '');
        priceVal = Math.round(parseFloat(cleaned)) || 0;
      }
      
      if (!newRents[finalType]) newRents[finalType] = [];
      if (!newRents[finalType].includes(priceVal)) newRents[finalType].push(priceVal);

      const unitId = `u_${Date.now()}_${i}`;
      let tenantId = null;
      if ((row['Tenant Name'] || row['tenant'])?.toString().trim()) {
        tenantId = `t_${Date.now()}_${i}`;
        newTenants.push({
          id: tenantId, name: (row['Tenant Name'] || row['tenant']).toString().trim(), phone: (row['Tenant Phone'] || row['phone'])?.toString().trim() || '',
          email: (row['Tenant Email'] || row['email'])?.toString().trim() || '', idNumber: (row['Tenant ID Number'] || row['id_number'])?.toString().trim() || '',
          moveInDate: (row['Move-in Date'] || row['date'])?.toString().trim() || '', unitId, arrears: (parseFloat(row['Arrears (KES)'] || row['arrears'] || '0') || 0).toString(),
          nextOfKin: []
        });
      }
      newUnits.push({ id: unitId, name: unitName, floor: floor.toString(), typeId: finalType, rent: priceVal.toString(), status: tenantId ? 'occupied' : 'vacant', tenantId, arrears: (parseFloat(row['Arrears (KES)'] || row['arrears'] || '0') || 0).toString() });
    });
    if (newErrors.length === 0) { 
      setUnits(newUnits); 
      setTenants(newTenants); 
      setRents(newRents);
      
      // Store locally for immediate use in handleConfirm if needed
      (window as any)._lastImport = { units: newUnits, tenants: newTenants, rents: newRents };
      
      setShowPreview(true); 
    }
    setErrors(newErrors);
  };

  const handleConfirm = async () => {
    if (propertyId) {
      setIsUploading(true);
      
      // 1. Upload the physical file for history
      if (selectedFile) {
        const formData = new FormData(); 
        formData.append("file", selectedFile);
        formData.append("metadata", JSON.stringify({ totalUnits: units.length, totalTenants: tenants.length }));
        await api.post<any>(`/properties/${propertyId}/upload-excel`, formData);
      }

      // 2. CRITICAL: Save the actual processed data to the database config
      // Use locally stored fresh data if available to bypass state lag
      const freshData = (window as any)._lastImport;
      
      const finalUnits = freshData?.units || units;
      const finalTenants = freshData?.tenants || tenants;
      const finalRents = freshData?.rents || rents;

      const newConfig = {
        ...propConfig,
        units: finalUnits.map((u: any) => ({ ...u, rent: u.rent || "0" })),
        tenants: finalTenants,
        rents: finalRents,
        lastImport: new Date().toISOString()
      };
      
      await api.post<any>(`/properties/${propertyId}/setup`, newConfig);
      
      setIsUploading(false);
    }
    onNext();
  };

  return (
    <div className="flex flex-col h-full space-y-4">
      <PreviewModal show={showPreview} onClose={() => setShowPreview(false)} units={units} isUploading={isUploading} onConfirm={handleConfirm} />

      {hasConfig && !showEditAnyway ? (
        <div className="space-y-4 animate-reveal">
          <div className="p-4 bg-[var(--bg-panel)] border border-[var(--border)] border-opacity-10 rounded-base flex items-center gap-4">
            <div className="w-10 h-10 rounded-sm bg-emerald-500/10 flex items-center justify-center shrink-0 border border-emerald-500/20 text-emerald-500"><Check size={20} /></div>
            <div className="flex-1">
              <h4 className="text-[11px] font-black uppercase tracking-tight text-[var(--text-base)]">Initial Setup Complete</h4>
              <p className="font-mono text-[8px] text-[var(--text-muted)] uppercase font-bold">Property initialized with {propConfig.units.length} units.</p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setShowEditAnyway(true)} className="px-3 py-1.5 border border-[var(--border)] border-opacity-10 rounded-base font-mono text-[8px] uppercase font-black hover:bg-[var(--bg-input)] text-[var(--text-muted)]">Overwrite</button>
              <button onClick={onNext} className="px-5 py-1.5 bg-[var(--accent-bg)] text-[var(--accent-text)] rounded-base font-mono text-[8px] uppercase font-black flex items-center gap-2">Next Step <ChevronRight size={10} /></button>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {[{l:'Capacity',v:propConfig.units.length},{l:'Occupants',v:propConfig.tenants?.length || 0},{l:'Status',v:'Ready'}].map(s=>(
              <div key={s.l} className="bg-[var(--bg-panel)] p-3 border border-[var(--border)] border-opacity-10 rounded-base text-center">
                <p className="font-mono text-[7px] uppercase text-[var(--text-muted)] font-black mb-0.5">{s.l}</p>
                <p className="text-lg font-black">{s.v}</p>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <>
          {showEditAnyway && (
            <div className="p-2 bg-red-500/10 border border-red-500/20 rounded-base flex items-center justify-between animate-reveal">
              <p className="font-mono text-[8px] uppercase font-black text-red-500 flex items-center gap-2"><AlertTriangle size={10} /> Overwrite existing layout?</p>
              <button onClick={() => setShowEditAnyway(false)} className="font-mono text-[8px] uppercase font-black opacity-50 underline">Cancel</button>
            </div>
          )}

          <div className="flex items-center justify-between border-b border-[var(--border)] border-opacity-10 pb-3">
            <h2 className="text-lg font-black uppercase tracking-tighter text-[var(--text-base)] flex items-center gap-2">
              <FileSpreadsheet size={16} /> Master Setup.
            </h2>
            <p className="text-[8px] font-mono text-[var(--text-muted)] uppercase font-black opacity-30 tracking-[0.2em]">Step-02</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            <div className="bg-[var(--bg-panel)] border border-[var(--border)] border-opacity-10 p-4 rounded-base space-y-4">
              <div className="flex items-center gap-2"><span className="text-[8px] font-black font-mono px-1.5 py-0.5 bg-[var(--accent-bg)] text-[var(--accent-text)] rounded-sm">01</span><h3 className="font-black text-[10px] uppercase tracking-tight">Template</h3></div>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="font-mono text-[7px] text-[var(--text-muted)] uppercase font-black">Floors</label>
                  <input type="number" placeholder="4" value={layoutConfig.floors} onChange={(e) => setLayoutConfig({...layoutConfig, floors: e.target.value})} className="w-full bg-[var(--bg-input)] border border-[var(--border)] border-opacity-10 text-[var(--text-base)] p-2 rounded-base font-mono text-[10px] outline-none font-black" />
                </div>
                <div className="space-y-1">
                  <label className="font-mono text-[7px] text-[var(--text-muted)] uppercase font-black">Units / Floor</label>
                  <input type="number" placeholder="10" value={layoutConfig.unitsPerFloor} onChange={(e) => setLayoutConfig({...layoutConfig, unitsPerFloor: e.target.value})} className="w-full bg-[var(--bg-input)] border border-[var(--border)] border-opacity-10 text-[var(--text-base)] p-2 rounded-base font-mono text-[10px] outline-none font-black" />
                </div>
              </div>
              <div className="space-y-1">
                <label className="font-mono text-[7px] text-[var(--text-muted)] uppercase font-black">Convention</label>
                <select value={layoutConfig.convention} onChange={(e) => setLayoutConfig({...layoutConfig, convention: e.target.value})} className="w-full bg-[var(--bg-input)] border border-[var(--border)] border-opacity-10 text-[var(--text-base)] p-2 rounded-base font-mono text-[10px] outline-none font-black appearance-none cursor-pointer">
                  <option value="alphanumeric">A1, A2, B1, B2...</option>
                  <option value="numeric">101, 102, 201, 202...</option>
                </select>
              </div>
              <button onClick={generateExcel} disabled={isGenerating} className="w-full bg-[var(--accent-bg)] text-[var(--accent-text)] font-black font-mono text-[8px] uppercase py-3 rounded-base transition-all flex justify-center items-center gap-2">
                {isGenerating ? "..." : <><Download size={12} /> Download Template</>}
              </button>
            </div>

            <div className="bg-[var(--bg-panel)] border border-[var(--border)] border-opacity-10 p-4 rounded-base space-y-4">
              <div className="flex items-center gap-2"><span className="text-[8px] font-black font-mono px-1.5 py-0.5 bg-[var(--accent-bg)] text-[var(--accent-text)] rounded-sm">02</span><h3 className="font-black text-[10px] uppercase tracking-tight">Upload</h3></div>
              <div className="aspect-[3/1] border border-dashed border-[var(--border)] border-opacity-20 rounded-base flex flex-col items-center justify-center p-4 group hover:border-opacity-50 transition-all cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept=".xlsx, .xls" className="hidden" />
                <Upload size={16} className="opacity-20 mb-1" />
                <p className="font-black text-[9px] uppercase">Upload XLSX</p>
              </div>
              {errors.length > 0 && (
                <div className="p-2 bg-red-500/10 border border-red-500/20 rounded-base space-y-1">
                  {errors.slice(0, 3).map((err, i) => (<p key={i} className="font-mono text-[7px] uppercase font-black text-red-500 truncate">{err}</p>))}
                </div>
              )}
              <div className="p-3 bg-[var(--bg-base)] border border-[var(--border)] border-opacity-5 rounded-base flex items-center gap-3">
                <LayoutGrid className="text-emerald-500 opacity-30" size={16} />
                <p className="font-black text-[9px] uppercase opacity-40">Ready for import</p>
              </div>
            </div>
          </div>
        </>
      )}
      {masterUploads.length > 0 && <UploadHistory masterUploads={masterUploads} />}
    </div>
  );
};
