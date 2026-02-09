import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './ProductCard.css';

const ProductCard = ({ product, onAddToCart }) => {
  const discountedPrice = product.marketPrice 
    ? (product.pricePerUnit * (1 - (product.discount || 0) / 100)).toFixed(2)
    : product.pricePerUnit;

  const savingsPercent = product.marketPrice 
    ? Math.round(((product.marketPrice - product.pricePerUnit) / product.marketPrice) * 100)
    : 0;

  return (
    <div className="product-card">
      <div className="product-image">
        {product.image ? (
          <img src={product.image} alt={product.name} />
        ) : (
          <div className="placeholder">📦</div>
        )}
        {product.organic && <span className="organic-badge">Organic</span>}
      </div>
      
      <div className="product-info">
        <h3>{product.name}</h3>
        <p className="farmer-info">
          By: <strong>{product.farmerId?.name || 'Farmer'}</strong>
        </p>
        
        <div className="pricing">
          <div className="price-row">
            <span className="current-price">₹{product.pricePerUnit}/{product.unit}</span>
            {product.marketPrice && (
              <span className="market-price">₹{product.marketPrice}</span>
            )}
          </div>
          {savingsPercent > 0 && (
            <p className="savings">Save {savingsPercent}% vs market price</p>
          )}
        </div>

        <div className="availability">
          <p className="stock">{product.quantity} {product.unit} available</p>
          {product.harvestDate && (
            <p className="harvest">Fresh: {new Date(product.harvestDate).toLocaleDateString()}</p>
          )}
        </div>

        <button 
          className="add-to-cart-btn"
          onClick={() => onAddToCart(product)}
          disabled={!product.inStock}
        >
          {product.inStock ? 'Add to Cart' : 'Out of Stock'}
        </button>
      </div>
    </div>
  );
};

export default ProductCard;
