const mongoose = require('mongoose');
require('dotenv').config();

const Farmer = require('./models/Farmer');
const Product = require('./models/Product');

const farmers = [
  {
    name: 'Rajesh Kumar',
    email: 'rajesh.farmer@example.com',
    phone: '9876543210',
    location: 'Village Banasthali, Jaipur',
    state: 'Rajasthan',
    city: 'Jaipur',
    farmSize: 5,
    crops: ['Tomatoes', 'Onions', 'Potatoes'],
    bankAccount: '12345678901234',
    bankCode: 'HDFC0000001',
    verified: true,
    rating: 4.8,
    totalOrders: 45
  },
  {
    name: 'Priya Singh',
    email: 'priya.farmer@example.com',
    phone: '9876543211',
    location: 'Haryana',
    state: 'Haryana',
    city: 'Hisar',
    farmSize: 8,
    crops: ['Wheat', 'Vegetables', 'Spinach'],
    bankAccount: '98765432109876',
    bankCode: 'ICIC0000001',
    verified: true,
    rating: 4.9,
    totalOrders: 67
  },
  {
    name: 'Arjun Patel',
    email: 'arjun.farmer@example.com',
    phone: '9876543212',
    location: 'Gujarat',
    state: 'Gujarat',
    city: 'Ahmedabad',
    farmSize: 3,
    crops: ['Mangoes', 'Bananas', 'Grapes'],
    bankAccount: '55555555555555',
    bankCode: 'AXIS0000001',
    verified: true,
    rating: 4.7,
    totalOrders: 32
  }
];

const products = [
  // Rajesh's products
  {
    farmerId: null, // Will be replaced with actual ID
    name: 'Fresh Tomatoes',
    category: 'Vegetables',
    description: 'Juicy, fresh tomatoes picked daily from our farm',
    quantity: 500,
    unit: 'kg',
    pricePerUnit: 25,
    marketPrice: 40,
    discount: 0,
    harvestDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
    expiryDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000), // 4 days from now
    organic: true,
    inStock: true,
    minOrderQuantity: 5,
    rating: 4.8,
    reviews: []
  },
  {
    farmerId: null,
    name: 'Organic Onions',
    category: 'Vegetables',
    description: 'Premium quality onions, no pesticides',
    quantity: 1000,
    unit: 'kg',
    pricePerUnit: 30,
    marketPrice: 50,
    discount: 0,
    harvestDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    organic: true,
    inStock: true,
    minOrderQuantity: 10,
    rating: 4.7,
    reviews: []
  },
  {
    farmerId: null,
    name: 'Potatoes',
    category: 'Vegetables',
    description: 'High quality potatoes, suitable for all cooking methods',
    quantity: 2000,
    unit: 'kg',
    pricePerUnit: 20,
    marketPrice: 35,
    discount: 0,
    harvestDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    expiryDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
    organic: false,
    inStock: true,
    minOrderQuantity: 20,
    rating: 4.6,
    reviews: []
  },
  // Priya's products
  {
    farmerId: null,
    name: 'Fresh Spinach',
    category: 'Vegetables',
    description: 'Tender, green spinach - perfect for salads and cooking',
    quantity: 300,
    unit: 'kg',
    pricePerUnit: 45,
    marketPrice: 70,
    discount: 0,
    harvestDate: new Date(),
    expiryDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    organic: true,
    inStock: true,
    minOrderQuantity: 2,
    rating: 4.9,
    reviews: []
  },
  {
    farmerId: null,
    name: 'Wheat Grains',
    category: 'Grains',
    description: 'Premium wheat, pesticide-free',
    quantity: 5000,
    unit: 'kg',
    pricePerUnit: 35,
    marketPrice: 55,
    discount: 0,
    harvestDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    expiryDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000),
    organic: true,
    inStock: true,
    minOrderQuantity: 50,
    rating: 4.8,
    reviews: []
  },
  // Arjun's products
  {
    farmerId: null,
    name: 'Fresh Mangoes',
    category: 'Fruits',
    description: 'Sweet, juicy mangoes - seasonal best',
    quantity: 800,
    unit: 'kg',
    pricePerUnit: 80,
    marketPrice: 120,
    discount: 0,
    harvestDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    expiryDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
    organic: true,
    inStock: true,
    minOrderQuantity: 5,
    rating: 4.9,
    reviews: []
  },
  {
    farmerId: null,
    name: 'Bananas',
    category: 'Fruits',
    description: 'Fresh bananas, perfectly ripe for eating',
    quantity: 600,
    unit: 'dozen',
    pricePerUnit: 60,
    marketPrice: 90,
    discount: 0,
    harvestDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    expiryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    organic: true,
    inStock: true,
    minOrderQuantity: 2,
    rating: 4.7,
    reviews: []
  },
  {
    farmerId: null,
    name: 'Grapes',
    category: 'Fruits',
    description: 'Sweet green grapes, juicy and fresh',
    quantity: 400,
    unit: 'kg',
    pricePerUnit: 100,
    marketPrice: 150,
    discount: 10,
    harvestDate: new Date(),
    expiryDate: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000),
    organic: true,
    inStock: true,
    minOrderQuantity: 3,
    rating: 4.8,
    reviews: []
  }
];

const seedDatabase = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/foodloop', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('✅ MongoDB connected');

    // Clear existing data
    await Farmer.deleteMany({});
    await Product.deleteMany({});
    console.log('🗑️  Cleared existing data');

    // Insert farmers
    const insertedFarmers = await Farmer.insertMany(farmers);
    console.log(`✅ Added ${insertedFarmers.length} farmers`);

    // Assign farmer IDs to products and insert
    const productsWithFarmers = [];
    
    // Rajesh's products (first 3)
    for (let i = 0; i < 3; i++) {
      productsWithFarmers.push({
        ...products[i],
        farmerId: insertedFarmers[0]._id
      });
    }
    
    // Priya's products (next 2)
    for (let i = 3; i < 5; i++) {
      productsWithFarmers.push({
        ...products[i],
        farmerId: insertedFarmers[1]._id
      });
    }
    
    // Arjun's products (last 3)
    for (let i = 5; i < 8; i++) {
      productsWithFarmers.push({
        ...products[i],
        farmerId: insertedFarmers[2]._id
      });
    }

    const insertedProducts = await Product.insertMany(productsWithFarmers);
    console.log(`✅ Added ${insertedProducts.length} products`);

    console.log('\n📊 Sample Data Summary:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    insertedFarmers.forEach((farmer, idx) => {
      const farmerProducts = insertedProducts.filter(p => p.farmerId.toString() === farmer._id.toString());
      console.log(`\n🌾 Farmer ${idx + 1}: ${farmer.name}`);
      console.log(`   Email: ${farmer.email}`);
      console.log(`   Location: ${farmer.city}, ${farmer.state}`);
      console.log(`   Products: ${farmerProducts.length}`);
      farmerProducts.forEach(p => {
        console.log(`   • ${p.name} - ₹${p.pricePerUnit}/${p.unit} (${p.quantity} available)`);
      });
    });
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`✅ Total: ${insertedFarmers.length} farmers, ${insertedProducts.length} products`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error.message);
    process.exit(1);
  }
};

seedDatabase();
