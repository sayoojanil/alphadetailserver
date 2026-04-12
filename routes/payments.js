const express = require('express');
const router = express.Router();
const Razorpay = require('razorpay');
const { protect } = require('../middleware/auth');
const crypto = require('crypto');
const Order = require('../models/Order');

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
    const amount = Math.round(parseFloat(total) * 100);
    
    const opt = { 
      amount, 
      currency: 'INR', 
      receipt: 'rcp_' + Date.now(),
      payment_capture: 1, 
      notes: {
        customerName: customer?.name || 'Guest',
        customerEmail: customer?.email || '',
        customerPhone: customer?.phone || '',
        info: "Automated Order Sync"
      }
    };
    
    console.log(`[PAYMENT] Creating order for ₹${total} (${amount} paise)`);
    const rOrder = await rp.orders.create(opt);
    res.json({ ...rOrder, key_id: process.env.RAZORPAY_KEY_ID });
  } catch (err) { 
    console.error('[PAYMENT ERROR] Order Creation Failed:', err);
    res.status(500).json({ error: err.message || 'Error creating Razorpay order' }); 
  }
});

// Verify
router.post('/verify', protect, async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ success: false, error: 'Missing payment details' });
    }

    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expected = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest('hex');

    if (expected === razorpay_signature) {
      console.log(`[PAYMENT] Verified: ${razorpay_payment_id}`);
      res.json({ success: true });
    } else {
      console.warn(`[PAYMENT INVALID] Signature mismatch for order ${razorpay_order_id}`);
      res.status(400).json({ success: false, error: 'Payment verification failed' });
    }
  } catch (err) { 
    console.error('[PAYMENT ERROR] Verification failed:', err);
    res.status(500).json({ error: err.message }); 
  }
});

// Webhook Handler
router.post('/webhook', async (req, res) => {
  try {
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
    const signature = req.headers['x-razorpay-signature'];

    // Verify Signature
    const shasum = crypto.createHmac('sha256', secret);
    shasum.update(JSON.stringify(req.body));
    const digest = shasum.digest('hex');

    if (digest !== signature) {
      console.warn('[WEBHOOK INVALID] Signature mismatch');
      return res.status(400).send('Invalid signature');
    }

    const event = req.body.event;
    console.log(`[WEBHOOK] Received event: ${event}`);

    const payload = req.body.payload;
    let razorpayOrderId, razorpayPaymentId;

    if (event === 'order.paid' || event === 'payment.captured') {
      const payment = payload.payment.entity;
      razorpayOrderId = payment.order_id;
      razorpayPaymentId = payment.id;

      // Retry logic: Webhook might arrive before client saves the order
      let retryCount = 0;
      let order = null;
      while (retryCount < 5 && !order) {
        order = await Order.findOneAndUpdate(
          { razorpayOrderId: razorpayOrderId },
          { 
            paymentStatus: 'paid', 
            razorpayPaymentId: razorpayPaymentId 
          }
        );
        if (!order) {
          console.log(`[WEBHOOK] Order ${razorpayOrderId} not found, retrying in 2s... (${retryCount + 1}/5)`);
          await new Promise(resolve => setTimeout(resolve, 2000));
          retryCount++;
        }
      }
      
      if (order) {
        console.log(`[WEBHOOK] Order ${razorpayOrderId} marked as PAID`);
      } else {
        console.warn(`[WEBHOOK] Order ${razorpayOrderId} NOT FOUND after retries. Payment ID: ${razorpayPaymentId}`);
      }
    }

    if (event === 'payment.failed') {
      const payment = payload.payment.entity;
      razorpayOrderId = payment.order_id;

      await Order.findOneAndUpdate(
        { razorpayOrderId: razorpayOrderId },
        { paymentStatus: 'failed' }
      );
      console.log(`[WEBHOOK] Order ${razorpayOrderId} marked as FAILED`);
    }

    res.json({ status: 'ok' });
  } catch (err) {
    console.error('[WEBHOOK ERROR]', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
