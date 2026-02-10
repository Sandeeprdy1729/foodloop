import React, { useState } from 'react';
import axios from 'axios';
import './FarmerAuth.css'; // Reusing farmer auth styles for consistency

const BuyerLogin = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await axios.post(
                `${process.env.REACT_APP_API_URL}/buyers/auth/login`,
                { email, password }
            );

            localStorage.setItem('buyerToken', response.data.token);
            localStorage.setItem('buyerInfo', JSON.stringify(response.data.data));

            window.location.href = '/';
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <h1>Buyer Login</h1>
                <p>Login to your mart/restaurant account</p>

                {error && <div className="error-message">{error}</div>}

                <form onSubmit={handleLogin}>
                    <div className="form-group">
                        <label>Email Address</label>
                        <input
                            type="email"
                            placeholder="Enter your email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Password</label>
                        <input
                            type="password"
                            placeholder="Enter your password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    <button type="submit" className="auth-btn" disabled={loading}>
                        {loading ? 'Logging in...' : 'Login'}
                    </button>
                </form>

                <div className="auth-footer">
                    <p>Don't have an account? Registered at checkout!</p>
                    <a href="/">Back to Dashboard</a>
                </div>
            </div>
        </div>
    );
};

export default BuyerLogin;
