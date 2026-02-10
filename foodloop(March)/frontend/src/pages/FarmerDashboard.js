import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import NotificationBell from '../components/NotificationBell';
import './FarmerDashboard.css';

const FarmerDashboard = () => {
  const navigate = useNavigate();
  const [farmer, setFarmer] = useState(null);
  const [products, setProducts] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [newProduct, setNewProduct] = useState({
    name: '',
    category: 'Vegetables',
    description: '',
    quantity: '',
    unit: 'kg',
    pricePerUnit: '',
    marketPrice: '',
    organic: false,
    minOrderQuantity: '1'
  });

  const farmerId = localStorage.getItem('farmerId');
  const farmerToken = localStorage.getItem('farmerToken');

  useEffect(() => {
    if (!farmerToken || !farmerId) {
      navigate('/farmer/login');
      return;
    }

    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/farmers/dashboard/${farmerId}`,
        { headers: { Authorization: `Bearer ${farmerToken}` } }
      );

      if (response.data.success) {
        setFarmer(response.data.data.farmer);
        setProducts(response.data.data.products);
        setStats(response.data.data.stats);
      }
    } catch (error) {
      console.error('Error fetching dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/farmers/products/${farmerId}/add`,
        {
          ...newProduct,
          quantity: parseFloat(newProduct.quantity),
          pricePerUnit: parseFloat(newProduct.pricePerUnit),
          marketPrice: parseFloat(newProduct.marketPrice),
          minOrderQuantity: parseInt(newProduct.minOrderQuantity)
        },
        { headers: { Authorization: `Bearer ${farmerToken}` } }
      );

      if (response.data.success) {
        setProducts([response.data.data, ...products]);
        setNewProduct({
          name: '',
          category: 'Vegetables',
          description: '',
          quantity: '',
          unit: 'kg',
          pricePerUnit: '',
          marketPrice: '',
          organic: false,
          minOrderQuantity: '1'
        });
        setShowAddProduct(false);
        alert('Product added successfully!');
      }
    } catch (error) {
      alert('Error adding product: ' + error.message);
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;

    try {
      const response = await axios.delete(
        `${process.env.REACT_APP_API_URL}/farmers/products/${productId}`,
        { headers: { Authorization: `Bearer ${farmerToken}` } }
      );

      if (response.data.success) {
        setProducts(products.filter(p => p._id !== productId));
        alert('Product deleted successfully');
      }
    } catch (error) {
      alert('Error deleting product: ' + error.message);
    }
  };

  const handleUpdateProduct = async (e) => {
    e.preventDefault();
    if (!editingProduct) return;

    try {
      const response = await axios.put(
        `${process.env.REACT_APP_API_URL}/farmers/products/update`,
        {
          ...editingProduct,
          productId: editingProduct._id,
          quantity: parseFloat(editingProduct.quantity),
          pricePerUnit: parseFloat(editingProduct.pricePerUnit),
          marketPrice: parseFloat(editingProduct.marketPrice)
        },
        { headers: { Authorization: `Bearer ${farmerToken}` } }
      );

      if (response.data.success) {
        setProducts(products.map(p => p._id === editingProduct._id ? response.data.data : p));
        setEditingProduct(null);
        alert('Product updated successfully!');
      }
    } catch (error) {
      alert('Error updating product: ' + error.message);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('farmerToken');
    localStorage.removeItem('farmerId');
    localStorage.removeItem('farmerName');
    navigate('/farmer/login');
  };

  if (loading) {
    return <div className="loading">Loading dashboard...</div>;
  }

  if (!farmer) {
    return <div className="loading">Farmer not found</div>;
  }

  return (
    <div className="farmer-dashboard">
      {/* Header */}
      <header className="dashboard-header">
        <div className="header-content">
          <h1>🌾 {farmer.name}'s Farm</h1>
          <p>{farmer.location}, {farmer.state}</p>
        </div>
        <div className="header-actions">
          <Link to="/farmer/orders" className="orders-link">📦 View Orders</Link>
          <NotificationBell />
          <button className="logout-btn" onClick={handleLogout}>Logout</button>
        </div>
      </header>

      {/* Stats */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-value">{stats.totalProducts || 0}</div>
          <div className="stat-label">Total Products</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.totalInventory || 0}</div>
          <div className="stat-label">Total Inventory (kg)</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.activeProducts || 0}</div>
          <div className="stat-label">In Stock</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.totalOrders || 0}</div>
          <div className="stat-label">Total Orders</div>
        </div>
      </div>

      {/* Products Section */}
      <div className="products-section">
        <div className="section-header">
          <h2>Your Products</h2>
          <button
            className="add-btn"
            onClick={() => setShowAddProduct(!showAddProduct)}
          >
            {showAddProduct ? '✕ Cancel' : '+ Add Product'}
          </button>
        </div>

        {showAddProduct && (
          <form className="add-product-form" onSubmit={handleAddProduct}>
            <div className="form-row">
              <input
                type="text"
                placeholder="Product Name"
                value={newProduct.name}
                onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                required
              />
              <select
                value={newProduct.category}
                onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
              >
                <option value="Vegetables">Vegetables</option>
                <option value="Fruits">Fruits</option>
                <option value="Grains">Grains</option>
                <option value="Dairy">Dairy</option>
                <option value="Spices">Spices</option>
              </select>
            </div>

            <textarea
              placeholder="Description"
              value={newProduct.description}
              onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
              rows="2"
            />

            <div className="form-row">
              <input
                type="number"
                placeholder="Quantity"
                value={newProduct.quantity}
                onChange={(e) => setNewProduct({ ...newProduct, quantity: e.target.value })}
                required
              />
              <select
                value={newProduct.unit}
                onChange={(e) => setNewProduct({ ...newProduct, unit: e.target.value })}
              >
                <option value="kg">kg</option>
                <option value="liter">liter</option>
                <option value="dozen">dozen</option>
              </select>
            </div>

            <div className="form-row">
              <input
                type="number"
                placeholder="Price per Unit (₹)"
                value={newProduct.pricePerUnit}
                onChange={(e) => setNewProduct({ ...newProduct, pricePerUnit: e.target.value })}
                required
              />
              <input
                type="number"
                placeholder="Market Price (₹)"
                value={newProduct.marketPrice}
                onChange={(e) => setNewProduct({ ...newProduct, marketPrice: e.target.value })}
              />
            </div>

            <div className="form-row">
              <input
                type="number"
                placeholder="Min Order Qty"
                value={newProduct.minOrderQuantity}
                onChange={(e) => setNewProduct({ ...newProduct, minOrderQuantity: e.target.value })}
              />
              <label className="checkbox">
                <input
                  type="checkbox"
                  checked={newProduct.organic}
                  onChange={(e) => setNewProduct({ ...newProduct, organic: e.target.checked })}
                />
                <span>Organic</span>
              </label>
            </div>

            <button type="submit" className="submit-btn">Add Product</button>
          </form>
        )}

        {products.length === 0 ? (
          <div className="no-products">
            <p>No products yet. Start adding your produce!</p>
          </div>
        ) : (
          <div className="products-table">
            <table>
              <thead>
                <tr>
                  <th>Product Name</th>
                  <th>Category</th>
                  <th>Quantity</th>
                  <th>Price</th>
                  <th>Market Price</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product._id}>
                    <td>
                      <strong>{product.name}</strong>
                      {product.organic && <span className="organic">Organic</span>}
                    </td>
                    <td>{product.category}</td>
                    <td>{product.quantity} {product.unit}</td>
                    <td>₹{product.pricePerUnit}</td>
                    <td>₹{product.marketPrice || 'N/A'}</td>
                    <td>
                      <span className={`status ${product.inStock ? 'in-stock' : 'out-of-stock'}`}>
                        {product.inStock ? '✓ In Stock' : '✕ Out of Stock'}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button
                          className="edit-btn-small"
                          onClick={() => setEditingProduct(product)}
                        >
                          Edit
                        </button>
                        <button
                          className="delete-btn-small"
                          onClick={() => handleDeleteProduct(product._id)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit Product Modal */}
      {editingProduct && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Edit Product</h3>
              <button className="close-btn" onClick={() => setEditingProduct(null)}>✕</button>
            </div>
            <form onSubmit={handleUpdateProduct} className="edit-product-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Product Name</label>
                  <input
                    type="text"
                    value={editingProduct.name}
                    onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Category</label>
                  <select
                    value={editingProduct.category}
                    onChange={(e) => setEditingProduct({ ...editingProduct, category: e.target.value })}
                  >
                    <option value="Vegetables">Vegetables</option>
                    <option value="Fruits">Fruits</option>
                    <option value="Grains">Grains</option>
                    <option value="Dairy">Dairy</option>
                    <option value="Spices">Spices</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={editingProduct.description}
                  onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                  rows="2"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Quantity</label>
                  <input
                    type="number"
                    value={editingProduct.quantity}
                    onChange={(e) => setEditingProduct({ ...editingProduct, quantity: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Unit</label>
                  <select
                    value={editingProduct.unit}
                    onChange={(e) => setEditingProduct({ ...editingProduct, unit: e.target.value })}
                  >
                    <option value="kg">kg</option>
                    <option value="liter">liter</option>
                    <option value="dozen">dozen</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Price per Unit (₹)</label>
                  <input
                    type="number"
                    value={editingProduct.pricePerUnit}
                    onChange={(e) => setEditingProduct({ ...editingProduct, pricePerUnit: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Market Price (₹)</label>
                  <input
                    type="number"
                    value={editingProduct.marketPrice}
                    onChange={(e) => setEditingProduct({ ...editingProduct, marketPrice: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-row">
                <label className="checkbox">
                  <input
                    type="checkbox"
                    checked={editingProduct.organic}
                    onChange={(e) => setEditingProduct({ ...editingProduct, organic: e.target.checked })}
                  />
                  <span>Organic</span>
                </label>
              </div>

              <button type="submit" className="submit-btn">Update Product</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default FarmerDashboard;
