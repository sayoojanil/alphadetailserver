const express = require('express');
const router = express.Router();
const Razorpay = require('razorpay');
const { protect } = require('../middleware/auth');
const crypto = require('crypto');

const rp = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

// Create Order (Razorpay)
router.post('/create-id', protect, async (req, res) => {
  try {
    const { total, customer } = req.body;
    if (!total || total < 1) return res.status(400).json({ error: 'Minimum order amount is ₹1' });
    
    // Amount in Paise (Must be an integer)
    const amount = Math.round(Number(total) * 100);
    const opt = { 
      amount, 
      currency: 'INR', 
      receipt: 'rcp_' + Date.now(),
      payment_capture: 1, // Auto-capture payment upon success
      notes: {
        customerName: customer?.name || 'Guest',
        customerEmail: customer?.email || '',
        customerPhone: customer?.phone || '',
        info: "Automated Order Sync"
      }
    };
    
    const rOrder = await rp.orders.create(opt);
    // Return order object PLUS the key_id to ensure frontend and backend are always in sync
    res.json({ ...rOrder, key_id: process.env.RAZORPAY_KEY_ID });
  } catch (err) { 
    console.error('Razorpay Error:', err);
    res.status(500).json({ error: err.message || 'Error creating Razorpay order' }); 
  }
});

// Verify
router.post('/verify', protect, async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expected = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET).update(body.toString()).digest('hex');
    if (expected === razorpay_signature) res.json({ success: true });
    else res.status(400).json({ success: false });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
