"use client";

import React, { useEffect, useState } from 'react';
import { 
  BarChart3, Building2, Wallet, 
  Activity, ArrowUpRight, ChevronRight,
  Package, LayoutGrid, Zap, Wrench, FileText, CheckCircle2, Clock
} from 'lucide-react';
import { useSession } from '@/lib/auth-client';
import { getOwnerProperties, getOwnerPortfolioStats } from '@/app/actions';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { SettingsView } from '@/components/SettingsView';
import { User } from 'lucide-react';

// Sub-components to keep hooks stable and code clean
const OverviewView = ({ properties, stats }: any) => {
  const portfolioStats = [
    { label: "Total Asset Count", value: properties.length, icon: Building2, trend: 'up', change: 'Live' },
    { label: "Monthly Revenue", value: `KES ${(stats?.revenue || 0).toLocaleString()}`, icon: Wallet, trend: 'up', change: '+0%' },
    { label: "Occupancy Rate", value: `${(stats?.occupancy || 0).toFixed(1)}%`, icon: Activity, trend: stats?.occupancy > 90 ? 'up' : 'down', change: stats?.occupancy > 90 ? 'Healthy' : 'Warning' },
    { label: "Units Managed", value: stats?.totalUnits || 0, icon: LayoutGrid, trend: 'up', change: 'Total' },
  ];

  return (
    <div className="space-y-10 animate-reveal">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
         {portfolioStats.map((stat, i) => (
           <div key={i} className="bg-[var(--bg-panel)] border border-[var(--border)] border-opacity-10 p-8 shadow-[8px_8px_0px_0px_var(--shadow-color)] group hover:translate-y-[-2px] transition-all">
              <div className="flex items-center justify-between mb-6">
                 <div className="w-12 h-12 bg-[var(--bg-ghost)] flex items-center justify-center text-[var(--text-muted)] group-hover:bg-[var(--text-base)] group-hover:text-[var(--bg-panel)] transition-all">
                    <stat.icon size={24} />
                 </div>
                 <div className={`flex items-center gap-1 px-3 py-1 font-mono text-[9px] font-black uppercase ${stat.trend === 'up' ? 'text-green-500' : 'text-red-500'}`}>
                    {stat.change}
                 </div>
              </div>
              <p className="text-[9px] font-mono text-[var(--text-muted)] uppercase font-black tracking-[0.2em] mb-2">{stat.label}</p>
              <h3 className="text-3xl font-black tracking-tighter leading-none">{stat.value}</h3>
           </div>
         ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
         <div className="lg:col-span-2 space-y-8">
            <div className="flex items-center justify-between border-b border-[var(--border)] border-opacity-10 pb-6">
               <h3 className="text-2xl font-black uppercase tracking-tighter">Managed Assets</h3>
               <span className="font-mono text-[10px] uppercase font-black text-[var(--text-muted)]">{properties.length} Total</span>
            </div>
            <div className="space-y-4">
               {properties.map((prop: any) => {
                  const config = JSON.parse(prop.config || '{}');
                  const units = config.units || [];
                  const occupied = units.filter((u: any) => u.status === 'occupied').length;
                  const occRate = units.length > 0 ? (occupied / units.length * 100).toFixed(0) : 0;
                  return (
                    <Link href={`/dashboard/manager/properties/${prop.id}`} key={prop.id} className="bg-[var(--bg-panel)] border border-[var(--border)] border-opacity-10 p-6 shadow-[8px_8px_0px_0px_var(--shadow-color)] flex items-center justify-between group hover:border-[var(--accent-bg)] transition-all">
                       <div className="flex items-center gap-8">
                          <div className="w-16 h-16 bg-[var(--bg-ghost)] flex items-center justify-center text-[var(--text-muted)] group-hover:bg-[var(--text-base)] group-hover:text-[var(--bg-panel)] transition-all"><Building2 size={32} /></div>
                          <div>
                             <h4 className="font-black text-xl uppercase tracking-tighter leading-none mb-2 group-hover:text-[var(--accent-bg)]">{prop.name}</h4>
                             <p className="text-[10px] font-mono text-[var(--text-muted)] uppercase tracking-widest">{prop.location}</p>
                          </div>
                       </div>
                       <div className="flex items-center gap-6">
                          <div className="hidden md:block text-right">
                             <p className="text-[9px] font-mono text-[var(--text-muted)] uppercase font-black">Occupancy</p>
                             <p className="font-black text-lg">{occRate}%</p>
                          </div>
                          <ChevronRight size={20} className="text-[var(--text-muted)] group-hover:translate-x-2 transition-all" />
                       </div>
                    </Link>
                  );
               })}
            </div>
         </div>
         <div className="space-y-10">
            <div className="bg-[var(--bg-panel)] border border-[var(--border)] border-opacity-10 p-10 shadow-[12px_12px_0px_0px_var(--shadow-color)]">
               <h3 className="text-xl font-black uppercase tracking-tighter mb-10 border-b border-[var(--border)] border-opacity-10 pb-6">Distribution</h3>
               <div className="aspect-square relative flex items-center justify-center mb-10">
                  <div className="absolute inset-0 border-[12px] border-[var(--bg-ghost)] rounded-full" />
                  <div className="absolute inset-0 border-[12px] border-[var(--accent-bg)] rounded-full" style={{ clipPath: 'polygon(50% 50%, 50% 0%, 100% 0%, 100% 100%, 0% 100%, 0% 0%, 50% 0%)' }} />
                  <div className="text-center">
                     <p className="text-5xl font-black tracking-tighter leading-none">{((stats?.distribution?.residential || 0) / (stats?.totalUnits || 1) * 100).toFixed(0)}%</p>
                     <p className="text-[9px] font-mono uppercase text-[var(--text-muted)] font-black tracking-widest mt-2">Residential</p>
                  </div>
               </div>
               <div className="space-y-2 text-[10px] font-mono uppercase font-black">
                  <div className="flex justify-between"><span>Residential</span><span>{stats?.distribution?.residential} Units</span></div>
                  <div className="flex justify-between"><span>Commercial</span><span>{stats?.distribution?.commercial} Units</span></div>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
};

const PropertiesView = ({ properties }: any) => (
  <div className="space-y-8 animate-reveal">
    <div className="flex items-center justify-between">
       <h3 className="text-2xl font-black uppercase tracking-tighter">Detailed Asset Ledger</h3>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
       {properties.map((prop: any) => {
          const config = JSON.parse(prop.config || '{}');
          const units = config.units || [];
          return (
            <div key={prop.id} className="bg-[var(--bg-panel)] border border-[var(--border)] border-opacity-10 p-10 shadow-[12px_12px_0px_0px_var(--shadow-color)] space-y-8">
               <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-2xl font-black uppercase tracking-tighter">{prop.name}</h4>
                    <p className="text-[10px] font-mono text-[var(--text-muted)] uppercase tracking-widest mt-1">{prop.location}</p>
                  </div>
                  <Link href={`/dashboard/manager/properties/${prop.id}`} className="p-3 bg-[var(--bg-ghost)] rounded-lg text-[var(--text-muted)] hover:text-[var(--text-base)] transition-all">
                    <ArrowUpRight size={20} />
                  </Link>
               </div>
               <div className="grid grid-cols-3 gap-4">
                  <div className="p-4 bg-black/20 rounded border border-[var(--border)] border-opacity-5">
                     <p className="text-[8px] font-mono text-[var(--text-muted)] uppercase font-black mb-1">Total Units</p>
                     <p className="text-lg font-black">{units.length}</p>
                  </div>
                  <div className="p-4 bg-black/20 rounded border border-[var(--border)] border-opacity-5">
                     <p className="text-[8px] font-mono text-[var(--text-muted)] uppercase font-black mb-1">Occupied</p>
                     <p className="text-lg font-black text-green-500">{units.filter((u:any) => u.status === 'occupied').length}</p>
                  </div>
                  <div className="p-4 bg-black/20 rounded border border-[var(--border)] border-opacity-5">
                     <p className="text-[8px] font-mono text-[var(--text-muted)] uppercase font-black mb-1">Vacant</p>
                     <p className="text-lg font-black text-orange-500">{units.filter((u:any) => u.status === 'vacant').length}</p>
                  </div>
               </div>
               <div className="space-y-3">
                  <p className="text-[9px] font-mono text-[var(--text-muted)] uppercase font-black tracking-widest">Unit Inventory Pulse</p>
                  <div className="flex flex-wrap gap-1">
                     {units.map((u: any, idx: number) => (
                       <div key={idx} className={`w-3 h-3 rounded-sm ${u.status === 'occupied' ? 'bg-green-500' : 'bg-[var(--bg-ghost)]'} border border-white/5`} title={`${u.name}: ${u.status}`} />
                     ))}
                  </div>
               </div>
            </div>
          );
       })}
    </div>
  </div>
);

const FinancialsView = ({ properties, stats }: any) => (
  <div className="space-y-10 animate-reveal">
    <div className="bg-[var(--bg-panel)] border border-[var(--border)] border-opacity-10 p-10 shadow-[12px_12px_0px_0px_var(--shadow-color)]">
       <h3 className="text-2xl font-black uppercase tracking-tighter mb-10 border-b border-[var(--border)] border-opacity-10 pb-6">Revenue Analysis</h3>
       <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          <div className="space-y-2">
             <p className="text-[10px] font-mono text-[var(--text-muted)] uppercase font-black tracking-widest">Gross Expected Monthly</p>
             <h4 className="text-4xl font-black tracking-tighter text-[var(--accent-bg)]">KES {(stats?.revenue || 0).toLocaleString()}</h4>
          </div>
          <div className="space-y-2">
             <p className="text-[10px] font-mono text-[var(--text-muted)] uppercase font-black tracking-widest">Annual Yield Projection</p>
             <h4 className="text-4xl font-black tracking-tighter text-green-500">8.4%</h4>
          </div>
          <div className="space-y-2">
             <p className="text-[10px] font-mono text-[var(--text-muted)] uppercase font-black tracking-widest">Collection Efficiency</p>
             <h4 className="text-4xl font-black tracking-tighter">98.2%</h4>
          </div>
       </div>
    </div>
    <div className="bg-[var(--bg-panel)] border border-[var(--border)] border-opacity-10 rounded-lg overflow-hidden">
       <table className="w-full text-left font-mono text-[11px]">
          <thead className="bg-black/20 text-[var(--text-muted)] uppercase font-black">
             <tr>
                <th className="p-6">Asset Name</th>
                <th className="p-6">Units</th>
                <th className="p-6">Occupancy</th>
                <th className="p-6">Monthly Revenue</th>
                <th className="p-6">Status</th>
             </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border)] divide-opacity-5">
             {properties.map((prop: any) => {
                const config = JSON.parse(prop.config || '{}');
                const units = config.units || [];
                const occupied = units.filter((u:any) => u.status === 'occupied').length;
                let propRev = 0;
                Object.entries(config.rents || {}).map(([type, price]: any) => {
                    const resCount = JSON.parse(prop.residentialUnits || '{}');
                    propRev += ((parseInt(resCount[type]) || 0) * parseFloat(price));
                });
                return (
                  <tr key={prop.id} className="hover:bg-black/10 transition-all">
                     <td className="p-6 font-black uppercase tracking-tight">{prop.name}</td>
                     <td className="p-6">{units.length}</td>
                     <td className="p-6">{occupied}/{units.length}</td>
                     <td className="p-6 font-black">KES {propRev.toLocaleString()}</td>
                     <td className="p-6"><span className="text-green-500 font-black">STABLE</span></td>
                  </tr>
                );
             })}
          </tbody>
       </table>
    </div>
  </div>
);

const MaintenanceView = ({ properties }: any) => (
  <div className="space-y-10 animate-reveal">
     <h3 className="text-2xl font-black uppercase tracking-tighter">Capex & Maintenance Overwatch</h3>
     <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[var(--bg-panel)] p-8 border border-[var(--border)] border-opacity-10 shadow-sm space-y-4">
            <Clock size={20} className="text-orange-500" />
            <p className="text-4xl font-black tracking-tighter">0</p>
            <p className="text-[9px] font-mono text-[var(--text-muted)] uppercase tracking-widest">Open Requests</p>
        </div>
        <div className="bg-[var(--bg-panel)] p-8 border border-[var(--border)] border-opacity-10 shadow-sm space-y-4">
            <CheckCircle2 size={20} className="text-green-500" />
            <p className="text-4xl font-black tracking-tighter">12</p>
            <p className="text-[9px] font-mono text-[var(--text-muted)] uppercase tracking-widest">Resolved Q2</p>
        </div>
        <div className="bg-[var(--bg-panel)] p-8 border border-[var(--border)] border-opacity-10 shadow-sm space-y-4">
            <Zap size={20} className="text-[var(--accent-bg)]" />
            <p className="text-4xl font-black tracking-tighter">KES 450K</p>
            <p className="text-[9px] font-mono text-[var(--text-muted)] uppercase tracking-widest">Q3 Budget</p>
        </div>
     </div>
     <div className="bg-[var(--bg-panel)] border border-[var(--border)] border-opacity-10 p-20 text-center flex flex-col items-center justify-center space-y-6">
        <Wrench size={40} className="text-[var(--text-muted)] opacity-20" />
        <p className="text-xl font-black uppercase tracking-tighter">No Active Incidents</p>
     </div>
  </div>
);

const DocumentsView = () => (
  <div className="space-y-10 animate-reveal">
     <h3 className="text-2xl font-black uppercase tracking-tighter">Vault & Documents</h3>
     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {['Property Deeds', 'Management Contracts', 'Tax Certificates', 'Insurance Policies'].map((title, i) => (
            <div key={i} className="bg-[var(--bg-panel)] p-8 border border-[var(--border)] border-opacity-10 group hover:border-[var(--text-base)] transition-all cursor-pointer">
                <FileText size={24} className="mb-8 text-[var(--text-muted)]" />
                <h4 className="text-lg font-black uppercase tracking-tight">{title}</h4>
            </div>
        ))}
     </div>
  </div>
);

export default function OwnerTabPage() {
  const params = useParams();
  const tab = params?.tab;
  const { data: session } = useSession();
  const [properties, setProperties] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!session?.user?.id) return;
    const loadData = async () => {
      setIsLoading(true);
      const [propsRes, statsRes] = await Promise.all([
        getOwnerProperties(session.user.id),
        getOwnerPortfolioStats(session.user.id)
      ]);
      if (propsRes.success) setProperties(propsRes.properties);
      if (statsRes.success) setStats(statsRes.stats);
      setIsLoading(false);
    };
    loadData();
  }, [session, tab]);

  if (isLoading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-[var(--accent-bg)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="pb-24">
      {tab === 'overview' && <OverviewView properties={properties} stats={stats} />}
      {tab === 'properties' && <PropertiesView properties={properties} />}
      {tab === 'financials' && <FinancialsView properties={properties} stats={stats} />}
      {tab === 'maintenance' && <MaintenanceView properties={properties} />}
      {tab === 'documents' && <DocumentsView />}
      {tab === 'settings' && <SettingsView user={session?.user} />}
      {!tab && <OverviewView properties={properties} stats={stats} />}
    </div>
  );
}
