const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const XLSX = require('xlsx');
const pool = require('../config/db');

// ==================== SHEET 1 UPLOAD ====================
router.post('/sheet-one', upload.single('file'), async (req, res) => {
  try {
    // Validate file
    if (!req.file) {
      return res.status(400).json({ 
        success: false,
        error: 'No file uploaded' 
      });
    }

    console.log(`📁 Processing file: ${req.file.originalname}`);

    // Parse Excel file
    const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const jsonData = XLSX.utils.sheet_to_json(worksheet);

    // Validate data
    if (jsonData.length === 0) {
      return res.status(400).json({ 
        success: false,
        error: 'Excel sheet is empty' 
      });
    }

    console.log(`✅ Parsed ${jsonData.length} rows from Excel`);

    // Get database connection
    const conn = await pool.getConnection();
    let importedCount = 0;
    let skippedCount = 0;

    // Insert data into database
    for (const row of jsonData) {
      try {
        const query = `
          INSERT INTO sheet_one 
          (ILO_IP, Platform, Controller_Name, Model_Number, Serial_NumberA, Drive_Description)
          VALUES (?, ?, ?, ?, ?, ?)
          ON DUPLICATE KEY UPDATE
          ILO_IP = VALUES(ILO_IP),
          Platform = VALUES(Platform),
          Controller_Name = VALUES(Controller_Name),
          Model_Number = VALUES(Model_Number),
          Drive_Description = VALUES(Drive_Description)
        `;

        await conn.execute(query, [
          row['ILO_IP'] || '',
          row['Platform'] || '',
          row['Controller_Name'] || '',
          row['Model_Number'] || '',
          row['Serial_NumberA'] || '',
          row['Drive_Description'] || ''
        ]);

        importedCount++;
      } catch (err) {
        console.warn(`⚠️ Skipped row: ${err.message}`);
        skippedCount++;
      }
    }

    conn.release();

    console.log(`✅ Import complete: ${importedCount} inserted, ${skippedCount} skipped`);

    res.json({
      success: true,
      message: `Successfully imported ${importedCount} records from Sheet 1 (Skipped: ${skippedCount})`,
      imported: importedCount,
      skipped: skippedCount,
      total: jsonData.length
    });

  } catch (err) {
    console.error('❌ Error uploading sheet 1:', err.message);
    res.status(500).json({ 
      success: false,
      error: err.message 
    });
  }
});

// ==================== SHEET 2 UPLOAD ====================
router.post('/sheet-two', upload.single('file'), async (req, res) => {
  try {
    // Validate file
    if (!req.file) {
      return res.status(400).json({ 
        success: false,
        error: 'No file uploaded' 
      });
    }

    console.log(`📁 Processing file: ${req.file.originalname}`);

    // Parse Excel file
    const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const jsonData = XLSX.utils.sheet_to_json(worksheet);

    // Validate data
    if (jsonData.length === 0) {
      return res.status(400).json({ 
        success: false,
        error: 'Excel sheet is empty' 
      });
    }

    console.log(`✅ Parsed ${jsonData.length} rows from Excel`);

    // Get database connection
    const conn = await pool.getConnection();
    let importedCount = 0;
    let skippedCount = 0;

    // Insert data into database
    for (const row of jsonData) {
      try {
        const query = `
          INSERT INTO sheet_two 
          (BOX_NO, Vender_Name, Program_Name, HPE_Part_no, HPE_Module_No, 
           Supplier_Model_Number, Supplier_Part_Number, serial_no, Description, DSFW)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          ON DUPLICATE KEY UPDATE
          BOX_NO = VALUES(BOX_NO),
          Vender_Name = VALUES(Vender_Name),
          Program_Name = VALUES(Program_Name),
          HPE_Part_no = VALUES(HPE_Part_no),
          HPE_Module_No = VALUES(HPE_Module_No),
          Supplier_Model_Number = VALUES(Supplier_Model_Number),
          Supplier_Part_Number = VALUES(Supplier_Part_Number),
          Description = VALUES(Description),
          DSFW = VALUES(DSFW)
        `;

        await conn.execute(query, [
          row['BOX NO'] || '',
          row['Vender Name'] || '',
          row['Program Name'] || '',
          row['HPE Part no'] || '',
          row['HPE Module No'] || '',
          row['Supplier Model Number'] || '',
          row['Supplier Part Number'] || '',
          row['serial no'] || '',
          row['Description'] || '',
          row['DSFW'] || ''
        ]);

        importedCount++;
      } catch (err) {
        console.warn(`⚠️ Skipped row: ${err.message}`);
        skippedCount++;
      }
    }

    conn.release();

    console.log(`✅ Import complete: ${importedCount} inserted, ${skippedCount} skipped`);

    res.json({
      success: true,
      message: `Successfully imported ${importedCount} records from Sheet 2 (Skipped: ${skippedCount})`,
      imported: importedCount,
      skipped: skippedCount,
      total: jsonData.length
    });

  } catch (err) {
    console.error('❌ Error uploading sheet 2:', err.message);
    res.status(500).json({ 
      success: false,
      error: err.message 
    });
  }
});

module.exports = router;