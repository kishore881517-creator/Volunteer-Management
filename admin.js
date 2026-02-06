const express = require('express');
const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');
const { JWT_SECRET } = require('../middleware/auth');

const router = express.Router();

// Admin/Employee Login
router.post('/login', async (req, res) => {
  try {
    const { email, username, password } = req.body;
    const identifier = email || username;

    if (!identifier || !password) {
      return res.status(400).json({ message: 'Email/Username and password are required' });
    }

    // Hardcoded Admin Credentials (as a fallback or special case)
    const hardcodedEmail = 'kishore881517@gmail.com';
    const hardcodedPassword = 'kamal@12345';

    let admin;

    if (identifier === hardcodedEmail && password === hardcodedPassword) {
      // Find or create the hardcoded admin in DB
      admin = await Admin.findOne({ email: hardcodedEmail });
      if (!admin) {
        admin = new Admin({
          username: 'admin',
          password: hardcodedPassword,
          email: hardcodedEmail,
          role: 'admin'
        });
        await admin.save();
      }
    } else {
      // Check database for either username or email
      admin = await Admin.findOne({
        $or: [{ email: identifier }, { username: identifier }]
      });

      if (!admin || admin.password !== password) {
        return res.status(401).json({ message: 'Invalid credentials. Access denied.' });
      }
    }

    const token = jwt.sign(
      { id: admin._id, username: admin.username, role: admin.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Login successful',
      token,
      admin: { id: admin._id, username: admin.username, role: admin.role, email: admin.email },
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: err.message });
  }
});


// Register Admin/Employee
router.post('/register', async (req, res) => {
  try {
    const { username, password, email, role } = req.body;

    if (!username || !password || !email) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const existingAdmin = await Admin.findOne({ $or: [{ username }, { email }] });
    if (existingAdmin) {
      return res.status(400).json({ message: 'Username or email already exists' });
    }

    const admin = new Admin({
      username,
      password,
      email,
      role: role || 'admin'
    });

    await admin.save();

    const token = jwt.sign(
      { id: admin._id, username: admin.username, role: admin.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(201).json({
      message: 'Registration successful',
      token,
      admin: { id: admin._id, username: admin.username, role: admin.role, email: admin.email },
    });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;

