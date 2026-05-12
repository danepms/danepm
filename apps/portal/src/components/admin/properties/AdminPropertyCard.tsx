import React from 'react';
import { Building2, MapPin, Users, User, ArrowRight } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface AdminPropertyCardProps {
  property: any;
  onClick: () => void;
}

export const AdminPropertyCard = ({ property, onClick }: AdminPropertyCardProps) => {
  const getInitials = (name: string) => {
    return name ? name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : '?';
  };

  return (
    <div 
      onClick={onClick}
      className="bg-[var(--bg-panel)] p-5 rounded-2xl border border-[var(--border)] shadow-sm hover:shadow-lg transition-all cursor-pointer group flex flex-col h-full"
    >
      <div className="flex gap-4 mb-4">
        <div className="w-16 h-16 rounded-xl border border-[var(--border)] overflow-hidden shrink-0 flex items-center justify-center bg-[var(--bg-base)]">
          {property.imageUrl ? (
            <img src={property.imageUrl} alt={property.name} className="w-full h-full object-cover" />
          ) : (
            <Building2 className="text-[var(--text-muted)]" size={24} />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex justify-between items-start">
            <h4 className="font-black text-lg truncate group-hover:text-[var(--admin-accent)] transition-colors">{property.name}</h4>
            <span className={`px-2 py-1 rounded text-[9px] font-mono font-bold uppercase tracking-widest border shrink-0 ml-2 ${
              property.isLive 
                ? 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20' 
                : 'text-orange-500 bg-orange-500/10 border-orange-500/20'
            }`}>
              {property.isLive ? 'Live' : 'Setup'}
            </span>
          </div>
          <p className="text-xs text-[var(--text-muted)] truncate flex items-center gap-1 mt-1">
            <MapPin size={12} /> {property.location}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 mb-4 text-xs">
        <div className="p-2 bg-[var(--bg-base)] rounded-lg border border-[var(--border)]">
           <span className="text-[9px] font-mono uppercase text-[var(--text-muted)] block mb-1">Manager</span>
           <div className="flex items-center gap-1.5 truncate">
             <div className="w-4 h-4 rounded-full bg-[var(--admin-accent)]/20 text-[var(--admin-accent)] flex items-center justify-center text-[8px] font-bold shrink-0">
               {getInitials(property.manager?.name)}
             </div>
             <span className="truncate">{property.manager?.name || 'Unknown'}</span>
           </div>
        </div>
        <div className="p-2 bg-[var(--bg-base)] rounded-lg border border-[var(--border)]">
           <span className="text-[9px] font-mono uppercase text-[var(--text-muted)] block mb-1">Owner</span>
           <div className="flex items-center gap-1.5 truncate">
             {property.owner ? (
               <>
                 <div className="w-4 h-4 rounded-full bg-purple-500/20 text-purple-500 flex items-center justify-center text-[8px] font-bold shrink-0">
                   {getInitials(property.owner.name)}
                 </div>
                 <span className="truncate">{property.owner.name}</span>
               </>
             ) : (
               <>
                 <User size={12} className="text-slate-400" />
                 <span className="truncate text-slate-400">Not assigned</span>
               </>
             )}
           </div>
        </div>
      </div>

      <div className="mt-auto space-y-3 pt-4 border-t border-[var(--border)]">
        <div>
           <div className="flex justify-between text-xs mb-1">
             <span className="text-[var(--text-muted)] font-mono text-[9px] uppercase tracking-widest">Occupancy</span>
             <span className="font-bold">{property.occupiedUnits} / {property.totalUnits}</span>
           </div>
           <div className="h-1.5 w-full bg-[var(--bg-base)] rounded-full overflow-hidden">
             <div 
               className="h-full bg-[var(--admin-accent)] rounded-full transition-all"
               style={{ width: `${property.totalUnits > 0 ? (property.occupiedUnits / property.totalUnits) * 100 : 0}%` }}
             />
           </div>
        </div>
        
        <div className="flex justify-between items-center text-xs">
          <div className="flex items-center gap-1.5 text-[var(--text-muted)]">
            <Users size={14} />
            <span className="font-medium">{property.tenantCount} Tenants</span>
          </div>
          <span className="text-[9px] font-mono text-[var(--text-muted)]">
            Created {formatDistanceToNow(new Date(property.createdAt))} ago
          </span>
        </div>
      </div>
    </div>
  );
};
