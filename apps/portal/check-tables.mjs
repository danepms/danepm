import { neon } from '@neondatabase/serverless';
import 'dotenv/config';

const sql = neon(process.env.DATABASE_URL);

async function check() {
  const tables = [
    'user', 
    'property', 
    'tenant', 
    'invoice', 
    'payment', 
    'settlement_allocation',
    'expense',
    'maintenance_request',
    'vendor',
    'system_audit_log',
    'communication_template',
    'communication_batch',
    'communication_flow'
  ];
  
  for (const table of tables) {
    const columns = await sql`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = ${table};
    `;
    
    if (columns.length === 0) {
        console.log(`\n❌ Table "${table}" DOES NOT EXIST.`);
        continue;
    }

    console.log(`\n✅ Columns in "${table}" table:`);
    columns.forEach(c => console.log(` - ${c.column_name} (${c.data_type})`));
  }
}

check().catch(console.error);
