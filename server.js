require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');

const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const orderRoutes = require('./routes/orders');
const paymentRoutes = require('./routes/payments');
const userRoutes = require('./routes/users');

const app = express();
const PORT = process.env.PORT || 5000;

const connectDB = require('./utils/db');

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Ensure DB is connected for every request (Serverless stability)
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    console.error('[DB CONNECTION ERROR]', err);
    res.status(500).json({ error: 'Database connection failed', details: err.message });
  }
});

// One-time Admin seed on startup (for non-serverless or first cold start)
const seedAdmin = async () => {
  try {
    await connectDB();
    const User = require('./models/User');
    const adminExists = await User.findOne({ email: process.env.ADMIN_EMAIL });
    if (!adminExists) {
      await User.create({
        firstName: 'Alpha', lastName: 'Admin',
        email: process.env.ADMIN_EMAIL, password: process.env.ADMIN_PASS,
        role: 'admin'
      });
      console.log('[AUTH] Default Admin Created:', process.env.ADMIN_EMAIL);
    }
  } catch (e) { console.error('[AUTH SEED ERROR]', e); }
};
seedAdmin();

// Routes
app.get('/', (req, res) => {
  res.send(`
   server is running..
  `);
});

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/users', userRoutes);

// Error handler
app.use((err, req, res, next) => {
  console.error('[SERVER ERROR]', err);
  res.status(err.status || 500).json({ error: err.message || 'Internal Server Error', details: err });
});

if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  app.listen(PORT, () => console.log(`[SERVER] Running on http://localhost:${PORT}`));
}

module.exports = app;
