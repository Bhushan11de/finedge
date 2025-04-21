require('dotenv').config();

module.exports = {
  development: {
    username: 'admin',
    password: 'Bhushan123',
    database: 'portfolio_tracker',
    host: 'database-1.c9iimq6egwnz.us-west-2.rds.amazonaws.com',
    port: 3306,
    dialect: 'mysql',
    logging: console.log,
    define: {
      timestamps: true,
      underscored: true
    }
  },
  production: {
    username: 'admin',
    password: 'Bhushan123',
    database: 'portfolio_tracker',
    host: 'database-1.c9iimq6egwnz.us-west-2.rds.amazonaws.com',
    port: 3306,
    dialect: 'mysql',
    logging: false,
    define: {
      timestamps: true,
      underscored: true
    }
  }
};