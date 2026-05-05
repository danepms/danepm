import { neon } from '@neondatabase/serverless';
import 'dotenv/config';

const sql = neon(process.env.DATABASE_URL);

async function check() {
  const tables = ['user', 'account', 'session', 'verification', 'two_factor', 'passkey'];
  for (const table of tables) {
    const columns = await sql`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = ${table};
    `;
    console.log(`\nColumns in "${table}" table:`);
    columns.forEach(c => console.log(` - ${c.column_name} (${c.data_type})`));
  }
}

check().catch(console.error);
