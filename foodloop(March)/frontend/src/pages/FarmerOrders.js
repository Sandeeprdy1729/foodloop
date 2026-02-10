import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import NotificationBell from '../components/NotificationBell';
import axios from 'axios';
import './FarmerOrders.css';

const FarmerOrders = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [updatingOrder, setUpdatingOrder] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const farmerId = localStorage.getItem('farmerId');
  const farmerToken = localStorage.getItem('farmerToken');
  const farmerName = localStorage.getItem('farmerName');

  useEffect(() => {
    if (!farmerToken || !farmerId) {
      navigate('/farmer/login');
      return;
    }

    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/farmers/orders/${farmerId}`,
        { headers: { Authorization: `Bearer ${farmerToken}` } }
      );

      if (response.data.success) {
        setOrders(response.data.data);
        setStats(response.data.stats);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (orderId, newStatus) => {
    setUpdatingOrder(orderId);

    try {
      const response = await axios.put(
        `${process.env.REACT_APP_API_URL}/farmers/orders/status/update`,
        { orderId, status: newStatus },
        { headers: { Authorization: `Bearer ${farmerToken}` } }
      );

      if (response.data.success) {
        setOrders(orders.map(o => o._id === orderId ? response.data.data : o));
        setSelectedOrder(response.data.data);
        alert('Order status updated!');
      }
    } catch (error) {
      alert('Error updating status: ' + error.message);
    } finally {
      setUpdatingOrder(null);
    }
  };

  const handlePaymentUpdate = async (orderId, newStatus) => {
    setUpdatingOrder(orderId);

    try {
      const response = await axios.put(
        `${process.env.REACT_APP_API_URL}/farmers/orders/payment/update`,
        { orderId, paymentStatus: newStatus },
        { headers: { Authorization: `Bearer ${farmerToken}` } }
      );

      if (response.data.success) {
        setOrders(orders.map(o => o._id === orderId ? response.data.data : o));
        setSelectedOrder(response.data.data);
        alert('Payment status updated!');
      }
    } catch (error) {
      alert('Error updating payment: ' + error.message);
    } finally {
      setUpdatingOrder(null);
    }
  };

  const getFilteredOrders = () => {
    let filtered = orders;
    if (filter !== 'All') {
      filtered = filtered.filter(o => o.status === filter);
    }
    if (searchTerm) {
      filtered = filtered.filter(o =>
        o.buyerId?.businessName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        o.buyerId?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        o.orderId?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    return filtered;
  };

  const getStatusColor = (status) => {
    const colors = {
      'Pending': '#ff9800',
      'Confirmed': '#2196f3',
      'Ready for Pickup': '#4caf50',
      'Shipped': '#9c27b0',
      'Delivered': '#2e7d32',
      'Cancelled': '#f44336'
    };
    return colors[status] || '#999';
  };

  const getPaymentStatusColor = (status) => {
    const colors = {
      'Pending': '#ff9800',
      'Completed': '#2e7d32',
      'Failed': '#f44336'
    };
    return colors[status] || '#999';
  };

  if (loading) {
    return <div className="loading">Loading orders...</div>;
  }

  const filteredOrders = getFilteredOrders();

  return (
    <div className="farmer-orders">
      {/* Header */}
      <header className="orders-header">
        <div className="header-left">
          <button className="back-btn" onClick={() => navigate('/farmer/dashboard')}>← Back</button>
          <h1>Order Management</h1>
        </div>
        <NotificationBell />
      </header>

      {/* Stats */}
      <div className="orders-stats">
        <div className="stat-box">
          <div className="stat-number">{stats.total || 0}</div>
          <div className="stat-name">Total Orders</div>
        </div>
        <div className="stat-box pending">
          <div className="stat-number">{stats.pending || 0}</div>
          <div className="stat-name">Pending</div>
        </div>
        <div className="stat-box confirmed">
          <div className="stat-number">{stats.confirmed || 0}</div>
          <div className="stat-name">Confirmed</div>
        </div>
        <div className="stat-box ready">
          <div className="stat-number">{stats.readyForPickup || 0}</div>
          <div className="stat-name">Ready</div>
        </div>
        <div className="stat-box delivered">
          <div className="stat-number">{stats.delivered || 0}</div>
          <div className="stat-name">Delivered</div>
        </div>
        <div className="stat-box revenue">
          <div className="stat-number">₹{(stats.totalRevenue || 0).toLocaleString()}</div>
          <div className="stat-name">Revenue</div>
        </div>
      </div>

      {/* Filters */}
      <div className="filters">
        <div className="filter-section">
          <h3>Filter by Status:</h3>
          <div className="filter-buttons">
            {['All', 'Pending', 'Confirmed', 'Ready for Pickup', 'Shipped', 'Delivered', 'Cancelled'].map(status => (
              <button
                key={status}
                className={`filter-btn ${filter === status ? 'active' : ''}`}
                onClick={() => setFilter(status)}
                style={filter === status ? { backgroundColor: getStatusColor(status) } : {}}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        <div className="search-section">
          <h3>Search Buyer/Order:</h3>
          <input
            type="text"
            placeholder="Search by name, business or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
      </div>

      {/* Orders List */}
      <div className="orders-container">
        {filteredOrders.length === 0 ? (
          <div className="no-orders">
            <p>No orders found for this filter</p>
          </div>
        ) : (
          <div className="orders-grid">
            {filteredOrders.map(order => (
              <div key={order._id} className="order-card">
                <div className="order-header">
                  <div>
                    <h4>{order.orderId}</h4>
                    <p className="buyer">{order.buyerId?.businessName}</p>
                  </div>
                  <span
                    className="status-badge"
                    style={{ backgroundColor: getStatusColor(order.status) }}
                  >
                    {order.status}
                  </span>
                </div>

                <div className="order-body">
                  <div className="order-info">
                    <p><strong>Items:</strong> {order.items.length}</p>
                    <p><strong>Amount:</strong> ₹{order.totalAmount}</p>
                    <p><strong>Date:</strong> {new Date(order.createdAt).toLocaleDateString()}</p>
                  </div>

                  <div className="payment-info">
                    <p><strong>Payment:</strong></p>
                    <span
                      className="payment-badge"
                      style={{ backgroundColor: getPaymentStatusColor(order.payment.status) }}
                    >
                      {order.payment.status}
                    </span>
                  </div>

                  <button
                    className="view-btn"
                    onClick={() => setSelectedOrder(order)}
                  >
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="modal-overlay" onClick={() => setSelectedOrder(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <button className="close-btn" onClick={() => setSelectedOrder(null)}>✕</button>

            <h2>Order Details - {selectedOrder.orderId}</h2>

            {/* Buyer Info */}
            <div className="section">
              <h3>Buyer Information</h3>
              <div className="info-grid">
                <div>
                  <p><strong>Name:</strong> {selectedOrder.buyerId?.name}</p>
                  <p><strong>Business:</strong> {selectedOrder.buyerId?.businessName}</p>
                </div>
                <div>
                  <p><strong>Phone:</strong> {selectedOrder.buyerId?.phone}</p>
                  <p><strong>Email:</strong> {selectedOrder.buyerId?.email}</p>
                </div>
              </div>
            </div>

            {/* Items */}
            <div className="section">
              <h3>Order Items</h3>
              <table className="items-table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Qty</th>
                    <th>Price</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedOrder.items.map((item, idx) => (
                    <tr key={idx}>
                      <td>{item.productName}</td>
                      <td>{item.quantity} {item.unit}</td>
                      <td>₹{item.pricePerUnit}</td>
                      <td>₹{item.totalPrice}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="total-row">
                <strong>Total Amount:</strong>
                <strong>₹{selectedOrder.totalAmount}</strong>
              </div>
            </div>

            {/* Status & Payment */}
            <div className="section">
              <h3>Order Status & Payment</h3>
              <div className="status-controls">
                <div className="control-group">
                  <label>Order Status:</label>
                  <select
                    value={selectedOrder.status}
                    onChange={(e) => handleStatusUpdate(selectedOrder._id, e.target.value)}
                    disabled={updatingOrder === selectedOrder._id}
                  >
                    <option value="Pending">Pending</option>
                    <option value="Confirmed">Confirmed</option>
                    <option value="Ready for Pickup">Ready for Pickup</option>
                    <option value="Shipped">Shipped</option>
                    <option value="Delivered">Delivered</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>

                <div className="control-group">
                  <label>Payment Status:</label>
                  <select
                    value={selectedOrder.payment.status}
                    onChange={(e) => handlePaymentUpdate(selectedOrder._id, e.target.value)}
                    disabled={updatingOrder === selectedOrder._id}
                  >
                    <option value="Pending">Pending</option>
                    <option value="Completed">Completed</option>
                    <option value="Failed">Failed</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Delivery Info */}
            <div className="section">
              <h3>Delivery Information</h3>
              <p><strong>Type:</strong> {selectedOrder.delivery.type}</p>
              <p><strong>Address:</strong> {selectedOrder.delivery.address}</p>
              {selectedOrder.delivery.scheduledDate && (
                <p><strong>Scheduled:</strong> {new Date(selectedOrder.delivery.scheduledDate).toLocaleDateString()}</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FarmerOrders;
