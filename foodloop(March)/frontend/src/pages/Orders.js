import axios from 'axios';
import NotificationBell from '../components/NotificationBell';
import './Orders.css';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const buyerInfo = localStorage.getItem('buyerInfo');
      const buyerId = buyerInfo ? JSON.parse(buyerInfo)._id : 'demo-buyer-id';

      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/orders/buyer/${buyerId}`
      );
      setOrders(response.data.data || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
      // Don't show error if endpoint doesn't exist yet
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending': return '#ff9800';
      case 'Confirmed': return '#2196f3';
      case 'Ready for Pickup': return '#4caf50';
      case 'Shipped': return '#9c27b0';
      case 'Delivered': return '#2e7d32';
      case 'Cancelled': return '#f44336';
      default: return '#999';
    }
  };

  return (
    <div className="orders-container">
      <header className="orders-header">
        <h1>📦 My Orders</h1>
        <NotificationBell />
      </header>

      <div className="orders-content">
        {loading ? (
          <div className="loading">Loading orders...</div>
        ) : orders.length === 0 ? (
          <div className="no-orders">
            <p>No orders yet. Start ordering fresh produce!</p>
            <a href="/">Go to Shop</a>
          </div>
        ) : (
          <div className="orders-list">
            {orders.map(order => (
              <div
                key={order._id}
                className="order-card"
                onClick={() => setSelectedOrder(selectedOrder?._id === order._id ? null : order)}
              >
                <div className="order-header">
                  <div className="order-id">
                    <strong>{order.orderId}</strong>
                    <span className="order-date">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="order-status" style={{ backgroundColor: getStatusColor(order.status) }}>
                    {order.status}
                  </div>
                </div>

                <div className="order-summary">
                  <div>
                    <p className="label">From Farmer:</p>
                    <p className="value">{order.farmerId?.name || 'Farmer'}</p>
                  </div>
                  <div>
                    <p className="label">Items:</p>
                    <p className="value">{order.items.length} product(s)</p>
                  </div>
                  <div>
                    <p className="label">Total:</p>
                    <p className="value" style={{ fontWeight: 'bold', color: '#2e7d32' }}>
                      ₹{order.totalAmount}
                    </p>
                  </div>
                </div>

                {selectedOrder?._id === order._id && (
                  <div className="order-details">
                    <h4>Order Items</h4>
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
                        {order.items.map((item, idx) => (
                          <tr key={idx}>
                            <td>{item.productName}</td>
                            <td>{item.quantity} {item.unit}</td>
                            <td>₹{item.pricePerUnit}</td>
                            <td>₹{item.totalPrice}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>

                    <h4>Delivery Information</h4>
                    <div className="delivery-info">
                      <p><strong>Type:</strong> {order.delivery.type}</p>
                      <p><strong>Address:</strong> {order.delivery.address}</p>
                      {order.delivery.scheduledDate && (
                        <p><strong>Scheduled:</strong> {new Date(order.delivery.scheduledDate).toLocaleDateString()}</p>
                      )}
                    </div>

                    <h4>Payment</h4>
                    <div className="payment-info">
                      <p><strong>Method:</strong> {order.payment.method}</p>
                      <p><strong>Status:</strong> {order.payment.status}</p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Orders;
