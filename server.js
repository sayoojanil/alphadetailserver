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
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>AlphaDetail | API Server</title>
        <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;700&display=swap" rel="stylesheet">
        <style>
            :root {
                --primary: #ff3366;
                --secondary: #2196f3;
                --bg: #0a0a0a;
                --card-bg: rgba(255, 255, 255, 0.05);
                --text: #ffffff;
            }
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body {
                font-family: 'Outfit', sans-serif;
                background-color: var(--bg);
                color: var(--text);
                height: 100vh;
                display: flex;
                align-items: center;
                justify-content: center;
                overflow: hidden;
            }
            .background-glow {
                position: fixed;
                top: 0; left: 0; width: 100%; height: 100%;
                background: radial-gradient(circle at 50% 50%, rgba(255, 51, 102, 0.15) 0%, transparent 50%),
                            radial-gradient(circle at 80% 20%, rgba(33, 150, 243, 0.1) 0%, transparent 40%);
                z-index: -1;
            }
            .container {
                text-align: center;
                padding: 3rem;
                background: var(--card-bg);
                backdrop-filter: blur(10px);
                border: 1px solid rgba(255, 255, 255, 0.1);
                border-radius: 24px;
                box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
                animation: fadeIn 1s ease-out;
            }
            @keyframes fadeIn {
                from { opacity: 0; transform: translateY(20px); }
                to { opacity: 1; transform: translateY(0); }
            }
            .logo {
                font-size: 2.5rem;
                font-weight: 700;
                margin-bottom: 1rem;
                background: linear-gradient(135deg, #fff 0%, #aaa 100%);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
            }
            .status-badge {
                display: inline-flex;
                align-items: center;
                padding: 0.5rem 1.25rem;
                background: rgba(16, 185, 129, 0.1);
                border: 1px solid rgba(16, 185, 129, 0.3);
                border-radius: 100px;
                color: #10b981;
                font-weight: 600;
                font-size: 0.875rem;
                margin-bottom: 2rem;
            }
            .status-dot {
                width: 8px;
                height: 8px;
                background: #10b981;
                border-radius: 50%;
                margin-right: 8px;
                box-shadow: 0 0 10px #10b981;
                animation: pulse 2s infinite;
            }
            @keyframes pulse {
                0% { opacity: 1; transform: scale(1); }
                50% { opacity: 0.5; transform: scale(1.2); }
                100% { opacity: 1; transform: scale(1); }
            }
            h1 { font-size: 1.5rem; font-weight: 400; color: #94a3b8; margin-bottom: 2rem; }
            .links { display: flex; gap: 1rem; justify-content: center; }
            .link {
                color: #64748b;
                text-decoration: none;
                font-size: 0.875rem;
                transition: color 0.3s;
            }
            .link:hover { color: #fff; }
        </style>
    </head>
    <body>
        <div class="background-glow"></div>
        <div class="container">
            <div class="logo">AlphaDetail</div>
            <div class="status-badge">
                <div class="status-dot"></div>
                System Operational
            </div>
            <h1>API Server is running smoothly</h1>
            <div class="links">
                <span class="link">v1.2.0</span>
                <span style="color: #334155">•</span>
                <span class="link">Production Environment</span>
            </div>
        </div>
    </body>
    </html>
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
