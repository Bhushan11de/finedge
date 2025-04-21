const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');

const Watchlist = sequelize.define('Watchlist', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  stockId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Stocks',
      key: 'id'
    }
  }
}, {
  timestamps: true,
  underscored: true,
  indexes: [
    {
      unique: true,
      fields: ['user_id', 'stock_id']
    }
  ]
});

Watchlist.associate = function(models) {
  Watchlist.belongsTo(models.User, { foreignKey: 'userId' });
  Watchlist.belongsTo(models.Stock, { foreignKey: 'stockId' });
};

module.exports = Watchlist; 