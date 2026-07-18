const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Product = require('../models/Product');

// Generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE || '7d' });
};

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }

    const userRole = (role === 'admin' && req.body.adminSecret === process.env.JWT_SECRET) ? 'admin' : 'user';
    const user = await User.create({ name, email, password, role: userRole });
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const token = generateToken(user._id);

    res.json({
      success: true,
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Google Sign-In / Sign-Up
// @route   POST /api/auth/google
// @access  Public
const googleLogin = async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) {
      return res.status(400).json({ success: false, message: 'Google token required' });
    }

    // Verify token with Google's tokeninfo API
    const response = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${token}`);
    if (!response.ok) {
      return res.status(400).json({ success: false, message: 'Invalid Google token' });
    }

    const payload = await response.json();
    const { email, name } = payload;
    if (!email) {
      return res.status(400).json({ success: false, message: 'Email address not provided by Google' });
    }

    let user = await User.findOne({ email });
    if (!user) {
      // Create new user (Google signup) with a random password
      const randomPassword = Math.random().toString(36).slice(-10) + 'A1!';
      user = await User.create({
        name,
        email,
        password: randomPassword,
        role: 'user'
      });
      console.log(`🆕 Created new user via Google signup: ${name} (${email})`);
    }

    const localToken = generateToken(user._id);

    res.json({
      success: true,
      token: localToken,
      user: { id: user._id, name: user.name, email: user.email, role: user.role }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Seed demo data (products + admin) — always refreshes products
// @route   POST /api/auth/seed
// @access  Public
const seed = async (req, res) => {
  try {
    // Create admin user
    let admin = await User.findOne({ email: 'admin@shop.com' });
    if (!admin) {
      admin = await User.create({
        name: 'Admin User', email: 'admin@shop.com', password: 'admin123', role: 'admin'
      });
    }

    // Create demo user
    let demoUser = await User.findOne({ email: 'user@shop.com' });
    if (!demoUser) {
      demoUser = await User.create({
        name: 'Demo User', email: 'user@shop.com', password: 'user123', role: 'user'
      });
    }

    // Always reseed products for fresh data with better images
    await Product.deleteMany({});

    const products = [
      // ── ELECTRONICS ────────────────────────────────────────
      {
        name: 'Sony WH-1000XM5 Headphones',
        description: 'Industry-leading noise canceling with 8 mics. 30-hour battery, multipoint connection, speak-to-chat technology. The ultimate premium wireless headphone experience.',
        price: 24999, originalPrice: 34999,
        category: 'Electronics',
        image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&h=600&fit=crop',
        stock: 50, rating: 4.8, numReviews: 2134, featured: true
      },
      {
        name: 'Apple AirPods Pro (2nd Gen)',
        description: 'Active Noise Cancellation, Transparency mode, Adaptive Audio. MagSafe USB-C charging case with precision finding.',
        price: 19999, originalPrice: 26900,
        category: 'Electronics',
        image: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=600&h=600&fit=crop',
        stock: 30, rating: 4.9, numReviews: 5621, featured: true
      },
      {
        name: 'Samsung Galaxy S24 Ultra',
        description: '200MP camera, titanium frame, built-in S Pen. 5000mAh battery with 45W fast charging. The ultimate Android flagship.',
        price: 124999, originalPrice: 134999,
        category: 'Electronics',
        image: 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=600&h=600&fit=crop',
        stock: 25, rating: 4.7, numReviews: 1832, featured: true
      },
      {
        name: 'Mechanical Gaming Keyboard RGB',
        description: 'Cherry MX switches, per-key RGB lighting, anti-ghosting, aluminium body. Perfect for gaming and professional use.',
        price: 7999, originalPrice: 12000,
        category: 'Electronics',
        image: 'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?w=600&h=600&fit=crop',
        stock: 75, rating: 4.6, numReviews: 892
      },
      {
        name: '4K Gaming Monitor 27"',
        description: 'IPS panel, 165Hz refresh rate, 1ms response time, HDR600, AMD FreeSync Premium Pro. Height/tilt/swivel adjustable.',
        price: 34999, originalPrice: 45000,
        category: 'Electronics',
        image: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=600&h=600&fit=crop',
        stock: 25, rating: 4.7, numReviews: 456
      },
      {
        name: 'Logitech MX Master 3S Mouse',
        description: 'Ultra-fast MagSpeed scroll, 8K DPI, silent clicks, ergonomic design. Works on any surface including glass.',
        price: 8499, originalPrice: 10999,
        category: 'Electronics',
        image: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=600&h=600&fit=crop',
        stock: 60, rating: 4.8, numReviews: 3421
      },
      {
        name: 'GoPro Hero 12 Black',
        description: '5.3K60 video, HyperSmooth 6.0 stabilization, waterproof to 10m. TimeWarp 3.0, HDR video, Enduro battery.',
        price: 35999, originalPrice: 44999,
        category: 'Electronics',
        image: 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=600&h=600&fit=crop',
        stock: 20, rating: 4.7, numReviews: 678
      },
      {
        name: 'iPad Air M2 (2024)',
        description: 'M2 chip, 11" Liquid Retina display, Apple Pencil Pro support, Magic Keyboard compatible. 256GB storage.',
        price: 74900, originalPrice: 84900,
        category: 'Electronics',
        image: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=600&h=600&fit=crop',
        stock: 18, rating: 4.9, numReviews: 2103, featured: true
      },
      {
        name: 'Portable Bluetooth Speaker JBL',
        description: 'JBL Charge 5 - 20h battery, IP67 waterproof, PartyBoost for stereo pairing, built-in power bank for charging devices.',
        price: 11999, originalPrice: 15999,
        category: 'Electronics',
        image: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=600&h=600&fit=crop',
        stock: 45, rating: 4.6, numReviews: 1567
      },
      {
        name: 'DJI Mini 4 Pro Drone',
        description: '4K/60fps omnidirectional obstacle sensing drone. 34-min flight time, ActiveTrack 360°, under 249g. No registration needed.',
        price: 89999, originalPrice: 109999,
        category: 'Electronics',
        image: 'https://images.unsplash.com/photo-1473968512647-3e447244af8f?w=600&h=600&fit=crop',
        stock: 10, rating: 4.8, numReviews: 892, featured: true
      },

      // ── CLOTHING ───────────────────────────────────────────
      {
        name: 'Nike Air Max 270 React',
        description: 'Nike Air Max + React foam cushioning. Breathable mesh upper, reflective details. Available in multiple colorways.',
        price: 8999, originalPrice: 12995,
        category: 'Clothing',
        image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&h=600&fit=crop',
        stock: 100, rating: 4.7, numReviews: 3201, featured: true
      },
      {
        name: 'Premium Cotton Oversized Hoodie',
        description: '400 GSM brushed cotton fleece, dropped shoulders, kangaroo pocket. Unisex relaxed fit, available in 8 colors.',
        price: 2499, originalPrice: 3999,
        category: 'Clothing',
        image: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=600&h=600&fit=crop',
        stock: 120, rating: 4.5, numReviews: 789
      },
      {
        name: 'Levi\'s 511 Slim Fit Jeans',
        description: 'Classic slim fit through the thigh, slightly tapered leg. Soft stretch denim, sits below waist.',
        price: 3499, originalPrice: 4499,
        category: 'Clothing',
        image: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=600&h=600&fit=crop',
        stock: 200, rating: 4.4, numReviews: 4521
      },
      {
        name: 'Adidas Ultraboost 23',
        description: 'Boost midsole with Continental rubber outsole. Primeknit+ upper hugs your foot. Perfect for running and everyday wear.',
        price: 12999, originalPrice: 17999,
        category: 'Clothing',
        image: 'https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?w=600&h=600&fit=crop',
        stock: 80, rating: 4.8, numReviews: 2134
      },
      {
        name: 'Formal Slim Fit Blazer',
        description: 'Italian wool blend, fully canvassed construction. Notch lapel, 2-button, 2 flap pockets. Ideal for work and events.',
        price: 5999, originalPrice: 9999,
        category: 'Clothing',
        image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&h=600&fit=crop',
        stock: 60, rating: 4.6, numReviews: 432
      },
      {
        name: 'Yoga Activewear Set',
        description: 'High-waist leggings + sports bra set. 4-way stretch, moisture-wicking, squat-proof fabric. Available sizes XS-3XL.',
        price: 1899, originalPrice: 2999,
        category: 'Clothing',
        image: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=600&h=600&fit=crop',
        stock: 150, rating: 4.5, numReviews: 1892
      },

      // ── BOOKS ─────────────────────────────────────────────
      {
        name: 'Atomic Habits — James Clear',
        description: '#1 NYT bestseller. Tiny changes, remarkable results. A proven framework for improving every day through good habits.',
        price: 599, originalPrice: 799,
        category: 'Books',
        image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&h=600&fit=crop',
        stock: 200, rating: 4.9, numReviews: 18432
      },
      {
        name: 'The Psychology of Money',
        description: 'Morgan Housel\'s timeless lessons on wealth, greed, and happiness. How we think about money and make better financial decisions.',
        price: 449, originalPrice: 599,
        category: 'Books',
        image: 'https://images.unsplash.com/photo-1592496431122-2349e0fbc666?w=600&h=600&fit=crop',
        stock: 300, rating: 4.8, numReviews: 12341
      },
      {
        name: 'Rich Dad Poor Dad',
        description: 'Robert Kiyosaki\'s personal finance classic. What the rich teach their kids about money that the poor and middle class do not.',
        price: 349, originalPrice: 499,
        category: 'Books',
        image: 'https://images.unsplash.com/photo-1580927752452-89d86da3fa0a?w=600&h=600&fit=crop',
        stock: 400, rating: 4.7, numReviews: 25891
      },
      {
        name: 'Zero to One — Peter Thiel',
        description: 'Notes on startups, how to build the future. Essential reading for entrepreneurs and anyone interested in creating new things.',
        price: 499, originalPrice: 699,
        category: 'Books',
        image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&h=600&fit=crop&q=80',
        stock: 150, rating: 4.6, numReviews: 8901
      },

      // ── SPORTS ────────────────────────────────────────────
      {
        name: 'Premium Yoga Mat 6mm',
        description: 'Extra thick non-slip TPE yoga mat. Eco-friendly, sweat-resistant, comes with carrying strap. 183 × 61 cm.',
        price: 1499, originalPrice: 2499,
        category: 'Sports',
        image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=600&h=600&fit=crop',
        stock: 150, rating: 4.5, numReviews: 567
      },
      {
        name: 'Stainless Steel Insulated Bottle',
        description: 'Triple-wall vacuum insulation. Cold 48h, hot 24h. BPA-free, leak-proof, 1L capacity. Free engraving available.',
        price: 1299, originalPrice: 1999,
        category: 'Sports',
        image: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=600&h=600&fit=crop',
        stock: 250, rating: 4.7, numReviews: 4521
      },
      {
        name: 'Adjustable Dumbbell Set 5-52.5kg',
        description: 'Replaces 15 sets of weights. Quick-change dial system, ergonomic handle, compact storage tray included.',
        price: 18999, originalPrice: 24999,
        category: 'Sports',
        image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600&h=600&fit=crop',
        stock: 30, rating: 4.8, numReviews: 1243, featured: true
      },
      {
        name: 'Resistance Bands Set (11pcs)',
        description: 'Heavy duty latex bands, 5 resistance levels from 5-150lbs. Includes handles, ankle straps, door anchor & guide.',
        price: 799, originalPrice: 1299,
        category: 'Sports',
        image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&h=600&fit=crop',
        stock: 200, rating: 4.5, numReviews: 3210
      },

      // ── BEAUTY ────────────────────────────────────────────
      {
        name: 'Vitamin C Brightening Serum',
        description: '15% L-Ascorbic Acid + Hyaluronic Acid + Vitamin E. Brightens skin, reduces pigmentation, boosts collagen. 30ml.',
        price: 999, originalPrice: 1499,
        category: 'Beauty',
        image: 'https://images.unsplash.com/photo-1570194065650-d99fb4bedf0a?w=600&h=600&fit=crop',
        stock: 300, rating: 4.6, numReviews: 2890
      },
      {
        name: 'Hydrating Face Moisturizer SPF 50',
        description: 'Lightweight, non-greasy moisturizer with broad-spectrum SPF50. Hyaluronic acid, ceramides, niacinamide. All skin types.',
        price: 1299, originalPrice: 1799,
        category: 'Beauty',
        image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=600&h=600&fit=crop',
        stock: 200, rating: 4.7, numReviews: 4312
      },
      {
        name: 'Luxury Perfume Gift Set',
        description: '3 × 30ml Eau de Parfum collection. Long-lasting 12h+ fragrance. Elegant gift box, ideal for gifting.',
        price: 3499, originalPrice: 5999,
        category: 'Beauty',
        image: 'https://images.unsplash.com/photo-1541643600914-78b084683702?w=600&h=600&fit=crop',
        stock: 80, rating: 4.8, numReviews: 1231, featured: true
      },

      // ── HOME & GARDEN ──────────────────────────────────────
      {
        name: 'Dyson V15 Detect Cordless Vacuum',
        description: 'Laser detects invisible dust. Piezo sensor counts & sizes particles. 60-min fade-free suction. LCD screen.',
        price: 49999, originalPrice: 65000,
        category: 'Home & Garden',
        image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=600&fit=crop',
        stock: 20, rating: 4.8, numReviews: 743, featured: true
      },
      {
        name: 'Nespresso Vertuo Coffee Machine',
        description: 'Centrifusion™ technology, 5 cup sizes, 30s heat-up, 17-bar pressure. Auto-eject capsule, 1.1L water tank.',
        price: 15999, originalPrice: 21999,
        category: 'Home & Garden',
        image: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600&h=600&fit=crop',
        stock: 35, rating: 4.7, numReviews: 2134
      },
      {
        name: 'Indoor Plant Trio Set',
        description: 'Monstera Deliciosa, Pothos Golden, Snake Plant — the perfect low-maintenance indoor air purifiers. Comes with ceramic pots.',
        price: 1499, originalPrice: 2499,
        category: 'Home & Garden',
        image: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=600&h=600&fit=crop',
        stock: 60, rating: 4.6, numReviews: 891
      },
    ];

    await Product.insertMany(products);

    res.json({
      success: true,
      message: `Demo data seeded! ${products.length} products loaded.`,
      credentials: {
        admin: { email: 'admin@shop.com', password: 'admin123' },
        user: { email: 'user@shop.com', password: 'user123' }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { register, login, googleLogin, getMe, seed };
