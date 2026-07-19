import { getDB } from "../db.js";
import { format } from "date-fns";

const formatExpense = (expense) => ({
  ...expense,
  date: format(new Date(expense.date), "yyyy-MM-dd"),
});

export const getExpenses = async (req, res, next) => {
  try {
    const db = getDB();
    const { category, amountMin, amountMax, dateFrom, dateTo } = req.query;
    
    let query = "SELECT * FROM expenses WHERE 1=1";
    let args = [];

    if (category && category !== "All") { query += " AND category = ?"; args.push(category); }
    if (amountMin) { query += " AND amount >= ?"; args.push(parseFloat(amountMin)); }
    if (amountMax) { query += " AND amount <= ?"; args.push(parseFloat(amountMax)); }
    if (dateFrom) { query += " AND date >= ?"; args.push(dateFrom); }
    if (dateTo) { query += " AND date <= ?"; args.push(dateTo + ' 23:59:59'); }

    const result = await db.execute({ sql: query, args });
    res.status(200).json(result.rows.map(row => formatExpense(row)));
  } catch (err) {
    next(err);
  }
};

export const createExpense = async (req, res, next) => {
  try {
    const db = getDB();
    const { category, amount, date } = req.body;
    const dateAdded = date || new Date().toISOString();
    
    const result = await db.execute({
      sql: "INSERT INTO expenses (category, amount, date) VALUES (?, ?, ?) RETURNING *",
      args: [category, amount, dateAdded]
    });
    res.status(201).json(formatExpense(result.rows[0]));
  } catch (err) {
    next(err);
  }
};

export const updateExpense = async (req, res, next) => {
  try {
    const db = getDB();
    const { category, amount, date } = req.body;
    const result = await db.execute({
      sql: "UPDATE expenses SET category = ?, amount = ?, date = ? WHERE id = ? RETURNING *",
      args: [category, amount, date, req.params.id]
    });

    if (result.rows.length === 0) return res.status(404).json({ message: "Expense not found" });
    res.status(200).json(formatExpense(result.rows[0]));
  } catch (err) {
    next(err);
  }
};

export const deleteExpense = async (req, res, next) => {
  try {
    const db = getDB();
    const result = await db.execute({
      sql: "DELETE FROM expenses WHERE id = ?",
      args: [req.params.id]
    });
    if (result.rowsAffected === 0) return res.status(404).json({ message: "Expense not found" });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};
