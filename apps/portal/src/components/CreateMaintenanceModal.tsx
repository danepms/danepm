"use client";

import React, { useState } from 'react';
import { X, Wrench, Zap, Droplets, PaintBucket, Trash2, Image as ImageIcon, Loader2, AlertCircle } from 'lucide-react';
import { api } from '@/lib/api';

const CATEGORIES = [
  { id: 'plumbing', label: 'Plumbing', icon: Droplets, color: 'text-blue-500 bg-blue-500/10' },
  { id: 'electrical', label: 'Electrical', icon: Zap, color: 'text-yellow-500 bg-yellow-500/10' },
  { id: 'structural', label: 'Structural', icon: Wrench, color: 'text-purple-500 bg-purple-500/10' },
  { id: 'painting', label: 'Painting', icon: PaintBucket, color: 'text-pink-500 bg-pink-500/10' },
  { id: 'cleaning', label: 'Cleaning', icon: Trash2, color: 'text-emerald-500 bg-emerald-500/10' },
  { id: 'general', label: 'General', icon: AlertCircle, color: 'text-gray-500 bg-gray-500/10' },
];

interface CreateMaintenanceModalProps {
  show: boolean;
  onClose: () => void;
  onSuccess: () => void;
  managerId: string;
  propertyId: string;
  propertyName?: string;
  unitId?: string;
  tenantId?: string;
}

