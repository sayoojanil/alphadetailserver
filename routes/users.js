const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { protect, adminOnly } = require('../middleware/auth');

// Get all users (Admin only)
router.get('/', protect, adminOnly, async (req, res) => {
  try {
    const users = await User.find().select('-password').sort('-createdAt');
    res.json(users);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Update current user's cart
router.patch('/me/cart', protect, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.user._id, { cart: req.body.cart }, { new: true }).select('cart');
    res.json(user);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Update user (Admin only - e.g. change role)
router.patch('/:id', protect, adminOnly, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true }).select('-password');
    res.json(user);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Delete user (Admin only)
router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'User deleted successfully' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
