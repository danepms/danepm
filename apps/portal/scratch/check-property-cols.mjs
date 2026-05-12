
import 'dotenv/config';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL);

async function checkCols() {
  const res = await sql`
    SELECT column_name, data_type 
    FROM information_schema.columns 
    WHERE table_name = 'property'
  `;
  console.log(JSON.stringify(res, null, 2));
}

checkCols().catch(console.error);
