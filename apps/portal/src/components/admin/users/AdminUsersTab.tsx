"use client";

import React, { useState } from 'react';
import { AdminUsersSummary } from './AdminUsersSummary';
import { AdminUsersRoleList } from './AdminUsersRoleList';
import { AdminUserDetail } from './AdminUserDetail';

interface AdminUsersTabProps {
  adminId: string;
}

type ViewState = 'summary' | 'list' | 'detail';

export const AdminUsersTab = ({ adminId }: AdminUsersTabProps) => {
  const [view, setView] = useState<ViewState>('summary');
  const [selectedRole, setSelectedRole] = useState<string>('all');
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  const navigateTo = (newView: ViewState, role?: string, userId?: string) => {
    if (role) setSelectedRole(role);
    if (userId) setSelectedUserId(userId);
    setView(newView);
  };

  return (
    <div className="h-full">
      {view === 'summary' && (
        <AdminUsersSummary 
          adminId={adminId} 
          onNavigate={(v, role) => navigateTo(v, role)} 
        />
      )}
      
      {view === 'list' && (
        <AdminUsersRoleList 
          adminId={adminId} 
          role={selectedRole} 
          onNavigateDetail={(id) => navigateTo('detail', undefined, id)} 
          onBack={() => navigateTo('summary')} 
        />
      )}
      
      {view === 'detail' && selectedUserId && (
        <AdminUserDetail 
          adminId={adminId} 
          userId={selectedUserId} 
          onBack={() => navigateTo('list')} 
        />
      )}
    </div>
  );
};
