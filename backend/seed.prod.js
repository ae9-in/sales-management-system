import bcrypt from "bcryptjs";
import { createClient } from "@libsql/client";
import { env } from "./config/env.js";
import { ensureSchema } from "./db.js";

async function main() {
  console.log("🔒 [PROD SEED] Running additive production seed...");

  const adminPassword = env.SEED_ADMIN_PASSWORD || process.env.SEED_ADMIN_PASSWORD;
  if (!adminPassword) {
    console.error("❌ CRITICAL: SEED_ADMIN_PASSWORD environment variable is required to run production seed.");
    process.exit(1);
  }

  const clientConfig = { url: env.TURSO_DB_URL };
  if (env.TURSO_AUTH_TOKEN) clientConfig.authToken = env.TURSO_AUTH_TOKEN;
  const client = createClient(clientConfig);

  // Ensure schema tables exist safely
  await ensureSchema();

  // Check existing admin count
  const adminCountRes = await client.execute("SELECT COUNT(*) as count FROM users WHERE role = 'admin'");
  const adminCount = adminCountRes.rows[0].count;

  if (adminCount > 0) {
    console.log("ℹ️ Admin account already exists. Skipping production super-admin creation.");
    return;
  }

  const adminPasswordHash = await bcrypt.hash(adminPassword, 12);

  await client.execute({
    sql: "INSERT OR IGNORE INTO users (username, email, password, role, status, mustChangePassword) VALUES (?, ?, ?, ?, ?, ?)",
    args: ["admin", "superadmin@toksharasales.com", adminPasswordHash, "admin", "active", 0],
  });

  await client.execute({
    sql: "INSERT OR IGNORE INTO users (username, email, password, role, status, mustChangePassword) VALUES (?, ?, ?, ?, ?, ?)",
    args: ["admin_user", "admin@toksharasales.com", adminPasswordHash, "admin", "active", 0],
  });

  console.log("✅ Production admin users seeded safely.");
}

main().catch((err) => {
  console.error("❌ Production seed failed:", err);
  process.exit(1);
});
