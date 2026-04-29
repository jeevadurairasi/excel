const express = require('express');
const router = express.Router();
const pool = require('../config/db');

// ==================== CREATE WORK HOURS ====================
router.post('/create', async (req, res) => {
  try {
    const { employee_name, function_role, location, program, work_type, work_date, hours_logged, description } = req.body;

    if (!employee_name || !function_role || !work_type || !work_date || !hours_logged) {
      return res.status(400).json({
        success: false,
        error: 'Employee name, function, work type, date, and hours are required'
      });
    }

    const query = `
      INSERT INTO work_hours 
      (employee_name, function_role, location, program, work_type, work_date, hours_logged, description)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const conn = await pool.getConnection();
    const [result] = await conn.execute(query, [
      employee_name,
      function_role,
      location || '',
      program || '',
      work_type,
      work_date,
      hours_logged,
      description || ''
    ]);

    conn.release();

    res.json({
      success: true,
      message: 'Work hours entry created successfully',
      id: result.insertId
    });

  } catch (err) {
    console.error('❌ Error creating work hours:', err.message);
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
});

// ==================== GET ALL WORK HOURS ====================
router.get('/all', async (req, res) => {
  try {
    const query = `
      SELECT * FROM work_hours 
      ORDER BY work_date DESC, employee_name ASC 
      LIMIT 1000
    `;

    const conn = await pool.getConnection();
    const [rows] = await conn.execute(query);
    conn.release();

    res.json({
      success: true,
      count: rows.length,
      data: rows
    });

  } catch (err) {
    console.error('❌ Error fetching work hours:', err.message);
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
});

// ==================== GET BY DATE RANGE ====================
router.get('/by-date-range', async (req, res) => {
  try {
    const { startDate, endDate, employee_name, work_type } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        error: 'startDate and endDate are required'
      });
    }

    let query = `
      SELECT * FROM work_hours 
      WHERE work_date BETWEEN ? AND ?
    `;
    const params = [startDate, endDate];

    if (employee_name && employee_name !== 'all') {
      query += ' AND employee_name = ?';
      params.push(employee_name);
    }

    if (work_type && work_type !== 'all') {
      query += ' AND work_type = ?';
      params.push(work_type);
    }

    query += ' ORDER BY work_date DESC, employee_name ASC';

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
    console.error('❌ Error fetching by date range:', err.message);
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

    const startDate = new Date(weekStart);
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 4);

    const startDateStr = startDate.toISOString().split('T')[0];
    const endDateStr = endDate.toISOString().split('T')[0];

    const query = `
      SELECT * FROM work_hours 
      WHERE work_date BETWEEN ? AND ?
      ORDER BY work_date DESC, employee_name ASC
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

// ==================== GET SINGLE ENTRY ====================
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const query = 'SELECT * FROM work_hours WHERE id = ?';

    const conn = await pool.getConnection();
    const [rows] = await conn.execute(query, [id]);
    conn.release();

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Entry not found'
      });
    }

    res.json({
      success: true,
      data: rows[0]
    });

  } catch (err) {
    console.error('❌ Error fetching entry:', err.message);
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
});

// ==================== UPDATE WORK HOURS ====================
router.put('/update/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { employee_name, function_role, location, program, work_type, work_date, hours_logged, description } = req.body;

    const query = `
      UPDATE work_hours 
      SET employee_name = ?, function_role = ?, location = ?, program = ?, 
          work_type = ?, work_date = ?, hours_logged = ?, description = ?
      WHERE id = ?
    `;

    const conn = await pool.getConnection();
    const [result] = await conn.execute(query, [
      employee_name,
      function_role,
      location || '',
      program || '',
      work_type,
      work_date,
      hours_logged,
      description || '',
      id
    ]);

    conn.release();

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        error: 'Entry not found'
      });
    }

    res.json({
      success: true,
      message: 'Work hours entry updated successfully'
    });

  } catch (err) {
    console.error('❌ Error updating work hours:', err.message);
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
});

