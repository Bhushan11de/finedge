const express = require('express');
const cors = require('cors');
require('dotenv').config();

const sequelize = require('./config/database');
const stockRoutes = require('./routes/stocks');
const watchlistRoutes = require('./routes/watchlist');
const stockPriceService = require('./services/stockPriceService');
const Stock = require('./models/Stock');

// Sample stock data to initialize the database
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

// CORS Configuration
app.use(cors({
  origin: [
    'https://portfolio-tracker-sage.vercel.app',
    'https://portfolio-tracker-hackstyx.vercel.app',
    'https://portfolio-tracker-kc46ea0ei-hackstyxs-projects.vercel.app',
    'http://44.232.157.2:3000',
    /\.vercel\.app$/
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  optionsSuccessStatus: 200
}));

// Enable CORS preflight
app.options('*', cors());
app.use(express.json());

// Health Check Endpoint
app.get('/api/health', (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  res.status(200).json({ status: 'ok', message: 'Server is running' });
});

// Root Endpoint
app.get('/', (req, res) => {
  res.send('✅ Backend is up and running!');
});

// API Routes
app.use('/api/stocks', stockRoutes);
app.use('/api/watchlist', watchlistRoutes);

// Initialize default stocks if DB is empty
const initializeStocks = async () => {
  try {
    const stockCount = await Stock.count();
    if (stockCount === 0) {
      console.log('⚠️ No stocks found. Initializing default stocks...');
      await Promise.all(defaultStocks.map(stock => Stock.create(stock)));
      console.log('✅ Default stocks initialized.');
    } else {
      console.log(`ℹ️ Found ${stockCount} existing stocks. Skipping initialization.`);
    }
  } catch (error) {
    console.error('❌ Error initializing stocks:', error.message);
  }
};

// Start server
const PORT = process.env.PORT || 5000;

const start = async () => {
  try {
    await sequelize.sync();
    console.log('✅ Database synced successfully');

    await initializeStocks();

    stockPriceService.startPeriodicUpdates();

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    process.exit(1);
  }
};

start();

module.exports = app;
