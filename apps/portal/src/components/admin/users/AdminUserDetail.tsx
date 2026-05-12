"use client";

import React, { useEffect, useState } from 'react';
import { 
  ChevronLeft, Building2, Users, Wallet, Shield, AlertTriangle, 
  Activity, Clock, MapPin, Key, Mail, Smartphone, Edit2, ShieldCheck, UserX, UserCheck
} from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import { api } from '@/lib/api';
import { useToast } from '@/context/ToastContext';

interface UserDetailProps {
  adminId: string;
  userId: string;
  onBack: () => void;
}

export const AdminUserDetail = ({ adminId, userId, onBack }: UserDetailProps) => {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const { showToast } = useToast();
  const [showRoleModal, setShowRoleModal] = useState(false);

  const loadData = async () => {
    setIsLoading(true);
    const res = await api.get<any>(`/admin/users/${userId}?adminId=${adminId}`);
    if (res.success) {
      setData(res);
    } else {
      showToast('Failed to load user details', 'error');
    }
    setIsLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [adminId, userId]);

  const handleToggleSuspend = async () => {
    if (!data?.user) return;
    const isSuspended = data.user.suspended;
    
    if (!confirm(`Are you sure you want to ${isSuspended ? 'reactivate' : 'suspend'} this user?`)) return;

    setIsActionLoading(true);
    const res = isSuspended 
      ? await api.post<any>(`/admin/users/${userId}/reactivate`, { adminId })
      : await api.post<any>(`/admin/users/${userId}/suspend`, { adminId });
      
    if (res.success) {
      showToast(`User successfully ${isSuspended ? 'reactivated' : 'suspended'}`, 'success');
      loadData();
    } else {
      showToast('Action failed', 'error');
    }
    setIsActionLoading(false);
  };

  const handleChangeRole = async (newRole: string) => {
    setIsActionLoading(true);
    const res = await api.post<any>(`/admin/users/${userId}/role`, { adminId, role: newRole });
    if (res.success) {
      showToast(`Role updated to ${newRole}`, 'success');
      setShowRoleModal(false);
      loadData();
    } else {
      showToast('Failed to update role', 'error');
    }
    setIsActionLoading(false);
  };

  if (isLoading || !data) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const { user, stats, properties, auditLogs, sessions } = data;

  const getInitials = (name: string) => name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'manager': return 'text-blue-500 bg-blue-500/10 border-blue-500/20';
      case 'owner': return 'text-purple-500 bg-purple-500/10 border-purple-500/20';
      case 'admin': return 'text-indigo-500 bg-indigo-500/10 border-indigo-500/20';
      default: return 'text-slate-500 bg-slate-500/10 border-slate-500/20';
    }
  };

  return (
    <div className="space-y-6 animate-reveal">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-[var(--bg-panel)] p-6 rounded-2xl border border-[var(--border)] shadow-sm">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 bg-[var(--bg-base)] border border-[var(--border)] rounded-lg hover:text-[var(--admin-accent)] hover:border-[var(--admin-accent)] transition-all">
            <ChevronLeft size={20} />
          </button>
          <div className="w-16 h-16 rounded-xl border border-[var(--border)] overflow-hidden flex items-center justify-center bg-[var(--bg-base)] shrink-0">
            {user.image ? (
              <img src={user.image} alt={user.name} className="w-full h-full object-cover" />
            ) : (
              <span className="font-black text-2xl text-[var(--text-muted)]">{getInitials(user.name)}</span>
            )}
          </div>
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h2 className="text-2xl font-black uppercase tracking-tighter">{user.name}</h2>
              <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-widest border ${getRoleColor(user.role)}`}>
                {user.role}
              </span>
              {user.suspended && (
                 <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-widest border text-red-500 bg-red-500/10 border-red-500/20 flex items-center gap-1">
                    <AlertTriangle size={10} /> Suspended
                 </span>
              )}
            </div>
            <p className="text-sm text-[var(--text-muted)]">{user.email} • Joined {format(new Date(user.createdAt), 'MMM d, yyyy')}</p>
          </div>
        </div>
        
        <div className="flex gap-3 w-full md:w-auto">
          <button 
            onClick={() => setShowRoleModal(true)}
            disabled={isActionLoading}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-[var(--bg-base)] border border-[var(--border)] rounded-lg font-mono text-[10px] uppercase font-bold hover:text-[var(--admin-accent)] hover:border-[var(--admin-accent)] transition-all disabled:opacity-50"
          >
            <Edit2 size={14} /> Change Role
          </button>
          <button 
            onClick={handleToggleSuspend}
            disabled={isActionLoading}
            className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-mono text-[10px] uppercase font-bold transition-all disabled:opacity-50 ${
              user.suspended 
                ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 hover:bg-emerald-500/20'
                : 'bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500/20'
            }`}
          >
            {user.suspended ? <UserCheck size={14} /> : <UserX size={14} />}
            {user.suspended ? 'Reactivate' : 'Suspend'}
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Houses', value: stats.properties, icon: Building2, color: 'text-indigo-500' },
          { label: 'Tenants', value: stats.tenants, icon: Users, color: 'text-blue-500' },
          { label: 'Total Revenue', value: `KES ${Number(stats.revenue).toLocaleString()}`, icon: Wallet, color: 'text-emerald-500' },
          { label: 'Arrears', value: `KES ${Number(stats.arrears).toLocaleString()}`, icon: AlertTriangle, color: 'text-red-500' },
        ].map((stat, i) => (
          <div key={i} className="bg-[var(--bg-panel)] p-5 rounded-2xl border border-[var(--border)] shadow-sm flex items-center gap-4">
            <div className={`w-10 h-10 rounded-xl bg-[var(--bg-base)] flex items-center justify-center border border-[var(--border)] ${stat.color}`}>
              <stat.icon size={20} />
            </div>
            <div>
              <h3 className="text-[10px] font-mono font-bold text-[var(--text-muted)] uppercase tracking-widest">{stat.label}</h3>
              <p className="text-lg font-black tracking-tighter">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Properties */}
          <div className="bg-[var(--bg-panel)] rounded-2xl border border-[var(--border)] shadow-sm overflow-hidden">
             <div className="p-5 border-b border-[var(--border)] flex justify-between items-center bg-[var(--bg-base)]">
                <h3 className="font-black text-lg uppercase tracking-tighter flex items-center gap-2">
                  <Building2 size={18} className="text-indigo-500" /> Linked Houses
                </h3>
             </div>
             <div className="p-0">
                {properties.length === 0 ? (
                  <div className="p-8 text-center text-[var(--text-muted)]">No houses linked to this account.</div>
                ) : (
                  <div className="divide-y divide-[var(--border)]">
                    {properties.map((prop: any) => (
                      <div key={prop.id} className="p-4 flex justify-between items-center hover:bg-[var(--bg-base)] transition-colors">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-lg bg-[var(--bg-base)] border border-[var(--border)] flex items-center justify-center">
                            <Building2 size={18} className="text-[var(--text-muted)]" />
                          </div>
                          <div>
                            <h4 className="font-bold text-sm">{prop.name}</h4>
                            <p className="text-xs text-[var(--text-muted)] flex items-center gap-1">
                              <MapPin size={10} /> {prop.location}
                            </p>
                          </div>
                        </div>
                        <span className={`px-2 py-1 rounded text-[9px] font-mono font-bold uppercase tracking-widest ${prop.isLive ? 'bg-emerald-500/10 text-emerald-500' : 'bg-orange-500/10 text-orange-500'}`}>
                          {prop.isLive ? 'Live' : 'Setup'}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
             </div>
          </div>

          {/* Activity Log */}
          <div className="bg-[var(--bg-panel)] rounded-2xl border border-[var(--border)] shadow-sm overflow-hidden">
             <div className="p-5 border-b border-[var(--border)] flex justify-between items-center bg-[var(--bg-base)]">
                <h3 className="font-black text-lg uppercase tracking-tighter flex items-center gap-2">
                  <Activity size={18} className="text-purple-500" /> Recent Activity
                </h3>
             </div>
             <div className="p-0 max-h-[400px] overflow-y-auto">
                {auditLogs.length === 0 ? (
                  <div className="p-8 text-center text-[var(--text-muted)]">No recent activity.</div>
                ) : (
                  <div className="divide-y divide-[var(--border)]">
                    {auditLogs.map((log: any) => (
                      <div key={log.id} className="p-4 flex items-start gap-4 hover:bg-[var(--bg-base)] transition-colors">
                        <div className="mt-1 w-2 h-2 rounded-full bg-indigo-500 shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-center mb-1">
                            <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-[var(--text-base)]">
                              {log.action.replace(/_/g, ' ')}
                            </span>
                            <span className="text-[10px] text-[var(--text-muted)] whitespace-nowrap ml-2">
                              {formatDistanceToNow(new Date(log.createdAt))} ago
                            </span>
                          </div>
                          <p className="text-xs text-[var(--text-muted)] truncate">
                            {log.entityType}: {log.entityId}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
             </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Security & Contact */}
          <div className="bg-[var(--bg-panel)] rounded-2xl border border-[var(--border)] shadow-sm overflow-hidden">
             <div className="p-5 border-b border-[var(--border)] bg-[var(--bg-base)]">
                <h3 className="font-black text-lg uppercase tracking-tighter flex items-center gap-2">
                  <ShieldCheck size={18} className="text-emerald-500" /> Security & Contact
                </h3>
             </div>
             <div className="p-5 space-y-4">
                <div className="flex items-center gap-3 text-sm">
                  <div className="w-8 h-8 rounded-lg bg-[var(--bg-base)] border border-[var(--border)] flex items-center justify-center text-[var(--text-muted)] shrink-0">
                    <Mail size={14} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] font-mono uppercase text-[var(--text-muted)]">Email</p>
                    <p className="truncate">{user.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <div className="w-8 h-8 rounded-lg bg-[var(--bg-base)] border border-[var(--border)] flex items-center justify-center text-[var(--text-muted)] shrink-0">
                    <Smartphone size={14} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] font-mono uppercase text-[var(--text-muted)]">Phone</p>
                    <p className="truncate">{user.phone || 'Not provided'}</p>
                  </div>
                </div>
                <div className="h-px bg-[var(--border)] w-full my-2" />
                <div className="flex justify-between items-center text-sm">
                  <span className="text-[var(--text-muted)] flex items-center gap-2"><Key size={14} /> Email Verified</span>
                  <span className={user.emailVerified ? 'text-emerald-500 font-bold' : 'text-slate-500'}>
                    {user.emailVerified ? 'Yes' : 'No'}
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-[var(--text-muted)] flex items-center gap-2"><Shield size={14} /> 2FA Enabled</span>
                  <span className={user.twoFactorEnabled ? 'text-indigo-500 font-bold' : 'text-slate-500'}>
                    {user.twoFactorEnabled ? 'Yes' : 'No'}
                  </span>
                </div>
             </div>
          </div>

          {/* Sessions */}
          <div className="bg-[var(--bg-panel)] rounded-2xl border border-[var(--border)] shadow-sm overflow-hidden">
             <div className="p-5 border-b border-[var(--border)] bg-[var(--bg-base)]">
                <h3 className="font-black text-lg uppercase tracking-tighter flex items-center gap-2">
                  <Clock size={18} className="text-blue-500" /> Active Sessions
                </h3>
             </div>
             <div className="p-0">
                {sessions.length === 0 ? (
                  <div className="p-5 text-center text-[var(--text-muted)] text-sm">No active sessions.</div>
                ) : (
                  <div className="divide-y divide-[var(--border)]">
                    {sessions.map((sess: any) => (
                      <div key={sess.id} className="p-4">
                        <div className="flex justify-between items-start mb-2">
                           <span className="text-xs font-bold">{sess.userAgent?.split(' ')[0] || 'Unknown Device'}</span>
                           <span className="text-[10px] text-[var(--text-muted)] font-mono">{sess.ipAddress}</span>
                        </div>
                        <p className="text-[10px] text-[var(--text-muted)] font-mono">
                          Created: {format(new Date(sess.createdAt), 'MMM d, HH:mm')}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
             </div>
          </div>
        </div>
      </div>

      {/* Role Change Modal */}
      {showRoleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-[var(--bg-panel)] rounded-2xl border border-[var(--border)] shadow-2xl w-full max-w-md overflow-hidden animate-reveal">
            <div className="p-6 border-b border-[var(--border)]">
              <h3 className="font-black text-xl uppercase tracking-tighter">Change Role</h3>
              <p className="text-sm text-[var(--text-muted)] mt-1">Update platform access level for {user.name}</p>
            </div>
            <div className="p-6 space-y-3">
              {['manager', 'owner', 'admin'].map((r) => (
                <button
                  key={r}
                  onClick={() => handleChangeRole(r)}
                  disabled={user.role === r}
                  className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all ${
                    user.role === r 
                      ? 'bg-[var(--bg-base)] border-[var(--admin-accent)] text-[var(--admin-accent)]' 
                      : 'bg-[var(--bg-panel)] border-[var(--border)] hover:border-[var(--admin-accent)] hover:shadow-md'
                  }`}
                >
                  <span className="font-bold uppercase tracking-widest text-sm">{r}</span>
                  {user.role === r && <span className="text-[10px] font-mono bg-[var(--admin-accent)]/10 px-2 py-1 rounded">CURRENT</span>}
                </button>
              ))}
            </div>
            <div className="p-4 bg-[var(--bg-base)] border-t border-[var(--border)] flex justify-end">
              <button 
                onClick={() => setShowRoleModal(false)}
                className="px-6 py-2 rounded-lg font-mono text-sm uppercase font-bold text-[var(--text-muted)] hover:text-[var(--text-base)] transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
