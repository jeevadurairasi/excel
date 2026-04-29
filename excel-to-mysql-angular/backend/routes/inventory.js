const express = require('express');
const router = express.Router();
const pool = require('../config/db');

// ==================== CREATE INVENTORY ====================
router.post('/create', async (req, res) => {
  try {
    const { name, description, quantity, price, category, entry_date } = req.body;

    // Validate required fields
    if (!name || !quantity || !price || !entry_date) {
      return res.status(400).json({
        success: false,
        error: 'Name, quantity, price, and entry_date are required'
      });
    }

    const query = `
      INSERT INTO inventory (name, description, quantity, price, category, entry_date)
      VALUES (?, ?, ?, ?, ?, ?)
    `;

    const conn = await pool.getConnection();
    const [result] = await conn.execute(query, [
      name,
      description || '',
      quantity,
      price,
      category || '',
      entry_date
    ]);

    conn.release();

    res.json({
      success: true,
      message: 'Inventory item created successfully',
      id: result.insertId
    });

  } catch (err) {
    console.error('❌ Error creating inventory:', err.message);
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
});

// ==================== GET ALL INVENTORY ====================
router.get('/all', async (req, res) => {
  try {
    const query = 'SELECT * FROM inventory ORDER BY entry_date DESC LIMIT 1000';

    const conn = await pool.getConnection();
    const [rows] = await conn.execute(query);
    conn.release();

    res.json({
      success: true,
      count: rows.length,
      data: rows
    });

  } catch (err) {
    console.error('❌ Error fetching inventory:', err.message);
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
});

// ==================== GET BY DATE RANGE ====================
router.get('/by-date', async (req, res) => {
  try {
    const { startDate, endDate, category } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        error: 'startDate and endDate are required'
      });
    }

    let query = 'SELECT * FROM inventory WHERE entry_date BETWEEN ? AND ?';
    const params = [startDate, endDate];

    // Filter by category if provided
    if (category && category !== 'all') {
      query += ' AND category = ?';
      params.push(category);
    }

    query += ' ORDER BY entry_date DESC LIMIT 1000';

    const conn = await pool.getConnection();
    const [rows] = await conn.execute(query, params);
    conn.release();

    res.json({
      success: true,
      count: rows.length,
      startDate,
      endDate,
      data: rows
    });

  } catch (err) {
    console.error('❌ Error fetching by date:', err.message);
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
});

// ==================== GET BY WEEK ====================
router.get('/by-week', async (req, res) => {
  try {
    const { weekStart } = req.query;

    if (!weekStart) {
      return res.status(400).json({
        success: false,
        error: 'weekStart date is required'
      });
    }

    // Calculate week end (7 days from start)
    const startDate = new Date(weekStart);
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 6);

    const startDateStr = startDate.toISOString().split('T')[0];
    const endDateStr = endDate.toISOString().split('T')[0];

    const query = `
      SELECT * FROM inventory 
      WHERE entry_date BETWEEN ? AND ?
      ORDER BY entry_date DESC
    `;

    const conn = await pool.getConnection();
    const [rows] = await conn.execute(query, [startDateStr, endDateStr]);
    conn.release();

    res.json({
      success: true,
      count: rows.length,
      weekStart: startDateStr,
      weekEnd: endDateStr,
      data: rows
    });

  } catch (err) {
    console.error('❌ Error fetching by week:', err.message);
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
});

// ==================== GET SINGLE ITEM ====================
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const query = 'SELECT * FROM inventory WHERE id = ?';

    const conn = await pool.getConnection();
    const [rows] = await conn.execute(query, [id]);
    conn.release();

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Item not found'
      });
    }

    res.json({
      success: true,
      data: rows[0]
    });

  } catch (err) {
    console.error('❌ Error fetching item:', err.message);
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
});

// ==================== UPDATE INVENTORY ====================
router.put('/update/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, quantity, price, category, entry_date } = req.body;

    const query = `
      UPDATE inventory 
      SET name = ?, description = ?, quantity = ?, price = ?, category = ?, entry_date = ?
      WHERE id = ?
    `;

    const conn = await pool.getConnection();
    const [result] = await conn.execute(query, [
      name,
      description || '',
      quantity,
      price,
      category || '',
      entry_date,
      id
    ]);

    conn.release();

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        error: 'Item not found'
      });
    }

    res.json({
      success: true,
      message: 'Inventory item updated successfully'
    });

  } catch (err) {
    console.error('❌ Error updating inventory:', err.message);
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
});

// ==================== DELETE INVENTORY ====================
router.delete('/delete/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const query = 'DELETE FROM inventory WHERE id = ?';

    const conn = await pool.getConnection();
    const [result] = await conn.execute(query, [id]);
    conn.release();

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        error: 'Item not found'
      });
    }

    res.json({
      success: true,
      message: 'Inventory item deleted successfully'
    });

  } catch (err) {
    console.error('❌ Error deleting inventory:', err.message);
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
});

// ==================== GET CATEGORIES ====================
router.get('/categories/all', async (req, res) => {
  try {
    const query = 'SELECT DISTINCT category FROM inventory WHERE category != ""';

    const conn = await pool.getConnection();
    const [rows] = await conn.execute(query);
    conn.release();

    const categories = rows.map(row => row.category);

    res.json({
      success: true,
      categories
    });

  } catch (err) {
    console.error('❌ Error fetching categories:', err.message);
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
});

// ==================== GET STATS BY DATE RANGE ====================
router.get('/stats/range', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        error: 'startDate and endDate are required'
      });
    }

    const query = `
      SELECT 
        COUNT(*) as total_items,
        SUM(quantity) as total_quantity,
        SUM(price * quantity) as total_value,
        AVG(price) as avg_price,
        category
      FROM inventory 
      WHERE entry_date BETWEEN ? AND ?
      GROUP BY category
    `;

    const conn = await pool.getConnection();
    const [rows] = await conn.execute(query, [startDate, endDate]);
    conn.release();

    res.json({
      success: true,
      startDate,
      endDate,
      stats: rows
    });

  } catch (err) {
    console.error('❌ Error fetching stats:', err.message);
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
});

module.exports = router;