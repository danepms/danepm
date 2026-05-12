import React, { useEffect, useState } from 'react';
import { 
  ChevronLeft, Building2, MapPin, Users, Wallet, AlertTriangle, 
  Activity, Clock, User, FileText, Wrench, Home, Key
} from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import { api } from '@/lib/api';
import { AdminPropertyUnits } from './AdminPropertyUnits';
import { AdminPropertyTenants } from './AdminPropertyTenants';
import { AdminPropertyFinancials } from './AdminPropertyFinancials';

interface DetailProps {
  adminId: string;
  propertyId: string;
  onBack: () => void;
  onNavigateToPerson: (id: string) => void;
}

export const AdminPropertyDetail = ({ adminId, propertyId, onBack, onNavigateToPerson }: DetailProps) => {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      const res = await api.get<any>(`/admin/properties/${propertyId}?adminId=${adminId}`);
      if (res.success) {
        setData(res);
      }
      setIsLoading(false);
    };
    load();
  }, [adminId, propertyId]);

  if (isLoading || !data) {
    return (
      <div className="flex-1 space-y-6">
        <div className="h-32 bg-[var(--bg-panel)] rounded-2xl animate-pulse" />
        <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
          {[1,2,3,4,5,6].map(i => <div key={i} className="h-24 bg-[var(--bg-panel)] rounded-2xl animate-pulse" />)}
        </div>
        <div className="h-96 bg-[var(--bg-panel)] rounded-2xl animate-pulse" />
      </div>
    );
  }

  const { property, manager, owner, stats, units, rents, recurring, tenants, maintenanceRequests, auditLogs } = data;
  const resUnits = JSON.parse(property.residentialUnits || '{}');
  const comUnits = JSON.parse(property.commercialUnits || '{}');

  const getInitials = (name: string) => name ? name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : '?';

  return (
    <div className="space-y-6 animate-reveal">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-[var(--bg-panel)] p-6 rounded-2xl border border-[var(--border)] shadow-sm">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 bg-[var(--bg-base)] border border-[var(--border)] rounded-lg hover:text-[var(--admin-accent)] hover:border-[var(--admin-accent)] transition-all shrink-0">
            <ChevronLeft size={20} />
          </button>
          <div className="w-16 h-16 rounded-xl border border-[var(--border)] overflow-hidden shrink-0 flex items-center justify-center bg-[var(--bg-base)]">
            {property.imageUrl ? (
              <img src={property.imageUrl} alt={property.name} className="w-full h-full object-cover" />
            ) : (
              <Building2 className="text-[var(--text-muted)]" size={24} />
            )}
          </div>
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h2 className="text-2xl font-black uppercase tracking-tighter">{property.name}</h2>
              <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-widest border ${
                property.isLive ? 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20' : 'text-orange-500 bg-orange-500/10 border-orange-500/20'
              }`}>
                {property.isLive ? 'Live' : 'Setup'}
              </span>
            </div>
            <p className="text-sm text-[var(--text-muted)] flex items-center gap-1 font-mono">
              <MapPin size={12} /> {property.location}
            </p>
          </div>
        </div>

        <div className="flex gap-4">
          <div className="text-right">
            <span className="text-[9px] font-mono uppercase text-[var(--text-muted)] block mb-1">Manager</span>
            <button onClick={() => onNavigateToPerson(manager.id)} className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <span className="text-xs font-bold">{manager.name}</span>
              <div className="w-6 h-6 rounded-full bg-[var(--admin-accent)]/20 text-[var(--admin-accent)] flex items-center justify-center text-[8px] font-bold">
                {getInitials(manager.name)}
              </div>
            </button>
          </div>
          <div className="w-px h-8 bg-[var(--border)] self-center" />
          <div className="text-left">
            <span className="text-[9px] font-mono uppercase text-[var(--text-muted)] block mb-1">Owner</span>
            {owner ? (
              <button onClick={() => onNavigateToPerson(owner.id)} className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                <div className="w-6 h-6 rounded-full bg-purple-500/20 text-purple-500 flex items-center justify-center text-[8px] font-bold">
                  {getInitials(owner.name)}
                </div>
                <span className="text-xs font-bold">{owner.name}</span>
              </button>
            ) : (
              <div className="flex items-center gap-2 text-slate-400">
                <User size={14} />
                <span className="text-xs font-medium">Not assigned</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
        {[
          { label: 'Total Units', value: stats.totalUnits, icon: Home, color: 'text-indigo-500' },
          { label: 'Occupied', value: stats.occupiedUnits, icon: Key, color: 'text-blue-500' },
          { label: 'Vacancy', value: `${stats.vacancyRate.toFixed(1)}%`, icon: Activity, color: 'text-pink-500' },
          { label: 'Tenants', value: stats.tenants, icon: Users, color: 'text-purple-500' },
          { label: 'Revenue', value: `KES ${(stats.revenue / 1000).toFixed(0)}k`, icon: Wallet, color: 'text-emerald-500' },
          { label: 'Arrears', value: `KES ${(stats.arrears / 1000).toFixed(0)}k`, icon: AlertTriangle, color: 'text-red-500' },
        ].map((stat, i) => (
          <div key={i} className="bg-[var(--bg-panel)] p-4 rounded-xl border border-[var(--border)] shadow-sm flex flex-col justify-center">
            <div className={`mb-2 ${stat.color}`}>
              <stat.icon size={16} />
            </div>
            <h3 className="text-[9px] font-mono font-bold text-[var(--text-muted)] uppercase tracking-widest">{stat.label}</h3>
            <p className="text-xl font-black tracking-tighter">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left Column (Main Content) */}
        <div className="xl:col-span-2 space-y-6">
          
          {/* Units Matrix */}
          <div className="bg-[var(--bg-panel)] rounded-2xl border border-[var(--border)] shadow-sm overflow-hidden">
             <div className="p-5 border-b border-[var(--border)] flex justify-between items-center bg-[var(--bg-base)]">
                <h3 className="font-black text-lg uppercase tracking-tighter flex items-center gap-2">
                  <Home size={18} className="text-[var(--admin-accent)]" /> Unit Layout
                </h3>
                <span className="text-xs font-mono text-[var(--text-muted)]">Read-only view</span>
             </div>
             <div className="p-6">
                <AdminPropertyUnits units={units} />
             </div>
          </div>

          {/* Tenants */}
          <div className="bg-[var(--bg-panel)] rounded-2xl border border-[var(--border)] shadow-sm overflow-hidden">
             <div className="p-5 border-b border-[var(--border)] flex justify-between items-center bg-[var(--bg-base)]">
                <h3 className="font-black text-lg uppercase tracking-tighter flex items-center gap-2">
                  <Users size={18} className="text-purple-500" /> Linked Tenants
                </h3>
             </div>
             <div className="p-0">
                <AdminPropertyTenants tenants={tenants} units={units} onNavigateToPerson={onNavigateToPerson} />
             </div>
          </div>

          {/* Financials */}
          <div className="bg-[var(--bg-panel)] rounded-2xl border border-[var(--border)] shadow-sm overflow-hidden">
             <div className="p-5 border-b border-[var(--border)] flex justify-between items-center bg-[var(--bg-base)]">
                <h3 className="font-black text-lg uppercase tracking-tighter flex items-center gap-2">
                  <Wallet size={18} className="text-emerald-500" /> Financial Overview
                </h3>
             </div>
             <div className="p-6">
                <AdminPropertyFinancials stats={stats} rents={rents} recurring={recurring} resUnits={resUnits} comUnits={comUnits} />
             </div>
          </div>
        </div>

        {/* Right Column (Side Content) */}
        <div className="space-y-6">
          
          {/* Maintenance */}
          <div className="bg-[var(--bg-panel)] rounded-2xl border border-[var(--border)] shadow-sm overflow-hidden">
             <div className="p-5 border-b border-[var(--border)] bg-[var(--bg-base)]">
                <h3 className="font-black text-lg uppercase tracking-tighter flex items-center gap-2">
                  <Wrench size={18} className="text-orange-500" /> Maintenance
                </h3>
             </div>
             <div className="p-0">
                {maintenanceRequests.length === 0 ? (
                  <div className="p-6 text-center text-[var(--text-muted)] text-sm">No maintenance requests logged.</div>
                ) : (
                  <div className="divide-y divide-[var(--border)]">
                    {maintenanceRequests.map((req: any) => (
                      <div key={req.id} className="p-4">
                        <div className="flex justify-between items-start mb-1">
                          <h4 className="font-bold text-sm truncate pr-4">{req.title}</h4>
                          <span className={`text-[9px] font-mono px-2 py-0.5 rounded uppercase font-bold shrink-0 ${
                            req.status === 'open' ? 'bg-orange-500/10 text-orange-500' : 'bg-emerald-500/10 text-emerald-500'
                          }`}>
                            {req.status}
                          </span>
                        </div>
                        <div className="flex justify-between items-center mt-2">
                          <span className="text-[10px] text-[var(--text-muted)] font-mono uppercase tracking-widest">{req.priority} Priority</span>
                          <span className="text-[10px] text-[var(--text-muted)] font-mono">{format(new Date(req.createdAt), 'MMM d')}</span>
                        </div>
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
                  <Activity size={18} className="text-blue-500" /> Audit Log
                </h3>
             </div>
             <div className="p-0 max-h-[400px] overflow-y-auto">
                {auditLogs.length === 0 ? (
                  <div className="p-6 text-center text-[var(--text-muted)] text-sm">No recent activity.</div>
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
                              {formatDistanceToNow(new Date(log.createdAt))}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
             </div>
          </div>

          {/* Metadata */}
          <div className="bg-[var(--bg-panel)] rounded-2xl border border-[var(--border)] shadow-sm overflow-hidden">
             <div className="p-5 border-b border-[var(--border)] bg-[var(--bg-base)]">
                <h3 className="font-black text-lg uppercase tracking-tighter flex items-center gap-2">
                  <FileText size={18} className="text-[var(--text-muted)]" /> Metadata
                </h3>
             </div>
             <div className="p-5 space-y-3 font-mono text-[10px] uppercase">
                <div className="flex justify-between">
                  <span className="text-[var(--text-muted)]">Record ID</span>
                  <span className="font-bold">{property.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--text-muted)]">Created At</span>
                  <span className="font-bold">{format(new Date(property.createdAt), 'MMM d, yyyy HH:mm')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--text-muted)]">Setup Step</span>
                  <span className="font-bold">{property.setupStep}</span>
                </div>
                <div className="h-px bg-[var(--border)] my-2" />
                <div className="flex justify-between">
                  <span className="text-[var(--text-muted)]">Has Residential</span>
                  <span className={property.hasResidential ? 'text-emerald-500 font-bold' : ''}>{property.hasResidential ? 'YES' : 'NO'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--text-muted)]">Has Commercial</span>
                  <span className={property.hasCommercial ? 'text-emerald-500 font-bold' : ''}>{property.hasCommercial ? 'YES' : 'NO'}</span>
                </div>
             </div>
          </div>

        </div>
      </div>
    </div>
  );
};
