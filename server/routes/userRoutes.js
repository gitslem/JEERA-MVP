const express = require('express');
const router = express.Router();
const User = require('../models/User.js');
const jwt = require('jsonwebtoken');
const { protect } = require('../middleware/authMiddleware'); // <-- IMPORT THE MIDDLEWARE

// Helper function to generate a JWT
const generateToken = (res, userId) => {
  const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });

  // Set JWT as an HTTP-Only cookie
  res.cookie('jwt', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV !== 'development',
    sameSite: 'strict',
    maxAge: 30 * 24 * 60 * 60 * 1000,
  });
};

// --- PUBLIC ROUTES ---
router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;
  const userExists = await User.findOne({ email });

  if (userExists) {
    return res.status(400).json({ message: 'User already exists' });
  }

  const user = await User.create({ name, email, password });

  if (user) {
    generateToken(res, user._id);
    res.status(201).json({ _id: user._id, name: user.name, email: user.email });
  } else {
    res.status(400).json({ message: 'Invalid user data' });
  }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });

  if (user && (await user.matchPassword(password))) {
    generateToken(res, user._id);
    res.json({ _id: user._id, name: user.name, email: user.email });
  } else {
    res.status(401).json({ message: 'Invalid email or password' });
  }
});

router.post('/logout', (req, res) => {
  res.cookie('jwt', '', {
    httpOnly: true,
    expires: new Date(0),
  });
  res.status(200).json({ message: 'Logged out successfully' });
});


// --- PROTECTED ROUTES ---
// Only logged-in users will be able to access these
router.get('/profile', protect, async (req, res) => {
    // Because of the 'protect' middleware, we now have access to req.user
    const user = await User.findById(req.user._id);

    if (user) {
        res.json({ _id: user._id, name: user.name, email: user.email });
    } else {
        res.status(404).json({ message: 'User not found' });
    }
});

router.get('/', protect, async (req, res) => {
    const users = await User.find({}).select('-password');
    res.status(200).json(users);
});


module.exports = router;