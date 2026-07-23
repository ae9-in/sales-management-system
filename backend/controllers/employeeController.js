import { getDB } from "../db.js";

const formatEmployee = (emp) => ({
  id: emp.id,
  name: emp.name,
  position: emp.position,
  salary: emp.salary,
  phone: emp.phone || '',
  area: emp.area || '',
  dateAdded: emp.dateAdded,
  createdAt: emp.createdAt,
  updatedAt: emp.updatedAt,
});

export const getEmployees = async (req, res, next) => {
  try {
    const db = getDB();
    const { name, position, salaryMin, salaryMax, dateFrom, dateTo } = req.query;
    
    let query = "SELECT * FROM employees WHERE 1=1";
    let args = [];

    if (name) { query += " AND name LIKE ?"; args.push('%'+name+'%'); }
    if (position) { query += " AND position LIKE ?"; args.push('%'+position+'%'); }
    if (salaryMin) { query += " AND salary >= ?"; args.push(parseFloat(salaryMin)); }
    if (salaryMax) { query += " AND salary <= ?"; args.push(parseFloat(salaryMax)); }
    if (dateFrom) { query += " AND dateAdded >= ?"; args.push(dateFrom); }
    if (dateTo) { query += " AND dateAdded <= ?"; args.push(dateTo + ' 23:59:59'); }

    query += " ORDER BY id ASC";

    const result = await db.execute({ sql: query, args });
    res.status(200).json(result.rows.map(row => formatEmployee(row)));
  } catch (err) {
    next(err);
  }
};

export const createEmployee = async (req, res, next) => {
  try {
    const db = getDB();
    const { name, position, salary, date, phone, area } = req.body;
    const dateAdded = date || new Date().toISOString();
    
    const result = await db.execute({
      sql: "INSERT INTO employees (name, position, salary, phone, area, dateAdded) VALUES (?, ?, ?, ?, ?, ?) RETURNING *",
      args: [name, position, salary, phone || '', area || '', dateAdded]
    });
    res.status(201).json(formatEmployee(result.rows[0]));
  } catch (err) {
    next(err);
  }
};

export const updateEmployee = async (req, res, next) => {
  try {
    const db = getDB();
    const { name, position, salary, date, dateAdded, phone, area } = req.body;
    const dateToUpdate = date || dateAdded;

    const result = await db.execute({
      sql: "UPDATE employees SET name = ?, position = ?, salary = ?, phone = ?, area = ?, dateAdded = ? WHERE id = ? RETURNING *",
      args: [name, position, salary, phone || '', area || '', dateToUpdate, req.params.id]
    });

    if (result.rows.length === 0) return res.status(404).json({ message: "Employee not found" });
    res.status(200).json(formatEmployee(result.rows[0]));
  } catch (err) {
    next(err);
  }
};

export const deleteEmployee = async (req, res, next) => {
  try {
    const db = getDB();
    const result = await db.execute({
      sql: "DELETE FROM employees WHERE id = ?",
      args: [req.params.id]
    });
    if (result.rowsAffected === 0) return res.status(404).json({ message: "Employee not found" });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};
