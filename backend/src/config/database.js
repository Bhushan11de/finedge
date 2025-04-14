const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'mysql',
  logging: false, // Turn on if you want to see SQL logs
  dialectOptions: {
    // Only use this SSL part if you're on Railway or a host that requires SSL
    // Otherwise, comment it out for localhost
    ssl: {
      require: false,
      rejectUnauthorized: false
    }
  }
});

// Test the connection
sequelize.authenticate()
  .then(() => {
    console.log('✅ Database connection has been established successfully.');
  })
  .catch(err => {
    console.error('❌ Unable to connect to the database:', err);
  });

module.exports = sequelize;
