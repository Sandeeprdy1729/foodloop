import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import BuyerDashboard from './pages/BuyerDashboard';
import Checkout from './pages/Checkout';
import Orders from './pages/Orders';
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<BuyerDashboard />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/orders" element={<Orders />} />
      </Routes>
    </Router>
  );
}

export default App;
