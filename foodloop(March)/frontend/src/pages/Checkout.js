import React, { useState } from 'react';
import axios from 'axios';
import './Checkout.css';

const Checkout = () => {
  const [cartData, setCartData] = useState(null);
  const [buyerInfo, setBuyerInfo] = useState({
    name: '',
    businessName: '',
    businessType: 'Retail Mart',
    phone: '',
    email: '',
    address: '',
    city: '',
    state: ''
  });
  const [paymentMethod, setPaymentMethod] = useState('Bank Transfer');
  const [loading, setLoading] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);

  React.useEffect(() => {
    const data = localStorage.getItem('cartData');
    if (data) {
      setCartData(JSON.parse(data));
    }
  }, []);

  const calculateTotal = () => {
    if (!cartData) return 0;
    return cartData.items.reduce((total, item) => {
      return total + (item.pricePerUnit * (cartData.quantities[item._id] || 1));
    }, 0).toFixed(2);
  };

  const handleSubmitOrder = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Create buyer first
      const buyerResponse = await axios.post(
        `${process.env.REACT_APP_API_URL}/buyers`,
        buyerInfo
      );
      const buyerId = buyerResponse.data.data._id;

      // Group items by farmer
      const ordersByFarmer = {};
      cartData.items.forEach(item => {
        const farmerId = item.farmerId._id;
        if (!ordersByFarmer[farmerId]) {
          ordersByFarmer[farmerId] = [];
        }
        ordersByFarmer[farmerId].push({
          productId: item._id,
          quantity: cartData.quantities[item._id]
        });
      });

      // Create orders for each farmer
      for (const [farmerId, items] of Object.entries(ordersByFarmer)) {
        const totalAmount = items.reduce((sum, item) => {
          const product = cartData.items.find(p => p._id === item.productId);
          return sum + (product.pricePerUnit * item.quantity);
        }, 0);

        await axios.post(
          `${process.env.REACT_APP_API_URL}/orders`,
          {
            buyerId,
            farmerId,
            items: items.map(item => ({
              productId: item.productId,
              quantity: item.quantity
            })),
            totalAmount,
            deliveryType: 'Delivery',
            address: buyerInfo.address,
            notes: ''
          }
        );
      }

      setOrderPlaced(true);
      localStorage.removeItem('cartData');
      setTimeout(() => {
        window.location.href = '/orders';
      }, 2000);
    } catch (error) {
      console.error('Error placing order:', error);
      alert('Error placing order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!cartData) {
    return <div className="checkout-loading">Loading checkout...</div>;
  }

  if (orderPlaced) {
    return (
      <div className="order-success">
        <h2>✓ Order Placed Successfully!</h2>
        <p>Your order has been confirmed. Farmers will prepare your produce.</p>
        <p>Redirecting to orders page...</p>
      </div>
    );
  }

  const total = parseFloat(calculateTotal());
  const delivery = 50;
  const grandTotal = (total + delivery).toFixed(2);

  return (
    <div className="checkout-container">
      <div className="checkout-header">
        <h1>Checkout</h1>
      </div>

      <div className="checkout-content">
        {/* Order Summary */}
        <section className="order-summary">
          <h3>Order Summary</h3>
          <div className="summary-items">
            {cartData.items.map(item => (
              <div key={item._id} className="summary-item">
                <div>
                  <p className="item-name">{item.name}</p>
                  <p className="item-farmer">{item.farmerId?.name}</p>
                </div>
                <div className="item-qty">
                  {cartData.quantities[item._id] || 1} {item.unit}
                </div>
                <div className="item-price">
                  ₹{(item.pricePerUnit * (cartData.quantities[item._id] || 1)).toFixed(2)}
                </div>
              </div>
            ))}
          </div>

          <div className="summary-totals">
            <div className="total-row">
              <span>Subtotal:</span>
              <span>₹{total}</span>
            </div>
            <div className="total-row">
              <span>Delivery:</span>
              <span>₹{delivery}</span>
            </div>
            <div className="total-row grand-total">
              <span>Grand Total:</span>
              <span>₹{grandTotal}</span>
            </div>
          </div>
        </section>

        {/* Checkout Form */}
        <section className="checkout-form">
          <form onSubmit={handleSubmitOrder}>
            <h3>Delivery Information</h3>

            <div className="form-group">
              <label>Your Name *</label>
              <input
                type="text"
                value={buyerInfo.name}
                onChange={(e) => setBuyerInfo({...buyerInfo, name: e.target.value})}
                required
              />
            </div>

            <div className="form-group">
              <label>Business Name *</label>
              <input
                type="text"
                value={buyerInfo.businessName}
                onChange={(e) => setBuyerInfo({...buyerInfo, businessName: e.target.value})}
                required
              />
            </div>

            <div className="form-group">
              <label>Business Type *</label>
              <select
                value={buyerInfo.businessType}
                onChange={(e) => setBuyerInfo({...buyerInfo, businessType: e.target.value})}
              >
                <option value="Retail Mart">Retail Mart</option>
                <option value="Supermarket">Supermarket</option>
                <option value="Restaurant">Restaurant</option>
                <option value="Wholesaler">Wholesaler</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Email *</label>
                <input
                  type="email"
                  value={buyerInfo.email}
                  onChange={(e) => setBuyerInfo({...buyerInfo, email: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Phone *</label>
                <input
                  type="tel"
                  value={buyerInfo.phone}
                  onChange={(e) => setBuyerInfo({...buyerInfo, phone: e.target.value})}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label>Delivery Address *</label>
              <input
                type="text"
                value={buyerInfo.address}
                onChange={(e) => setBuyerInfo({...buyerInfo, address: e.target.value})}
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>City *</label>
                <input
                  type="text"
                  value={buyerInfo.city}
                  onChange={(e) => setBuyerInfo({...buyerInfo, city: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>State *</label>
                <input
                  type="text"
                  value={buyerInfo.state}
                  onChange={(e) => setBuyerInfo({...buyerInfo, state: e.target.value})}
                  required
                />
              </div>
            </div>

            <h3 style={{marginTop: '25px'}}>Payment Method</h3>

            <div className="payment-options">
              {['Bank Transfer', 'UPI', 'Card', 'Cash on Delivery'].map(method => (
                <label key={method} className="payment-option">
                  <input
                    type="radio"
                    value={method}
                    checked={paymentMethod === method}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  />
                  <span>{method}</span>
                </label>
              ))}
            </div>

            <button 
              type="submit" 
              className="place-order-btn"
              disabled={loading}
            >
              {loading ? 'Placing Order...' : `Place Order - ₹${grandTotal}`}
            </button>
          </form>
        </section>
      </div>
    </div>
  );
};

export default Checkout;
