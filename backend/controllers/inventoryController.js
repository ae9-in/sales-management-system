import { getDB } from "../db.js";
import { format } from "date-fns";

const formatInventory = (inventory) => ({
  ...inventory,
  date: format(new Date(inventory.dateUpdated), "yyyy-MM-dd"),
});

export const getInventory = async (req, res, next) => {
  try {
    const db = getDB();
    const { name, stockMin, stockMax, reorderMin, reorderMax, dateFrom, dateTo } = req.query;
    
    let query = "SELECT * FROM inventory WHERE 1=1";
    let args = [];

    if (name) { query += " AND name LIKE ?"; args.push('%'+name+'%'); }
    if (stockMin) { query += " AND currentStock >= ?"; args.push(parseFloat(stockMin)); }
    if (stockMax) { query += " AND currentStock <= ?"; args.push(parseFloat(stockMax)); }
    if (reorderMin) { query += " AND reorderLevel >= ?"; args.push(parseFloat(reorderMin)); }
    if (reorderMax) { query += " AND reorderLevel <= ?"; args.push(parseFloat(reorderMax)); }
    if (dateFrom) { query += " AND dateUpdated >= ?"; args.push(dateFrom); }
    if (dateTo) { query += " AND dateUpdated <= ?"; args.push(dateTo + ' 23:59:59'); }

    const result = await db.execute({ sql: query, args });
    res.status(200).json(result.rows.map(row => formatInventory(row)));
  } catch (err) {
    next(err);
  }
};

export const createInventoryItem = async (req, res, next) => {
  try {
    const db = getDB();
    const { name, currentStock, reorderLevel, price, date } = req.body;
    const dateUpdated = date || new Date().toISOString();
    
    const result = await db.execute({
      sql: "INSERT INTO inventory (name, currentStock, reorderLevel, price, dateUpdated) VALUES (?, ?, ?, ?, ?) RETURNING *",
      args: [name, currentStock, reorderLevel, price || 0, dateUpdated]
    });
    res.status(201).json(formatInventory(result.rows[0]));
  } catch (err) {
    next(err);
  }
};

export const updateInventoryItem = async (req, res, next) => {
  try {
    const db = getDB();
    const { name, currentStock, reorderLevel, price, date, dateUpdated } = req.body;
    const dateToUpdate = date || dateUpdated;

    const result = await db.execute({
      sql: "UPDATE inventory SET name = ?, currentStock = ?, reorderLevel = ?, price = ?, dateUpdated = ? WHERE id = ? RETURNING *",
      args: [name, currentStock, reorderLevel, price || 0, dateToUpdate, req.params.id]
    });

    if (result.rows.length === 0) return res.status(404).json({ message: "Inventory item not found" });
    res.status(200).json(formatInventory(result.rows[0]));
  } catch (err) {
    next(err);
  }
};

export const deleteInventoryItem = async (req, res, next) => {
  try {
    const db = getDB();
    const result = await db.execute({
      sql: "DELETE FROM inventory WHERE id = ?",
      args: [req.params.id]
    });
    if (result.rowsAffected === 0) return res.status(404).json({ message: "Inventory item not found" });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};
