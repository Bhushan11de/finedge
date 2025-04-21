const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const sequelize = require('./config/database');
const stockRoutes = require('./routes/stocks');
const watchlistRoutes = require('./routes/watchlist');
const authRoutes = require('./routes/auth');
const transactionRoutes = require('./routes/transactions');
const stockPriceService = require('./services/stockPriceService');
const Stock = require('./models/Stock');
const User = require('./models/User');

// Sample stocks data for initialization
const defaultStocks = [
  {
    name: 'Apple Inc.',
    ticker: 'AAPL',
    shares: 1,
    buy_price: 175.50,
    current_price: 175.50,
    target_price: 200.00,
    is_in_watchlist: true
  },
  {
    name: 'Microsoft Corporation',
    ticker: 'MSFT',
    shares: 1,
    buy_price: 350.00,
    current_price: 350.00,
    target_price: 400.00,
    is_in_watchlist: true
  },
  {
    name: 'Amazon.com Inc.',
    ticker: 'AMZN',
    shares: 1,
    buy_price: 145.00,
    current_price: 145.00,
    target_price: 170.00,
    is_in_watchlist: true
  },
  {
    name: 'NVIDIA Corporation',
    ticker: 'NVDA',
    shares: 1,
    buy_price: 480.00,
    current_price: 480.00,
    target_price: 550.00,
    is_in_watchlist: true
  },
  {
    name: 'Tesla Inc.',
    ticker: 'TSLA',
    shares: 1,
    buy_price: 240.00,
    current_price: 240.00,
    target_price: 280.00,
    is_in_watchlist: true
  }
];

const app = express();

// Configure CORS
app.use(cors());

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Authentication token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

// Admin middleware
const isAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }
  next();
};

app.use(express.json());

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

// Public routes
app.use('/api/auth', authRoutes);

// Protected routes
app.use('/api/stocks', authenticateToken, stockRoutes);
app.use('/api/watchlist', authenticateToken, watchlistRoutes);
app.use('/api/transactions', authenticateToken, transactionRoutes);

// Admin routes
app.use('/api/admin', authenticateToken, isAdmin, (req, res) => {
  res.json({ message: 'Admin access granted' });
});

const PORT = process.env.PORT || 5000;

const initializeStocks = async () => {
  try {
    // Check if there are any existing stocks
    const stockCount = await Stock.count();
    
    if (stockCount === 0) {
      console.log('No stocks found. Initializing with default stocks...');
      
      // Create default stocks
      await Promise.all(defaultStocks.map(stock => Stock.create(stock)));
      
      console.log('Default stocks created successfully');
    } else {
      console.log(`Found ${stockCount} existing stocks. Skipping initialization.`);
    }
  } catch (error) {
    console.error('Error initializing stocks:', error);
  }
};

const start = async () => {
  try {
    // Sync database
    await sequelize.sync();
    console.log('Database synced successfully');

    // Initialize stocks
    await initializeStocks();

    // Start periodic stock price updates
    stockPriceService.startPeriodicUpdates();

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

start();

module.exports = app; 