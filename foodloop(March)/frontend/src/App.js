import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import BuyerDashboard from './pages/BuyerDashboard';
import Checkout from './pages/Checkout';
import Orders from './pages/Orders';
import FarmerLogin from './pages/FarmerLogin';
import FarmerSignup from './pages/FarmerSignup';
import FarmerDashboard from './pages/FarmerDashboard';
import FarmerOrders from './pages/FarmerOrders';
import BuyerLogin from './pages/BuyerLogin';
import { NotificationProvider } from './context/NotificationContext';
import './App.css';

function App() {
  return (
    <NotificationProvider>
      <Router>
        <Routes>
          {/* Buyer Routes */}
          <Route path="/" element={<BuyerDashboard />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/buyer/login" element={<BuyerLogin />} />

          {/* Farmer Routes */}
          <Route path="/farmer/login" element={<FarmerLogin />} />
          <Route path="/farmer/signup" element={<FarmerSignup />} />
          <Route path="/farmer/orders" element={<FarmerOrders />} />
          <Route path="/farmer/dashboard" element={<FarmerDashboard />} />
        </Routes>
      </Router>
    </NotificationProvider>
  );
}

export default App;
