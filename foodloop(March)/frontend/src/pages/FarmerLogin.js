import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import './FarmerAuth.css';

const FarmerLogin = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    email: '',
    password: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/farmers/auth/login`,
        form
      );

      if (response.data.success) {
        // Store token and farmer data
        localStorage.setItem('farmerToken', response.data.token);
        localStorage.setItem('farmerId', response.data.data.farmerId);
        localStorage.setItem('farmerName', response.data.data.name);
        
        navigate('/farmer/dashboard');
      }
    } catch (error) {
      alert('Login failed: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="farmer-auth-container">
      <div className="auth-card">
        <h1>🌾 Farmer Login</h1>
        <p>Access your farm dashboard and manage products</p>

        <form onSubmit={handleSubmit}>
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            required
          />

          <input
            type="password"
            name="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            required
          />

          <button type="submit" className="auth-btn" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <p className="auth-link">
          New farmer? <Link to="/farmer/signup">Register here</Link>
        </p>
      </div>
    </div>
  );
};

export default FarmerLogin;
