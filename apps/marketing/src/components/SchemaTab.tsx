"use client";

import React, { useState } from 'react';
import { Code, Terminal, FileJson, GitBranch } from 'lucide-react';

export default function SchemaTab() {
  const [activeCode, setActiveCode] = useState<'drizzle' | 'api' | 'architecture'>('drizzle');

  const drizzleCode = `// packages/database/src/schema.ts
import { pgTable, uuid, text, numeric, timestamp, varchar } from 'drizzle-orm/pg-core';

export const tenant = pgTable('tenant', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  phoneNumber: varchar('phone_number', { length: 20 }).notNull(),
  email: text('email'),
  unitId: uuid('unit_id').references(() => unit.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const invoice = pgTable('invoice', {
  id: uuid('id').defaultRandom().primaryKey(),
  tenantId: uuid('tenant_id').references(() => tenant.id).notNull(),
  amount: numeric('amount', { precision: 12, scale: 2 }).notNull(),
  status: varchar('status', { length: 20 }).default('pending').notNull(), // pending, paid, partial
  dueDate: timestamp('due_date').notNull(),
});

export const payment = pgTable('payment', {
  id: uuid('id').defaultRandom().primaryKey(),
  amount: numeric('amount', { precision: 12, scale: 2 }).notNull(),
  channel: varchar('channel', { length: 50 }).notNull(), // MPESA, PAYSTACK, BANK
  reference: varchar('reference', { length: 100 }).unique().notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});`;

  const apiPayload = `{
  "TransactionType": "Pay Bill",
  "TransID": "LKT89JK23F",
  "TransTime": "20260527045339",
  "TransAmount": "45000.00",
  "BusinessShortCode": "600900",
  "BillRefNumber": "UNIT-A3-DANE",
  "MSISDN": "254712345678",
  "FirstName": "John",
  "MiddleName": "K.",
  "LastName": "Doe"
}`;

  const architectureInfo = `Monorepo Architecture Structure:
------------------------------------------
apps/
  ├── api/          # NestJS backend framework serving REST operations & Webhooks
  ├── portal/       # Next.js 16 Web Dashboard interface for Property Managers
  └── marketing/    # Next.js Static site detailing features, APIs, and schemas
packages/
  └── database/     # Drizzle ORM schemas, migration states, and connection engines
  
Primary Deployment Target: Railway (Nixpacks environment deployment pipeline)
Core Database Engine: Neon Serverless PostgreSQL with pgBouncer pooling integration.`;

  return (
    <div className="space-y-6 animate-fade-in font-sans">
      
      {/* Code Editor Container */}
      <div className="glass rounded-2xl border border-[var(--border)] overflow-hidden flex flex-col justify-between">
        
        {/* Editor Tab bar */}
        <div className="flex items-center justify-between px-4 py-3 bg-[#0c0c0c] border-b border-[var(--border)]">
          <div className="flex items-center gap-2">
            {[
              { id: 'drizzle', label: 'schema.ts (Drizzle)', icon: Code },
              { id: 'api', label: 'mpesa-webhook.json', icon: FileJson },
              { id: 'architecture', label: 'workspace-architecture.txt', icon: GitBranch }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveCode(tab.id as any)}
                className={`px-3 py-1.5 rounded-lg font-mono text-[9px] font-bold uppercase transition-all flex items-center gap-2 ${
                  activeCode === tab.id
                    ? 'bg-white/10 text-white border border-white/5'
                    : 'text-[var(--text-muted)] hover:text-white'
                }`}
              >
                <tab.icon size={11} />
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
            <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/80" />
            <div className="w-2.5 h-2.5 rounded-full bg-green-500/80" />
          </div>
        </div>

        {/* Code Content Editor Area */}
        <div className="p-6 bg-[#070707] font-mono text-[11px] leading-relaxed text-[var(--text-muted)] overflow-x-auto min-h-[350px] relative">
          <pre className="text-left select-all whitespace-pre">
            <code>
              {activeCode === 'drizzle' && drizzleCode}
              {activeCode === 'api' && apiPayload}
              {activeCode === 'architecture' && architectureInfo}
            </code>
          </pre>

          {/* Glowing badge indicator */}
          <div className="absolute bottom-4 right-4 bg-[#111] px-3 py-1 rounded border border-[#222] text-[8px] uppercase font-bold text-[var(--accent)] tracking-wider">
            {activeCode === 'drizzle' && 'Drizzle ORM Model Schema'}
            {activeCode === 'api' && 'JSON API Webhook Spec'}
            {activeCode === 'architecture' && 'Monorepo Spec Graph'}
          </div>
        </div>

      </div>

      {/* Database Telemetry Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="glass p-4 rounded-xl border border-[var(--border)] font-mono text-[10px]">
          <span className="text-[9px] text-[var(--text-muted)] uppercase block mb-1">Database ORM</span>
          <div className="text-sm font-bold text-white">Drizzle Engine v0.45.2</div>
          <span className="text-[9px] text-[var(--text-dim)]">Type-safe SQL queries compilation</span>
        </div>
        <div className="glass p-4 rounded-xl border border-[var(--border)] font-mono text-[10px]">
          <span className="text-[9px] text-[var(--text-muted)] uppercase block mb-1">Serverless Provider</span>
          <div className="text-sm font-bold text-white">Neon Serverless PostgreSQL</div>
          <span className="text-[9px] text-[var(--text-dim)]">With dynamic autoscaling clusters</span>
        </div>
        <div className="glass p-4 rounded-xl border border-[var(--border)] font-mono text-[10px]">
          <span className="text-[9px] text-[var(--text-muted)] uppercase block mb-1">Migrations Engine</span>
          <div className="text-sm font-bold text-white">drizzle-kit migration manager</div>
          <span className="text-[9px] text-[var(--text-dim)]">Automated schema syncing loops</span>
        </div>
      </div>

    </div>
  );
}
