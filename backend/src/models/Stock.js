const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');

const Stock = sequelize.define('Stock', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  ticker: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  shares: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  buy_price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0.00
  },
  current_price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0.00
  },
  target_price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true
  },
  is_in_watchlist: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  last_updated: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  }
}, {
  timestamps: true,
  underscored: true
});

module.exports = Stock; 