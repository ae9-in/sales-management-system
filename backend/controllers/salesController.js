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
  const db = getDB();
  const tx = await db.transaction("write");
  try {
    const { product, quantity, price, date, customer, rep, status, method } = req.body;
    const saleQty = parseFloat(quantity);
    
    // Check inventory stock
    const productItemResult = await tx.execute({
      sql: "SELECT currentStock FROM inventory WHERE name = ?",
      args: [product]
    });
    if (productItemResult.rows.length === 0) {
      await tx.rollback();
      return res.status(400).json({ message: `Product "${product}" not found in inventory.` });
    }
    const currentStock = parseFloat(productItemResult.rows[0].currentStock);
    if (currentStock < saleQty) {
      await tx.rollback();
      return res.status(400).json({ message: `Insufficient stock for "${product}". Available: ${currentStock}, Requested: ${saleQty}` });
    }

    const total = saleQty * parseFloat(price);
    const dateAdded = date || new Date().toISOString();
    
    const insertResult = await tx.execute({
      sql: "INSERT INTO sales (product, quantity, price, total, customer, rep, status, method, date) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?) RETURNING *",
      args: [product, quantity, price, total, customer || 'Walk-in', rep || '', status || 'Paid', method || 'Cash', dateAdded]
    });
    
    await tx.execute({
      sql: "UPDATE inventory SET currentStock = currentStock - ? WHERE name = ?",
      args: [saleQty, product]
    });
    
    await tx.commit();
    res.status(201).json(formatSale(insertResult.rows[0]));
  } catch (err) {
    try { await tx.rollback(); } catch (_) {}
    next(err);
  }
};

export const updateSale = async (req, res, next) => {
  const db = getDB();
  const tx = await db.transaction("write");
  try {
    const { product, quantity, price, date, customer, rep, status, method } = req.body;
    const newQty = parseFloat(quantity);
    
    const oldSaleResult = await tx.execute({
      sql: "SELECT product, quantity FROM sales WHERE id = ?",
      args: [req.params.id]
    });
    if (oldSaleResult.rows.length === 0) {
      await tx.rollback();
      return res.status(404).json({ message: "Sale not found" });
    }
    const oldSale = oldSaleResult.rows[0];
    const oldQty = parseFloat(oldSale.quantity);

    // Fetch new product stock
    const newProductItemResult = await tx.execute({
      sql: "SELECT currentStock FROM inventory WHERE name = ?",
      args: [product]
    });
    if (newProductItemResult.rows.length === 0) {
      await tx.rollback();
      return res.status(400).json({ message: `Product "${product}" not found in inventory.` });
    }
    const newProductStock = parseFloat(newProductItemResult.rows[0].currentStock);

    if (product === oldSale.product) {
      // Same product, check if available + oldQty >= newQty
      if (newProductStock + oldQty < newQty) {
        await tx.rollback();
        return res.status(400).json({ message: `Insufficient stock for "${product}". Available: ${newProductStock + oldQty}, Requested: ${newQty}` });
      }
    } else {
      // Different product, check if newProductStock >= newQty
      if (newProductStock < newQty) {
        await tx.rollback();
        return res.status(400).json({ message: `Insufficient stock for new product "${product}". Available: ${newProductStock}, Requested: ${newQty}` });
      }
    }

    const total = newQty * parseFloat(price);

    const updateResult = await tx.execute({
      sql: "UPDATE sales SET product = ?, quantity = ?, price = ?, total = ?, customer = ?, rep = ?, status = ?, method = ?, date = ? WHERE id = ? RETURNING *",
      args: [product, quantity, price, total, customer || 'Walk-in', rep || '', status || 'Paid', method || 'Cash', date, req.params.id]
    });

    // Revert stock on old product
    await tx.execute({
      sql: "UPDATE inventory SET currentStock = currentStock + ? WHERE name = ?",
      args: [oldQty, oldSale.product]
    });

    // Deduct stock on new product
    await tx.execute({
      sql: "UPDATE inventory SET currentStock = currentStock - ? WHERE name = ?",
      args: [newQty, product]
    });

    await tx.commit();
    res.status(200).json(formatSale(updateResult.rows[0]));
  } catch (err) {
    try { await tx.rollback(); } catch (_) {}
    next(err);
  }
};

export const deleteSale = async (req, res, next) => {
  const db = getDB();
  const tx = await db.transaction("write");
  try {
    const saleResult = await tx.execute({
      sql: "SELECT product, quantity FROM sales WHERE id = ?",
      args: [req.params.id]
    });
    if (saleResult.rows.length === 0) {
      await tx.rollback();
      return res.status(404).json({ message: "Sale not found" });
    }
    const sale = saleResult.rows[0];

    await tx.execute({
      sql: "DELETE FROM sales WHERE id = ?",
      args: [req.params.id]
    });

    await tx.execute({
      sql: "UPDATE inventory SET currentStock = currentStock + ? WHERE name = ?",
      args: [parseFloat(sale.quantity), sale.product]
    });

    await tx.commit();
    res.status(204).send();
  } catch (err) {
    try { await tx.rollback(); } catch (_) {}
    next(err);
  }
};
