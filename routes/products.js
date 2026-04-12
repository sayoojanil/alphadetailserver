const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const { protect, adminOnly } = require('../middleware/auth');
const { upload } = require('../utils/cloudinary');

// Get all
router.get('/', async (req, res) => {
  try {
    const products = await Product.find().sort('-createdAt');
    res.json(products);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Update or Create (Admin only)
router.post('/', protect, adminOnly, upload.array('images', 3), async (req, res) => {
  try {
    const data = req.body;
    console.log('📦 Incoming Product Data:', data);
    console.log('📁 Incoming Files:', req.files ? req.files.length : 0);

    if (req.files && req.files.length > 0) {
      data.imgs = req.files.map(f => f.path);
      console.log('✅ Uploaded to Cloudinary:', data.imgs);
    }
    if (data.feats && typeof data.feats === 'string') data.feats = JSON.parse(data.feats);
    if (data.tags && typeof data.tags === 'string') data.tags = JSON.parse(data.tags);
    if (data.howToUse && typeof data.howToUse === 'string') data.howToUse = JSON.parse(data.howToUse);
    
    let product = await Product.findOne({ id: data.id });
    if (product) {
      product = await Product.findOneAndUpdate({ id: data.id }, data, { returnDocument: 'after' });
    } else {
      product = await Product.create(data);
    }
    res.json(product);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Delete
router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    await Product.findOneAndDelete({ id: req.params.id });
    res.json({ message: 'Success' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
