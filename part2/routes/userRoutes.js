const express = require('express');
const router = express.Router();
const mysql = require('mysql2'); // use mysql in application
const db = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'DogWalkService'
}).promise();

// GET all users (for admin/testing)
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT user_id, username, email, role FROM Users');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// POST a new user (simple signup)
router.post('/register', async (req, res) => {
  const { username, email, password, role } = req.body;

  try {
    const [result] = await db.query(`
      INSERT INTO Users (username, email, password_hash, role)
      VALUES (?, ?, ?, ?)
    `, [username, email, password, role]);

    res.status(201).json({ message: 'User registered', user_id: result.insertId });
  } catch (error) {
    res.status(500).json({ error: 'Registration failed' });
  }
});

router.get('/me', (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ error: 'Not logged in' });
  }
  res.json(req.session.user);
});

// POST login
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  // Ensuring blank is filled in login
  if (!username || !password) {
    return res.status(400).json({ message: 'Username and Password are required.' });
  }

  try {
    // getting data from database
    const [results] = await db.query('SELECT * FROM Users WHERE username = ?', [username]);

      if (results.length === 0) {
        return res.status(401).json({ message: 'Invalid Username or Password!' });
      }

      const user = results[0];

      if (user.password_hash === password) {
        // Using sessions here, storing the information needed
        req.session.user = {
          username: user.username,
          email: user.email,
          role: user.role,
          user_id: user.user_id
        };
        res.status(200).json({
          message: 'Login Successful!',
          username: user.username,
          role: user.role
        });
      } else {
        res.status(401).json({ message: 'Invalid Username or Password!.' });
      }
  } catch (err) {
    console.error('Login Error:', err);
    res.status(500).json({ message: 'Server Error' });
  }
});

// Post Logout

module.exports = router;
