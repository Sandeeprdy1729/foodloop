import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ProductCard from '../components/ProductCard';
import Cart from '../components/Cart';
import NotificationBell from '../components/NotificationBell';
import './BuyerDashboard.css';

const BuyerDashboard = () => {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    category: '',
    search: '',
    maxPrice: ''
  });
  const [showCart, setShowCart] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, [filters]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filters.category) params.append('category', filters.category);
      if (filters.search) params.append('search', filters.search);
      if (filters.maxPrice) params.append('maxPrice', filters.maxPrice);

      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/products?${params.toString()}`
      );
      setProducts(response.data.data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = (product) => {
    const existingItem = cart.find(item => item._id === product._id);
    if (existingItem) {
      setCart(cart.map(item =>
        item._id === product._id
          ? { ...item, orderQuantity: (item.orderQuantity || 1) + 1 }
          : item
      ));
    } else {
      setCart([...cart, { ...product, orderQuantity: 1 }]);
    }
  };

  const handleRemoveFromCart = (productId) => {
    setCart(cart.filter(item => item._id !== productId));
  };

  const handleUpdateQuantity = (productId, quantity) => {
    setCart(cart.map(item =>
      item._id === productId ? { ...item, orderQuantity: quantity } : item
    ));
  };

  const handleCheckout = (quantities) => {
    // Store cart data for checkout page
    localStorage.setItem('cartData', JSON.stringify({
      items: cart,
      quantities
    }));
    // Redirect to checkout (we'll create this page next)
    window.location.href = '/checkout';
  };

  return (
    <div className="buyer-dashboard">
      <header className="dashboard-header">
        <h1>🌾 FoodLoop - Buyer Portal</h1>
        <p>Fresh produce directly from farmers to your mart</p>
        <div className="header-controls">
          <NotificationBell />
          <button
            className="cart-toggle"
            onClick={() => setShowCart(!showCart)}
          >
            🛒 Cart ({cart.length})
          </button>
        </div>
      </header>

      <div className="dashboard-content">
        {/* Filters */}
        <aside className="filters-panel">
          <h3>Filters</h3>

          <div className="filter-group">
            <label>Search Product</label>
            <input
              type="text"
              placeholder="e.g., tomato, potato"
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            />
          </div>

          <div className="filter-group">
            <label>Category</label>
            <select
              value={filters.category}
              onChange={(e) => setFilters({ ...filters, category: e.target.value })}
            >
              <option value="">All Categories</option>
              <option value="Vegetables">Vegetables</option>
              <option value="Fruits">Fruits</option>
              <option value="Grains">Grains</option>
              <option value="Dairy">Dairy</option>
              <option value="Spices">Spices</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Max Price (₹)</label>
            <input
              type="number"
              placeholder="e.g., 50"
              value={filters.maxPrice}
              onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
            />
          </div>

          <button
            className="reset-filters"
            onClick={() => setFilters({ category: '', search: '', maxPrice: '' })}
          >
            Reset Filters
          </button>
        </aside>

        {/* Products Grid */}
        <main className="products-section">
          {loading ? (
            <div className="loading">Loading products...</div>
          ) : products.length === 0 ? (
            <div className="no-products">
              <p>No products found. Try adjusting your filters.</p>
            </div>
          ) : (
            <>
              <div className="products-count">
                Showing {products.length} products
              </div>
              <div className="products-grid">
                {products.map(product => (
                  <ProductCard
                    key={product._id}
                    product={product}
                    onAddToCart={handleAddToCart}
                  />
                ))}
              </div>
            </>
          )}
        </main>

        {/* Cart Sidebar */}
        {showCart && (
          <aside className="cart-sidebar">
            <Cart
              items={cart}
              onRemove={handleRemoveFromCart}
              onUpdateQuantity={handleUpdateQuantity}
              onCheckout={handleCheckout}
            />
          </aside>
        )}
      </div>
    </div>
  );
};

export default BuyerDashboard;
