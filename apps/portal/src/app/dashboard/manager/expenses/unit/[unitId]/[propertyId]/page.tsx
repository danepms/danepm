"use client";

import React from 'react';
import { useParams } from 'next/navigation';
import { FilteredExpensesView } from '@/components/FilteredExpensesView';

export default function UnitExpensesPage() {
  const params = useParams();
  const unitId = params.unitId as string;
  const propertyId = params.propertyId as string;

  return (
    <div className="p-10">
      <FilteredExpensesView 
        title={`Unit ${unitId}`}
        subtitle={`Room-Level Maintenance History · Registry Audit`}
        filter={{ unitId, propertyId }}
      />
    </div>
  );
}
