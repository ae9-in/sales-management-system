import test from "node:test";
import assert from "node:assert/strict";
import fs from "fs";
import path from "path";

// Force test environment and dedicated test DB before loading config modules
process.env.NODE_ENV = "test";
process.env.TURSO_DB_URL = "file:test.db";
process.env.JWT_SECRET = "akshara_sales_test_secret_key_32chars_min";
process.env.CORS_ALLOWED_ORIGINS = "http://localhost:5173,http://localhost:3000";

// Clean up previous test database if exists
try {
  if (fs.existsSync(path.resolve("test.db"))) {
    fs.unlinkSync(path.resolve("test.db"));
  }
} catch (e) {
  // Ignore
}

const { env } = await import("./config/env.js");
const { connectDB, getDB } = await import("./db.js");
const { runMigrations } = await import("./migrations/migrate.js");
const { getSalePointScope } = await import("./utils/scope.js");
const { getCrmStatus, syncCustomerToCrm } = await import("./services/crmService.js");
const { getPosStatus, syncPosTransaction } = await import("./services/posService.js");
const { getMarketingStatus, triggerMarketingCampaign } = await import("./services/marketingService.js");

test("1. Environment Validation Test", () => {
  assert.equal(env.NODE_ENV, "test");
  assert.ok(env.JWT_SECRET.length >= 32);
});

test("2. Database Migration Test", async () => {
  await runMigrations();
  const db = await connectDB();
  const result = await db.execute("SELECT name FROM sqlite_master WHERE type='table'");
  const tables = result.rows.map((r) => r.name);
  assert.ok(tables.includes("schema_migrations"));
  assert.ok(tables.includes("users"));
  assert.ok(tables.includes("sales"));
});

test("3. Per-Sale-Point Row-Level Scoping Test", () => {
  const adminScope = getSalePointScope({ role: "admin", username: "admin" });
  assert.equal(adminScope.isScoped, false);

  const employeeScopeBangalore = getSalePointScope({ role: "employee", area: "Bangalore" });
  assert.equal(employeeScopeBangalore.isScoped, true);
  assert.equal(employeeScopeBangalore.salePointId, "Bangalore");

  const sqlWhere = employeeScopeBangalore.sqlWhere("WHERE 1=1");
  assert.ok(sqlWhere.includes("salePointId = ? OR area = ?"));
});

test("4. Integrations Status & Sync Fallback Test", async () => {
  const crmStatus = getCrmStatus();
  assert.equal(crmStatus.configured, false);
  assert.equal(crmStatus.status, "disabled");

  const posStatus = getPosStatus();
  assert.equal(posStatus.configured, false);

  const mktStatus = getMarketingStatus();
  assert.equal(mktStatus.configured, false);

  const crmSync = await syncCustomerToCrm({ name: "Acme Corp", email: "info@acme.com" });
  assert.equal(crmSync.success, false);
  assert.equal(crmSync.mode, "disabled");

  const posSync = await syncPosTransaction({ amount: 150, items: 2 });
  assert.equal(posSync.success, false);
  assert.equal(posSync.mode, "disabled");

  const mktSync = await triggerMarketingCampaign({ campaignName: "Summer Sale" });
  assert.equal(mktSync.success, false);
  assert.equal(mktSync.mode, "disabled");
});

test("5. Data Scoping & Record Filtering Test", async () => {
  const db = getDB();

  // Clear existing sales
  await db.execute("DELETE FROM sales");

  // Insert sales for Bangalore and Delhi
  await db.execute({
    sql: "INSERT INTO sales (product, quantity, price, total, rep, salePointId, area) VALUES (?, ?, ?, ?, ?, ?, ?)",
    args: ["Laptop", 1, 50000, 50000, "Arjun Kumar", "Bangalore", "Bangalore"],
  });

  await db.execute({
    sql: "INSERT INTO sales (product, quantity, price, total, rep, salePointId, area) VALUES (?, ?, ?, ?, ?, ?, ?)",
    args: ["Printer", 1, 15000, 15000, "Neha Singh", "Delhi", "Delhi"],
  });

  // Query as Bangalore staff
  const bangaloreScope = getSalePointScope({ role: "employee", area: "Bangalore" });
  const bangaloreSales = await db.execute({
    sql: `SELECT * FROM sales ${bangaloreScope.sqlWhere()}`,
    args: bangaloreScope.args,
  });
  assert.equal(bangaloreSales.rows.length, 1);
  assert.equal(bangaloreSales.rows[0].product, "Laptop");

  // Query as Admin (unfiltered)
  const adminScope = getSalePointScope({ role: "admin" });
  const adminSales = await db.execute({
    sql: `SELECT * FROM sales ${adminScope.sqlWhere()}`,
    args: adminScope.args,
  });
  assert.equal(adminSales.rows.length, 2);
});
