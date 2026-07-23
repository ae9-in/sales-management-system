import dotenv from 'dotenv';
import { createClient } from '@libsql/client';

dotenv.config();

const client = createClient({
  url: process.env.TURSO_DB_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

async function main() {
  const tables = ['employees', 'expenses', 'inventory', 'sales'];
  for (const t of tables) {
    const res = await client.execute(`SELECT COUNT(*) as count FROM ${t}`);
    console.log(`${t}: ${res.rows[0].count}`);
  }
}

main().catch(console.error);
