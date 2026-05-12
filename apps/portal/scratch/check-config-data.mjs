
import 'dotenv/config';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL);

async function checkConfig() {
  console.log("--- AUDITING PROPERTY CONFIGS (LOOKING FOR ANOMALIES) ---");
  const properties = await sql`SELECT id, name, config FROM property`;
  
  let corruptedCount = 0;
  for (const prop of properties) {
    if (typeof prop.config === 'string') {
        console.log(`❌ STRING DETECTED: Property ${prop.name} (${prop.id}) has string config: ${prop.config.slice(0, 50)}...`);
        if (prop.config === "[object Object]") {
            console.log(`🔥 CRITICAL: Property ${prop.name} (${prop.id}) is corrupted with "[object Object]" string!`);
            corruptedCount++;
        }
    }
  }
  
  if (corruptedCount === 0) {
      console.log("✅ No [object Object] corruptions found in the database.");
  } else {
      console.log(`⚠️ Found ${corruptedCount} corrupted records.`);
  }
}

checkConfig().catch(console.error);