// ==================== DELETE WORK HOURS ====================
router.delete('/delete/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const query = 'DELETE FROM work_hours WHERE id = ?';

    const conn = await pool.getConnection();
    const [result] = await conn.execute(query, [id]);
    conn.release();

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        error: 'Entry not found'
      });
    }

    res.json({
      success: true,
      message: 'Work hours entry deleted successfully'
    });

  } catch (err) {
    console.error('❌ Error deleting work hours:', err.message);
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
});

// ==================== GET EMPLOYEES ====================
router.get('/employees/list', async (req, res) => {
  try {
    const query = 'SELECT DISTINCT employee_name FROM work_hours ORDER BY employee_name ASC';

    const conn = await pool.getConnection();
    const [rows] = await conn.execute(query);
    conn.release();

    const employees = rows.map(row => row.employee_name);

    res.json({
      success: true,
      employees
    });

  } catch (err) {
    console.error('❌ Error fetching employees:', err.message);
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
});

// ==================== GET WORK TYPES ====================
router.get('/work-types/list', async (req, res) => {
  try {
    const query = 'SELECT DISTINCT work_type FROM work_hours ORDER BY work_type ASC';

    const conn = await pool.getConnection();
    const [rows] = await conn.execute(query);
    conn.release();

    const workTypes = rows.map(row => row.work_type);

    res.json({
      success: true,
      workTypes
    });

  } catch (err) {
    console.error('❌ Error fetching work types:', err.message);
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
});

// ==================== GET SUMMARY BY DATE ====================
router.get('/summary/by-date', async (req, res) => {
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
        employee_name,
        work_date,
        work_type,
        SUM(hours_logged) as total_hours
      FROM work_hours 
      WHERE work_date BETWEEN ? AND ?
      GROUP BY employee_name, work_date, work_type
      ORDER BY work_date DESC, employee_name ASC
    `;

    const conn = await pool.getConnection();
    const [rows] = await conn.execute(query, [startDate, endDate]);
    conn.release();

    res.json({
      success: true,
      count: rows.length,
      data: rows
    });

  } catch (err) {
    console.error('❌ Error fetching summary:', err.message);
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
});

// ==================== SAVE/UPDATE SPREADSHEET CELL ====================
router.post('/spreadsheet/update-cell', async (req, res) => {
  try {
    const { employee_name, work_date, work_type, hours_logged, function_role, location, program } = req.body;

    if (!employee_name || !work_date || !work_type || hours_logged === undefined) {
      return res.status(400).json({
        success: false,
        error: 'All fields are required'
      });
    }

    const conn = await pool.getConnection();

    // Check if entry exists
    const checkQuery = `
      SELECT id FROM work_hours 
      WHERE employee_name = ? AND work_date = ? AND work_type = ?
    `;

    const [existing] = await conn.execute(checkQuery, [employee_name, work_date, work_type]);

    let result;

    if (existing.length > 0) {
      // UPDATE existing
      const updateQuery = `
        UPDATE work_hours 
        SET hours_logged = ?
        WHERE employee_name = ? AND work_date = ? AND work_type = ?
      `;

      [result] = await conn.execute(updateQuery, [
        hours_logged,
        employee_name,
        work_date,
        work_type
      ]);
    } else {
      // INSERT new
      const insertQuery = `
        INSERT INTO work_hours 
        (employee_name, function_role, location, program, work_type, work_date, hours_logged)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `;

      [result] = await conn.execute(insertQuery, [
        employee_name,
        function_role || 'Storage Sustaining',
        location || 'Bangalore, IN',
        program || 'MCHP Sustaining',
        work_type,
        work_date,
        hours_logged
      ]);
    }

    conn.release();

    res.json({
      success: true,
      message: 'Hours updated successfully'
    });

  } catch (err) {
    console.error('❌ Error updating cell:', err.message);
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
});

module.exports = router;