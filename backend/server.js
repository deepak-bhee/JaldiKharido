const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const connectDB = require('./config/db');
const { getNotificationStatus, logNotificationStatus } = require('./config/notifications');
const { sendEmailNotification } = require('./utils/notifier');

dotenv.config({ path: path.join(__dirname, '.env') });

// Connect to database
connectDB();

const app = express();

// Middleware
app.use((req, res, next) => {
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin-allow-popups');
  next();
});
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/products', require('./routes/products'));
app.use('/api/orders', require('./routes/orders'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'E-Commerce API is running',
    timestamp: new Date(),
    notifications: getNotificationStatus(),
    env: {
      BREVO_API_KEY: process.env.BREVO_API_KEY ? '✅ SET' : '❌ MISSING',
      SMTP_USER: process.env.SMTP_USER ? '✅ SET' : '❌ MISSING',
      NODE_VERSION: process.version,
    }
  });
});

// Test email endpoint (for debugging live server)
app.post('/api/test-email', async (req, res) => {
  const to = req.body.email || 'deepakbhee2006@gmail.com';
  try {
    const result = await sendEmailNotification(
      to,
      'JaldiKharidoo — Live Server Email Test 🚀',
      'Email delivery from your live Render server is working!',
      '<h2 style="color:#f97316;">JaldiKharidoo ⚡</h2><p>Live server email delivery is working! 🎉</p>'
    );
    res.json({ success: result, to, BREVO_KEY: process.env.BREVO_API_KEY ? '✅ SET' : '❌ MISSING' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`\n🚀 E-Commerce API running on http://localhost:${PORT}`);
  console.log(`📦 Environment: ${process.env.NODE_ENV || 'development'}`);
  logNotificationStatus();
});
