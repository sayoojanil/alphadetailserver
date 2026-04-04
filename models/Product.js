const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  code: { type: String },
  name: { type: String, required: true },
  sub: { type: String },
  price: { type: Number, required: true },
  badge: { type: String },
  cat: { type: String },
  hook: { type: String },
  desc: { type: String },
  feats: { type: [String] },
  tags: { type: [String] },
  imgs: { type: [String] },
  grad: { type: String },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Product', productSchema);
