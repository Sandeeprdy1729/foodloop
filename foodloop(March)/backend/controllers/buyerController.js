const Buyer = require('../models/Buyer');

// Create or get existing buyer (Deduplication)
exports.createBuyer = async (req, res) => {
  try {
    const { email, name, phone, businessName, businessType, location, address, city, state } = req.body;

    // Check if buyer already exists by email
    let buyer = await Buyer.findOne({ email });

    if (buyer) {
      // Update existing buyer info (simple persistence of latest info)
      buyer.name = name || buyer.name;
      buyer.phone = phone || buyer.phone;
      buyer.businessName = businessName || buyer.businessName;
      buyer.businessType = businessType || buyer.businessType;
      buyer.location = location || buyer.location;
      buyer.address = address || buyer.address;
      buyer.city = city || buyer.city;
      buyer.state = state || buyer.state;
      
      await buyer.save();
      
      return res.status(200).json({
        success: true,
        message: 'Existing buyer updated',
        data: buyer
      });
    }

    // Create new buyer if doesn't exist
    buyer = new Buyer({
      name,
      email,
      phone,
      businessName,
      businessType,
      location,
      address,
      city,
      state,
      verified: false
    });

    await buyer.save();

    res.status(201).json({
      success: true,
      message: 'Buyer created successfully',
      data: buyer
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get all buyers
exports.getAllBuyers = async (req, res) => {
  try {
    const buyers = await Buyer.find();
    res.status(200).json({
      success: true,
      data: buyers
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get buyer by ID
exports.getBuyerById = async (req, res) => {
  try {
    const buyer = await Buyer.findById(req.params.id);
    if (!buyer) {
      return res.status(404).json({
        success: false,
        message: 'Buyer not found'
      });
    }
    res.status(200).json({
      success: true,
      data: buyer
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
