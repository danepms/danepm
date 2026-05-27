"use client";

import React, { useState, useEffect } from 'react';
import { 
  Send, Zap, BarChart3, Clock, Copy
} from 'lucide-react';
import { api } from '@/lib/api';
import { useToast } from '@/context/ToastContext';

// Sub-components
import { CommSummary } from './communications/CommSummary';
import { CommBroadcast } from './communications/CommBroadcast';
import { CommAutomation } from './communications/CommAutomation';
import { CommVault } from './communications/CommVault';
import { CommModals } from './communications/CommModals';

interface CommunicationsTabProps {
  managerId: string;
  properties: any[];
  initialView?: 'overview' | 'campaign' | 'templates' | 'history' | 'flows';
}

export const CommunicationsTab = ({ managerId, properties, initialView = 'overview' }: CommunicationsTabProps) => {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<'overview' | 'campaign' | 'templates' | 'history' | 'flows' | 'upcoming'>(initialView);
  
  // Data State
  const [templates, setTemplates] = useState<any[]>([]);
  const [batches, setBatches] = useState<any[]>([]);
  const [flows, setFlows] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [overdueTenants, setOverdueTenants] = useState<any[]>([]);
  const [upcoming, setUpcoming] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Campaign Builder State
  const [targeting, setTargeting] = useState({ propertyId: '', hasArrears: false, status: '' });
  const [recipients, setRecipients] = useState<any[]>([]);
  const [selectedRecipientIds, setSelectedRecipientIds] = useState<string[]>([]);
  const [channel, setChannel] = useState<'sms' | 'email' | 'both'>('sms');
  const [campaignName, setCampaignName] = useState('');
  const [customContent, setCustomContent] = useState('');
  const [customSubject, setCustomSubject] = useState('');
  const [isPreflight, setIsPreflight] = useState(false);
  const [isSending, setIsSending] = useState(false);

  // Editor States
  const [editingTemplate, setEditingTemplate] = useState<any>(null);
  const [editingFlow, setEditingFlow] = useState<any>(null);
  const [flowTab, setFlowTab] = useState<'manage' | 'analytics' | 'nudges' | 'queue'>('manage');

  useEffect(() => {
    setActiveTab(initialView);
  }, [initialView]);

  useEffect(() => {
    loadInitialData();
  }, [managerId]);

  const loadInitialData = async () => {
    setIsLoading(true);
    const [tplRes, batchRes, flowRes, anaRes, overdueRes, upRes] = await Promise.all([
      api.get<any>(`/communications/templates?managerId=${managerId}`),
      api.get<any>(`/communications/batches?managerId=${managerId}`),
      api.get<any>(`/communications/flows?managerId=${managerId}`),
      api.get<any>(`/communications/analytics?managerId=${managerId}`),
      api.get<any>(`/finance/arrears-ledger?managerId=${managerId}`),
      api.get<any>(`/communications/upcoming?managerId=${managerId}`)
    ]);
    if (tplRes.success) setTemplates(tplRes.templates || []);
    if (batchRes.success) setBatches(batchRes.batches || []);
    if (flowRes.success) setFlows(flowRes.flows || []);
    if (anaRes.success) setAnalytics(anaRes);
    if (overdueRes.success) setOverdueTenants(overdueRes.ledger || []);
    if (upRes.success) setUpcoming(upRes.upcoming || []);
    setIsLoading(false);
  };

  const getVariables = () => [
    '{{tenant_name}}', '{{unit_name}}', '{{property_name}}', 
    '{{total_amount}}', '{{due_date}}', '{{invoice_month}}',
    '{{base_rent}}', '{{utility_total}}', '{{property_location}}'
  ];

  const refreshRecipients = async () => {
    const res = await api.get<any>(`/communications/targeted-tenants?managerId=${managerId}&propertyId=${targeting.propertyId || ''}&hasArrears=${targeting.hasArrears}&status=${targeting.status || ''}`);
    if (res.success) {
      setRecipients(res.tenants || []);
      setSelectedRecipientIds((res.tenants || []).map((t: any) => t.id));
    }
  };

  const handleLaunch = async () => {
    setIsSending(true);
    const res = await api.post<any>("/communications/launch-campaign", {
      managerId,
      name: campaignName || `Broadcast ${new Date().toLocaleDateString()}`,
      recipientIds: selectedRecipientIds,
      channel,
      customSubject,
      customContent
    });

    if (res.success) {
      showToast("Messages Sent", "success");
      setActiveTab('history');
      loadInitialData();
      setIsPreflight(false);
      setCampaignName('');
      setCustomContent('');
      setCustomSubject('');
    } else {
      showToast(res.error || "Failed to send", "error");
    }
    setIsSending(false);
  };

  const handleSaveTemplate = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await api.post<any>("/communications/templates", { ...editingTemplate, managerId });
    if (res.success) {
      showToast("Blueprint Saved", "success");
      setEditingTemplate(null);
      loadInitialData();
    }
  };

  const saveFlow = async (flow: any) => {
    const res = await api.post<any>("/communications/flows", { ...flow, managerId });
    if (res.success) {
      showToast(flow.id ? "Sequence Updated" : "Intelligence Activated", "success");
      setEditingFlow(null);
      loadInitialData();
    }
    return res;
  };

  const handleSaveFlow = async (e: React.FormEvent) => {
    e.preventDefault();
    await saveFlow(editingFlow);
  };

  const handleManualNudge = async () => {
    if (selectedRecipientIds.length === 0) return;
    showToast(`Initializing collection nudge for ${selectedRecipientIds.length} tenants...`, "info");
    const flow = flows.find(f => f.trigger === 'manual_nudge');
    if (!flow) {
      showToast("No 'Manual Nudge' sequence defined. Create one in Flows first.", "error");
      return;
    }
    for (const tenantId of selectedRecipientIds) {
      await api.post<any>("/communications/trigger-flow", { managerId, trigger: 'manual_nudge', tenantId });
    }
    showToast("Collection sequence fired.", "success");
    setSelectedRecipientIds([]);
  };

  const triggerOptions = [
    { id: 'invoice_generated', label: 'New Invoice Issued' },
    { id: 'payment_received', label: 'Payment Received' },
    { id: 'maintenance_updated', label: 'Maintenance Updated' },
    { id: 'tenant_added', label: 'New Tenant (Move-in)' },
    { id: 'manual_nudge', label: 'Manual Nudge Trigger' }
  ];

  if (isLoading) {
    return (
       <div className="h-[60vh] flex flex-col items-center justify-center gap-5">
          <Zap size={48} className="animate-pulse text-[var(--accent-bg)]" />
          <p className="font-mono text-[10px] uppercase font-black tracking-widest opacity-40">Synchronizing Ledger...</p>
       </div>
    );
  }

  return (
    <div className="space-y-8 animate-reveal">
      
      {/* --- HEADER --- */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 bg-[var(--bg-panel)] p-8 rounded border border-[var(--border)] border-opacity-10 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-5">
           <Zap size={120} />
        </div>
        <div className="relative z-10">
          <h2 className="text-4xl font-black tracking-tighter text-[var(--text-base)]">Communications</h2>
          <p className="text-xs text-[var(--text-muted)] font-medium mt-1">
            Enterprise Engagement Hub • danesproperties.com
          </p>
        </div>

        <div className="flex bg-[var(--bg-ghost)] p-1 rounded-sm border border-[var(--border)] border-opacity-10 relative z-10 overflow-x-auto max-w-full no-scrollbar">
          {[
            { id: 'overview', label: 'Summary', icon: BarChart3 },
            { id: 'campaign', label: 'Broadcast', icon: Send },
            { id: 'flows', label: 'Automation', icon: Zap },
            { id: 'templates', label: 'Vault', icon: Copy },
            { id: 'history', label: 'Archive', icon: Clock }
          ].map(v => (
            <button
              key={v.id}
              onClick={() => setActiveTab(v.id as any)}
              className={`px-6 py-2.5 rounded-sm text-[11px] font-black uppercase tracking-widest transition-all flex items-center gap-2.5 whitespace-nowrap ${activeTab === v.id ? 'bg-[var(--text-base)] text-[var(--bg-panel)] shadow-lg scale-105' : 'text-[var(--text-muted)] hover:text-[var(--text-base)]'}`}
            >
              <v.icon size={14} />
              {v.label}
            </button>
          ))}
        </div>
      </div>

      <div className="min-h-[60vh]">
        {activeTab === 'overview' && (
          <CommSummary 
            analytics={analytics} flows={flows} batches={batches} 
            setActiveTab={setActiveTab} setFlowTab={setFlowTab} 
          />
        )}

        {activeTab === 'campaign' && (
          <CommBroadcast 
            managerId={managerId} properties={properties} templates={templates}
            refreshRecipients={refreshRecipients} targeting={targeting}
            setTargeting={setTargeting} channel={channel} setChannel={setChannel}
            recipients={recipients} selectedRecipientIds={selectedRecipientIds}
            setSelectedRecipientIds={setSelectedRecipientIds}
            customSubject={customSubject} setCustomSubject={setCustomSubject}
            customContent={customContent} setCustomContent={setCustomContent}
            setIsPreflight={setIsPreflight} getVariables={getVariables}
          />
        )}

        {activeTab === 'flows' && (
          <CommAutomation 
            flows={flows} flowTab={flowTab} setFlowTab={setFlowTab}
            setEditingFlow={setEditingFlow} triggerOptions={triggerOptions}
            saveCommunicationFlow={saveFlow} loadInitialData={loadInitialData}
            analytics={analytics} overdueTenants={overdueTenants}
            selectedRecipientIds={selectedRecipientIds} setSelectedRecipientIds={setSelectedRecipientIds}
            handleManualNudge={handleManualNudge}
          />
        )}

        {(activeTab === 'templates' || activeTab === 'history' || activeTab === 'upcoming') && (
           <CommVault 
              templates={templates} batches={batches} upcoming={upcoming}
              activeTab={activeTab === 'history' ? 'history' : activeTab === 'upcoming' ? 'upcoming' : 'templates'}
              setActiveTab={setActiveTab} setEditingTemplate={setEditingTemplate}
           />
        )}
      </div>

      <CommModals 
        editingFlow={editingFlow} setEditingFlow={setEditingFlow}
        templates={templates} triggerOptions={triggerOptions} onSaveFlow={handleSaveFlow}
        isPreflight={isPreflight} setIsPreflight={setIsPreflight}
        recipients={recipients} selectedRecipientIds={selectedRecipientIds}
        setSelectedRecipientIds={setSelectedRecipientIds}
        customSubject={customSubject} customContent={customContent}
        channel={channel} isSending={isSending} handleLaunch={handleLaunch}
        editingTemplate={editingTemplate} setEditingTemplate={setEditingTemplate}
        onSaveTemplate={handleSaveTemplate}
      />
    </div>
  );
};
