import { neon } from '@neondatabase/serverless';
import 'dotenv/config';

const sql = neon(process.env.DATABASE_URL);

async function sync() {
  console.log("Synchronizing tenant table schema...");
  
  await sql`ALTER TABLE tenant ADD COLUMN IF NOT EXISTS move_out_date TIMESTAMP;`;
  await sql`ALTER TABLE tenant ADD COLUMN IF NOT EXISTS move_out_photos TEXT;`;
  await sql`ALTER TABLE tenant ADD COLUMN IF NOT EXISTS final_statement TEXT;`;
  await sql`ALTER TABLE tenant ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active';`;
  
  console.log("Schema synchronized successfully!");
}

sync().catch(console.error);
