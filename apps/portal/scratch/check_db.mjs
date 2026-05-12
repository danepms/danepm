import { neon } from '@neondatabase/serverless';
import 'dotenv/config';

async function check() {
  const sql = neon(process.env.DATABASE_URL);
  const res = await sql`SELECT config, "residential_units", "commercial_units" FROM property WHERE id = 'd491deb8-e309-420c-a27f-b435c3db8edb'`;
  console.log(JSON.stringify(res[0], null, 2));
}

check().catch(console.error);
