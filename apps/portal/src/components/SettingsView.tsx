"use client";

import React, { useState, useEffect } from 'react';
import { 
  User, Shield, Bell, Clock, Monitor, Smartphone, 
  Trash2, RefreshCw, Key, Mail, Phone, Check, X,
  ChevronRight, LogOut, ShieldCheck, Fingerprint, 
  AlertTriangle, Lock, UserX, Plus, ShieldAlert, Zap, Briefcase
} from 'lucide-react';
import { useToast } from '@/context/ToastContext';
import { authClient } from '@/lib/auth-client';
import { api } from '@/lib/api';
import { resolveDeviceName } from '@/lib/utils';

interface SettingsViewProps {
  user: any;
  initialTab?: 'profile' | 'security' | 'business' | 'finance';
}

export const SettingsView = ({ user, initialTab = 'profile' }: SettingsViewProps) => {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'business' | 'finance'>(initialTab);
  const [sessions, setSessions] = useState<any[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [passkeys, setPasskeys] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // --- MFA STATE ---
  const [showMfaModal, setShowMfaModal] = useState(false);
  const [mfaStep, setMfaStep] = useState<'password' | 'otp' | 'success'>('password');
  const [otpCode, setOtpCode] = useState('');
  const [countdown, setCountdown] = useState(300);

  // --- PASSKEY STATE ---
  const [showPasskeyModal, setShowPasskeyModal] = useState(false);
  const [passkeyStep, setPasskeyStep] = useState<'ready' | 'waiting' | 'success' | 'error'>('ready');
  
  // Form States
  const [newName, setNewName] = useState(user?.name || '');
  const [newEmail, setNewEmail] = useState(user?.email || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  // Business State
  const [companyName, setCompanyName] = useState(user?.businessConfig?.companyName || '');
  const [address, setAddress] = useState(user?.businessConfig?.address || '');
  const [supportEmail, setSupportEmail] = useState(user?.businessConfig?.supportEmail || '');
  const [supportPhone, setSupportPhone] = useState(user?.businessConfig?.supportPhone || '');
  const [logoUrl, setLogoUrl] = useState(user?.businessConfig?.logoUrl || '');

  // Finance State
  const [rentDueDay, setRentDueDay] = useState(user?.financeConfig?.rentDueDay || 5);
  const [penaltyGraceDays, setPenaltyGraceDays] = useState(user?.financeConfig?.penaltyGraceDays || 5);
  const [penaltyType, setPenaltyType] = useState(user?.financeConfig?.penaltyType || 'percent');
  const [penaltyValue, setPenaltyValue] = useState(user?.financeConfig?.penaltyValue || 10);

  useEffect(() => {
    let timer: any;
    if (showMfaModal && mfaStep === 'otp' && countdown > 0) {
      timer = setInterval(() => setCountdown(prev => prev - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [showMfaModal, mfaStep, countdown]);

  useEffect(() => {
    if (activeTab === 'security') {
      loadSessions();
      loadPasskeys();
    }
  }, [activeTab]);

  // --- ACTIONS ---

  const loadSessions = async () => {
    setIsLoading(true);
    const res = await api.get<any>(`/admin/sessions?managerId=${user.id}`);
    if (res.success) setSessions(res.sessions || []);
    setIsLoading(false);
  };

  const loadPasskeys = async () => {
    const res = await authClient.passkey.listUserPasskeys();
    if (res.data) setPasskeys(res.data);
  };

  const handleUpdateProfile = async () => {
    const { error } = await authClient.updateUser({ name: newName });
    if (error) showToast('Update failed', 'error');
    else showToast('Profile updated', 'success');
  };

  const handleChangeEmail = async () => {
    const { error } = await authClient.changeEmail({
      newEmail,
      callbackURL: "/dashboard/manager/profile"
    });
    if (error) showToast('Email change failed', 'error');
    else showToast('Check your email to verify', 'success');
  };

  const handleChangePassword = async () => {
    const { error } = await authClient.changePassword({
      currentPassword,
      newPassword,
      revokeOtherSessions: true,
    });
    if (error) showToast('Password change failed', 'error');
    else {
      showToast('Password updated', 'success');
      setCurrentPassword('');
      setNewPassword('');
    }
  };

  const handleAddPasskey = async () => {
    setShowPasskeyModal(true);
    setPasskeyStep('waiting');
    
    const { error } = await authClient.passkey.addPasskey({
       name: `${resolveDeviceName(navigator.userAgent)} Key`
    });

    if (error) {
      setPasskeyStep('error');
      showToast('Failed to add key', 'error');
    } else {
      setPasskeyStep('success');
      showToast('Key added', 'success');
      loadPasskeys();
    }
  };

  const handleToggle2FA = async () => {
    if (user.twoFactorEnabled) {
      await authClient.twoFactor.disable({ password: currentPassword });
      showToast('MFA Disabled', 'success');
      window.location.reload();
    } else {
      setShowMfaModal(true);
      setMfaStep('password');
    }
  };

  const handleUpdateBusiness = async () => {
    setIsLoading(true);
    const res = await api.post<any>("/admin/business-settings", {
        managerId: user.id, companyName, address, supportEmail, supportPhone, logoUrl
    });
    if (res.success) showToast('Business settings saved', 'success');
    else showToast('Failed to save settings', 'error');
    setIsLoading(false);
  };

  const handleUpdateFinance = async () => {
    setIsLoading(true);
    const res = await api.post<any>("/admin/finance-settings", {
        managerId: user.id, rentDueDay, penaltyGraceDays, penaltyType, penaltyValue
    });
    if (res.success) showToast('Portfolio policy updated', 'success');
    else showToast('Failed to update policy', 'error');
    setIsLoading(false);
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    const formData = new FormData();
    formData.append('file', file);
    const res = await api.post<any>("/admin/upload-logo", formData);
    if (res.success && res.url) {
        setLogoUrl(res.url);
        showToast('Logo uploaded', 'success');
    } else {
        showToast('Upload failed', 'error');
    }
    setIsLoading(false);
  };

  const handleRevokeSession = async (id: string) => {
    const res = await api.post<any>(`/admin/sessions/${id}/revoke`, { managerId: user.id });
    if (res.success) {
      showToast('Logged out device', 'success');
      loadSessions();
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto py-6 px-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
      
      {/* --- TOP TABS --- */}
      <div className="flex flex-wrap gap-1 bg-black p-1 rounded-lg border border-[var(--border)] border-opacity-10 mb-6 w-fit mx-auto justify-center">
        <button 
          onClick={() => setActiveTab('profile')}
          className={`px-4 md:px-6 py-2 text-[10px] font-black uppercase tracking-widest rounded transition-all ${activeTab === 'profile' ? 'bg-[var(--text-base)] text-[var(--bg-panel)]' : 'text-[var(--text-muted)] hover:text-[var(--text-base)]'}`}
        >
          My Profile
        </button>
        <button 
          onClick={() => setActiveTab('business')}
          className={`px-4 md:px-6 py-2 text-[10px] font-black uppercase tracking-widest rounded transition-all ${activeTab === 'business' ? 'bg-[var(--text-base)] text-[var(--bg-panel)]' : 'text-[var(--text-muted)] hover:text-[var(--text-base)]'}`}
        >
          Business Identity
        </button>
        <button 
          onClick={() => setActiveTab('finance')}
          className={`px-4 md:px-6 py-2 text-[10px] font-black uppercase tracking-widest rounded transition-all ${activeTab === 'finance' ? 'bg-[var(--text-base)] text-[var(--bg-panel)]' : 'text-[var(--text-muted)] hover:text-[var(--text-base)]'}`}
        >
          Portfolio Policy
        </button>
        <button 
          onClick={() => setActiveTab('security')}
          className={`px-4 md:px-6 py-2 text-[10px] font-black uppercase tracking-widest rounded transition-all ${activeTab === 'security' ? 'bg-[var(--text-base)] text-[var(--bg-panel)]' : 'text-[var(--text-muted)] hover:text-[var(--text-base)]'}`}
        >
          Security & Auth
        </button>
      </div>

      <div className="space-y-4">
        {activeTab === 'profile' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* AVATAR CARD */}
            <div className="bg-[var(--bg-panel)] p-6 border border-[var(--border)] border-opacity-10 rounded-lg flex flex-col items-center justify-center space-y-4">
              <div className="w-16 h-16 rounded-lg bg-[var(--text-base)] text-[var(--bg-panel)] flex items-center justify-center text-3xl font-black uppercase">
                {user?.name?.slice(0, 1)}
              </div>
              <div className="text-center">
                <p className="text-lg font-black uppercase tracking-tight">{user?.name}</p>
                <p className="text-[9px] text-[var(--text-muted)] font-black uppercase tracking-widest">
                  {user?.role === 'owner' ? 'Owner' : 'Manager'}
                </p>
              </div>
              <button className="text-[9px] font-black uppercase tracking-widest text-[var(--accent-bg)] hover:underline">Change Photo</button>
            </div>

            {/* IDENTITY FORM */}
            <div className="md:col-span-2 bg-[var(--bg-panel)] p-6 border border-[var(--border)] border-opacity-10 rounded-lg space-y-6">
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-1">
                  <label className="text-[9px] font-black uppercase text-[var(--text-muted)] tracking-widest">Display Name</label>
                  <input 
                    type="text" 
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="w-full bg-black border border-[var(--border)] border-opacity-5 p-3 rounded text-sm font-bold focus:border-opacity-100 outline-none transition-all"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-black uppercase text-[var(--text-muted)] tracking-widest">Email Address</label>
                  <div className="flex gap-2">
                    <input 
                      type="email" 
                      value={newEmail}
                      onChange={(e) => setNewEmail(e.target.value)}
                      className="flex-1 bg-black border border-[var(--border)] border-opacity-5 p-3 rounded text-sm font-bold outline-none"
                    />
                    <button onClick={handleChangeEmail} className="px-4 bg-[var(--bg-ghost)] rounded text-[9px] font-black uppercase border border-[var(--border)] border-opacity-10">Verify</button>
                  </div>
                </div>
              </div>
              <div className="flex justify-end pt-2">
                <button onClick={handleUpdateProfile} className="px-8 py-3 bg-[var(--text-base)] text-[var(--bg-panel)] text-[10px] font-black uppercase tracking-widest rounded hover:translate-y-[-1px] transition-all active:translate-y-0">Save Profile</button>
              </div>
            </div>

            {/* DANGER ZONE */}
            <div className="md:col-span-3 bg-red-500/5 border border-red-500/10 p-4 rounded flex items-center justify-between">
              <div className="flex items-center gap-3">
                <AlertTriangle size={16} className="text-red-500" />
                <p className="text-[9px] text-red-500/80 font-black uppercase tracking-widest">Terminate Account Data</p>
              </div>
              <button className="px-4 py-2 bg-red-500 text-white text-[9px] font-black uppercase tracking-widest rounded shadow-lg">Delete</button>
            </div>
          </div>
        )}

        {activeTab === 'business' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
            <div className="bg-[var(--bg-panel)] p-8 border border-[var(--border)] border-opacity-10 rounded-xl space-y-8">
              <div className="flex flex-col md:flex-row gap-8 items-start">
                <div className="w-32 h-32 bg-black border border-[var(--border)] border-opacity-10 rounded-xl flex items-center justify-center overflow-hidden relative group">
                  {logoUrl ? <img src={logoUrl} alt="Logo" className="w-full h-full object-contain p-2" /> : <Briefcase className="opacity-20" size={40} />}
                  <label className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center cursor-pointer transition-all">
                    <p className="text-[8px] font-black uppercase tracking-widest text-white">Upload Logo</p>
                    <input type="file" className="hidden" onChange={handleLogoUpload} accept="image/*" />
                  </label>
                </div>
                <div className="flex-1 space-y-6 w-full">
                  <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase text-[var(--text-muted)] tracking-widest">Company Registered Name</label>
                    <input 
                      type="text" 
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      className="w-full bg-black border border-[var(--border)] border-opacity-10 p-4 rounded-lg font-bold text-lg focus:ring-2 focus:ring-[var(--accent-bg)] outline-none transition-all"
                      placeholder="E.G. DANE MANAGEMENT LTD"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[9px] font-black uppercase text-[var(--text-muted)] tracking-widest">Support Email</label>
                      <input 
                        type="email" 
                        value={supportEmail}
                        onChange={(e) => setSupportEmail(e.target.value)}
                        className="w-full bg-black border border-[var(--border)] border-opacity-10 p-3 rounded font-bold text-sm outline-none"
                        placeholder="support@company.com"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-black uppercase text-[var(--text-muted)] tracking-widest">Support Hotline</label>
                      <input 
                        type="text" 
                        value={supportPhone}
                        onChange={(e) => setSupportPhone(e.target.value)}
                        className="w-full bg-black border border-[var(--border)] border-opacity-10 p-3 rounded font-bold text-sm outline-none"
                        placeholder="+254..."
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-black uppercase text-[var(--text-muted)] tracking-widest">Headquarters Physical Address</label>
                <textarea 
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full bg-black border border-[var(--border)] border-opacity-10 p-4 rounded-lg font-bold text-sm min-h-[80px] outline-none"
                  placeholder="Street, Building, Floor..."
                />
              </div>
              <div className="flex justify-end border-t border-[var(--border)] border-opacity-5 pt-6">
                <button 
                    onClick={handleUpdateBusiness}
                    disabled={isLoading}
                    className="px-10 py-4 bg-[var(--text-base)] text-[var(--bg-panel)] text-[10px] font-black uppercase tracking-widest rounded-lg shadow-xl hover:translate-y-[-2px] transition-all active:translate-y-0 disabled:opacity-50"
                >
                  Save Business Identity
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'finance' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
            <div className="bg-[var(--bg-panel)] p-8 border border-[var(--border)] border-opacity-10 rounded-xl space-y-8">
              <div className="flex items-center gap-4 border-b border-[var(--border)] border-opacity-5 pb-4">
                <Zap className="text-amber-500" size={20} />
                <div>
                  <h3 className="font-black uppercase tracking-tight text-lg">Global Financial Policy</h3>
                  <p className="text-[9px] font-mono text-[var(--text-muted)] uppercase tracking-widest">Defaults for all properties unless overridden</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase text-[var(--text-muted)] tracking-widest">Standard Rent Due Day</label>
                    <input 
                      type="number" 
                      min={1} max={28}
                      value={rentDueDay}
                      onChange={(e) => setRentDueDay(parseInt(e.target.value))}
                      className="w-full bg-black border border-[var(--border)] border-opacity-10 p-4 rounded-lg font-black text-2xl outline-none"
                    />
                    <p className="text-[8px] text-[var(--text-muted)] font-bold uppercase mt-2 italic">Typically the 1st or 5th of every month</p>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase text-[var(--text-muted)] tracking-widest">Penalty Grace Period (Days)</label>
                    <input 
                      type="number" 
                      min={0}
                      value={penaltyGraceDays}
                      onChange={(e) => setPenaltyGraceDays(parseInt(e.target.value))}
                      className="w-full bg-black border border-[var(--border)] border-opacity-10 p-4 rounded-lg font-black text-2xl outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase text-[var(--text-muted)] tracking-widest">Default Late Fee Structure</label>
                    <div className="flex gap-2 p-1 bg-black rounded-lg border border-[var(--border)] border-opacity-10">
                      <button 
                        onClick={() => setPenaltyType('percent')}
                        className={`flex-1 py-3 text-[9px] font-black uppercase tracking-widest rounded ${penaltyType === 'percent' ? 'bg-[var(--accent-bg)] text-[var(--accent-text)]' : 'text-[var(--text-muted)]'}`}
                      >Percentage (%)</button>
                      <button 
                        onClick={() => setPenaltyType('flat')}
                        className={`flex-1 py-3 text-[9px] font-black uppercase tracking-widest rounded ${penaltyType === 'flat' ? 'bg-[var(--accent-bg)] text-[var(--accent-text)]' : 'text-[var(--text-muted)]'}`}
                      >Flat Rate (KES)</button>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase text-[var(--text-muted)] tracking-widest">Penalty Value</label>
                    <input 
                      type="number" 
                      value={penaltyValue}
                      onChange={(e) => setPenaltyValue(parseFloat(e.target.value))}
                      className="w-full bg-black border border-[var(--border)] border-opacity-10 p-4 rounded-lg font-black text-2xl outline-none text-[var(--accent-bg)]"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end border-t border-[var(--border)] border-opacity-5 pt-6">
                <button 
                    onClick={handleUpdateFinance}
                    disabled={isLoading}
                    className="px-10 py-4 bg-[var(--text-base)] text-[var(--bg-panel)] text-[10px] font-black uppercase tracking-widest rounded-lg shadow-xl hover:translate-y-[-2px] transition-all active:translate-y-0 disabled:opacity-50"
                >
                  Update Portfolio Policy
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'security' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* PASSWORD BOX */}
              <div className="bg-[var(--bg-panel)] p-6 border border-[var(--border)] border-opacity-10 rounded-lg space-y-4">
                <div className="flex items-center gap-3 border-b border-[var(--border)] border-opacity-5 pb-3">
                  <Lock size={16} className="text-[var(--accent-bg)]" />
                  <h3 className="text-[11px] font-black uppercase tracking-widest">Security Settings</h3>
                </div>
                <div className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase text-[var(--text-muted)] tracking-widest">Current</label>
                    <input 
                      type="password" 
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="w-full bg-black border border-[var(--border)] border-opacity-5 p-3 rounded text-sm outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase text-[var(--text-muted)] tracking-widest">New</label>
                    <input 
                      type="password" 
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full bg-black border border-[var(--border)] border-opacity-5 p-3 rounded text-sm outline-none"
                    />
                  </div>
                </div>
                <button onClick={handleChangePassword} className="w-full py-3 bg-[var(--text-base)] text-[var(--bg-panel)] text-[10px] font-black uppercase tracking-widest rounded shadow-xl">Update</button>
              </div>

              {/* MFA & KEYS BOX */}
              <div className="space-y-4">
                {/* MFA TOGGLE */}
                <div className="bg-[var(--bg-panel)] p-6 border border-[var(--border)] border-opacity-10 rounded-lg flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <ShieldCheck size={16} className={user?.twoFactorEnabled ? 'text-green-500' : 'text-[var(--text-muted)]'} />
                      <h4 className="text-[11px] font-black uppercase tracking-widest">2-Step Verification</h4>
                    </div>
                    <p className="text-[9px] text-[var(--text-muted)] font-black uppercase tracking-tight">Code sent to your device on login.</p>
                  </div>
                  <button 
                    onClick={handleToggle2FA}
                    className={`px-4 py-2 rounded text-[9px] font-black uppercase transition-all ${user?.twoFactorEnabled ? 'bg-red-500/10 text-red-500 border border-red-500/20' : 'bg-green-500 text-black shadow-lg'}`}
                  >
                    {user?.twoFactorEnabled ? 'Turn Off' : 'Turn On'}
                  </button>
                </div>

                {/* PASSKEYS LIST */}
                <div className="bg-[var(--bg-panel)] p-6 border border-[var(--border)] border-opacity-10 rounded-lg space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Fingerprint size={16} className="text-[var(--accent-bg)]" />
                      <h4 className="text-[11px] font-black uppercase tracking-widest">Passkeys</h4>
                    </div>
                    <button onClick={handleAddPasskey} className="text-[9px] font-black uppercase text-[var(--accent-bg)] flex items-center gap-1"><Plus size={10}/> Add New</button>
                  </div>
                  <div className="space-y-2 max-h-32 overflow-y-auto pr-2 custom-scrollbar">
                    {passkeys.map(pk => (
                      <div key={pk.id} className="flex items-center justify-between p-2 bg-black border border-[var(--border)] border-opacity-5 rounded">
                        <span className="text-[10px] font-bold uppercase truncate max-w-[120px]">{pk.name || 'Key'}</span>
                        <button className="text-red-500/50 hover:text-red-500"><Trash2 size={10} /></button>
                      </div>
                    ))}
                    {passkeys.length === 0 && <p className="text-[9px] text-[var(--text-muted)] text-center py-2 uppercase italic tracking-widest">No keys registered</p>}
                  </div>
                </div>
              </div>
            </div>

            {/* SESSIONS LIST */}
            <div className="bg-[var(--bg-panel)] p-6 border border-[var(--border)] border-opacity-10 rounded-lg">
              <div className="flex items-center gap-3 border-b border-[var(--border)] border-opacity-5 pb-3 mb-4">
                <Monitor size={16} className="text-[var(--text-muted)]" />
                <h3 className="text-[11px] font-black uppercase tracking-widest">Active Devices</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {sessions.map(sess => (
                  <div key={sess.id} className="flex items-center justify-between p-3 bg-black border border-[var(--border)] border-opacity-5 rounded group">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-[var(--bg-ghost)] rounded-lg text-[var(--text-muted)] group-hover:text-[var(--accent-bg)] transition-colors">
                        {sess.userAgent?.includes('Mobi') ? <Smartphone size={14}/> : <Monitor size={14}/>}
                      </div>
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-tight">{resolveDeviceName(sess.userAgent)}</p>
                        <p className="text-[8px] text-[var(--text-muted)] font-black uppercase tracking-widest">{sess.ipAddress}</p>
                      </div>
                    </div>
                    <button onClick={() => handleRevokeSession(sess.id)} className="text-[8px] font-black uppercase text-red-500 opacity-0 group-hover:opacity-100 transition-opacity px-2 py-1 border border-red-500/20 rounded">Logout</button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* --- MFA MODAL --- */}
      {showMfaModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm">
          <div className="relative w-full max-w-xs bg-[var(--bg-panel)] border border-[var(--border)] border-opacity-20 rounded-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 space-y-6">
              {mfaStep === 'password' && (
                <div className="space-y-4">
                  <div className="text-center space-y-1">
                    <h3 className="text-lg font-black uppercase tracking-tight">Confirm Password</h3>
                    <p className="text-[9px] text-[var(--text-muted)] font-black uppercase tracking-widest">Security check to enable MFA.</p>
                  </div>
                  <input 
                    type="password" 
                    placeholder="CURRENT PASSWORD"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full bg-black border border-[var(--border)] border-opacity-10 p-3 rounded font-mono text-sm outline-none text-center"
                  />
                  <button 
                    onClick={async () => {
                      const { error } = await authClient.twoFactor.sendOtp();
                      if (error) showToast('Failed to send code', 'error');
                      else { setMfaStep('otp'); setCountdown(300); }
                    }}
                    className="w-full py-3 bg-[var(--text-base)] text-[var(--bg-panel)] font-black uppercase text-[10px] tracking-widest rounded"
                  >
                    Send Code
                  </button>
                </div>
              )}

              {mfaStep === 'otp' && (
                <div className="space-y-6">
                  <div className="text-center space-y-1">
                    <h3 className="text-lg font-black uppercase tracking-tight">Verification</h3>
                    <p className="text-[9px] text-[var(--text-muted)] font-black uppercase tracking-widest">Enter the code sent to you.</p>
                  </div>
                  <input 
                    type="text" 
                    maxLength={6}
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value)}
                    placeholder="000000"
                    className="w-full bg-black border border-[var(--border)] border-opacity-10 p-4 rounded text-3xl text-center font-black tracking-widest outline-none"
                  />
                  <div className="flex justify-between items-center text-[8px] font-black uppercase tracking-widest px-1">
                    <span className="text-[var(--text-muted)]">Time Left</span>
                    <span className="text-[var(--accent-bg)] font-mono">{Math.floor(countdown / 60)}:{(countdown % 60).toString().padStart(2, '0')}</span>
                  </div>
                  <button 
                    onClick={async () => {
                      const { error } = await authClient.twoFactor.verifyOtp({ code: otpCode });
                      if (error) showToast('Failed', 'error');
                      else setMfaStep('success');
                    }}
                    className="w-full py-3 bg-[var(--accent-bg)] text-[var(--accent-text)] font-black uppercase text-[10px] tracking-widest rounded"
                  >
                    Confirm Code
                  </button>
                </div>
              )}

              {mfaStep === 'success' && (
                <div className="py-4 text-center space-y-6">
                  <div className="inline-flex p-4 rounded bg-green-500 text-black"><Check size={32} /></div>
                  <div className="space-y-1">
                    <h3 className="text-xl font-black uppercase tracking-tight text-green-500">Verified</h3>
                    <p className="text-[9px] text-[var(--text-muted)] font-black uppercase tracking-widest">MFA is now active on your account.</p>
                  </div>
                  <button 
                    onClick={() => window.location.reload()}
                    className="w-full py-3 border border-[var(--border)] border-opacity-10 font-black uppercase text-[10px] tracking-widest rounded"
                  >
                    Close
                  </button>
                </div>
              )}
            </div>
            <button onClick={() => setShowMfaModal(false)} className="absolute top-4 right-4 text-[var(--text-muted)] hover:text-[var(--text-base)]"><X size={14}/></button>
          </div>
        </div>
      )}
      {/* --- PASSKEY MODAL --- */}
      {showPasskeyModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm">
          <div className="relative w-full max-w-xs bg-[var(--bg-panel)] border border-[var(--border)] border-opacity-20 rounded-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-8 text-center space-y-6">
              {passkeyStep === 'waiting' && (
                <div className="space-y-6">
                  <div className="relative w-20 h-20 mx-auto">
                    <div className="absolute inset-0 border-2 border-[var(--accent-bg)] border-t-transparent rounded-full animate-spin" />
                    <div className="absolute inset-0 flex items-center justify-center text-[var(--accent-bg)]">
                      <Fingerprint size={32} />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-lg font-black uppercase tracking-tight">Awaiting Sensor</h3>
                    <p className="text-[9px] text-[var(--text-muted)] font-black uppercase tracking-widest leading-relaxed px-4">
                      Use your biometric sensor <br/> or hardware key to sign.
                    </p>
                  </div>
                </div>
              )}

              {passkeyStep === 'success' && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
                  <div className="w-16 h-16 mx-auto bg-green-500 text-black rounded flex items-center justify-center">
                    <Check size={32} />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-lg font-black uppercase tracking-tight text-green-500">Key Linked</h3>
                    <p className="text-[9px] text-[var(--text-muted)] font-black uppercase tracking-widest">
                      Biometric access is now active.
                    </p>
                  </div>
                  <button 
                    onClick={() => setShowPasskeyModal(false)}
                    className="w-full py-3 bg-black border border-[var(--border)] border-opacity-10 text-[10px] font-black uppercase tracking-widest rounded"
                  >
                    Done
                  </button>
                </div>
              )}

              {passkeyStep === 'error' && (
                <div className="space-y-6 animate-in shake duration-300">
                  <div className="w-16 h-16 mx-auto bg-red-500/10 text-red-500 rounded flex items-center justify-center">
                    <X size={32} />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-lg font-black uppercase tracking-tight text-red-500">Handshake Failed</h3>
                    <p className="text-[9px] text-[var(--text-muted)] font-black uppercase tracking-widest">
                      Sensor timed out or rejected.
                    </p>
                  </div>
                  <button 
                    onClick={() => setPasskeyStep('waiting')}
                    className="w-full py-3 bg-red-500 text-white text-[10px] font-black uppercase tracking-widest rounded"
                  >
                    Try Again
                  </button>
                </div>
              )}
            </div>
            <button onClick={() => setShowPasskeyModal(false)} className="absolute top-4 right-4 text-[var(--text-muted)] hover:text-[var(--text-base)]">
              <X size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
