import { getDB } from "../db.js";

export const exportBackup = async (req, res) => {
  try {
    console.log("[AUDIT LOG]", {
      action: "EXPORT_BACKUP",
      userId: req.user?.id,
      username: req.user?.username,
      timestamp: new Date().toISOString(),
      ip: req.ip || req.headers["x-forwarded-for"] || "127.0.0.1",
    });

    const db = getDB();
    const [salesRes, employeesRes, inventoryRes, expensesRes] = await Promise.all([
      db.execute("SELECT * FROM sales"),
      db.execute("SELECT * FROM employees"),
      db.execute("SELECT * FROM inventory"),
      db.execute("SELECT * FROM expenses")
    ]);

    res.json({
      sales: salesRes.rows,
      employees: employeesRes.rows,
      inventory: inventoryRes.rows,
      expenses: expensesRes.rows
    });
  } catch (error) {
    console.error("Export backup failed:", error);
    res.status(500).json({ error: "Failed to export backup data." });
  }
};

export const importBackup = async (req, res) => {
  try {
    console.log("[AUDIT LOG]", {
      action: "IMPORT_BACKUP",
      userId: req.user?.id,
      username: req.user?.username,
      timestamp: new Date().toISOString(),
      ip: req.ip || req.headers["x-forwarded-for"] || "127.0.0.1",
    });

    const db = getDB();
    const { sales, employees, inventory, expenses } = req.body;

    const queries = [];
    
    // 1. Clear existing tables
    queries.push({ sql: "DELETE FROM sales", args: [] });
    queries.push({ sql: "DELETE FROM employees", args: [] });
    queries.push({ sql: "DELETE FROM inventory", args: [] });
    queries.push({ sql: "DELETE FROM expenses", args: [] });

    // 2. Insert sales
    if (Array.isArray(sales) && sales.length > 0) {
      const columns = Object.keys(sales[0]);
      const sql = `INSERT INTO sales (${columns.join(", ")}) VALUES (${columns.map(() => "?").join(", ")})`;
      sales.forEach(s => {
        queries.push({
          sql,
          args: columns.map(col => s[col])
        });
      });
    }

    // 3. Insert employees
    if (Array.isArray(employees) && employees.length > 0) {
      const columns = Object.keys(employees[0]);
      const sql = `INSERT INTO employees (${columns.join(", ")}) VALUES (${columns.map(() => "?").join(", ")})`;
      employees.forEach(e => {
        queries.push({
          sql,
          args: columns.map(col => e[col])
        });
      });
    }

    // 4. Insert inventory
    if (Array.isArray(inventory) && inventory.length > 0) {
      const columns = Object.keys(inventory[0]);
      const sql = `INSERT INTO inventory (${columns.join(", ")}) VALUES (${columns.map(() => "?").join(", ")})`;
      inventory.forEach(item => {
        queries.push({
          sql,
          args: columns.map(col => item[col])
        });
      });
    }

    // 5. Insert expenses
    if (Array.isArray(expenses) && expenses.length > 0) {
      const columns = Object.keys(expenses[0]);
      const sql = `INSERT INTO expenses (${columns.join(", ")}) VALUES (${columns.map(() => "?").join(", ")})`;
      expenses.forEach(exp => {
        queries.push({
          sql,
          args: columns.map(col => exp[col])
        });
      });
    }

    // Run batch transaction
    await db.batch(queries, "write");

    res.json({ message: "Backup restored successfully!", counts: {
      sales: sales?.length || 0,
      employees: employees?.length || 0,
      inventory: inventory?.length || 0,
      expenses: expenses?.length || 0
    }});
  } catch (error) {
    console.error("Restore backup failed:", error);
    res.status(500).json({ error: "Failed to restore backup data." });
  }
};
