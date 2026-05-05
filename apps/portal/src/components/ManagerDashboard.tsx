"use client";

import React, { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { 
  Building2, Users, Sun, Moon, Bell, 
  Search, CircleDot, LogOut, 
  ChevronRight, ChevronDown, Plus, Activity, Cpu,
  Wallet, Receipt, ArrowLeftRight, BarChart3,
  Wrench, AlertCircle, HardHat, MessageSquare,
  Zap, Copy, Clock, Shield, RefreshCw,
  PanelLeftClose, PanelLeftOpen, PanelBottom, PanelLeft, LayoutTemplate
} from 'lucide-react';

import { useTheme } from '@/context/ThemeContext';

type TabItem = {
  id: string;
  label: string;
  icon: any;
  children?: TabItem[];
};

const TABS: TabItem[] = [
  { id: 'properties', label: 'Properties', icon: Building2 },
  { id: 'tenants', label: 'Tenants', icon: Users },
  { 
    id: 'finance', label: 'Finance', icon: Wallet,
    children: [
      { id: 'invoices', label: 'Invoices', icon: Receipt },
      { id: 'reconciliation', label: 'Reconciliation', icon: ArrowLeftRight },
      { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    ]
  },
  { 
    id: 'maintenance', label: 'Maintenance', icon: Wrench,
    children: [
      { id: 'requests', label: 'Requests', icon: AlertCircle },
      { id: 'expenses', label: 'Expenses', icon: Receipt },
      { id: 'vendors', label: 'Vendors', icon: HardHat },
    ]
  },
  { 
    id: 'communications_hub', label: 'Communications', icon: MessageSquare,
    children: [
      { id: 'communications', label: 'Summary', icon: BarChart3 },
      { id: 'campaigns', label: 'Campaigns', icon: Zap },
      { id: 'flows', label: 'Flows', icon: Activity },
      { id: 'templates', label: 'Templates', icon: Copy },
      { id: 'archives', label: 'Archives', icon: Clock },
    ]
  },
];

export const ManagerDashboard = ({ onLogout, user, hasProperties, onUnlock, children }: any) => {
  const router = useRouter();
  const pathname = usePathname();
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const [expandedGroups, setExpandedGroups] = useState<string[]>([]);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isBottomBar, setIsBottomBar] = useState(false);
  const [flyoutPositions, setFlyoutPositions] = useState<Record<string, React.CSSProperties>>({});

  // Responsive defaults
  React.useEffect(() => {
    const checkWidth = () => {
      if (window.innerWidth < 768) {
        setIsSidebarCollapsed(true);
      } else {
        setIsSidebarCollapsed(false);
      }
    };
    checkWidth();
    window.addEventListener('resize', checkWidth);
    return () => window.removeEventListener('resize', checkWidth);
  }, []);

  // Extract active tab from URL
  const activeTab = pathname.split('/').pop() || 'properties';

  // Check if a child tab is active to auto-highlight its parent
  const isChildActive = (tab: TabItem) => {
    return tab.children?.some(c => c.id === activeTab) || false;
  };

  const isGroupExpanded = (tabId: string) => {
    return expandedGroups.includes(tabId);
  };

  const toggleGroup = (tabId: string) => {
    setExpandedGroups(prev => 
      prev.includes(tabId) ? [] : [tabId]
    );
  };

  const handleToggleGroup = (e: React.MouseEvent, tabId: string) => {
    const rect = e.currentTarget.getBoundingClientRect();
    
    // Calculate fixed position based on mode
    let pos: React.CSSProperties = {};
    if (isBottomBar) {
      pos = { left: rect.left, bottom: window.innerHeight - rect.top + 8 };
    } else {
      pos = { top: rect.top, left: rect.right + 8 };
    }
    
    setFlyoutPositions(prev => ({ ...prev, [tabId]: pos }));
    toggleGroup(tabId);
  };

  const handleTabChange = (tabId: string) => {
    router.push(`/dashboard/manager/${tabId}`);
  };

  return (
    <div className={`h-screen w-full font-sans bg-[var(--bg-base)] text-[var(--text-base)] flex ${isBottomBar ? 'flex-col-reverse' : 'flex-row'} transition-none ${theme === 'dark' ? 'theme-dark' : ''}`}>
      
      {/* --- SIDEBAR / BOTTOM BAR --- */}
      <aside className={`bg-[var(--bg-panel)] border-[var(--border)] flex shrink-0 z-30 shadow-xl relative transition-all duration-300 ${
        isBottomBar 
          ? 'w-full h-16 border-t flex-row items-center justify-between px-4' 
          : `flex-col border-r h-screen ${isSidebarCollapsed ? 'w-20' : 'w-64'}`
      }`}>
        <div className={`flex items-center shrink-0 border-[var(--border)] ${
          isBottomBar 
            ? 'h-full border-r pr-6 mr-2' 
            : `h-20 px-6 border-b ${isSidebarCollapsed ? 'justify-center px-0' : ''}`
        }`}>
          <div className="w-9 h-9 rounded-lg bg-[var(--text-base)] text-[var(--bg-panel)] flex items-center justify-center shadow-lg transition-transform hover:rotate-[10deg] duration-300 shrink-0">
            <Building2 size={18} />
          </div>
          {(!isSidebarCollapsed && !isBottomBar) && (
            <div className="ml-3 flex flex-col overflow-hidden whitespace-nowrap">
              <span className="text-lg font-bold text-[var(--text-base)] tracking-tighter leading-none">Dane.</span>
              <span className="text-[9px] font-mono text-[var(--text-muted)] uppercase tracking-widest mt-1 opacity-70">Control Panel</span>
            </div>
          )}
        </div>

        <nav className={`flex-1 ${
          isBottomBar 
            ? 'flex flex-row items-center gap-2 overflow-x-auto no-scrollbar' 
            : 'overflow-y-auto pt-6 px-4 custom-scrollbar'
        }`}>
          {(!isSidebarCollapsed && !isBottomBar) && (
            <p className="px-4 font-mono text-[9px] text-[var(--text-muted)] uppercase tracking-widest mb-4 opacity-50 whitespace-nowrap">Management</p>
          )}
          
          <div className={`${isBottomBar ? 'flex flex-row gap-2' : 'mb-8'}`}>
            {TABS.map((tab) => {
              const hasChildren = tab.children && tab.children.length > 0;
              const expanded = hasChildren && isGroupExpanded(tab.id);
              const isActive = activeTab === tab.id || isChildActive(tab);

              return (
                <div key={tab.id} className={`${isBottomBar ? '' : 'mb-1'} relative`}>
                  {/* Parent button */}
                  <button
                    onClick={(e) => hasChildren ? handleToggleGroup(e, tab.id) : handleTabChange(tab.id)}
                    title={isSidebarCollapsed || isBottomBar ? tab.label : undefined}
                    className={`nav-item group relative flex items-center justify-center rounded-lg transition-all ${
                      isBottomBar ? 'px-3 h-10' : 'w-full px-4 py-2.5 justify-start'
                    } ${
                      isActive && (!hasChildren || isBottomBar)
                        ? 'bg-[var(--bg-ghost)] text-[var(--text-base)] shadow-sm' 
                        : isActive && hasChildren && !isBottomBar
                        ? 'text-[var(--text-base)]'
                        : 'text-[var(--text-muted)] hover:text-[var(--text-base)] hover:bg-[var(--bg-ghost)]/50'
                    }`}
                  >
                    {!hasChildren && !isBottomBar && (
                      <div className={`absolute left-[-16px] top-1/2 -translate-y-1/2 w-1.5 rounded-r-full bg-[var(--accent-bg)] active-filament ${
                        isActive ? 'h-6 opacity-100' : 'h-0 opacity-0 group-hover:h-3 group-hover:opacity-50'
                      }`} />
                    )}
                    <div className={`w-8 h-8 rounded-md flex items-center justify-center shrink-0 transition-all ${
                      isActive ? 'bg-[var(--accent-bg)] text-[var(--accent-text)]' : 'text-[var(--text-muted)] group-hover:text-[var(--text-base)]'
                    }`}>
                      <tab.icon size={isSidebarCollapsed || isBottomBar ? 20 : 18} />
                    </div>
                    {(!isSidebarCollapsed && !isBottomBar) && (
                      <span className="ml-3 text-sm font-medium tracking-tight flex-1 text-left whitespace-nowrap">{tab.label}</span>
                    )}
                    {hasChildren && (!isSidebarCollapsed && !isBottomBar) && (
                      <div className={`transition-transform duration-200 ${expanded ? 'rotate-90' : 'rotate-0'}`}>
                        <ChevronRight size={14} className="opacity-40" />
                      </div>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        </nav>

        <div className={`p-4 shrink-0 relative ${isBottomBar ? 'border-l border-[var(--border)] ml-2 pl-6' : 'border-t border-[var(--border)]'}`}>
          {/* --- DROP-UP MENU --- */}
          {expandedGroups.includes('profile_menu') && (
            <div className={`absolute bg-[var(--bg-panel)] border border-[var(--border)] rounded shadow-2xl z-50 overflow-hidden animate-slide-up ${
              isBottomBar ? 'bottom-[calc(100%+16px)] right-4 w-64' : 'bottom-[calc(100%+8px)] left-4 right-4'
            }`}>
              <div className="p-3 border-b border-[var(--border)] border-opacity-5 bg-[var(--bg-ghost)]/50">
                 <p className="font-mono text-[9px] text-[var(--text-muted)] uppercase tracking-widest font-black">System Terminal</p>
              </div>
              <div className="p-1">
                 {[
                   { id: 'audit', label: 'System Ledger', icon: Activity, desc: 'Forensic Audit Trails' },
                   { id: 'security', label: 'Account & Access', icon: Shield, desc: 'Sessions & Security' },
                   { id: 'profile', label: 'Personal Info', icon: Users, desc: 'Identity & Bio' }
                 ].map(item => (
                   <button
                     key={item.id}
                     onClick={() => { handleTabChange(item.id); setExpandedGroups(prev => prev.filter(i => i !== 'profile_menu')); }}
                     className="w-full flex items-center gap-3 p-3 rounded-sm hover:bg-[var(--bg-ghost)] transition-all group/item"
                   >
                     <div className="w-8 h-8 rounded-sm bg-[var(--bg-ghost)] border border-[var(--border)] border-opacity-5 flex items-center justify-center text-[var(--text-muted)] group-hover/item:text-[var(--accent-bg)] transition-colors">
                        <item.icon size={14} />
                     </div>
                     <div className="text-left">
                        <p className="text-[11px] font-black uppercase tracking-tight leading-none">{item.label}</p>
                        <p className="text-[9px] text-[var(--text-muted)] mt-1 font-medium">{item.desc}</p>
                     </div>
                   </button>
                 ))}
                 <div className="h-px bg-[var(--border)] opacity-5 my-1" />
                 <button 
                   onClick={onLogout}
                   className="w-full flex items-center gap-3 p-3 rounded-sm hover:bg-red-500/10 text-red-500 transition-all group/logout"
                 >
                    <div className="w-8 h-8 rounded-sm bg-red-500/5 flex items-center justify-center">
                       <LogOut size={14} />
                    </div>
                    <span className="text-[11px] font-black uppercase tracking-widest">Terminate Session</span>
                 </button>
              </div>
            </div>
          )}

          <button 
            onClick={() => toggleGroup('profile_menu')}
            className={`flex items-center justify-between w-full p-2 rounded-lg border transition-all ${
              expandedGroups.includes('profile_menu') ? 'bg-[var(--bg-ghost)] border-[var(--accent-bg)] shadow-lg' : 'bg-[var(--bg-ghost)]/50 border-[var(--border)] hover:border-[var(--text-base)]'
            }`}
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="relative shrink-0">
                <div className="w-9 h-9 rounded-lg bg-[var(--accent-bg)] text-[var(--accent-text)] flex items-center justify-center font-bold text-sm shadow-sm">
                  {user?.name?.slice(0, 2) || "JD"}
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-green-500 border-2 border-[var(--bg-panel)] shadow-sm" />
              </div>
              {(!isSidebarCollapsed && !isBottomBar) && (
                <div className="flex-1 min-w-0 text-left">
                  <p className="text-sm font-bold text-[var(--text-base)] truncate leading-tight">{user?.name || "James K."}</p>
                  <p className="font-mono text-[8px] text-[var(--text-muted)] uppercase tracking-widest truncate">{user?.role || "Owner"}</p>
                </div>
              )}
            </div>
            {(!isSidebarCollapsed && !isBottomBar) && (
              <div className={`transition-transform duration-200 ${expandedGroups.includes('profile_menu') ? 'rotate-180' : 'rotate-0'}`}>
                 <ChevronDown size={14} className="opacity-40" />
              </div>
            )}
          </button>
        </div>
      </aside>

      {/* --- MAIN STAGE --- */}
      <div className="flex-1 flex flex-col min-w-0 min-h-0 overflow-hidden relative">
        
        {/* --- HEADER --- */}
        <header className="h-20 glass-header border-b border-[var(--border)] flex items-center justify-between px-8 shrink-0 relative z-40 transition-all duration-500">
          
          {/* Breadcrumb */}
          <div className="flex items-center gap-6">
            <div className="hidden lg:flex items-center">
              <div 
                onClick={() => router.push('/')}
                className="flex items-center px-3 py-1.5 rounded-md bg-[var(--bg-ghost)]/50 border border-[var(--border)] text-xs font-semibold text-[var(--text-muted)] hover:text-[var(--text-base)] cursor-pointer transition-colors shadow-sm"
              >
                Home
              </div>
              <ChevronRight size={14} className="mx-2 text-[var(--text-muted)] opacity-30" />
              <div className="flex items-center px-3 py-1.5 rounded-md bg-[var(--accent-bg)]/10 border border-[var(--accent-bg)]/20 text-xs font-bold text-[var(--accent-bg)] shadow-sm capitalize">
                {activeTab}
              </div>
            </div>
          </div>

          {/* Search */}
          <div className="flex-1 max-w-2xl mx-12">
            <div className={`search-input-wrap relative border border-[var(--border)] rounded-lg flex items-center transition-all ${isSearchFocused ? 'px-1 shadow-lg' : 'px-0 shadow-sm'}`}>
              <div className="pl-4 pr-3 text-[var(--text-muted)] shrink-0">
                <Search size={18} className={isSearchFocused ? 'text-[var(--accent-bg)]' : ''} />
              </div>
              <input 
                type="text" 
                placeholder={`Search ${activeTab}...`} 
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setIsSearchFocused(false)}
                className="w-full bg-transparent border-none text-[var(--text-base)] py-3 pr-4 font-sans text-sm focus:outline-none placeholder:text-[var(--text-muted)] placeholder:opacity-50"
              />
              
              <div className="pr-4 hidden sm:flex items-center gap-2">
                <div className="flex items-center gap-1 px-1.5 py-0.5 rounded border border-[var(--border)] bg-[var(--bg-ghost)] text-[var(--text-muted)] text-[9px] font-mono font-bold shadow-sm">
                  <span className="opacity-50">CTRL</span>
                  <span>K</span>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-4 ml-auto">
            
            <div className="hidden xl:flex items-center gap-3 px-4 h-10 rounded-lg bg-[var(--bg-ghost)]/50 border border-[var(--border)] shadow-sm">
              <div className="flex items-center gap-2">
                <div className="relative">
                  <CircleDot size={12} className="text-green-500" />
                  <div className="absolute inset-0 bg-green-500 blur-sm opacity-50 animate-pulse" />
                </div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[var(--text-muted)]">Live</span>
              </div>
              <div className="w-[1px] h-4 bg-[var(--border)]" />
              <Activity size={14} className="text-[var(--text-muted)]" />
            </div>

            <div className="flex items-center gap-2">
              
              {!isBottomBar && (
                <button 
                  onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                  className="btn-action hidden md:flex items-center justify-center w-10 h-10 rounded-lg bg-[var(--bg-panel)] border border-[var(--border)] text-[var(--text-muted)] hover:border-[var(--accent-bg)] hover:text-[var(--accent-bg)] shadow-sm active:scale-90 group transition-all"
                  title={isSidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
                >
                  {isSidebarCollapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
                </button>
              )}

              <button 
                onClick={() => setIsBottomBar(!isBottomBar)}
                className="btn-action flex items-center justify-center w-10 h-10 rounded-lg bg-[var(--bg-panel)] border border-[var(--border)] text-[var(--text-muted)] hover:border-[var(--accent-bg)] hover:text-[var(--accent-bg)] shadow-sm active:scale-90 group transition-all"
                title={isBottomBar ? "Switch to Sidebar" : "Switch to Bottom Bar"}
              >
                {isBottomBar ? <PanelLeft size={18} /> : <PanelBottom size={18} />}
              </button>

              <button 
                onClick={toggleTheme}
                className="btn-action flex items-center justify-center w-10 h-10 rounded-lg bg-[var(--bg-panel)] border border-[var(--border)] text-[var(--text-muted)] hover:border-[var(--accent-bg)] hover:text-[var(--accent-bg)] shadow-sm active:scale-90 group ml-2"
              >
                {theme === 'dark' ? <Sun size={18} className="group-hover:rotate-45 transition-transform" /> : <Moon size={18} />}
              </button>
              
              <button className="btn-action relative flex items-center justify-center w-10 h-10 rounded-lg bg-[var(--bg-panel)] border border-[var(--border)] text-[var(--text-muted)] hover:border-[var(--text-base)] shadow-sm active:scale-90">
                <Bell size={18} />
                <div className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-[var(--alert-bg)] shadow-[0_0_8px_var(--alert-bg)] animate-pulse" />
              </button>
            </div>

            <button 
              onClick={() => onUnlock?.()}
              className="btn-action hidden sm:flex items-center gap-2 px-5 py-2.5 bg-[var(--text-base)] text-[var(--bg-panel)] rounded-lg text-xs font-black shadow-lg hover:shadow-[0_8px_20px_-4px_rgba(0,0,0,0.3)] transition-all ml-2 uppercase tracking-widest border border-transparent"
            >
              <Plus size={16} strokeWidth={3} />
              <span>Create</span>
            </button>
          </div>
        </header>

        {/* --- CONTENT --- */}
        <main className="flex-1 overflow-y-auto p-8 custom-scrollbar bg-[var(--bg-base)] relative">
          {children || (
            <div className={`max-w-7xl mx-auto h-full flex flex-col items-center justify-center opacity-30 select-none pointer-events-none transition-all duration-500 ${!hasProperties ? 'blur-md scale-95 opacity-10' : ''}`}>
              <Cpu size={120} className="text-[var(--text-muted)] mb-8" />
              <h2 className="text-4xl font-bold tracking-tighter uppercase">Interface Primary Buffer</h2>
              <p className="font-mono text-xs uppercase tracking-widest mt-4">Module: {activeTab} // Layer: Primary</p>
            </div>
          )}
        </main>
      </div>

      {/* --- GLOBAL FLYOUT PORTAL --- */}
      {TABS.map((tab) => {
        const hasChildren = tab.children && tab.children.length > 0;
        const expanded = hasChildren && isGroupExpanded(tab.id);
        
        if (!expanded || !hasChildren) return null;

        const pos = flyoutPositions[tab.id] || {};

        return (
          <div 
            key={`flyout-${tab.id}`}
            style={pos}
            className="fixed bg-[var(--bg-panel)] border border-[var(--border)] rounded shadow-2xl z-[100] overflow-hidden animate-in fade-in zoom-in-95 duration-200 w-48"
          >
            <div className="p-1">
              {tab.children!.map((child) => {
                const childActive = activeTab === child.id;
                return (
                  <button
                    key={child.id}
                    onClick={() => { handleTabChange(child.id); toggleGroup(tab.id); }}
                    className={`w-full flex items-center gap-3 p-3 rounded-sm hover:bg-[var(--bg-ghost)] transition-all group/item ${
                      childActive ? 'text-[var(--text-base)] bg-[var(--bg-ghost)] shadow-sm' : 'text-[var(--text-muted)]'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-sm border border-[var(--border)] border-opacity-5 flex items-center justify-center transition-colors shrink-0 ${
                      childActive ? 'bg-[var(--accent-bg)] text-[var(--accent-text)]' : 'bg-[var(--bg-ghost)] group-hover/item:text-[var(--accent-bg)]'
                    }`}>
                        <child.icon size={14} />
                    </div>
                    <span className="text-[11px] font-black uppercase tracking-tight leading-none text-left flex-1">{child.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
};

