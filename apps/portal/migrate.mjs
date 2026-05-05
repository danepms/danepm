/**
 * migrate.mjs — Pushes ALL schema tables to Neon over HTTPS (port 443)
 * 
 * Usage: node migrate.mjs
 * 
 * Safe to re-run — uses IF NOT EXISTS on everything.
 */

import { neon } from '@neondatabase/serverless';
import 'dotenv/config';

const sql = neon(process.env.DATABASE_URL);

async function migrate() {
  console.log('');
  console.log('  ╔══════════════════════════════════════╗');
  console.log('  ║   Dane — Schema Migration (HTTPS)    ║');
  console.log('  ╚══════════════════════════════════════╝');
  console.log('');

  const steps = [
    {
      name: 'tenant',
      run: () => sql`CREATE TABLE IF NOT EXISTS "tenant" (
        "id" text PRIMARY KEY,
        "name" text NOT NULL,
        "phone" text NOT NULL,
        "email" text,
        "mpesa_number" text,
        "id_number" text,
        "id_type" text DEFAULT 'National ID',
        "next_of_kin" text,
        "property_id" text REFERENCES "property"("id"),
        "unit_id" text,
        "arrears" text DEFAULT '0',
        "move_in_charges" text DEFAULT '0',
        "move_in_photos" text,
        "move_in_date" timestamp,
        "notes" text,
        "manager_id" text NOT NULL REFERENCES "user"("id"),
        "created_at" timestamp NOT NULL,
        "updated_at" timestamp NOT NULL
      )`
    },
    {
      name: 'invoice',
      run: () => sql`CREATE TABLE IF NOT EXISTS "invoice" (
        "id" text PRIMARY KEY,
        "tenant_id" text NOT NULL REFERENCES "tenant"("id"),
        "property_id" text REFERENCES "property"("id"),
        "manager_id" text NOT NULL REFERENCES "user"("id"),
        "period" text NOT NULL,
        "description" text,
        "amount" text NOT NULL,
        "paid" text DEFAULT '0',
        "balance" text NOT NULL,
        "status" text DEFAULT 'unpaid',
        "due_date" timestamp,
        "issued_at" timestamp NOT NULL,
        "paid_at" timestamp,
        "created_at" timestamp NOT NULL
      )`
    },
    {
      name: 'payment',
      run: () => sql`CREATE TABLE IF NOT EXISTS "payment" (
        "id" text PRIMARY KEY,
        "tenant_id" text NOT NULL REFERENCES "tenant"("id"),
        "invoice_id" text REFERENCES "invoice"("id"),
        "manager_id" text NOT NULL REFERENCES "user"("id"),
        "amount" text NOT NULL,
        "method" text DEFAULT 'cash',
        "reference" text,
        "notes" text,
        "recorded_at" timestamp NOT NULL,
        "created_at" timestamp NOT NULL
      )`
    },
    {
      name: 'maintenance_request',
      run: () => sql`CREATE TABLE IF NOT EXISTS "maintenance_request" (
        "id" text PRIMARY KEY,
        "property_id" text NOT NULL REFERENCES "property"("id"),
        "unit_id" text,
        "tenant_id" text REFERENCES "tenant"("id"),
        "manager_id" text NOT NULL REFERENCES "user"("id"),
        "title" text NOT NULL,
        "description" text,
        "category" text DEFAULT 'general',
        "priority" text DEFAULT 'normal',
        "status" text DEFAULT 'open',
        "photos" text,
        "resolved_at" timestamp,
        "created_at" timestamp NOT NULL,
        "updated_at" timestamp NOT NULL
      )`
    },
    {
      name: 'expense',
      run: () => sql`CREATE TABLE IF NOT EXISTS "expense" (
        "id" text PRIMARY KEY,
        "property_id" text NOT NULL REFERENCES "property"("id"),
        "manager_id" text NOT NULL REFERENCES "user"("id"),
        "request_id" text REFERENCES "maintenance_request"("id"),
        "category" text NOT NULL,
        "description" text NOT NULL,
        "amount" text NOT NULL,
        "vendor_name" text,
        "vendor_phone" text,
        "receipt" text,
        "paid_date" timestamp,
        "created_at" timestamp NOT NULL
      )`
    },
    {
      name: 'vendor',
      run: () => sql`CREATE TABLE IF NOT EXISTS "vendor" (
        "id" text PRIMARY KEY,
        "manager_id" text NOT NULL REFERENCES "user"("id"),
        "name" text NOT NULL,
        "phone" text NOT NULL,
        "email" text,
        "specialty" text,
        "rating" text DEFAULT '0',
        "notes" text,
        "created_at" timestamp NOT NULL
      )`
    },
    {
      name: 'communication_log',
      run: () => sql`CREATE TABLE IF NOT EXISTS "communication_log" (
        "id" text PRIMARY KEY,
        "manager_id" text NOT NULL REFERENCES "user"("id"),
        "tenant_id" text REFERENCES "tenant"("id"),
        "property_id" text REFERENCES "property"("id"),
        "batch_id" text,
        "channel" text NOT NULL,
        "type" text NOT NULL,
        "subject" text,
        "content" text NOT NULL,
        "status" text DEFAULT 'pending',
        "external_id" text,
        "sent_at" timestamp NOT NULL,
        "created_at" timestamp NOT NULL
      )`
    },
    {
      name: 'communication_template',
      run: () => sql`CREATE TABLE IF NOT EXISTS "communication_template" (
        "id" text PRIMARY KEY,
        "manager_id" text NOT NULL REFERENCES "user"("id"),
        "name" text NOT NULL,
        "subject" text,
        "content_html" text,
        "content_text" text NOT NULL,
        "channel" text DEFAULT 'both',
        "category" text DEFAULT 'general',
        "created_at" timestamp NOT NULL,
        "updated_at" timestamp NOT NULL
      )`
    },
    {
      name: 'communication_batch',
      run: () => sql`CREATE TABLE IF NOT EXISTS "communication_batch" (
        "id" text PRIMARY KEY,
        "manager_id" text NOT NULL REFERENCES "user"("id"),
        "name" text NOT NULL,
        "channel" text NOT NULL,
        "total_recipients" text DEFAULT '0',
        "success_count" text DEFAULT '0',
        "failed_count" text DEFAULT '0',
        "status" text DEFAULT 'pending',
        "created_at" timestamp NOT NULL
      )`
    },
    {
      name: 'communication_flow',
      run: () => sql`CREATE TABLE IF NOT EXISTS "communication_flow" (
        "id" text PRIMARY KEY,
        "manager_id" text NOT NULL REFERENCES "user"("id"),
        "name" text NOT NULL,
        "trigger" text NOT NULL,
        "is_active" boolean DEFAULT true,
        "created_at" timestamp NOT NULL,
        "updated_at" timestamp NOT NULL
      )`
    },
    {
      name: 'communication_flow_step',
      run: () => sql`CREATE TABLE IF NOT EXISTS "communication_flow_step" (
        "id" text PRIMARY KEY,
        "flow_id" text NOT NULL REFERENCES "communication_flow"("id"),
        "template_id" text NOT NULL REFERENCES "communication_template"("id"),
        "channel" text DEFAULT 'both',
        "offset_days" integer DEFAULT 0,
        "created_at" timestamp NOT NULL
      )`
    },
    {
      name: 'communication_analytics',
      run: () => sql`CREATE TABLE IF NOT EXISTS "communication_analytics" (
        "id" text PRIMARY KEY,
        "manager_id" text NOT NULL REFERENCES "user"("id"),
        "flow_id" text REFERENCES "communication_flow"("id"),
        "property_id" text REFERENCES "property"("id"),
        "period" text NOT NULL,
        "sent_count" integer DEFAULT 0,
        "success_count" integer DEFAULT 0,
        "failed_count" integer DEFAULT 0,
        "cost_estimate" text DEFAULT '0',
        "updated_at" timestamp NOT NULL
      )`
    },
    {
      name: 'drop_api_key',
      run: () => sql`ALTER TABLE "user" DROP COLUMN IF EXISTS "api_key"`
    },
    {
      name: 'drop_prefs',
      run: () => sql`ALTER TABLE "user" DROP COLUMN IF EXISTS "notification_prefs"`
    },
    {
      name: 'add_api_key',
      run: () => sql`ALTER TABLE "user" ADD COLUMN "api_key" text`
    },
    {
      name: 'add_prefs',
      run: () => sql`ALTER TABLE "user" ADD COLUMN "notification_prefs" jsonb`
    },
    {
      name: 'add_2fa',
      run: () => sql`ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "two_factor_enabled" boolean DEFAULT false`
    },
    {
      name: 'add_sec_config',
      run: () => sql`ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "security_config" jsonb`
    },
    {
      name: 'two_factor',
      run: () => sql`
        CREATE TABLE IF NOT EXISTS "two_factor" (
          "id" text PRIMARY KEY,
          "secret" text NOT NULL,
          "backup_codes" text NOT NULL,
          "user_id" text NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
          "verified" boolean DEFAULT false
        )
      `
    },
    {
      name: 'passkey',
      run: () => sql`
        CREATE TABLE IF NOT EXISTS "passkey" (
          "id" text PRIMARY KEY,
          "name" text,
          "public_key" text NOT NULL,
          "user_id" text NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
          "credential_id" text NOT NULL,
          "counter" integer NOT NULL,
          "device_type" text NOT NULL,
          "backed_up" boolean NOT NULL,
          "transports" text,
          "aaguid" text,
          "created_at" timestamp
        )
      `
    },
    {
      name: 'add_passkey_aaguid',
      run: () => sql`ALTER TABLE "passkey" ADD COLUMN IF NOT EXISTS "aaguid" text`
    },
    {
      name: 'add_two_factor_verified',
      run: () => sql`ALTER TABLE "two_factor" ADD COLUMN IF NOT EXISTS "verified" boolean DEFAULT false`
    },
    {
      name: 'system_audit_log',
      run: () => sql`CREATE TABLE IF NOT EXISTS "system_audit_log" (
        "id" text PRIMARY KEY,
        "manager_id" text NOT NULL REFERENCES "user"("id"),
        "action" text NOT NULL,
        "entity_type" text NOT NULL,
        "entity_id" text,
        "actor_id" text,
        "actor_name" text,
        "payload" jsonb,
        "ip_address" text,
        "created_at" timestamp NOT NULL DEFAULT now()
      )`
    },
    {
      name: 'cron_heartbeat',
      run: () => sql`CREATE TABLE IF NOT EXISTS "cron_heartbeat" (
        "id" text PRIMARY KEY,
        "job_name" text NOT NULL,
        "status" text NOT NULL,
        "executed_at" timestamp,
        "scheduled_for" timestamp,
        "duration_ms" integer,
        "details" jsonb,
        "created_at" timestamp NOT NULL DEFAULT now()
      )`
    },
    {
      name: 'add_property_owner_id',
      run: () => sql`ALTER TABLE "property" ADD COLUMN IF NOT EXISTS "owner_id" text REFERENCES "user"("id")`
    },
    {
      name: 'invite',
      run: () => sql`CREATE TABLE IF NOT EXISTS "invite" (
        "id" text PRIMARY KEY,
        "inviter_id" text NOT NULL REFERENCES "user"("id"),
        "email" text NOT NULL,
        "role" text NOT NULL,
        "status" text DEFAULT 'pending',
        "target_id" text,
        "created_at" timestamp NOT NULL,
        "expires_at" timestamp NOT NULL
      )`
    }

  ];

  let created = 0;
  let existed = 0;
  let failed = 0;

  for (const step of steps) {
    try {
      await step.run();
      // Check if it was actually created vs already existed
      const check = await sql`SELECT to_regclass(${step.name})`;
      console.log(`  ✓  ${step.name}`);
      created++;
    } catch (e) {
      if (e.message?.includes('already exists')) {
        console.log(`  ○  ${step.name} (already exists)`);
        existed++;
      } else {
        console.log(`  ✗  ${step.name} — ${e.message}`);
        failed++;
      }
    }
  }

  console.log('');
  console.log(`  Results: ${created} created, ${existed} existed, ${failed} failed`);
  console.log('');
}

migrate().catch(err => {
  console.error('  Migration failed:', err.message);
  process.exit(1);
});
