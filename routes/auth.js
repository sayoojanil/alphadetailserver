const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const generateToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });

// Register
router.post('/register', async (req, res) => {
  try {
    const { firstName, lastName, email, password, phone } = req.body;
    const userEx = await User.findOne({ email });
    if (userEx) return res.status(400).json({ error: 'User already exists' });
    const user = await User.create({ firstName, lastName, email, password, phone });
    res.status(201).json({ id: user._id, token: generateToken(user._id), firstName: user.firstName, lastName: user.lastName, email: user.email, role: user.role, phone: user.phone, address: user.address, city: user.city, pin: user.pin, avatar: user.avatar, cart: user.cart, createdAt: user.createdAt });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (user && (await user.comparePassword(password))) {
      res.json({ id: user._id, token: generateToken(user._id), firstName: user.firstName, lastName: user.lastName, email: user.email, role: user.role, phone: user.phone, address: user.address, city: user.city, pin: user.pin, avatar: user.avatar, cart: user.cart, createdAt: user.createdAt });
    } else {
      res.status(401).json({ error: 'Invalid credentials' });
    }
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
