const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const generateToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });

const { loginLimiter } = require('../middleware/rateLimit');

// Register
router.post('/register', async (req, res) => {
  try {
    const { firstName, lastName, email, password, phone } = req.body;
    const userEx = await User.findOne({ email });
    if (userEx) return res.status(400).json({ error: 'User already exists' });
    const user = await User.create({ firstName, lastName, email, password, phone });
    const userResp = user.toObject();
    delete userResp.password;
    res.status(201).json({ ...userResp, token: generateToken(user._id) });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Login
router.post('/login', loginLimiter, async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (user && (await user.comparePassword(password))) {
      const userResp = user.toObject();
      delete userResp.password;
      res.json({ ...userResp, token: generateToken(user._id) });
    } else {
      res.status(401).json({ error: 'Invalid credentials' });
    }
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
