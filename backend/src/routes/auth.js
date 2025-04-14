const express = require("express");
const bcrypt = require("bcryptjs");
const mysql = require("mysql2/promise"); // Use mysql2 for async operations
const router = express.Router();

// Create a connection pool to the AWS RDS MySQL instance
const pool = mysql.createPool({
  host: "database-1.c9iimq6egwnz.us-west-2.rds.amazonaws.com", // Replace with your RDS endpoint
  user: "admin", // Replace with your MySQL username
  password: "Bhushan123", // Replace with your MySQL password
  database: "portfolio_tracker", // Replace with your database name
});

// POST /api/signup
router.post("/signup", async (req, res) => {
  const { name, email, password } = req.body;

  try {
    // Check if email already exists
    const [rows] = await pool.query("SELECT * FROM users WHERE email = ?", [email]);
    if (rows.length > 0) {
      return res.status(400).json({ message: "Email already exists" });
    }

    // Hash password and insert new user
    const hashedPassword = await bcrypt.hash(password, 10);
    await pool.query("INSERT INTO users (name, email, password) VALUES (?, ?, ?)", [name, email, hashedPassword]);

    res.status(201).json({ message: "User created", user: { name, email } });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// POST /api/signin
router.post("/signin", async (req, res) => {
  const { email, password } = req.body;

  try {
    // Retrieve user by email
    const [rows] = await pool.query("SELECT * FROM users WHERE email = ?", [email]);
    if (rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    const user = rows[0];
    const valid = await bcrypt.compare(password, user.password);

    if (!valid) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    res.json({ message: "Signin successful", user: { id: user.id, email: user.email, name: user.name } });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

module.exports = router;