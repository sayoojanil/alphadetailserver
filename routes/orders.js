const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Product = require('../models/Product');
const { protect, adminOnly } = require('../middleware/auth');

// Create
router.post('/', protect, async (req, res) => {
  try {
    const data = req.body;
    data.user = req.user._id;
    // Map items to match internal DB refs
    const items = await Promise.all(data.items.map(async i => {
      const p = await Product.findOne({ id: i.id });
      if (!p) throw new Error(`Product not found: ${i.id}`);
      return { product: p._id, name: p.name, qty: i.qty, price: p.price };
    }));
    data.items = items;
    const order = await Order.create(data);
    res.status(201).json(order);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Update (Admin only)
router.patch('/:id', protect, adminOnly, async (req, res) => {
  try {
    const order = await Order.findOneAndUpdate({ orderNum: req.params.id }, req.body, { new: true });
    res.json(order);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Get User Orders
router.get('/my-orders', protect, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort('-createdAt');
    res.json(orders);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Admin All Orders
router.get('/admin', protect, adminOnly, async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('user', 'firstName lastName email phone')
      .populate('items.product', 'imgs name')
      .sort('-createdAt');
    res.json(orders);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
