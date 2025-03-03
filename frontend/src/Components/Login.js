import React, { useState } from "react";
import { useNavigate } from 'react-router-dom';
import axios from "axios";
import "./CSS/AuthLogin.css"

const Login = () => {
    const [formData, setFormData] = useState({
      username: '',
      password: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
  
    const handleChange = (e) => {
      const { name, value } = e.target;
      setFormData({ ...formData, [name]: value });
    };
  
    const handleSubmit = async (e) => {
      e.preventDefault();
      setLoading(true);
      setError('');
  
      try {
        const response = await axios.post('http://127.0.0.1:5000/login', formData);
        
        // Store the token and topics in localStorage
        localStorage.setItem('token', response.data['access token']);
        localStorage.setItem('topics', response.data.topics);
        
        // Set the default authorization header for future requests
        axios.defaults.headers.common['Authorization'] = `Bearer ${response.data['access token']}`;
        
        // Redirect to the feed page
        navigate('/feed');
      } catch (error) {
        setError(error.response?.data?.message || 'Login failed. Please check your credentials.');
      } finally {
        setLoading(false);
      }
    };
  
    return (
      <div className="auth-container">
        <div className="auth-card">
          <h2>Login</h2>
          {error && <div className="error-message">{error}</div>}
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="username">Username</label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>
            <button type="submit" className="auth-button" disabled={loading}>
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>
          <p className="auth-redirect">
            Don't have an account? <a href="/register">Register here</a>
          </p>
        </div>
      </div>
    );
  };
  
  export default Login;