import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '../packages/database/src/schema.js';
import { eq } from 'drizzle-orm';
import * as dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env from portal
dotenv.config({ path: path.resolve(__dirname, '../apps/portal/.env') });

const connectionString = process.env.DATABASE_URL;

async function checkSessions() {
    if (!connectionString) {
        console.error("DATABASE_URL is missing!");
        return;
    }
    
    console.log("Connecting to DB...");
    const client = postgres(connectionString);
    const db = drizzle(client, { schema });

    try {
        const email = 'fic.callus@gmail.com';
        console.log(`Checking sessions for ${email}...`);

        const users = await db.select().from(schema.user).where(eq(schema.user.email, email)).limit(1);
        if (users.length === 0) {
            console.log("User not found.");
            return;
        }

        const user = users[0];
        console.log(`User ID: ${user.id}`);

        const sessions = await db.select().from(schema.session).where(eq(schema.session.userId, user.id));
        console.log(`Found ${sessions.length} sessions.`);

        sessions.forEach(s => {
            console.log(`- ID: ${s.id.slice(0, 10)}... Token: ${s.token.slice(0, 10)}... Expires: ${s.expiresAt}`);
        });

    } catch (error) {
        console.error("DB Check Failed:", error);
    } finally {
        await client.end();
    }
}

checkSessions();
