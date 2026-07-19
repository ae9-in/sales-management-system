import { getDB } from "../db.js";

export const exportBackup = async (req, res) => {
  try {
    const db = getDB();
    const [salesRes, employeesRes, inventoryRes] = await Promise.all([
      db.execute("SELECT * FROM sales"),
      db.execute("SELECT * FROM employees"),
      db.execute("SELECT * FROM inventory")
    ]);

    res.json({
      sales: salesRes.rows,
      employees: employeesRes.rows,
      inventory: inventoryRes.rows
    });
  } catch (error) {
    console.error("Export backup failed:", error);
    res.status(500).json({ error: "Failed to export backup data." });
  }
};

export const importBackup = async (req, res) => {
  try {
    const db = getDB();
    const { sales, employees, inventory } = req.body;

    const queries = [];
    
    // 1. Clear existing tables
    queries.push({ sql: "DELETE FROM sales", args: [] });
    queries.push({ sql: "DELETE FROM employees", args: [] });
    queries.push({ sql: "DELETE FROM inventory", args: [] });

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

    // Run batch transaction
    await db.batch(queries, "write");

    res.json({ message: "Backup restored successfully!", counts: {
      sales: sales?.length || 0,
      employees: employees?.length || 0,
      inventory: inventory?.length || 0
    }});
  } catch (error) {
    console.error("Restore backup failed:", error);
    res.status(500).json({ error: "Failed to restore backup data." });
  }
};
