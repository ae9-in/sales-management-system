import express from 'express';
import { getDB } from '../db.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

const getAggregatedData = async (table, groupBy) => {
    const db = getDB();
    const dateField = table === 'inventory' ? 'dateUpdated' : (table === 'employees' ? 'dateAdded' : 'date');
    const fieldToSum = table === 'sales' ? 'total' : 'amount';

    let sql = "";
    if (groupBy === 'month') {
        sql = `SELECT strftime('%m', ${dateField}) as month, strftime('%Y', ${dateField}) as year, SUM(${fieldToSum}) as total FROM ${table} GROUP BY year, month ORDER BY year ASC, month ASC`;
    } else {
        sql = `SELECT strftime('%Y', ${dateField}) as year, SUM(${fieldToSum}) as total FROM ${table} GROUP BY year ORDER BY year ASC`;
    }

    const result = await db.execute(sql);
    
    if (groupBy === 'month') {
        return result.rows.map(row => ({
            _id: { month: parseInt(row.month, 10), year: parseInt(row.year, 10) },
            total: row.total
        }));
    } else {
        return result.rows.map(row => ({
            _id: { year: parseInt(row.year, 10) },
            total: row.total
        }));
    }
};

router.get('/', authenticateToken, async (req, res, next) => {
    try {
        const [monthlySales, yearlySales, monthlyExpenses, yearlyExpenses] = await Promise.all([
            getAggregatedData('sales', 'month'),
            getAggregatedData('sales', 'year'),
            getAggregatedData('expenses', 'month'),
            getAggregatedData('expenses', 'year')
        ]);

        res.json({ monthlySales, yearlySales, monthlyExpenses, yearlyExpenses });
    } catch (error) {
        next(error);
    }
});

export default router;
