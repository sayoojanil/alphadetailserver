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

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Database connection
mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    console.log('[DATABASE] Connected to MongoDB');
    // Seed Admin User
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
  })
  .catch(err => console.error('[DATABASE] Connection error:', err));

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
