const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  orderNum: { type: String, required: true, unique: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: [
    {
      product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
      name: { type: String },
      qty: { type: Number, required: true },
      price: { type: Number, required: true }
    }
  ],
  subtotal: { type: Number, required: true },
  shipping: { type: Number, default: 0 },
  gst: { type: Number, default: 0 },
  discount: { type: Number, default: 0 },
  total: { type: Number, required: true },
  paymentMethod: { type: String, enum: ['cod', 'razorpay'], default: 'cod' },
  paymentStatus: { type: String, enum: ['pending', 'paid', 'failed'], default: 'pending' },
  razorpayOrderId: { type: String },
  razorpayPaymentId: { type: String },
  address: {
    first: { type: String, required: true },
    last: { type: String },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    addr: { type: String, required: true },
    addr2: { type: String },
    city: { type: String, required: true },
    pin: { type: String, required: true },
    state: { type: String, default: 'Kerala' }
  },
  status: { type: String, enum: ['ordered', 'processing', 'shipped', 'delivered', 'cancelled'], default: 'ordered' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Order', orderSchema);
