import React from 'react';
import { Shield, Building2, Users, CheckCircle2, AlertTriangle, Key } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface UserCardProps {
  user: any;
  onClick: () => void;
}

export const AdminUserCard = ({ user, onClick }: UserCardProps) => {
  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'manager': return 'text-blue-500 bg-blue-500/10 border-blue-500/20';
      case 'owner': return 'text-purple-500 bg-purple-500/10 border-purple-500/20';
      case 'admin': return 'text-indigo-500 bg-indigo-500/10 border-indigo-500/20';
      default: return 'text-slate-500 bg-slate-500/10 border-slate-500/20';
    }
  };

  return (
    <div 
      onClick={onClick}
      className="bg-[var(--bg-panel)] p-5 rounded-2xl border border-[var(--border)] shadow-sm hover:shadow-lg transition-all cursor-pointer group flex flex-col"
    >
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl border border-[var(--border)] overflow-hidden flex items-center justify-center bg-[var(--bg-base)] shrink-0">
            {user.image ? (
              <img src={user.image} alt={user.name} className="w-full h-full object-cover" />
            ) : (
              <span className="font-black text-lg text-[var(--text-muted)]">{getInitials(user.name)}</span>
            )}
          </div>
          <div className="min-w-0">
            <h4 className="font-bold text-base truncate group-hover:text-[var(--admin-accent)] transition-colors">{user.name}</h4>
            <p className="text-xs text-[var(--text-muted)] truncate">{user.email}</p>
          </div>
        </div>
        {user.suspended && (
          <div className="w-6 h-6 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center shrink-0" title="Suspended">
            <AlertTriangle size={14} />
          </div>
        )}
      </div>

      <div className="flex items-center gap-2 mb-4">
        <span className={`px-2 py-1 rounded text-[9px] font-mono font-bold uppercase tracking-widest border ${getRoleColor(user.role)}`}>
          {user.role}
        </span>
        <span className="text-[10px] text-[var(--text-muted)] font-mono">
          Joined {formatDistanceToNow(new Date(user.createdAt))} ago
        </span>
      </div>

      <div className="mt-auto grid grid-cols-2 gap-2 pt-4 border-t border-[var(--border)]">
        <div className="flex items-center gap-2 text-[var(--text-muted)]">
          <Building2 size={14} />
          <span className="text-xs font-medium">{user.propertiesCount || 0} Houses</span>
        </div>
        <div className="flex items-center gap-2 text-[var(--text-muted)]">
          <Users size={14} />
          <span className="text-xs font-medium">{user.tenantsCount || 0} Tenants</span>
        </div>
        <div className="flex items-center gap-2 text-[var(--text-muted)]">
          <CheckCircle2 size={14} className={user.emailVerified ? 'text-emerald-500' : 'text-slate-400 opacity-50'} />
          <span className="text-xs font-medium">{user.emailVerified ? 'Verified' : 'Unverified'}</span>
        </div>
        <div className="flex items-center gap-2 text-[var(--text-muted)]">
          <Key size={14} className={user.twoFactorEnabled ? 'text-indigo-500' : 'text-slate-400 opacity-50'} />
          <span className="text-xs font-medium">{user.twoFactorEnabled ? '2FA On' : '2FA Off'}</span>
        </div>
      </div>
    </div>
  );
};
