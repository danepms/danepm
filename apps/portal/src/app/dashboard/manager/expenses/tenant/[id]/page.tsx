"use client";

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { FilteredExpensesView } from '@/components/FilteredExpensesView';
import { api } from '@/lib/api';

export default function TenantExpensesPage() {
  const params = useParams();
  const id = params.id as string;
  const [tenant, setTenant] = useState<any>(null);

  useEffect(() => {
    if (id) {
      api.get<any>(`/tenants/${id}`).then(res => {
        if (res.success) setTenant(res.tenant);
      });
    }
  }, [id]);

  return (
    <div className="p-10">
      <FilteredExpensesView 
        title={tenant?.name || "Loading..."}
        subtitle={`Residency Cost Analysis · Tenant Ledger`}
        filter={{ tenantId: id }}
      />
    </div>
  );
}
