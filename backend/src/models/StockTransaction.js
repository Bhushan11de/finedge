const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');

const StockTransaction = sequelize.define('StockTransaction', {
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
  },
  type: {
    type: DataTypes.ENUM('buy', 'sell'),
    allowNull: false
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 1
    }
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      min: 0.01
    }
  },
  totalAmount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  transactionDate: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  }
}, {
  timestamps: true,
  underscored: true,
  hooks: {
    beforeCreate: (transaction) => {
      transaction.totalAmount = transaction.quantity * transaction.price;
    }
  }
});

StockTransaction.associate = function(models) {
  StockTransaction.belongsTo(models.User, { foreignKey: 'userId' });
  StockTransaction.belongsTo(models.Stock, { foreignKey: 'stockId' });
};

module.exports = StockTransaction; 