const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { protect, adminOnly } = require('../middleware/auth');
const { avatarUpload } = require('../utils/cloudinary');

// Get all users (Admin only)
router.get('/', protect, adminOnly, async (req, res) => {
  try {
    const users = await User.find().select('-password').sort('-createdAt');
    res.json(users);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Get current user profile
router.get('/me', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.json(user);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Update current user's cart
router.patch('/me/cart', protect, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.user._id, { cart: req.body.cart }, { new: true }).select('cart');
    res.json(user);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Update current user's profile
router.post('/me', protect, avatarUpload.single('avatar'), async (req, res) => {
  try {
    console.log('👤 Profile Update Request:', req.body);
    console.log('🖼️ Avatar File:', req.file ? req.file.path : 'None');
    
    // Allow partial updates if only avatar is sent
    const { 
      firstName, lastName, phone, phoneCode, secondaryPhone,
      houseNo, address, landmark, city, district, state, country, pin 
    } = req.body;
    
    let upData = {};

    if (req.file) upData.avatar = req.file.path;
    if (firstName) upData.firstName = firstName;
    if (lastName !== undefined) upData.lastName = lastName;
    if (phone) upData.phone = phone;
    if (phoneCode) upData.phoneCode = phoneCode;
    if (secondaryPhone !== undefined) upData.secondaryPhone = secondaryPhone;
    if (houseNo) upData.houseNo = houseNo;
    if (address) upData.address = address;
    if (landmark !== undefined) upData.landmark = landmark;
    if (city) upData.city = city;
    if (district) upData.district = district;
    if (state) upData.state = state;
    if (country) upData.country = country;
    if (pin) upData.pin = pin;

    // Basic validation only if full form sent
    if (!req.file || firstName) {
      if (!firstName && !req.file) return res.status(400).json({ error: 'First name is required' });
      if (phone) {
        const phoneRegex = /^[6-9]\d{9}$/;
        if (!phoneRegex.test(phone.replace(/\D/g, ''))) return res.status(400).json({ error: 'Invalid phone number (10 digits expected)' });
      }
      if (pin) {
        const pinCheck = /^\d{6}$/.test(pin.replace(/\D/g, ''));
        if (!pinCheck) return res.status(400).json({ error: 'Invalid PIN Code (6 digits expected)' });
      }
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      upData,
      { new: true, runValidators: true }
    ).select('-password');

    console.log('✅ Updated User:', updatedUser);
    res.json(updatedUser);
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
