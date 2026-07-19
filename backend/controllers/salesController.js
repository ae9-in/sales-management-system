import { getDB } from "../db.js";

const formatSale = (sale) => ({
  id: sale.id,
  product: sale.product,
  quantity: sale.quantity,
  price: sale.price,
  total: sale.total,
  customer: sale.customer || 'Walk-in',
  rep: sale.rep || '',
  status: sale.status || 'Paid',
  method: sale.method || 'Cash',
  date: sale.date,
  createdAt: sale.createdAt,
  updatedAt: sale.updatedAt,
});

export const getSales = async (req, res, next) => {
  try {
    const db = getDB();
    const { product, quantityMin, quantityMax, priceMin, priceMax, dateFrom, dateTo } = req.query;
    
    let query = "SELECT * FROM sales WHERE 1=1";
    let args = [];

    if (product && product !== "All") { query += " AND product = ?"; args.push(product); }
    if (quantityMin) { query += " AND quantity >= ?"; args.push(parseFloat(quantityMin)); }
    if (quantityMax) { query += " AND quantity <= ?"; args.push(parseFloat(quantityMax)); }
    if (priceMin) { query += " AND price >= ?"; args.push(parseFloat(priceMin)); }
    if (priceMax) { query += " AND price <= ?"; args.push(parseFloat(priceMax)); }
    if (dateFrom) { query += " AND date >= ?"; args.push(dateFrom); }
    if (dateTo) { query += " AND date <= ?"; args.push(dateTo + ' 23:59:59'); }

    query += " ORDER BY date DESC";

    const result = await db.execute({ sql: query, args });
    res.status(200).json(result.rows.map(row => formatSale(row)));
  } catch (err) {
    next(err);
  }
};

export const createSale = async (req, res, next) => {
  try {
    const db = getDB();
    const { product, quantity, price, date, customer, rep, status, method } = req.body;
    const total = parseFloat(quantity) * parseFloat(price);
    const dateAdded = date || new Date().toISOString();
    
    const result = await db.batch([
      {
        sql: "INSERT INTO sales (product, quantity, price, total, customer, rep, status, method, date) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?) RETURNING *",
        args: [product, quantity, price, total, customer || 'Walk-in', rep || '', status || 'Paid', method || 'Cash', dateAdded]
      },
      {
        sql: "UPDATE inventory SET currentStock = currentStock - ? WHERE name = ?",
        args: [parseFloat(quantity), product]
      }
    ], "write");
    res.status(201).json(formatSale(result[0].rows[0]));
  } catch (err) {
    next(err);
  }
};

export const updateSale = async (req, res, next) => {
  try {
    const db = getDB();
    const { product, quantity, price, date, customer, rep, status, method } = req.body;
    const total = parseFloat(quantity) * parseFloat(price);
    
    const oldSaleResult = await db.execute({
      sql: "SELECT product, quantity FROM sales WHERE id = ?",
      args: [req.params.id]
    });
    if (oldSaleResult.rows.length === 0) {
      return res.status(404).json({ message: "Sale not found" });
    }
    const oldSale = oldSaleResult.rows[0];

    const result = await db.batch([
      {
        sql: "UPDATE sales SET product = ?, quantity = ?, price = ?, total = ?, customer = ?, rep = ?, status = ?, method = ?, date = ? WHERE id = ? RETURNING *",
        args: [product, quantity, price, total, customer || 'Walk-in', rep || '', status || 'Paid', method || 'Cash', date, req.params.id]
      },
      {
        sql: "UPDATE inventory SET currentStock = currentStock + ? WHERE name = ?",
        args: [parseFloat(oldSale.quantity), oldSale.product]
      },
      {
        sql: "UPDATE inventory SET currentStock = currentStock - ? WHERE name = ?",
        args: [parseFloat(quantity), product]
      }
    ], "write");

    res.status(200).json(formatSale(result[0].rows[0]));
  } catch (err) {
    next(err);
  }
};

export const deleteSale = async (req, res, next) => {
  try {
    const db = getDB();
    const saleResult = await db.execute({
      sql: "SELECT product, quantity FROM sales WHERE id = ?",
      args: [req.params.id]
    });
    if (saleResult.rows.length === 0) {
      return res.status(404).json({ message: "Sale not found" });
    }
    const sale = saleResult.rows[0];

    await db.batch([
      {
        sql: "DELETE FROM sales WHERE id = ?",
        args: [req.params.id]
      },
      {
        sql: "UPDATE inventory SET currentStock = currentStock + ? WHERE name = ?",
        args: [parseFloat(sale.quantity), sale.product]
      }
    ], "write");

    res.status(204).send();
  } catch (err) {
    next(err);
  }
};
