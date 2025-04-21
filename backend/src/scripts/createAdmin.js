const bcrypt = require('bcryptjs');
const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: 'mysql',
    logging: false
  }
);

async function createAdmin() {
  try {
    await sequelize.authenticate();
    console.log('Database connection has been established successfully.');

    const adminEmail = 'admin@finedge.com';
    const adminPassword = 'Admin@123';
    const hashedPassword = await bcrypt.hash(adminPassword, 10);

    const [results] = await sequelize.query(
      'SELECT * FROM Users WHERE email = ?',
      {
        replacements: [adminEmail],
        type: Sequelize.QueryTypes.SELECT
      }
    );

    if (results) {
      console.log('Admin user already exists');
      return;
    }

    await sequelize.query(
      `INSERT INTO Users (name, email, password, role, createdAt, updatedAt) 
       VALUES (?, ?, ?, 'admin', NOW(), NOW())`,
      {
        replacements: ['Admin', adminEmail, hashedPassword],
        type: Sequelize.QueryTypes.INSERT
      }
    );

    console.log('Admin user created successfully!');
    console.log('Your admin credentials are:');
    console.log('Email:', adminEmail);
    console.log('Password:', adminPassword);
  } catch (error) {
    console.error('Error creating admin user:', error);
  } finally {
    await sequelize.close();
  }
}

createAdmin(); 