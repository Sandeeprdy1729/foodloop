import React, { useState } from 'react';
import './Cart.css';

const Cart = ({ items, onRemove, onUpdateQuantity, onCheckout }) => {
  const [quantities, setQuantities] = useState(
    items.reduce((acc, item) => ({ ...acc, [item._id]: item.orderQuantity || 1 }), {})
  );

  const handleQuantityChange = (productId, newQuantity) => {
    if (newQuantity > 0) {
      setQuantities({ ...quantities, [productId]: newQuantity });
      onUpdateQuantity(productId, newQuantity);
    }
  };

  const calculateTotal = () => {
    return items.reduce((total, item) => {
      return total + (item.pricePerUnit * (quantities[item._id] || 1));
    }, 0).toFixed(2);
  };

  if (items.length === 0) {
    return (
      <div className="cart-empty">
        <p>Your cart is empty</p>
      </div>
    );
  }

  return (
    <div className="cart-container">
      <h3>Shopping Cart ({items.length} items)</h3>
      
      <div className="cart-items">
        {items.map(item => (
          <div key={item._id} className="cart-item">
            <div className="item-info">
              <h4>{item.name}</h4>
              <p className="farmer">From: {item.farmerId?.name}</p>
              <p className="price">₹{item.pricePerUnit}/{item.unit}</p>
            </div>

            <div className="item-quantity">
              <button onClick={() => handleQuantityChange(item._id, quantities[item._id] - 1)}>−</button>
              <input 
                type="number" 
                value={quantities[item._id] || 1}
                onChange={(e) => handleQuantityChange(item._id, parseInt(e.target.value))}
              />
              <button onClick={() => handleQuantityChange(item._id, quantities[item._id] + 1)}>+</button>
            </div>

            <div className="item-total">
              ₹{(item.pricePerUnit * (quantities[item._id] || 1)).toFixed(2)}
            </div>

            <button 
              className="remove-btn"
              onClick={() => onRemove(item._id)}
            >
              ✕
            </button>
          </div>
        ))}
      </div>

      <div className="cart-summary">
        <div className="summary-row">
          <span>Subtotal:</span>
          <span>₹{calculateTotal()}</span>
        </div>
        <div className="summary-row">
          <span>Delivery:</span>
          <span>₹50</span>
        </div>
        <div className="summary-row total">
          <span>Total:</span>
          <span>₹{(parseFloat(calculateTotal()) + 50).toFixed(2)}</span>
        </div>
        
        <button 
          className="checkout-btn"
          onClick={() => onCheckout(quantities)}
        >
          Proceed to Checkout
        </button>
      </div>
    </div>
  );
};

export default Cart;
