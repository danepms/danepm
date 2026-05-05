"use client";

import React, { useState } from 'react';
import { 
  Building2, ArrowRight, Camera, Image as ImageIcon, 
  MapPin, Home, Store, Check, CheckSquare, X, Activity 
} from 'lucide-react';
import { createProperty, uploadPropertyImage } from '@/app/actions';

interface PropertyWizardProps {
  onComplete: () => void;
  userId: string | null;
  wizardStep: number;
  setWizardStep: (step: number | ((prev: number) => number)) => void;
  formData: any;
  setFormData: (data: any | ((prev: any) => any)) => void;
}

export const PropertyWizard = ({ onComplete, userId, wizardStep, setWizardStep, formData, setFormData }: PropertyWizardProps) => {
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const residentialTypes = [
    { id: 'single', label: 'Single Rooms' },
    { id: 'double', label: 'Double Rooms' },
    { id: 'bedsitter', label: 'Bedsitters' },
    { id: 'studio', label: 'Studios' },
    { id: 'oneBed', label: '1 Bedroom' },
    { id: 'twoBed', label: '2 Bedroom' },
    { id: 'threeBed', label: '3 Bedroom' },
  ];

  const commercialTypes = [
    { id: 'shop', label: 'Shops' },
    { id: 'office', label: 'Offices' },
    { id: 'warehouse', label: 'Warehouses' },
    { id: 'stall', label: 'Stalls' },
    { id: 'parking', label: 'Parking Slots' },
  ];

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const localUrl = URL.createObjectURL(file);
      setPreviewUrl(localUrl);
      setFormData({ ...formData, hasPhoto: true });
      
      setIsUploading(true);
      try {
        const uploadData = new FormData();
        uploadData.append("photo", file);
        const result = await uploadPropertyImage(uploadData);
        if (result.success && result.imageUrl) {
          setFormData((prev: any) => ({ ...prev, imageUrl: result.imageUrl }));
        }
      } catch (err) {
        console.error("Immediate upload failed:", err);
      } finally {
        setIsUploading(false);
      }
    }
  };

  const removePhoto = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setFormData({ ...formData, hasPhoto: false, imageUrl: undefined });
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleNext = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (wizardStep === 2) {
      setIsSaving(true);
      try {
        const result = await createProperty({
          name: formData.name,
          location: formData.location,
          userId: userId || "system_admin",
          hasResidential: formData.hasResidential,
          hasCommercial: formData.hasCommercial,
          residentialUnits: JSON.stringify(formData.residentialUnits),
          commercialUnits: JSON.stringify(formData.commercialUnits || {}),
          imageUrl: formData.imageUrl
        });
        
        if (result.success) {
          setWizardStep(3);
        } else {
          alert("Error: " + result.error);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsSaving(false);
      }
    } else {
      setWizardStep((prev: number) => prev + 1);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const updateUnitCount = (type: 'residential' | 'commercial', id: string, value: string) => {
    const num = parseInt(value);
    if (value === '' || (!isNaN(num) && num >= 0)) {
      const field = type === 'residential' ? 'residentialUnits' : 'commercialUnits';
      setFormData({
        ...formData,
        [field]: { ...formData[field], [id]: value }
      });
    }
  };

  const toggleUnitType = (type: 'residential' | 'commercial', id: string) => {
    const field = type === 'residential' ? 'residentialUnits' : 'commercialUnits';
    const current = formData[field] || {};
    if (current[id]) {
      const next = { ...current };
      delete next[id];
      setFormData({ ...formData, [field]: next });
    } else {
      setFormData({ ...formData, [field]: { ...current, [id]: '0' } });
    }
  };

  const renderProgressBar = () => {
    const totalSteps = 3;
    const blocks = Array.from({ length: totalSteps }, (_, i) => i + 1 <= wizardStep ? '█' : '░');
    return `[${blocks.join('')}]`;
  };

  return (
    <div className="reveal-step">
      {/* Hidden File Input */}
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        className="hidden" 
        accept="image/*"
      />

      <div className="flex items-center justify-between border-b border-[var(--border)] pb-6 mb-12 shrink-0">
        <div className="font-mono text-[10px] text-[var(--text-muted)] uppercase tracking-widest flex items-center gap-4">
          <span className="w-8 h-8 border border-[var(--border)] flex items-center justify-center bg-[var(--bg-input)] text-[var(--text-base)] font-bold rounded-lg shadow-sm">
            0{wizardStep}
          </span>
          <span className="font-bold">Step <span className="mx-1 opacity-40">/</span> 03</span>
          <span className="hidden sm:inline-block tracking-widest ml-2 opacity-60">
            {renderProgressBar()}
          </span>
        </div>
        <button className="flex items-center gap-1 font-mono text-[10px] uppercase text-[var(--text-muted)] hover:text-red-500 transition-colors font-bold">
          <X size={14} /> Close
        </button>
      </div>

      <div key={`step-${wizardStep}`} className="max-w-xl w-full mx-auto flex-1 reveal-step pb-12">
        {wizardStep === 1 && (
          <form onSubmit={handleNext} className="flex flex-col h-full space-y-10">
            <div>
              <div className="w-14 h-14 bg-[var(--accent-bg)] text-[var(--accent-text)] flex items-center justify-center mb-6 rounded-lg shadow-lg">
                <Building2 size={28} />
              </div>
              <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tighter mb-4 leading-none text-[var(--text-base)]">
                Tell us about your building.
              </h2>
              <p className="text-sm font-mono text-[var(--text-muted)] uppercase font-medium">
                Let's get the basic info down.
              </p>
            </div>

            <div className="space-y-8 flex-1">
              <div>
                <label className="text-[10px] font-mono text-[var(--text-muted)] uppercase mb-3 block font-bold">Building Name</label>
                <input 
                  type="text" 
                  placeholder="e.g. Skyline Towers" 
                  className="w-full bg-[var(--bg-input)] border border-[var(--border)] text-[var(--text-base)] p-4 font-mono text-lg focus:ring-2 focus:ring-[var(--accent-bg)] outline-none rounded-lg transition-all shadow-sm" 
                  autoFocus required value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                />
              </div>
              
              <div>
                <label className="flex items-center gap-2 text-[10px] font-mono text-[var(--text-muted)] uppercase mb-3 font-bold">
                  <MapPin size={12} /> Where is it located?
                </label>
                <input 
                  type="text" 
                  placeholder="e.g. Westlands, Nairobi" 
                  className="w-full bg-[var(--bg-input)] border border-[var(--border)] text-[var(--text-base)] p-4 font-mono text-lg focus:ring-2 focus:ring-[var(--accent-bg)] outline-none rounded-lg transition-all shadow-sm" 
                  required value={formData.location}
                  onChange={e => setFormData({...formData, location: e.target.value})}
                />
              </div>

              <div>
                <label className="text-[10px] font-mono text-[var(--text-muted)] uppercase mb-3 block font-bold">Add a photo (Optional)</label>
                {!formData.hasPhoto ? (
                  <button 
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full border-2 border-dashed border-[var(--border)] bg-[var(--bg-panel)] glass-card hover:border-[var(--accent-bg)] p-10 flex flex-col items-center justify-center gap-4 transition-all rounded-xl"
                  >
                    <Camera size={36} className="text-[var(--text-muted)]" />
                    <div className="text-center font-mono uppercase">
                      <span className="text-sm font-bold block mb-1">Add Image</span>
                      <span className="text-[10px] text-[var(--text-muted)]">Upload a shot of the front</span>
                    </div>
                  </button>
                ) : (
                  <div className="w-full border border-[var(--accent-bg)] bg-[var(--bg-input)] p-6 flex items-center justify-between shadow-sm rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-[var(--accent-bg)] text-[var(--accent-text)] overflow-hidden rounded-xl relative">
                        {previewUrl ? (
                          <>
                            <img src={previewUrl} alt="Preview" className={`w-full h-full object-cover transition-opacity ${isUploading ? 'opacity-30' : 'opacity-100'}`} />
                            {isUploading && (
                              <div className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-[2px]">
                                <Activity size={16} className="animate-pulse text-white" />
                              </div>
                            )}
                          </>
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <ImageIcon size={24} />
                          </div>
                        )}
                      </div>
                      <div className="font-mono uppercase">
                        <p className="font-bold text-sm">{isUploading ? "Uploading..." : "Image Added"}</p>
                        <p className="text-[10px] text-[var(--text-muted)]">{isUploading ? "Storing in Cloud..." : (selectedFile?.name || 'Saved to setup')}</p>
                      </div>
                    </div>
                    <button type="button" onClick={removePhoto} className="font-mono text-[10px] text-red-500 font-bold uppercase underline">Remove</button>
                  </div>
                )}
              </div>
            </div>

            <div className="pt-6">
              <button type="submit" className="w-full bg-[var(--accent-bg)] text-[var(--accent-text)] font-extrabold font-mono text-base uppercase py-3.5 shadow-[6px_6px_0px_0px_var(--shadow-color)] active:translate-y-1 active:shadow-none transition-all flex justify-center items-center gap-3 rounded-lg">
                Continue <ArrowRight size={20} />
              </button>
            </div>
          </form>
        )}

        {wizardStep === 2 && (
          <form onSubmit={handleNext} className="flex flex-col h-full space-y-10">
            <div>
              <button type="button" onClick={() => setWizardStep(1)} className="font-mono text-[10px] text-[var(--text-muted)] hover:text-[var(--text-base)] uppercase mb-6 flex items-center gap-2 font-bold tracking-widest">← Go Back</button>
              <div className="w-14 h-14 border-2 border-[var(--text-base)] text-[var(--text-base)] flex items-center justify-center mb-6 rounded-lg shadow-sm">
                <Home size={28} />
              </div>
              <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tighter mb-4 leading-none text-[var(--text-base)]">What's inside?</h2>
              <p className="text-sm font-mono text-[var(--text-muted)] uppercase font-medium">Tell us about the spaces you're renting.</p>
            </div>

            <div className="space-y-8 flex-1">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <button 
                  type="button" onClick={() => setFormData({...formData, hasResidential: !formData.hasResidential})}
                  className={`p-6 border text-left transition-all min-h-[160px] relative rounded-xl ${formData.hasResidential ? 'bg-[var(--bg-input)] border-[var(--accent-bg)] shadow-lg' : 'border-[var(--border)] opacity-30 bg-transparent'}`}
                >
                  {formData.hasResidential && <Check size={20} className="absolute top-5 right-5 text-[var(--accent-bg)]" />}
                  <Home size={36} className={`mb-4 ${formData.hasResidential ? 'text-[var(--accent-bg)]' : ''}`} />
                  <span className="font-extrabold text-xl uppercase block mb-1">Residential</span>
                  <span className="text-[10px] font-mono uppercase opacity-70">Houses / Apartments</span>
                </button>

                <button 
                  type="button" onClick={() => setFormData({...formData, hasCommercial: !formData.hasCommercial})}
                  className={`p-6 border text-left transition-all min-h-[160px] relative rounded-xl ${formData.hasCommercial ? 'bg-[var(--bg-input)] border-[var(--accent-bg)] shadow-lg' : 'border-[var(--border)] opacity-30 bg-transparent'}`}
                >
                  {formData.hasCommercial && <Check size={20} className="absolute top-5 right-5 text-[var(--accent-bg)]" />}
                  <Store size={36} className={`mb-4 ${formData.hasCommercial ? 'text-[var(--accent-bg)]' : ''}`} />
                  <span className="font-extrabold text-xl uppercase block mb-1">Commercial</span>
                  <span className="text-[10px] font-mono uppercase opacity-70">Shops / Offices</span>
                </button>
              </div>

              {(formData.hasResidential || formData.hasCommercial) && (
                <div className="border border-[var(--border)] bg-[var(--bg-panel)] glass-card p-8 reveal-step rounded-xl shadow-sm space-y-12">
                  
                  {/* Residential Section */}
                  {formData.hasResidential && (
                    <div className="reveal-step">
                      <div className="flex items-center gap-3 mb-6">
                        <Home size={20} className="text-[var(--accent-bg)]" />
                        <h3 className="font-extrabold uppercase text-lg">Residential Breakdown</h3>
                      </div>
                      
                      <label className="text-[10px] font-mono text-[var(--text-muted)] uppercase mb-4 block font-bold">Select Room Types</label>
                      <div className="flex flex-wrap gap-2 mb-8">
                        {residentialTypes.map((type) => {
                          const isSelected = !!formData.residentialUnits[type.id];
                          return (
                            <button
                              key={type.id}
                              type="button"
                              onClick={() => toggleUnitType('residential', type.id)}
                              className={`px-4 py-2 rounded-lg font-mono text-[10px] uppercase font-bold transition-all border ${
                                isSelected 
                                  ? 'bg-[var(--text-base)] text-[var(--bg-base)] border-[var(--text-base)] shadow-md' 
                                  : 'bg-[var(--bg-ghost)] text-[var(--text-muted)] border-[var(--border)] border-opacity-30 hover:border-opacity-100'
                              }`}
                            >
                              {type.label}
                            </button>
                          );
                        })}
                      </div>

                      <div className="space-y-4">
                        {Object.keys(formData.residentialUnits).map((unitId) => {
                          const type = residentialTypes.find(t => t.id === unitId);
                          if (!type) return null;
                          return (
                            <div key={unitId} className="flex items-center justify-between group reveal-step">
                              <span className="font-mono text-xs uppercase text-[var(--text-muted)] font-bold">{type.label}</span>
                              <div className="flex items-center gap-4">
                                <input 
                                  type="number" min="1" placeholder="0" 
                                  value={formData.residentialUnits[unitId]}
                                  onChange={(e) => updateUnitCount('residential', unitId, e.target.value)}
                                  className="w-24 bg-[var(--bg-input)] border border-[var(--border)] text-[var(--text-base)] text-center py-3 font-mono text-sm focus:ring-2 focus:ring-[var(--accent-bg)] outline-none rounded-lg transition-all font-bold"
                                />
                                <button 
                                  type="button" 
                                  onClick={() => toggleUnitType('residential', unitId)}
                                  className="p-2 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                  <X size={14} />
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Commercial Section */}
                  {formData.hasCommercial && (
                    <div className="reveal-step pt-4 border-t border-[var(--border)] border-opacity-20">
                      <div className="flex items-center gap-3 mb-6">
                        <Store size={20} className="text-[var(--accent-bg)]" />
                        <h3 className="font-extrabold uppercase text-lg">Commercial Breakdown</h3>
                      </div>
                      
                      <label className="text-[10px] font-mono text-[var(--text-muted)] uppercase mb-4 block font-bold">Select Unit Types</label>
                      <div className="flex flex-wrap gap-2 mb-8">
                        {commercialTypes.map((type) => {
                          const isSelected = !!formData.commercialUnits[type.id];
                          return (
                            <button
                              key={type.id}
                              type="button"
                              onClick={() => toggleUnitType('commercial', type.id)}
                              className={`px-4 py-2 rounded-lg font-mono text-[10px] uppercase font-bold transition-all border ${
                                isSelected 
                                  ? 'bg-[var(--text-base)] text-[var(--bg-base)] border-[var(--text-base)] shadow-md' 
                                  : 'bg-[var(--bg-ghost)] text-[var(--text-muted)] border-[var(--border)] border-opacity-30 hover:border-opacity-100'
                              }`}
                            >
                              {type.label}
                            </button>
                          );
                        })}
                      </div>

                      <div className="space-y-4">
                        {Object.keys(formData.commercialUnits || {}).map((unitId) => {
                          const type = commercialTypes.find(t => t.id === unitId);
                          if (!type) return null;
                          return (
                            <div key={unitId} className="flex items-center justify-between group reveal-step">
                              <span className="font-mono text-xs uppercase text-[var(--text-muted)] font-bold">{type.label}</span>
                              <div className="flex items-center gap-4">
                                <input 
                                  type="number" min="1" placeholder="0" 
                                  value={formData.commercialUnits[unitId]}
                                  onChange={(e) => updateUnitCount('commercial', unitId, e.target.value)}
                                  className="w-24 bg-[var(--bg-input)] border border-[var(--border)] text-[var(--text-base)] text-center py-3 font-mono text-sm focus:ring-2 focus:ring-[var(--accent-bg)] outline-none rounded-lg transition-all font-bold"
                                />
                                <button 
                                  type="button" 
                                  onClick={() => toggleUnitType('commercial', unitId)}
                                  className="p-2 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                  <X size={14} />
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Empty State */}
                  {Object.keys(formData.residentialUnits).length === 0 && Object.keys(formData.commercialUnits || {}).length === 0 && (
                    <div className="text-center py-12 border-2 border-dashed border-[var(--border)] border-opacity-10 rounded-2xl">
                      <p className="font-mono text-[10px] text-[var(--text-muted)] uppercase tracking-widest font-bold">Please select at least one unit type to continue</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="pt-6">
              <button 
                type="submit" 
                disabled={isSaving || (Object.keys(formData.residentialUnits).length === 0 && Object.keys(formData.commercialUnits || {}).length === 0)} 
                className="w-full bg-[var(--accent-bg)] text-[var(--accent-text)] font-extrabold font-mono text-base uppercase py-3.5 shadow-[6px_6px_0px_0px_var(--shadow-color)] active:translate-y-1 transition-all rounded-lg disabled:opacity-20 flex items-center justify-center gap-3"
              >
                {isSaving ? "Saving..." : "All Done"} <CheckSquare size={20} />
              </button>
            </div>
          </form>
        )}

        {wizardStep === 3 && (
          <div className="h-full flex flex-col justify-center items-center text-center py-12 space-y-10">
            <div className="w-28 h-28 bg-[var(--accent-bg)] text-[var(--accent-text)] flex items-center justify-center shadow-2xl mb-4 rounded-xl">
              <CheckSquare size={56} />
            </div>
            <div>
              <h2 className="text-5xl md:text-6xl font-black uppercase tracking-tighter mb-4 leading-none text-[var(--text-base)]">You're all set.</h2>
              <p className="text-sm font-mono text-[var(--text-muted)] uppercase font-bold">
                <span className="text-[var(--text-base)]">{formData.name}</span> is now active.
              </p>
            </div>
            <button 
              onClick={onComplete}
              className="w-full max-w-sm bg-[var(--text-base)] text-[var(--bg-base)] font-extrabold font-mono text-sm uppercase py-3.5 shadow-lg active:translate-y-1 transition-all rounded-lg flex items-center justify-center gap-3"
            >
              Open My Dashboard
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
