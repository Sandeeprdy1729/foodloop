# FoodLoop - B2B Farmer Produce Marketplace

A full-stack web application connecting farmers directly with retail marts, supermarkets, and restaurants for fresh produce procurement.

## Project Structure

```
foodloop/
├── backend/              # Node.js/Express API
│   ├── models/          # MongoDB schemas (Farmer, Product, Buyer, Order)
│   ├── controllers/      # Business logic
│   ├── routes/          # API endpoints
│   ├── server.js        # Express server
│   ├── package.json
│   └── .env.example
├── frontend/            # React client application
│   ├── src/
│   │   ├── components/  # Reusable React components
│   │   ├── pages/       # Page components
│   │   ├── App.js
│   │   └── index.js
│   ├── public/
│   ├── package.json
│   └── .env.example
└── README.md
```

## Features

### Buyer Portal (Retail Marts, Supermarkets, Restaurants)
- Browse fresh produce from local farmers
- Filter by category, price, organic status
- Add products to cart
- Place orders with multiple farmers at once
- Track order status in real-time
- Payment method options (Bank Transfer, UPI, Card, COD)

### Farmer Portal (Coming Soon)
- Register and list produce
- Manage inventory
- Track orders from buyers
- View earnings

### Admin Dashboard (Coming Soon)
- Monitor all orders
- Manage returns/refunds
- Generate reports

## Tech Stack

**Backend:**
- Node.js & Express
- MongoDB
- Mongoose
- JWT Authentication
- Stripe (Payments)
- Nodemailer (Email notifications)

**Frontend:**
- React 18
- React Router
- Axios
- CSS3

## Getting Started

### Prerequisites
- Node.js (v16+)
- MongoDB Atlas account (or local MongoDB)
- npm or yarn

### Backend Setup

1. Navigate to backend folder:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file from `.env.example`:
```bash
cp .env.example .env
```

4. Update `.env` with your MongoDB connection and API keys:
```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/foodloop
PORT=5000
JWT_SECRET=your_secret_key
```

5. Start the server:
```bash
npm run dev
```

Server will run on `http://localhost:5000`

### Frontend Setup

1. In a new terminal, navigate to frontend folder:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file:
```bash
cp .env.example .env
```

4. Start React development server:
```bash
npm start
```

App will open on `http://localhost:3000`

## API Endpoints

### Products
- `GET /api/products` - Get all products (with filters)
- `GET /api/products/:id` - Get product details
- `GET /api/products/farmer/:farmerId` - Get farmer's products
- `POST /api/products` - Create new product
- `PUT /api/products/:id/quantity` - Update quantity

### Orders
- `POST /api/orders` - Create new order
- `GET /api/orders/buyer/:buyerId` - Get buyer's orders
- `GET /api/orders/farmer/:farmerId` - Get farmer's orders
- `GET /api/orders/:orderId` - Get order details
- `PUT /api/orders/:orderId/status` - Update order status

## How It Works

1. **Farmer Lists Produce**: Farmers register and add their produce with pricing
2. **Buyer Searches**: Marts browse available produce and filter by needs
3. **Order Placement**: Buyer adds items to cart and checks out
4. **Payment**: Payment processed through selected method
5. **Fulfillment**: Farmer receives order and prepares produce
6. **Delivery**: Produce delivered to buyer's location
7. **Returns**: Unused/rejected produce can be returned for composting

## Next Steps

- [ ] Implement farmer registration & authentication
- [ ] Add payment gateway integration (Stripe API)
- [ ] Build farmer portal dashboard
- [ ] Add SMS/email notifications
- [ ] Implement real-time tracking
- [ ] Add return/refund management
- [ ] Build admin analytics dashboard
- [ ] Mobile app (React Native)

## Database Schema

### Farmer
- name, email, phone, location, state, city
- farmSize, crops, bankAccount
- verified status, rating, totalOrders

### Product
- farmerId, name, category, description
- quantity, unit (kg/liter/dozen)
- pricePerUnit, marketPrice, discount
- harvestDate, expiryDate, organic
- inStock, minOrderQuantity, rating, reviews

### Buyer
- name, email, phone, businessName, businessType
- location, address, city, state
- licenseNumber, verified status
- totalPurchases, totalSpent

### Order
- orderId, buyerId, farmerId
- items (array of products with quantity)
- totalAmount, status
- payment info (method, status, transactionId)
- delivery info (type, address, dates)

## Future Enhancements

1. **Mobile App**: React Native app for farmers and buyers
2. **AI Pricing**: Dynamic pricing based on demand
3. **Quality Analytics**: IoT sensors for produce quality tracking
4. **Supply Chain**: Complete traceability from farm to store
5. **Insurance**: Crop insurance integration
6. **Returns Management**: Automated composting/recycling network
7. **Government Integration**: Subsidies and support schemes

## Contributing

This is an open project for FoodLoop startup in India. Feel free to contribute!

## License

See LICENSE file

---

**Built for Impact** 🌾 Connecting farmers directly with markets for sustainable agriculture and reduced food waste.
