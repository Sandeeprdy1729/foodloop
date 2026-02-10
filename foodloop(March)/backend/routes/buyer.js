const express = require('express');
const router = express.Router();
const {
    createBuyer,
    getAllBuyers,
    getBuyerById
} = require('../controllers/buyerController');

// POST create or update buyer
router.post('/', createBuyer);

// GET all buyers
router.get('/', getAllBuyers);

// GET buyer by ID
router.get('/:id', getBuyerById);

module.exports = router;
