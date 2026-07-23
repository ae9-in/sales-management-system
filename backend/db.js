import { createClient } from "@libsql/client";

let client = null;

export async function connectDB() {
  const url = process.env.TURSO_DB_URL;
  const authToken = process.env.TURSO_AUTH_TOKEN;

  if (!url || !authToken) {
    throw new Error("TURSO_DB_URL or TURSO_AUTH_TOKEN is not defined in environment variables");
  }

  if (!client) {
    client = createClient({
      url,
      authToken,
    });
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

  // Add missing columns to existing tables (safe — ignores if already exists)
  const alterStatements = [
    "ALTER TABLE sales ADD COLUMN customer TEXT DEFAULT 'Walk-in'",
    "ALTER TABLE sales ADD COLUMN rep TEXT DEFAULT ''",
    "ALTER TABLE sales ADD COLUMN status TEXT DEFAULT 'Paid'",
    "ALTER TABLE sales ADD COLUMN method TEXT DEFAULT 'Cash'",
    "ALTER TABLE employees ADD COLUMN phone TEXT DEFAULT ''",
    "ALTER TABLE employees ADD COLUMN area TEXT DEFAULT ''",
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
