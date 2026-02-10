const express = require('express');
const router = express.Router();
const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Farmer = require('../models/Farmer');

// Register Farmer
router.post('/register', async (req, res) => {
  try {
    const { name, email, phone, location, state, city, farmSize, crops, password } = req.body;

    // Check if farmer already exists
    const existingFarmer = await Farmer.findOne({ email });
    if (existingFarmer) {
      return res.status(400).json({
        success: false,
        message: 'Farmer with this email already exists'
      });
    }

    // Hash password
    const hashedPassword = await bcryptjs.hash(password, 10);

    // Create new farmer
    const farmer = new Farmer({
      name,
      email,
      phone,
      location,
      state,
      city,
      farmSize,
      crops: crops || [],
      password: hashedPassword,
      verified: false,
      rating: 5.0
    });

    await farmer.save();

    // Generate JWT token
    const token = jwt.sign(
      { farmerId: farmer._id, email: farmer.email },
      process.env.JWT_SECRET || 'secret_key',
      { expiresIn: '7d' }
    );

    res.status(201).json({
      success: true,
      message: 'Farmer registered successfully',
      token,
      data: {
        farmerId: farmer._id,
        name: farmer.name,
        email: farmer.email,
        location: farmer.location
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Login Farmer
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find farmer by email
    const farmer = await Farmer.findOne({ email });
    if (!farmer) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Check password
    const isPasswordValid = await bcryptjs.compare(password, farmer.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { farmerId: farmer._id, email: farmer.email },
      process.env.JWT_SECRET || 'secret_key',
      { expiresIn: '7d' }
    );

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      data: {
        farmerId: farmer._id,
        name: farmer.name,
        email: farmer.email,
        location: farmer.location,
        verified: farmer.verified,
        rating: farmer.rating
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Get farmer profile
router.get('/profile/:farmerId', async (req, res) => {
  try {
    const farmer = await Farmer.findById(req.params.farmerId).select('-password');

    if (!farmer) {
      return res.status(404).json({
        success: false,
        message: 'Farmer not found'
      });
    }

    res.status(200).json({
      success: true,
      data: farmer
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;
