import { createClient } from "@libsql/client";
import { env } from "./config/env.js";

let client = null;

export async function connectDB() {
  const url = env.TURSO_DB_URL;
  const authToken = env.TURSO_AUTH_TOKEN;

  if (!client) {
    const config = { url };
    if (authToken) config.authToken = authToken;
    client = createClient(config);
  }

  return client;
}

export async function ensureSchema() {
  const db = getDB();

  // Create tables if they don't exist
  await db.execute(`
    CREATE TABLE IF NOT EXISTS employees (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      position TEXT NOT NULL,
      salary REAL NOT NULL,
      phone TEXT DEFAULT '',
      area TEXT DEFAULT '',
      dateAdded DATETIME DEFAULT CURRENT_TIMESTAMP,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await db.execute(`
    CREATE TABLE IF NOT EXISTS expenses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      category TEXT NOT NULL,
      amount REAL NOT NULL,
      date DATETIME DEFAULT CURRENT_TIMESTAMP,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await db.execute(`
    CREATE TABLE IF NOT EXISTS inventory (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      currentStock REAL NOT NULL,
      reorderLevel REAL NOT NULL,
      price REAL DEFAULT 0,
      dateUpdated DATETIME DEFAULT CURRENT_TIMESTAMP,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  try {
    await db.execute("ALTER TABLE inventory ADD COLUMN price REAL DEFAULT 0");
  } catch (e) {
    // Ignore if column already exists
  }

  await db.execute(`
    CREATE TABLE IF NOT EXISTS sales (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      product TEXT NOT NULL,
      quantity REAL NOT NULL,
      price REAL NOT NULL,
      total REAL NOT NULL,
      customer TEXT DEFAULT 'Walk-in',
      rep TEXT DEFAULT '',
      status TEXT DEFAULT 'Paid',
      method TEXT DEFAULT 'Cash',
      date DATETIME DEFAULT CURRENT_TIMESTAMP,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await db.execute(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL UNIQUE,
      email TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'employee',
      status TEXT NOT NULL DEFAULT 'active',
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Verified bcrypt hash for password "admin" (bcrypt.hashSync('admin', 10))
  try {
    const adminPasswordHash = process.env.ADMIN_PASSWORD_HASH || "$2b$10$MW7o7VDvByDWMaVMisyy/.vH9TpEbbsLcUIkQlCeJRBTEz0SlAqUq";
    
    // Force-update admin password on every boot to ensure login always works
    const existingAdmin = await db.execute("SELECT id FROM users WHERE email = 'superadmin@toksharasales.com'");
    if (existingAdmin.rows.length > 0) {
      await db.execute({
        sql: "UPDATE users SET password = ?, role = 'admin', status = 'active' WHERE email = 'superadmin@toksharasales.com'",
        args: [adminPasswordHash]
      });
    } else {
      await db.execute({
        sql: "INSERT INTO users (username, email, password, role, status) VALUES (?, ?, ?, ?, ?)",
        args: ["admin", "superadmin@toksharasales.com", adminPasswordHash, "admin", "active"]
      });
    }

    const existingAdmin2 = await db.execute("SELECT id FROM users WHERE email = 'admin@toksharasales.com'");
    if (existingAdmin2.rows.length > 0) {
      await db.execute({
        sql: "UPDATE users SET password = ?, role = 'admin', status = 'active' WHERE email = 'admin@toksharasales.com'",
        args: [adminPasswordHash]
      });
    } else {
      await db.execute({
        sql: "INSERT INTO users (username, email, password, role, status) VALUES (?, ?, ?, ?, ?)",
        args: ["admin_user", "admin@toksharasales.com", adminPasswordHash, "admin", "active"]
      });
    }
    console.log("✓ Admin users ensured in users table");
  } catch (e) {
    console.error("Failed to seed default admin:", e);
  }

  // Add missing columns to existing tables (safe — ignores if already exists)
  const alterStatements = [
    "ALTER TABLE sales ADD COLUMN customer TEXT DEFAULT 'Walk-in'",
    "ALTER TABLE sales ADD COLUMN rep TEXT DEFAULT ''",
    "ALTER TABLE sales ADD COLUMN status TEXT DEFAULT 'Paid'",
    "ALTER TABLE sales ADD COLUMN method TEXT DEFAULT 'Cash'",
    "ALTER TABLE employees ADD COLUMN phone TEXT DEFAULT ''",
    "ALTER TABLE employees ADD COLUMN area TEXT DEFAULT ''",
    "ALTER TABLE users ADD COLUMN role TEXT DEFAULT 'employee'",
    "ALTER TABLE users ADD COLUMN status TEXT DEFAULT 'active'",
    "ALTER TABLE sales ADD COLUMN salePointId TEXT DEFAULT 'Main Office'",
    "ALTER TABLE employees ADD COLUMN salePointId TEXT DEFAULT 'Main Office'",
    "ALTER TABLE inventory ADD COLUMN salePointId TEXT DEFAULT 'Main Office'",
    "ALTER TABLE users ADD COLUMN salePointId TEXT DEFAULT 'Main Office'",
  ];

  for (const sql of alterStatements) {
    try { await db.execute(sql); } catch (e) { /* column already exists */ }
  }
}

export function getDB() {
  if (!client) {
    throw new Error("Database not connected. Call connectDB first.");
  }
  return client;
}
