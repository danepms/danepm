"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useSession } from '@/lib/auth-client';
import { api } from '@/lib/api';
import { PropertiesTab } from '@/components/PropertiesTab';
import { TenantsTab } from '@/components/TenantsTab';
import { InvoicesTab } from '@/components/InvoicesTab';
import { ReconciliationTab } from '@/components/ReconciliationTab';
import { AnalyticsTab } from '@/components/AnalyticsTab';
import { RequestsTab } from '@/components/RequestsTab';
import { ExpensesTab } from '@/components/ExpensesTab';
import { VendorsTab } from '@/components/VendorsTab';
import { CommunicationsTab } from '@/components/CommunicationsTab';
import { ActivityLog } from '@/components/AuditVault';
import { ArchivedTenantsTab } from '@/components/ArchivedTenantsTab';
import { SettingsView } from '@/components/SettingsView';

export default function ManagerTabPage() {
  const params = useParams();
  const tab = params.tab as string;
  const { data: session, isPending } = useSession();
  const [properties, setProperties] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [tenantsData, setTenantsData] = useState<any[]>([]);
  const [tenantStats, setTenantStats] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [isTenantsLoading, setIsTenantsLoading] = useState(false);

  // 1. STABLE GLOBAL DATA (Properties & Stats)
  useEffect(() => {
    if (isPending || !session) return;
    let isMounted = true;

    async function loadGlobalData() {
      // Only show global loading on first mount
      if (properties.length === 0) setIsLoading(true);
      
      const [propsRes, statsRes] = await Promise.all([
        api.get<any>(`/properties?managerId=${session?.user.id || ''}`),
        api.get<any>(`/tenants/stats?managerId=${session?.user.id || ''}`)
      ]);

      if (isMounted) {
        if (propsRes.success) setProperties(propsRes.properties || []);
        if (statsRes.success) setTenantStats(statsRes.stats);
        setIsLoading(false);
      }
    }

    loadGlobalData();
    return () => { isMounted = false; };
  }, [session?.user.id, isPending]);

  // 2. TAB-SPECIFIC DATA (Tenants)
  useEffect(() => {
    if (tab === 'tenants' && tenantsData.length === 0) {
      fetchTenants(1);
    }
  }, [tab, session?.user.id]);

  const fetchTenants = async (page: number, force = false) => {
    if (!session || (!force && tenantsData.length > 0 && page === currentPage)) return;
    
    setIsTenantsLoading(true);
    const res = await api.get<any>(`/tenants?managerId=${session.user.id}&page=${page}`);
    if (res.success) {
      setTenantsData(res.tenants || []);
      setHasMore(res.hasMore || false);
      setCurrentPage(page);
    }
    setIsTenantsLoading(false);
  };

  const handleRefreshTenants = () => {
    fetchTenants(currentPage, true);
    api.get<any>(`/tenants/stats?managerId=${session?.user.id || ''}`).then((res: any) => {
      if (res.success) setTenantStats(res.stats);
    });
  };

  if (isPending || !session) return null;

  const renderActiveTab = () => {
    const managerId = session.user.id;
    switch (tab) {
      case 'properties': 
        return <PropertiesTab properties={properties} isLoading={isLoading} />;
      case 'tenants': 
        return (
          <TenantsTab 
            tenants={tenantsData}
            stats={tenantStats}
            isLoading={isTenantsLoading}
            currentPage={currentPage}
            hasMore={hasMore}
            onPageChange={fetchTenants}
            onRefresh={handleRefreshTenants}
            properties={properties}
            managerId={managerId}
          />
        );
      case 'invoices': return <InvoicesTab managerId={managerId} properties={properties} />;
      case 'reconciliation': return <ReconciliationTab managerId={managerId} />;
      case 'analytics': return <AnalyticsTab managerId={managerId} />;
      case 'requests': return <RequestsTab managerId={managerId} properties={properties} />;
      case 'expenses': return <ExpensesTab managerId={managerId} properties={properties} />;
      case 'vendors': return <VendorsTab managerId={managerId} />;
      case 'communications': return <CommunicationsTab managerId={managerId} properties={properties} initialView="overview" />;
      case 'campaigns': return <CommunicationsTab managerId={managerId} properties={properties} initialView="campaign" />;
      case 'flows': return <CommunicationsTab managerId={managerId} properties={properties} initialView="flows" />;
      case 'templates': return <CommunicationsTab managerId={managerId} properties={properties} initialView="templates" />;
      case 'archives': return <ArchivedTenantsTab managerId={managerId} />;
      case 'audit': return <ActivityLog managerId={managerId} properties={properties} />;
      case 'security': return <SettingsView user={session.user} initialTab="security" />;
      case 'profile': return <SettingsView user={session.user} initialTab="profile" />;
      default: return <PropertiesTab properties={properties} isLoading={isLoading} />;
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-4">
      {renderActiveTab()}
    </div>
  );
}

