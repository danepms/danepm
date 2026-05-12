import { neon } from '@neondatabase/serverless';
import 'dotenv/config';

const sql = neon(process.env.DATABASE_URL);

async function sync() {
  console.log("Adding user_agent column to system_audit_log...");
  await sql`ALTER TABLE system_audit_log ADD COLUMN IF NOT EXISTS user_agent TEXT;`;
  console.log("Schema synchronized!");
}

sync().catch(console.error);
