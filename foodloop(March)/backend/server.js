const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// MongoDB Connection with better error handling
const mongodbUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/foodloop';

mongoose.connect(mongodbUri, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(() => {
    console.log('✅ MongoDB connected successfully');
    console.log(`📍 Connected to: ${mongodbUri.split('@')[1] || 'local'}`);
  })
  .catch(err => {
    console.error('❌ MongoDB connection error:', err.message);
    process.exit(1);
  });

// MongoDB connection events
mongoose.connection.on('disconnected', () => {
  console.log('⚠️  MongoDB disconnected');
});

mongoose.connection.on('error', (err) => {
  console.error('❌ MongoDB error:', err);
});

// Routes
app.use('/api/products', require('./routes/products'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/farmers/auth', require('./routes/farmerAuth'));
app.use('/api/farmers', require('./routes/farmer'));
app.use('/api/buyers', require('./routes/buyer'));
app.use('/api/buyers/auth', require('./routes/buyerAuth'));
app.use('/api/notifications', require('./routes/notifications'));

// Health check endpoint
app.get('/api/health', (req, res) => {
  const dbStatus = mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected';
  res.status(200).json({
    message: 'Server is running',
    database: dbStatus,
    timestamp: new Date()
  });
});

// Database info endpoint
app.get('/api/db-info', (req, res) => {
  res.status(200).json({
    status: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected',
    database: mongoose.connection.name,
    host: mongoose.connection.host
  });
});

const http = require('http');
const { initSocket } = require('./utils/socket');

const server = http.createServer(app);
const io = initSocket(server);

// Make io available in req for routes if needed (though we use utils/socket)
app.set('io', io);

const PORT = process.env.PORT || 5001;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 API: http://localhost:${PORT}/api`);
});
