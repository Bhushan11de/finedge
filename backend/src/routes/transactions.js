const express = require("express");
const router = express.Router();
const StockTransaction = require("../models/StockTransaction");
const Stock = require("../models/Stock");
const { Op } = require("sequelize");

// Middleware to check if user is authenticated
const isAuthenticated = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  next();
};

// GET /api/transactions - Get all transactions for a user
router.get("/", isAuthenticated, async (req, res) => {
  try {
    const transactions = await StockTransaction.findAll({
      where: { userId: req.user.id },
      include: [Stock],
      order: [['transactionDate', 'DESC']]
    });
    res.json(transactions);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// POST /api/transactions/buy - Record a buy transaction
router.post("/buy", isAuthenticated, async (req, res) => {
  const { stockId, quantity, price } = req.body;
  try {
    const stock = await Stock.findByPk(stockId);
    if (!stock) {
      return res.status(404).json({ message: "Stock not found" });
    }

    const transaction = await StockTransaction.create({
      userId: req.user.id,
      stockId,
      type: 'buy',
      quantity,
      price,
      totalAmount: quantity * price
    });

    res.status(201).json(transaction);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// POST /api/transactions/sell - Record a sell transaction
router.post("/sell", isAuthenticated, async (req, res) => {
  const { stockId, quantity, price } = req.body;
  try {
    const stock = await Stock.findByPk(stockId);
    if (!stock) {
      return res.status(404).json({ message: "Stock not found" });
    }

    // Check if user has enough stocks to sell
    const totalBought = await StockTransaction.sum('quantity', {
      where: {
        userId: req.user.id,
        stockId,
        type: 'buy'
      }
    });

    const totalSold = await StockTransaction.sum('quantity', {
      where: {
        userId: req.user.id,
        stockId,
        type: 'sell'
      }
    });

    const availableStocks = (totalBought || 0) - (totalSold || 0);
    if (availableStocks < quantity) {
      return res.status(400).json({ message: "Insufficient stocks to sell" });
    }

    const transaction = await StockTransaction.create({
      userId: req.user.id,
      stockId,
      type: 'sell',
      quantity,
      price,
      totalAmount: quantity * price
    });

    res.status(201).json(transaction);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// GET /api/transactions/portfolio - Get user's portfolio summary
router.get("/portfolio", isAuthenticated, async (req, res) => {
  try {
    const transactions = await StockTransaction.findAll({
      where: { userId: req.user.id },
      include: [Stock]
    });

    const portfolio = {};
    transactions.forEach(transaction => {
      const { stockId, type, quantity, price, Stock } = transaction;
      if (!portfolio[stockId]) {
        portfolio[stockId] = {
          stock: Stock,
          quantity: 0,
          totalInvested: 0,
          currentValue: 0
        };
      }

      if (type === 'buy') {
        portfolio[stockId].quantity += quantity;
        portfolio[stockId].totalInvested += quantity * price;
      } else {
        portfolio[stockId].quantity -= quantity;
        portfolio[stockId].totalInvested -= quantity * price;
      }
    });

    // Calculate current value for each stock
    for (const stockId in portfolio) {
      const stock = await Stock.findByPk(stockId);
      portfolio[stockId].currentValue = portfolio[stockId].quantity * stock.currentPrice;
    }

    res.json(portfolio);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

module.exports = router; 