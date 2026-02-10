const express = require('express');
const router = express.Router();
const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Buyer = require('../models/Buyer');

// Register Buyer
router.post('/register', async (req, res) => {
    try {
        const { name, email, phone, businessName, businessType, location, address, city, state, password } = req.body;

        // Check if buyer already exists
        const existingBuyer = await Buyer.findOne({ email });
        if (existingBuyer) {
            return res.status(400).json({
                success: false,
                message: 'Buyer with this email already exists'
            });
        }

        // Hash password
        const salt = await bcryptjs.genSalt(10);
        const hashedPassword = await bcryptjs.hash(password, salt);

        // Create new buyer
        const buyer = new Buyer({
            name,
            email,
            phone,
            businessName,
            businessType,
            location,
            address,
            city,
            state,
            password: hashedPassword
        });

        await buyer.save();

        // Generate JWT token
        const token = jwt.sign(
            { buyerId: buyer._id, email: buyer.email },
            process.env.JWT_SECRET || 'secret_key',
            { expiresIn: '7d' }
        );

        res.status(201).json({
            success: true,
            message: 'Buyer registered successfully',
            token,
            data: {
                buyerId: buyer._id,
                name: buyer.name,
                email: buyer.email
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// Login Buyer
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find buyer by email
        const buyer = await Buyer.findOne({ email });
        if (!buyer) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        // Check password
        const isPasswordValid = await bcryptjs.compare(password, buyer.password);
        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        // Generate JWT token
        const token = jwt.sign(
            { buyerId: buyer._id, email: buyer.email },
            process.env.JWT_SECRET || 'secret_key',
            { expiresIn: '7d' }
        );

        res.status(200).json({
            success: true,
            message: 'Login successful',
            token,
            data: {
                buyerId: buyer._id,
                name: buyer.name,
                email: buyer.email,
                businessName: buyer.businessName
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

module.exports = router;
