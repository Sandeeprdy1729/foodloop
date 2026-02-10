import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import './FarmerAuth.css';

const FarmerSignup = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    location: '',
    state: '',
    city: '',
    farmSize: '',
    crops: '',
    password: '',
    confirmPassword: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (form.password !== form.confirmPassword) {
      alert('Passwords do not match!');
      return;
    }

    setLoading(true);
    try {
      const cropsList = form.crops.split(',').map(c => c.trim()).filter(c => c);
      
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/farmers/auth/register`,
        {
          name: form.name,
          email: form.email,
          phone: form.phone,
          location: form.location,
          state: form.state,
          city: form.city,
          farmSize: parseFloat(form.farmSize),
          crops: cropsList,
          password: form.password
        }
      );

      if (response.data.success) {
        // Store token and farmer data
        localStorage.setItem('farmerToken', response.data.token);
        localStorage.setItem('farmerId', response.data.data.farmerId);
        localStorage.setItem('farmerName', response.data.data.name);
        
        navigate('/farmer/dashboard');
      }
    } catch (error) {
      alert('Signup failed: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="farmer-auth-container">
      <div className="auth-card">
        <h1>🌾 Join FoodLoop as a Farmer</h1>
        <p>Register your farm and start selling directly to markets</p>

        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <input
              type="text"
              name="name"
              placeholder="Full Name"
              value={form.name}
              onChange={handleChange}
              required
            />
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={form.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-row">
            <input
              type="tel"
              name="phone"
              placeholder="Phone"
              value={form.phone}
              onChange={handleChange}
              required
            />
            <input
              type="number"
              name="farmSize"
              placeholder="Farm Size (acres)"
              value={form.farmSize}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-row">
            <input
              type="text"
              name="location"
              placeholder="Location/Village"
              value={form.location}
              onChange={handleChange}
              required
            />
            <input
              type="text"
              name="city"
              placeholder="City"
              value={form.city}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-row">
            <input
              type="text"
              name="state"
              placeholder="State"
              value={form.state}
              onChange={handleChange}
              required
            />
            <input
              type="text"
              name="crops"
              placeholder="Crops (comma separated)"
              value={form.crops}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-row">
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={form.password}
              onChange={handleChange}
              required
            />
            <input
              type="password"
              name="confirmPassword"
              placeholder="Confirm Password"
              value={form.confirmPassword}
              onChange={handleChange}
              required
            />
          </div>

          <button type="submit" className="auth-btn" disabled={loading}>
            {loading ? 'Registering...' : 'Register Farm'}
          </button>
        </form>

        <p className="auth-link">
          Already have an account? <Link to="/farmer/login">Login here</Link>
        </p>
      </div>
    </div>
  );
};

export default FarmerSignup;
