'use strict';

const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const process = require('process');

const basename = path.basename(__filename);
const env = process.env.NODE_ENV || 'development';

// Load config from config/config.json
const config = require(path.join(__dirname, '..', 'config', 'config.json'))[env];

const db = {};

let sequelize;

// Use environment variable or default config
if (config.use_env_variable) {
  sequelize = new Sequelize(process.env[config.use_env_variable], config);
} else {
  sequelize = new Sequelize(config.database, config.username, config.password, config);
}

// Read and import all model files
fs.readdirSync(__dirname)
  .filter((file) => (
    file.indexOf('.') !== 0 &&             // Skip hidden files
    file !== basename &&                  // Skip this index.js
    file.slice(-3) === '.js' &&           // Only .js files
    !file.endsWith('.test.js')            // Skip test files
  ))
  .forEach((file) => {
    const model = require(path.join(__dirname, file))(sequelize, Sequelize.DataTypes);
    db[model.name] = model;
  });

// Run model associations if defined
Object.keys(db).forEach((modelName) => {
  if (typeof db[modelName].associate === 'function') {
    db[modelName].associate(db);
  }
});

// Export Sequelize instance and models
db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
