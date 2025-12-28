import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { studentAPI } from '../services/api';
import './Login.css';

const Login = () => {
  const [applicationId, setApplicationId] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await studentAPI.login(applicationId);
      
      // Store token and student info
      localStorage.setItem('token', response.token);
      localStorage.setItem('student', JSON.stringify(response.student));
      
      // Redirect to dashboard
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed. Please check your Application ID.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1>Interview Portal</h1>
          <p>Welcome! Please login with your Application ID</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          {error && <div className="error-message">{error}</div>}

          <div className="form-group">
            <label htmlFor="applicationId">Application ID</label>
            <input
              type="text"
              id="applicationId"
              value={applicationId}
              onChange={(e) => setApplicationId(e.target.value)}
              placeholder="Enter your Application ID"
              required
              autoFocus
            />
          </div>

          <button type="submit" className="login-button" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;

