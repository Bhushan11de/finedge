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

// Handle database connection errors
const setupConnectionHandlers = () => {
  sequelize.connectionManager.initPools();

  // Handle connection loss
  sequelize.connectionManager.on('error', (err) => {
    if (err.code === 'PROTOCOL_CONNECTION_LOST') {
      console.log('Database connection was closed. Reconnecting...');
      setTimeout(() => {
        sequelize.connectionManager.initPools()
          .then(() => console.log('Successfully reconnected to the database!'))
          .catch((reconnectErr) => console.error('Error reconnecting to database:', reconnectErr));
      }, 1000);
    } else {
      console.error('Database connection error:', err);
    }
  });
};

// Start server
const PORT = process.env.PORT || 5000;

const startServer = () => {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server running on port ${PORT} and binding to 0.0.0.0`);
  });
};

const initializeDatabase = async () => {
  try {
    console.log('Attempting to authenticate database...');
    await sequelize.authenticate();
    console.log('✅ Database connection established');
    
    setupConnectionHandlers();
    
    await sequelize.sync();
    console.log('✅ Database synced successfully');

    await initializeStocks();
    console.log('Starting stock price updates...');
    stockPriceService.startPeriodicUpdates();
    
    return true;
  } catch (error) {
    console.error('❌ Database initialization failed:', error.message);
    return false;
  }
};

const start = async (attempt = 1) => {
  console.log(`Starting application (attempt ${attempt})...`);
  
  const dbInitialized = await initializeDatabase();
  if (!dbInitialized) {
    const nextAttemptDelay = Math.min(1000 * attempt, 10000); // Max 10 second delay
    console.log(`Retrying in ${nextAttemptDelay/1000} seconds...`);
    setTimeout(() => start(attempt + 1), nextAttemptDelay);
    return;
  }

  startServer();
};

// Start the application
start();

module.exports = app;
