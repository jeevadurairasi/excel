const express = require('express');
const router = express.Router();
const pool = require('../config/db');

// ==================== GET SHEET 1 DATA ====================
router.get('/sheet-one', async (req, res) => {
  try {
    const { search, column, value } = req.query;
    let query = 'SELECT * FROM sheet_one WHERE 1=1';
    const params = [];

    if (search) {
      query += ' AND (Serial_NumberA LIKE ? OR ILO_IP LIKE ? OR Controller_Name LIKE ?)';
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }

    if (column && value) {
      query += ` AND \`${column}\` LIKE ?`;
      params.push(`%${value}%`);
    }

    query += ' LIMIT 1000';

    const conn = await pool.getConnection();
    const [rows] = await conn.execute(query, params);
    conn.release();

    res.json({
      success: true,
      count: rows.length,
      data: rows
    });

  } catch (err) {
    console.error('❌ Error:', err.message);
    res.status(500).json({ 
      success: false,
      error: err.message 
    });
  }
});

// ==================== GET SHEET 2 DATA ====================
router.get('/sheet-two', async (req, res) => {
  try {
    const { search, column, value } = req.query;
    let query = 'SELECT * FROM sheet_two WHERE 1=1';
    const params = [];

    if (search) {
      query += ' AND (serial_no LIKE ? OR BOX_NO LIKE ? OR Program_Name LIKE ?)';
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }

    if (column && value) {
      query += ` AND \`${column}\` LIKE ?`;
      params.push(`%${value}%`);
    }

    query += ' LIMIT 1000';

    const conn = await pool.getConnection();
    const [rows] = await conn.execute(query, params);
    conn.release();

    res.json({
      success: true,
      count: rows.length,
      data: rows
    });

  } catch (err) {
    console.error('❌ Error:', err.message);
    res.status(500).json({ 
      success: false,
      error: err.message 
    });
  }
});

module.exports = router;