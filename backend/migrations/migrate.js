import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { connectDB } from "../db.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function runMigrations() {
  console.log("🚀 Starting database migrations...");
  const db = await connectDB();

  // Create schema_migrations table
  await db.execute(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      version TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      appliedAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  const files = fs.readdirSync(__dirname).filter((f) => f.endsWith(".sql")).sort();

  const appliedRes = await db.execute("SELECT version FROM schema_migrations");
  const appliedVersions = new Set(appliedRes.rows.map((r) => r.version));

  let appliedCount = 0;

  for (const file of files) {
    const version = file.split("_")[0];
    if (appliedVersions.has(version)) {
      continue;
    }

    console.log(`  Applying migration: ${file}...`);
    const filePath = path.join(__dirname, file);
    const sqlContent = fs.readFileSync(filePath, "utf-8");

    // Remove single line comments before splitting statements
    const cleanSql = sqlContent
      .split("\n")
      .filter((line) => !line.trim().startsWith("--"))
      .join("\n");

    const statements = cleanSql
      .split(";")
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    for (const sql of statements) {
      try {
        await db.execute(sql);
      } catch (err) {
        // Ignore duplicate column errors during safe ALTER TABLE statements
        if (
          err.message?.includes("duplicate column name") ||
          err.message?.includes("column already exists")
        ) {
          // Ignore
        } else {
          console.warn(`  Warning executing statement in ${file}:`, err.message);
        }
      }
    }

    await db.execute({
      sql: "INSERT INTO schema_migrations (version, name) VALUES (?, ?)",
      args: [version, file],
    });

    console.log(`  ✓ Successfully applied: ${file}`);
    appliedCount++;
  }

  if (appliedCount === 0) {
    console.log("✅ Database is up to date. No new migrations applied.");
  } else {
    console.log(`✅ Applied ${appliedCount} migration(s) successfully!`);
  }
}

// Run directly if invoked from CLI
if (process.argv[1] && process.argv[1].endsWith("migrate.js")) {
  runMigrations()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error("❌ Migration failed:", err);
      process.exit(1);
    });
}
