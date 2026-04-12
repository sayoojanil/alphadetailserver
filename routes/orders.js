const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const User = require('../models/User');
const Product = require('../models/Product');
const { protect, adminOnly } = require('../middleware/auth');
const { sendWhatsAppMessage } = require('../utils/whatsapp');
const { sendOrderEmail } = require('../utils/email');

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
    
    // Update user profile with the delivery details from this order
    try {
      await User.findByIdAndUpdate(req.user._id, {
        firstName: order.address.first,
        lastName: order.address.last,
        phone: order.address.phone,
        phoneCode: order.address.phoneCode,
        secondaryPhone: order.address.secondaryPhone,
        houseNo: order.address.houseNo,
        address: order.address.addr,
        landmark: order.address.landmark,
        city: order.address.city,
        district: order.address.district,
        state: order.address.state,
        country: order.address.country,
        pin: order.address.pin
      });
    } catch (userUpErr) {
      console.error('[USER PROFILE AUTO-UPDATE ERR]', userUpErr.message);
    }

    // Send Notifications (Background)
    try {
      // 1. WhatsApp
      const orderDetails = order.items.map(item => `- ${item.name} (Qty: ${item.qty})`).join('\n');
      const messageBody = `
🛍️ *Order Confirmed!*

Hi ${order.address.first}, thank you for shopping with Alpha Detail!

*Order ID:* ${order.orderNum}
*Total:* ₹${order.total}

*Items:*
${orderDetails}

*Delivery Address:*
${order.address.addr}, ${order.address.city} - ${order.address.pin}

We will notify you once your order is shipped.
      `.trim();

      let phone = order.address.phone.replace(/\D/g, '');
      if (phone.length === 11 && phone.startsWith('0')) phone = phone.substring(1);
      if (phone.length === 10) phone = '91' + phone;
      if (!phone.startsWith('+')) phone = '+' + phone;

      sendWhatsAppMessage(phone, messageBody).catch(e => console.error('[WHATSAPP ERR]', e.message));

      // 2. Email
      sendOrderEmail(order).catch(e => console.error('[EMAIL ERR]', e.message));

    } catch (msgErr) {
      console.error('[NOTIFICATION ERROR]', msgErr.message);
    }

    res.status(201).json(order);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Update (Admin only)
router.patch('/:id', protect, adminOnly, async (req, res) => {
  try {
    const order = await Order.findOneAndUpdate({ orderNum: req.params.id }, req.body, { returnDocument: 'after' });
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
      .populate('user', 'firstName lastName email phone avatar')
      .populate('items.product', 'imgs name')
      .sort('-createdAt');
    res.json(orders);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Delete Order (Admin only)
router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    const order = await Order.findOneAndDelete({ orderNum: req.params.id });
    if (!order) return res.status(404).json({ error: 'Order not found' });
    res.json({ message: 'Order deleted successfully' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
