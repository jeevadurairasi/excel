const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();

// ==================== MIDDLEWARE ====================
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// ==================== ROUTES ====================
app.use('/api/upload', require('./routes/upload'));
app.use('/api/data', require('./routes/data'));
app.use('/api/inventory', require('./routes/inventory'));
app.use('/api/work-hours', require('./routes/work-hours'));

// ==================== HEALTH CHECK ====================
app.get('/api/test', (req, res) => {
  res.json({ 
    success: true,
    message: '✅ Backend API is running successfully!' 
  });
});

// ==================== ERROR HANDLING ====================
app.use((err, req, res, next) => {
  console.error('❌ Error:', err.stack);
  res.status(500).json({ 
    success: false,
    error: err.message 
  });
});

// ==================== 404 HANDLER ====================
app.use((req, res) => {
  res.status(404).json({ 
    success: false,
    error: 'Route not found' 
  });
});

// ==================== START SERVER ====================
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log('\n' + '='.repeat(60));
  console.log('🚀 BACKEND SERVER STARTED');
  console.log('='.repeat(60));
  console.log(`📡 Server running on: http://localhost:${PORT}`);
  console.log(`🧪 Test API:         http://localhost:${PORT}/api/test`);
  console.log(`📤 Upload Sheet 1:    POST http://localhost:${PORT}/api/upload/sheet-one`);
  console.log(`📤 Upload Sheet 2:    POST http://localhost:${PORT}/api/upload/sheet-two`);
  console.log(`📋 Get Sheet 1:       GET http://localhost:${PORT}/api/data/sheet-one`);
  console.log(`📋 Get Sheet 2:       GET http://localhost:${PORT}/api/data/sheet-two`);
  console.log(`📦 Inventory:         GET http://localhost:${PORT}/api/inventory/all`);
  console.log(`⏱️ Work Hours:        GET http://localhost:${PORT}/api/work-hours/all`);
  console.log('='.repeat(60) + '\n');
});