export const CreateMaintenanceModal = ({ 
  show, onClose, onSuccess, managerId, propertyId, propertyName, unitId, tenantId 
}: CreateMaintenanceModalProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'general',
    priority: 'normal',
    photos: [] as string[]
  });

  if (!show) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const res = await api.post<any>("/maintenance/requests", {
      ...formData,
      propertyId,
      unitId,
      tenantId,
      managerId,
      photos: JSON.stringify(formData.photos),
      initiatedBy: 'manager',
      initiatedById: managerId
    });
    if (res.success) {
      onSuccess();
      onClose();
      setFormData({ title: '', description: '', category: 'general', priority: 'normal', photos: [] });
    }
    setIsLoading(false);
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    setIsUploadingPhoto(true);
    for (let i = 0; i < files.length; i++) {
      const fd = new FormData();
      fd.append('photo', files[i]);
      const res = await api.post<any>("/tenants/upload-photo", fd);
      if (res.success && res.imageUrl) {
        setFormData(prev => ({ ...prev, photos: [...prev.photos, res.imageUrl] }));
      }
    }
    setIsUploadingPhoto(false);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 backdrop-blur-2xl bg-black/60 animate-reveal">
      <div className="absolute inset-0" onClick={onClose} />
      <form onSubmit={handleSubmit} className="relative w-full max-w-2xl bg-[var(--bg-panel)] border border-[var(--border)] border-opacity-20 rounded-[40px] shadow-[64px_64px_0px_0px_var(--shadow-color)] overflow-hidden">
        
        <div className="p-10 border-b border-[var(--border)] border-opacity-10 flex justify-between items-center bg-[var(--bg-ghost)]/30">
          <div>
            <div className="flex items-center gap-3 text-[var(--accent-bg)] mb-1">
                <Wrench size={24} strokeWidth={2.5} />
                <h3 className="text-2xl font-black uppercase tracking-tighter">New Repair Request</h3>
            </div>
            <p className="font-mono text-[9px] text-[var(--text-muted)] uppercase tracking-widest font-black opacity-50">Logging for {propertyName || 'Asset'} · {unitId || 'Common Area'}</p>
          </div>
          <button type="button" onClick={onClose} className="p-4 hover:bg-red-500/10 text-[var(--text-muted)] hover:text-red-500 transition-all rounded-full">
            <X size={24} />
          </button>
        </div>

        <div className="p-10 space-y-10">
          {/* CATEGORY SELECT */}
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
            {CATEGORIES.map(cat => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setFormData({...formData, category: cat.id})}
                className={`flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all gap-2 ${formData.category === cat.id ? 'border-[var(--accent-bg)] bg-[var(--accent-bg)] text-white shadow-lg scale-105' : 'border-[var(--border)] border-opacity-10 hover:border-opacity-100 text-[var(--text-muted)]'}`}
              >
                <cat.icon size={20} strokeWidth={formData.category === cat.id ? 3 : 2} />
                <span className="font-mono text-[8px] font-black uppercase tracking-widest">{cat.label}</span>
              </button>
            ))}
          </div>

          <div className="space-y-8">
            <div className="space-y-3">
              <label className="font-mono text-[9px] uppercase text-[var(--text-muted)] font-black tracking-widest ml-1">The Problem</label>
              <input 
                required
                placeholder="e.g. Broken pipe under kitchen sink"
                value={formData.title}
                onChange={e => setFormData({...formData, title: e.target.value})}
                className="w-full bg-[var(--bg-input)] border border-[var(--border)] border-opacity-10 p-6 rounded-3xl font-mono text-sm font-black outline-none focus:border-[var(--accent-bg)] focus:ring-4 focus:ring-[var(--accent-bg)]/5 transition-all"
              />
            </div>

            <div className="space-y-3">
              <label className="font-mono text-[9px] uppercase text-[var(--text-muted)] font-black tracking-widest ml-1">Additional Details (Optional)</label>
              <textarea 
                placeholder="Describe the issue in more detail..."
                rows={4}
                value={formData.description}
                onChange={e => setFormData({...formData, description: e.target.value})}
                className="w-full bg-[var(--bg-input)] border border-[var(--border)] border-opacity-10 p-6 rounded-3xl font-mono text-sm font-black outline-none focus:border-[var(--accent-bg)] focus:ring-4 focus:ring-[var(--accent-bg)]/5 transition-all resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-3">
                <label className="font-mono text-[9px] uppercase text-[var(--text-muted)] font-black tracking-widest ml-1">Priority</label>
                <select 
                  value={formData.priority}
                  onChange={e => setFormData({...formData, priority: e.target.value})}
                  className="w-full bg-[var(--bg-input)] border border-[var(--border)] border-opacity-10 p-6 rounded-3xl font-mono text-xs font-black outline-none focus:border-[var(--accent-bg)] appearance-none cursor-pointer"
                >
                  <option value="normal">Normal</option>
                  <option value="high">High (Urgent)</option>
                  <option value="critical">Emergency</option>
                </select>
              </div>
              <div className="space-y-3">
                <label className="font-mono text-[9px] uppercase text-[var(--text-muted)] font-black tracking-widest ml-1">Photos / Evidence</label>
                <label className="w-full bg-[var(--bg-ghost)] border-2 border-dashed border-[var(--border)] border-opacity-10 p-4 rounded-3xl flex items-center justify-center cursor-pointer hover:border-[var(--accent-bg)] hover:border-opacity-50 transition-all group h-full min-h-[68px]">
                  <input type="file" multiple accept="image/*" className="hidden" onChange={handlePhotoUpload} />
                  {isUploadingPhoto ? <Loader2 size={20} className="animate-spin text-[var(--accent-bg)]" /> : (
                    <div className="flex items-center gap-3">
                        <ImageIcon size={20} className="text-[var(--text-muted)] group-hover:text-[var(--accent-bg)]" />
                        <span className="font-mono text-[9px] font-black uppercase text-[var(--text-muted)] group-hover:text-[var(--text-base)]">{formData.photos.length > 0 ? `${formData.photos.length} Attached` : 'Upload'}</span>
                    </div>
                  )}
                </label>
              </div>
            </div>
          </div>
        </div>

        <div className="p-10 bg-[var(--bg-ghost)]/50 border-t border-[var(--border)] border-opacity-10 flex gap-4">
            <button type="button" onClick={onClose} className="px-10 py-5 border border-[var(--border)] border-opacity-10 rounded-2xl font-mono text-[11px] uppercase font-black hover:bg-red-500/5 hover:text-red-500 transition-all">Cancel</button>
            <button 
                type="submit" 
                disabled={isLoading || !formData.title}
                className="flex-1 bg-[var(--text-base)] text-[var(--bg-panel)] py-5 rounded-2xl font-mono text-[11px] uppercase font-black shadow-xl hover:translate-y-[-2px] hover:shadow-[0_20px_40px_-10px_rgba(0,0,0,0.3)] transition-all flex items-center justify-center gap-4 disabled:opacity-50"
            >
                {isLoading ? <Loader2 size={18} className="animate-spin" /> : 'Create Repair Request'}
            </button>
        </div>
      </form>
    </div>
  );
};
