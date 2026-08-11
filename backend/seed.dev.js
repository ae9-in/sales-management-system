import crypto from "crypto";
import bcrypt from "bcryptjs";
import { createClient } from "@libsql/client";
import { env } from "./config/env.js";

if (env.NODE_ENV === "production") {
  console.error("❌ Refusing to run dev seed script in production environment.");
  process.exit(1);
}

const clientConfig = { url: env.TURSO_DB_URL };
if (env.TURSO_AUTH_TOKEN) clientConfig.authToken = env.TURSO_AUTH_TOKEN;
const client = createClient(clientConfig);

function getOffsetDate(daysOffset, hoursOffset = 0, minsOffset = 0) {
  const d = new Date();
  d.setDate(d.getDate() - daysOffset);
  d.setHours(d.getHours() - hoursOffset);
  d.setMinutes(d.getMinutes() - minsOffset);
  return d.toISOString();
}

async function main() {
  console.log("🌱 [DEV SEED] Re-seeding database for development...");

  await client.execute("DROP TABLE IF EXISTS sales");
  await client.execute("DROP TABLE IF EXISTS inventory");
  await client.execute("DROP TABLE IF EXISTS expenses");
  await client.execute("DROP TABLE IF EXISTS employees");
  await client.execute("DROP TABLE IF EXISTS users");

  await client.execute(`
    CREATE TABLE users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL UNIQUE,
      email TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'employee',
      status TEXT NOT NULL DEFAULT 'active',
      mustChangePassword INTEGER DEFAULT 1,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  const adminUsername = "admin";
  const adminEmail = "superadmin@toksharasales.com";

  let plainPassword = env.SEED_ADMIN_PASSWORD;
  let isGeneratedPassword = false;
  if (!plainPassword) {
    plainPassword = env.NODE_ENV === "development" ? "admin" : crypto.randomBytes(16).toString("hex");
    isGeneratedPassword = true;
  }

  const adminPasswordHash = await bcrypt.hash(plainPassword, 12);

  await client.execute({
    sql: "INSERT INTO users (username, email, password, role, status, mustChangePassword) VALUES (?, ?, ?, ?, ?, ?)",
    args: [adminUsername, adminEmail, adminPasswordHash, "admin", "active", 1],
  });
  console.log("✓ Seeded default admin user");
  if (isGeneratedPassword) {
    console.log(`🔑 DEV ADMIN CREDENTIALS: Email: ${adminEmail} | Password: ${plainPassword}`);
  }

  await client.execute(`
    CREATE TABLE employees (
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

  await client.execute(`
    CREATE TABLE expenses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      category TEXT NOT NULL,
      amount REAL NOT NULL,
      date DATETIME DEFAULT CURRENT_TIMESTAMP,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await client.execute(`
    CREATE TABLE inventory (
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

  await client.execute(`
    CREATE TABLE sales (
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

  // EMPLOYEES
  const employees = [
    { name: "Arjun Kumar", position: "Sales Executive", salary: 18000, phone: "9876543210", area: "Bangalore" },
    { name: "Neha Singh", position: "Sales Executive", salary: 18500, phone: "9123456780", area: "Delhi" },
    { name: "Rohit Verma", position: "Sales Executive", salary: 17500, phone: "9988776655", area: "Mumbai" },
    { name: "Karan Shah", position: "Sales Executive", salary: 19000, phone: "9312456789", area: "Ahmedabad" },
    { name: "Pooja Mehta", position: "Sales Executive", salary: 17000, phone: "9098877766", area: "Pune" },
  ];

  for (const emp of employees) {
    await client.execute({
      sql: "INSERT INTO employees (name, position, salary, phone, area, dateAdded) VALUES (?, ?, ?, ?, ?, ?)",
      args: [emp.name, emp.position, emp.salary, emp.phone, emp.area, getOffsetDate(30)],
    });
  }
  console.log("✓ Seeded employees");

  // INVENTORY
  const products = [
    { name: "Dell Inspiron 15 Laptop", currentStock: 15, reorderLevel: 5 },
    { name: "HP LaserJet Pro Printer", currentStock: 8, reorderLevel: 3 },
    { name: "Ergonomic Office Chair", currentStock: 25, reorderLevel: 5 },
    { name: "Office Desk - Wooden", currentStock: 10, reorderLevel: 2 },
    { name: "Antivirus Software", currentStock: 9999, reorderLevel: 10 },
    { name: "Cloud Storage 1TB", currentStock: 9999, reorderLevel: 10 },
    { name: "Website Development", currentStock: 9999, reorderLevel: 5 },
    { name: "Digital Marketing Service", currentStock: 9999, reorderLevel: 5 },
    { name: "Wireless Headset", currentStock: 30, reorderLevel: 10 },
    { name: "Wireless Mouse", currentStock: 5, reorderLevel: 5 },
  ];

  for (const prod of products) {
    await client.execute({
      sql: "INSERT INTO inventory (name, currentStock, reorderLevel, dateUpdated) VALUES (?, ?, ?, ?)",
      args: [prod.name, prod.currentStock, prod.reorderLevel, getOffsetDate(10)],
    });
  }
  console.log("✓ Seeded inventory");

  // SALES
  const reps = ["Arjun Kumar", "Neha Singh", "Rohit Verma", "Karan Shah", "Pooja Mehta"];
  const customers = ["Rajesh Enterprises", "Gupta & Sons", "Sharma Traders", "Kumar Industries", "Verma Corporation"];
  const statuses = ["Paid", "Paid", "Paid", "Pending", "Paid"];
  const methods = ["UPI", "Cash", "Card", "Bank Transfer", "UPI"];

  const sales = [
    { product: "Dell Inspiron 15 Laptop", quantity: 1, price: 45000, daysOffset: 0 },
    { product: "HP LaserJet Pro Printer", quantity: 1, price: 18500, daysOffset: 0 },
    { product: "Ergonomic Office Chair", quantity: 2, price: 7500, daysOffset: 0 },
    { product: "Office Desk - Wooden", quantity: 1, price: 12000, daysOffset: 0 },
    { product: "Wireless Headset", quantity: 5, price: 2999, daysOffset: 0 },
  ];

  for (let i = 0; i < sales.length; i++) {
    const s = sales[i];
    const total = s.quantity * s.price;
    const rep = reps[i % reps.length];
    const customer = customers[i % customers.length];
    const status = statuses[i % statuses.length];
    const method = methods[i % methods.length];
    const date = getOffsetDate(s.daysOffset, i % 4, (i * 12) % 60);

    await client.execute({
      sql: "INSERT INTO sales (product, quantity, price, total, customer, rep, status, method, date) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
      args: [s.product, s.quantity, s.price, total, customer, rep, status, method, date],
    });
  }
  console.log("✓ Seeded sales");

  // EXPENSES
  const expenses = [
    { category: "Rent", amount: 50000, daysOffset: 15 },
    { category: "Electricity", amount: 12500, daysOffset: 10 },
    { category: "Internet & Telephone", amount: 3500, daysOffset: 8 },
  ];

  for (const exp of expenses) {
    await client.execute({
      sql: "INSERT INTO expenses (category, amount, date) VALUES (?, ?, ?)",
      args: [exp.category, exp.amount, getOffsetDate(exp.daysOffset)],
    });
  }
  console.log("✓ Seeded expenses");

  console.log("✅ Development database seeding completed successfully!");
}

main().catch(console.error);
