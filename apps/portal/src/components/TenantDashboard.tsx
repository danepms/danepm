"use client";

import React, { useState } from 'react';
import { 
  Home, LayoutGrid, Users, Settings, 
  ChevronRight, Bell, Menu, Wallet,
  AlertCircle, FileText, BookOpen, 
  Phone, Share2, MessageSquare, 
  ShieldCheck, Package, Car, Dog,
  TrendingUp, Zap, Clock, LogOut
} from 'lucide-react';

interface TenantDashboardProps {
  user: any;
  onLogout: () => void;
  tenantData?: any; // Property info, invoices, etc.
  children?: React.ReactNode;
}

export const TenantDashboard = ({ user, onLogout, tenantData, children }: TenantDashboardProps) => {
  const [activeTab, setActiveTab] = useState('home');

  // MOCK DATA based on screenshots
  const mockTenant = {
    name: user?.name || "Samuel Eto'o",
    tier: "DANE GOLD RESIDENT",
    unit: "UNIT 202",
    property: {
      name: "Dane Heights",
      location: "Kileleshwa, Plot 44/22",
      image: null
    },
    rentStatus: "OVERDUE",
    monthlyRent: "KES 25,000",
    totalArrears: "KES 25,000",
    hasProperty: true // Set to true to show the dashboard, false to show "Not Linked" state
  };

  const services = [
    { name: "Mama Fua (Naomi)", phone: "0711 222 333", type: "Laundry & Cleaning", price: "from 500/-", icon: Users },
    { name: "Jamaa wa Gas (Maina)", phone: "0722 333 444", type: "LPG Delivery", price: "Market Price", icon: Package },
    { name: "Water Guy (Onyango)", phone: "0733 444 555", type: "20L Drinking Water", price: "250/-", icon: Zap },
    { name: "Mama Mboga (Mary)", phone: "0744 555 666", type: "Groceries / Market", price: "Varies", icon: LayoutGrid },
    { name: "Wifi Guy (Steve)", phone: "0755 666 777", type: "Internet & Networking", price: "Support Only", icon: Zap },
    { name: "The Plumber (Baba Otis)", phone: "0766 777 888", type: "Fixes & Maintenance", price: "Quote Based", icon: Clock },
    { name: "The Electrician (Kamau)", phone: "0777 888 999", type: "Wiring & Power", price: "Quote Based", icon: Zap },
  ];

  const renderHome = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Property Header */}
      <div className="bg-[var(--bg-panel)] border border-[var(--border)] rounded-2xl p-6 flex items-center gap-6 glass-card">
        <div className="w-16 h-16 bg-[var(--text-base)] text-[var(--bg-panel)] rounded-xl flex items-center justify-center shrink-0 shadow-lg">
          <Home size={32} />
        </div>
        <div>
          <h2 className="text-3xl font-black uppercase tracking-tighter text-[var(--text-base)] leading-none mb-1">
            {mockTenant.property.name}
          </h2>
          <p className="text-[10px] font-mono text-[var(--text-muted)] uppercase font-bold flex items-center gap-2">
            <LayoutGrid size={12} /> {mockTenant.property.location}
          </p>
        </div>
      </div>

      {/* Rent Status Card */}
      <div className="bg-[var(--bg-panel)] border border-[var(--border)] rounded-2xl p-8 space-y-6 glass-card relative overflow-hidden">
         <div className="space-y-1">
            <p className="text-[10px] font-mono text-[var(--text-muted)] uppercase font-black tracking-widest">Rent Status</p>
            <div className="flex items-center justify-between">
               <h3 className={`text-5xl font-black uppercase tracking-tighter ${mockTenant.rentStatus === 'OVERDUE' ? 'text-red-500' : 'text-emerald-500'}`}>
                  {mockTenant.rentStatus}
               </h3>
               {mockTenant.rentStatus === 'OVERDUE' && (
                 <AlertCircle size={48} className="text-red-500 animate-pulse" />
               )}
            </div>
         </div>

         <div className="grid grid-cols-2 gap-4">
            <div>
               <p className="text-[10px] font-mono text-[var(--text-muted)] uppercase font-bold">Monthly Rent</p>
               <p className="text-xl font-black text-[var(--text-base)]">{mockTenant.monthlyRent}</p>
            </div>
            <div className="text-right">
               <p className="text-[10px] font-mono text-[var(--text-muted)] uppercase font-bold">Total Arrears</p>
               <p className={`text-xl font-black ${mockTenant.rentStatus === 'OVERDUE' ? 'text-red-500' : 'text-[var(--text-base)]'}`}>
                  {mockTenant.totalArrears}
               </p>
            </div>
         </div>

         <button className="w-full bg-[var(--text-base)] text-[var(--bg-panel)] font-black uppercase py-5 rounded-xl flex items-center justify-center gap-4 hover:opacity-90 active:scale-[0.98] transition-all shadow-[0_8px_30px_-4px_rgba(0,0,0,0.3)]">
            <Wallet size={20} /> Pay Now (M-PESA)
         </button>
      </div>

      {/* Simulation Helpers (Only for dev/demo) */}
      <div className="grid grid-cols-2 gap-4">
         <button className="py-3 bg-[var(--bg-panel)] border border-[var(--border)] rounded-lg text-[9px] font-mono uppercase font-black text-[var(--text-muted)] hover:text-[var(--text-base)] transition-all">
            Simulate Unpaid
         </button>
         <button className="py-3 bg-[var(--bg-panel)] border border-[var(--border)] rounded-lg text-[9px] font-mono uppercase font-black text-[var(--text-muted)] hover:text-[var(--text-base)] transition-all">
            Simulate Paid
         </button>
      </div>

      {/* Lifestyle Hub */}
      <div>
         <p className="text-[10px] font-mono text-[var(--text-muted)] uppercase font-black tracking-widest mb-4">Lifestyle Hub</p>
         <div className="grid grid-cols-2 gap-4">
            <button onClick={() => setActiveTab('services')} className="bg-[var(--bg-panel)] border border-[var(--border)] rounded-2xl p-8 flex flex-col items-center gap-4 glass-card hover:border-[var(--accent-bg)] transition-all group">
               <div className="w-12 h-12 rounded-lg bg-[var(--bg-ghost)] flex items-center justify-center text-[var(--text-muted)] group-hover:text-[var(--accent-bg)] transition-colors">
                  <LayoutGrid size={24} />
               </div>
               <span className="text-[10px] font-mono uppercase font-black">Services</span>
            </button>
            <button onClick={() => setActiveTab('community')} className="bg-[var(--bg-panel)] border border-[var(--border)] rounded-2xl p-8 flex flex-col items-center gap-4 glass-card hover:border-[var(--accent-bg)] transition-all group">
               <div className="w-12 h-12 rounded-lg bg-[var(--bg-ghost)] flex items-center justify-center text-[var(--text-muted)] group-hover:text-[var(--accent-bg)] transition-colors">
                  <Users size={24} />
               </div>
               <span className="text-[10px] font-mono uppercase font-black">Community</span>
            </button>
         </div>
      </div>

      {/* Documents */}
      <div className="grid grid-cols-2 gap-4">
         <div className="bg-[var(--bg-panel)] border border-[var(--border)] rounded-2xl p-6 space-y-4 glass-card">
            <FileText size={32} className="text-[var(--text-base)]" />
            <div>
               <h4 className="font-bold text-sm">Rental Agreement</h4>
               <p className="text-[10px] text-[var(--text-muted)]">Signed Jan 2024</p>
            </div>
            <button className="w-full py-2 bg-[var(--bg-ghost)] hover:bg-[var(--border)] rounded text-[9px] font-mono uppercase font-black transition-all">
               View PDF
            </button>
         </div>
         <div className="bg-[var(--bg-panel)] border border-[var(--border)] rounded-2xl p-6 space-y-4 glass-card">
            <ShieldCheck size={32} className="text-emerald-500" />
            <div>
               <h4 className="font-bold text-sm">Rules & Regs</h4>
               <p className="text-[10px] text-[var(--text-muted)]">Plot Guidelines</p>
            </div>
            <button className="w-full py-2 bg-[var(--bg-ghost)] hover:bg-[var(--border)] rounded text-[9px] font-mono uppercase font-black transition-all">
               Open Handbook
            </button>
         </div>
      </div>
    </div>
  );

  const renderServices = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
         <p className="text-[10px] font-mono text-[var(--text-muted)] uppercase font-black tracking-widest mb-1">Site Vetted Services</p>
         <h2 className="text-4xl font-black uppercase tracking-tighter text-[var(--text-base)]">
            Dane Heights Hub
         </h2>
         <p className="text-sm text-[var(--text-muted)] mt-2">Only contact people who have been verified by your site manager.</p>
      </div>

      <div className="space-y-3">
         {services.map((s, i) => (
           <div key={i} className="bg-[var(--bg-panel)] border border-[var(--border)] rounded-xl p-4 flex items-center justify-between glass-card group hover:border-[var(--accent-bg)] transition-all">
              <div className="flex items-center gap-4">
                 <div className="w-12 h-12 rounded-full bg-[var(--bg-ghost)] flex items-center justify-center text-[var(--text-muted)] group-hover:text-[var(--accent-bg)] transition-colors">
                    <s.icon size={20} />
                 </div>
                 <div>
                    <h4 className="font-bold text-base flex items-center gap-2">
                       {s.name} <ShieldCheck size={14} className="text-emerald-500" />
                    </h4>
                    <p className="text-[11px] font-mono font-bold text-[var(--text-base)]">{s.phone}</p>
                    <p className="text-[9px] text-[var(--text-muted)] uppercase mt-0.5">{s.type} • {s.price}</p>
                 </div>
              </div>
              <button className="w-12 h-12 bg-[var(--text-base)] text-[var(--bg-panel)] rounded-xl flex items-center justify-center shadow-lg active:scale-90 transition-all">
                 <Phone size={18} />
              </button>
           </div>
         ))}
      </div>
    </div>
  );

  const renderCommunity = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
         <p className="text-[10px] font-mono text-[var(--text-muted)] uppercase font-black tracking-widest mb-1">Resident Ecosystem</p>
         <h2 className="text-4xl font-black uppercase tracking-tighter text-[var(--text-base)]">
            Dane Heights Hub
         </h2>
      </div>

      {/* Tabs within Community */}
      <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
         {['Links', 'Rules', 'Market', 'Found'].map((tab) => (
           <button 
             key={tab}
             className={`px-6 py-2.5 rounded-full text-[10px] font-mono uppercase font-black transition-all border ${
               tab === 'Links' ? 'bg-[var(--text-base)] text-[var(--bg-panel)] border-transparent shadow-lg' : 'bg-[var(--bg-panel)] border-[var(--border)] text-[var(--text-muted)] hover:border-[var(--text-base)] hover:text-[var(--text-base)]'
             }`}
           >
             {tab === 'Links' && <LayoutGrid size={12} className="inline mr-2" />}
             {tab}
           </button>
         ))}
      </div>

      <div className="space-y-4">
         <div className="bg-[var(--bg-panel)] border border-[var(--border)] rounded-2xl p-6 glass-card relative">
            <div className="flex justify-between items-start mb-4">
               <div>
                  <h3 className="font-bold text-lg">Help a Friend?</h3>
                  <p className="text-[10px] text-[var(--text-muted)] font-mono uppercase">There are currently <span className="text-[var(--text-base)] font-black">3 VACANT UNITS</span> in this plot.</p>
               </div>
               <button className="p-2 text-[var(--text-muted)] hover:text-[var(--text-base)] transition-colors">
                  <Share2 size={20} />
               </button>
            </div>
            <div className="space-y-2">
               <p className="text-[9px] font-mono uppercase font-black text-[var(--text-muted)]">Share Vacancy Link</p>
               <div className="flex gap-2">
                  <div className="flex-1 bg-[var(--bg-ghost)] border border-[var(--border)] rounded-lg p-3 font-mono text-xs text-[var(--text-muted)] truncate">
                     /vacancies/dane-heights
                  </div>
                  <button className="px-6 bg-[var(--text-base)] text-[var(--bg-panel)] font-black text-[10px] uppercase rounded-lg shadow-md active:scale-95 transition-all">
                     Copy
                  </button>
               </div>
            </div>
         </div>

         <button className="w-full bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-6 flex items-center justify-between group hover:bg-emerald-500/20 transition-all">
            <div className="flex items-center gap-4">
               <div className="w-12 h-12 bg-emerald-500 text-white rounded-xl flex items-center justify-center shadow-lg">
                  <MessageSquare size={24} />
               </div>
               <div className="text-left">
                  <h4 className="font-bold text-emerald-500">Plot WhatsApp Group</h4>
                  <p className="text-[10px] text-emerald-600/70 font-mono uppercase">Chat with fellow residents & caretaker</p>
               </div>
            </div>
            <ChevronRight size={20} className="text-emerald-500" />
         </button>

         <div className="bg-[var(--bg-panel)] border border-[var(--border)] rounded-2xl p-4 flex items-center justify-between glass-card">
            <div className="flex items-center gap-4">
               <div className="w-12 h-12 bg-[var(--bg-ghost)] rounded-xl flex items-center justify-center text-[var(--text-muted)]">
                  <Users size={24} />
               </div>
               <div>
                  <h4 className="font-bold text-base">Caretaker (Mr. Onyango)</h4>
                  <p className="text-[11px] font-mono font-bold text-[var(--text-base)]">0712 345 678</p>
               </div>
            </div>
            <button className="w-12 h-12 bg-[var(--text-base)] text-[var(--bg-panel)] rounded-xl flex items-center justify-center shadow-lg">
               <Phone size={18} />
            </button>
         </div>
      </div>
    </div>
  );

  const renderAccount = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      <div>
         <h2 className="text-4xl font-black uppercase tracking-tighter text-[var(--text-base)]">
            My Account
         </h2>
         <p className="text-sm text-[var(--text-muted)] mt-1">Digital identity and personal asset management.</p>
      </div>

      {/* Emergency Alert */}
      <button className="w-full bg-red-600 text-white rounded-2xl p-6 flex items-center gap-6 shadow-[0_10px_40px_-10px_rgba(220,38,38,0.5)] active:scale-[0.98] transition-all">
         <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center shrink-0">
            <Zap size={32} className="text-white" />
         </div>
         <div className="text-left">
            <h4 className="font-black text-xl uppercase tracking-tighter">Emergency Alert</h4>
            <p className="text-[10px] font-mono uppercase font-bold opacity-80">Tap to notify security & neighbors</p>
         </div>
      </button>

      {/* Financial Analytics */}
      <div className="bg-[var(--bg-panel)] border border-[var(--border)] rounded-2xl p-6 glass-card space-y-4">
         <div className="flex justify-between items-center">
            <p className="text-[10px] font-mono text-[var(--text-muted)] uppercase font-black tracking-widest">Financial Analytics</p>
            <TrendingUp size={16} className="text-[var(--text-muted)]" />
         </div>
         
         <div className="h-32 flex items-end justify-between gap-2 py-4">
            {[40, 70, 45, 90, 60, 100].map((h, i) => (
              <div key={i} className="flex-1 bg-[var(--bg-ghost)] rounded-sm relative group">
                 <div 
                   className={`absolute bottom-0 left-0 right-0 rounded-sm transition-all duration-1000 ${i === 5 ? 'bg-[var(--text-base)]' : 'bg-[var(--border)] opacity-30'}`} 
                   style={{ height: `${h}%` }} 
                 />
              </div>
            ))}
         </div>

         <div className="text-center pt-2">
            <p className="text-[10px] font-mono text-[var(--text-muted)] uppercase font-bold">
               Total Paid (2026): <span className="text-[var(--text-base)] font-black ml-1">KES 150,000</span>
            </p>
         </div>
      </div>

         {/* List items */}
         <div className="space-y-3">
            {[
              { icon: ShieldCheck, label: "Digital Access Keys", sub: "2 Keys Active • Smart Lock" },
              { icon: Package, label: "Package Tracker", sub: "1 Package at Gate Reception", alert: true },
              { icon: Car, label: "Parking Space", sub: "Slot B-42 • Registered: KDA 123X" },
              { icon: Dog, label: "Pet Registry", sub: "1 Dog (Husky) • Verified" },
            ].map((item, i) => (
              <button key={i} className="w-full bg-[var(--bg-panel)] border border-[var(--border)] rounded-2xl p-6 flex items-center justify-between glass-card group hover:border-[var(--accent-bg)] transition-all">
                 <div className="flex items-center gap-6">
                    <div className="w-12 h-12 rounded-xl bg-[var(--bg-ghost)] flex items-center justify-center text-[var(--text-muted)] group-hover:text-[var(--accent-bg)] transition-colors">
                       <item.icon size={24} />
                    </div>
                    <div className="text-left">
                       <h4 className="font-bold text-base flex items-center gap-2">
                          {item.label} {item.alert && <div className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_8px_red]" />}
                       </h4>
                       <p className="text-[10px] text-[var(--text-muted)] font-mono uppercase font-bold">{item.sub}</p>
                    </div>
                 </div>
                 <ChevronRight size={20} className="text-[var(--text-muted)] group-hover:translate-x-1 transition-transform" />
              </button>
            ))}

            <button 
              onClick={onLogout}
              className="w-full bg-red-500/5 border border-red-500/20 rounded-2xl p-6 flex items-center justify-between group hover:bg-red-500/10 transition-all mt-6"
            >
               <div className="flex items-center gap-6">
                  <div className="w-12 h-12 rounded-xl bg-red-500/10 flex items-center justify-center text-red-500 group-hover:scale-110 transition-transform">
                     <LogOut size={24} />
                  </div>
                  <div className="text-left">
                     <h4 className="font-bold text-base text-red-500">Terminate Session</h4>
                     <p className="text-[10px] text-red-500/60 font-mono uppercase font-bold">Securely log out of Dane</p>
                  </div>
               </div>
               <ChevronRight size={20} className="text-red-500/40 group-hover:translate-x-1 transition-transform" />
            </button>
         </div>
      </div>
    );

  const renderNotLinked = () => (
    <div className="h-full flex flex-col items-center justify-center text-center p-8 animate-in zoom-in-95 duration-500">
      <div className="w-32 h-32 bg-[var(--bg-panel)] border border-[var(--border)] rounded-3xl flex items-center justify-center text-[var(--text-muted)] mb-8 shadow-2xl rotate-[5deg]">
         <AlertCircle size={64} />
      </div>
      <h2 className="text-5xl font-black uppercase tracking-tighter mb-4 leading-none text-[var(--text-base)]">
         Wait, Where Are You?
      </h2>
      <p className="text-sm font-mono text-[var(--text-muted)] uppercase font-bold max-w-sm mb-12">
         It seems you haven't been linked to a property yet. Tell your manager to onboard you on <span className="text-[var(--accent-bg)]">Dane.</span>
      </p>
      
      <div className="w-full max-w-sm space-y-4">
         <button className="w-full bg-[var(--accent-bg)] text-[var(--accent-text)] font-black uppercase py-5 rounded-xl shadow-xl hover:opacity-90 transition-all">
            Invite My Property Manager
         </button>
         <button onClick={onLogout} className="w-full py-4 text-[10px] font-mono text-[var(--text-muted)] uppercase font-black hover:text-[var(--text-base)] transition-colors">
            Exit Session
         </button>
      </div>
    </div>
  );

  return (
    <div className="h-screen w-full max-w-md mx-auto bg-[var(--bg-base)] text-[var(--text-base)] flex flex-col relative overflow-hidden shadow-2xl">
      
      {/* Top Header */}
      <header className="px-6 py-8 flex items-center justify-between shrink-0 relative z-10 border-b border-[var(--border)]">
         <div className="flex items-center gap-4">
            <div className="relative">
               <div className="w-14 h-14 bg-[var(--text-base)] text-[var(--bg-panel)] rounded-2xl flex items-center justify-center font-black text-xl shadow-lg">
                  {user?.name?.slice(0, 2).toUpperCase() || "SE"}
               </div>
               <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-[var(--bg-base)] rounded-full shadow-sm" />
            </div>
            <div>
               <h1 className="font-black uppercase tracking-tighter text-lg leading-none mb-1">
                  {user?.name || "Samuel Eto'o"} <span className="text-[var(--accent-bg)] ml-1">🏅</span>
               </h1>
               <p className="text-[9px] font-mono text-[var(--text-muted)] uppercase font-bold tracking-widest">
                  {mockTenant.tier} • {mockTenant.unit}
               </p>
            </div>
         </div>
         <div className="flex gap-2">
            <button className="w-12 h-12 rounded-2xl bg-[var(--bg-panel)] border border-[var(--border)] flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-base)] transition-colors glass-card relative">
               <Package size={20} />
               <div className="absolute top-3 right-3 w-2 h-2 rounded-full bg-red-500" />
            </button>
            <button className="w-12 h-12 rounded-2xl bg-[var(--bg-panel)] border border-[var(--border)] flex items-center justify-center text-red-500 hover:bg-red-500/10 transition-colors glass-card">
               <Zap size={20} />
            </button>
         </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto px-6 py-8 no-scrollbar">
         {!mockTenant.hasProperty ? renderNotLinked() : (
           <>
             {activeTab === 'home' && renderHome()}
             {activeTab === 'services' && renderServices()}
             {activeTab === 'community' && renderCommunity()}
             {activeTab === 'account' && renderAccount()}
             {children}
           </>
         )}
      </main>

      {/* Bottom Navigation */}
      <nav className="h-24 bg-[var(--bg-panel)] border-t border-[var(--border)] px-8 flex items-center justify-between shrink-0 relative z-20 glass-nav m-4 rounded-3xl shadow-2xl">
         {[
           { id: 'home', icon: Home, label: 'Home' },
           { id: 'services', icon: LayoutGrid, label: 'Services' },
           { id: 'community', icon: Users, label: 'Community' },
           { id: 'account', icon: Settings, label: 'Account' },
         ].map((tab) => (
           <button 
             key={tab.id}
             onClick={() => setActiveTab(tab.id)}
             className={`flex flex-col items-center gap-1.5 transition-all relative ${
               activeTab === tab.id ? 'text-[var(--text-base)]' : 'text-[var(--text-muted)] hover:text-[var(--text-base)] opacity-50'
             }`}
           >
             {activeTab === tab.id && (
               <div className="absolute -top-12 w-1 h-1 rounded-full bg-[var(--text-base)] animate-bounce" />
             )}
             <tab.icon size={22} strokeWidth={activeTab === tab.id ? 2.5 : 2} />
             <span className="text-[8px] font-mono uppercase font-black tracking-widest">{tab.label}</span>
           </button>
         ))}
      </nav>

      {/* Custom Styles for Glassmorphism and Layout */}
      <style jsx>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .glass-card {
          backdrop-filter: blur(8px);
          background: rgba(var(--bg-panel-rgb), 0.7);
        }
        .glass-nav {
          backdrop-filter: blur(12px);
          background: rgba(var(--bg-panel-rgb), 0.85);
        }
        @keyframes scan {
          from { top: 0%; }
          to { top: 100%; }
        }
        .animate-scan {
          animation: scan 3s linear infinite;
        }
      `}</style>
    </div>
  );
};
