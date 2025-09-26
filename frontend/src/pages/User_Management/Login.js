import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import assets from '../../assets/assets';
import {
  EnvelopeIcon,
  LockClosedIcon,
  EyeIcon,
  EyeSlashIcon,
  ExclamationCircleIcon,
} from '@heroicons/react/24/outline'; 

import '../../styles/Login.css'; 

const BASE_URL = "http://localhost:5001"; 

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [showPassword, setShowPassword] = useState(false);  

  const navigate = useNavigate();

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const validatePassword = (password) => password.length >= 8;

  const handleEmailChange = (e) => {
    const value = e.target.value;
    setEmail(value);
    setEmailError(
      value && !validateEmail(value) 
        ? 'Please enter a valid email address' 
        : ''
    );
  };

  const handlePasswordChange = (e) => {
    const value = e.target.value;
    setPassword(value);
    setPasswordError(
      value && !validatePassword(value) 
        ? 'Password must be at least 8 characters long' 
        : ''
    );
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    if (!validateEmail(email)) {
      setEmailError('Please enter a valid email address');
      return;
    }
    if (!validatePassword(password)) {
      setPasswordError('Password must be at least 8 characters long');
      return;
    }

    setLoading(true);

    try {
      const res = await axios.post(
        `${BASE_URL}/api/auth/login`,
        { email, password },
        { withCredentials: true }
      );

      if (res.data.success) {
        const token = res.data.token;
        const user = res.data.user;

        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(user));

        try {
          const authCheck = await axios.get(`${BASE_URL}/api/auth/check-auth`, {
            headers: { Authorization: `Bearer ${token}` },
            withCredentials: true,
          });

          if (authCheck.data.success && authCheck.data.user.isActive) {
            navigate(res.data.redirectUrl);
          } else {
            setError("Your account has been deactivated. Please contact admin.");
            localStorage.removeItem("token");
            localStorage.removeItem("user");
          }
        } catch {
          setError("Your account has been deactivated. Please contact admin.");
          localStorage.removeItem("token");
          localStorage.removeItem("user");
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    }

    setLoading(false);
  };

  return (
    <div className="lg-page">
      <div className="lg-doodle-panel">
        <div className="lg-content">

          <div className="lg-image-circle">
            <img src={assets.dog_img} alt="Dog" />
          </div>

          <div className="lg-card">
            <h2 className="lg-title">Login to Your Account</h2>
            <p className="lg-subtitle">
              Welcome back! Please enter your details to continue.
            </p>

            {error && (
              <div className="lg-error-box">
                <ExclamationCircleIcon className="lg-error-icon" />
                {error}
              </div>
            )}

            <form onSubmit={handleLogin} className="lg-form">
              
              {/* Email */}
              <div>
                <div className="lg-input-wrapper">
                  <EnvelopeIcon className="lg-left-icon" />
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={handleEmailChange}
                    placeholder="Email"
                    className={`lg-input ${emailError ? 'lg-input-error' : ''}`}
                  />
                </div>
                {emailError && <p className="lg-error-text">{emailError}</p>}
              </div>

              {/* Password */}
              <div>
                <div className="lg-input-wrapper">
                  <LockClosedIcon className="lg-left-icon" />
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={handlePasswordChange}
                    placeholder="Password"
                    className={`lg-input ${passwordError ? 'lg-input-error' : ''}`}
                  />
                  <span
                    className="lg-right-icon lg-eye-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeSlashIcon /> : <EyeIcon />}
                  </span>
                </div>
                {passwordError && <p className="lg-error-text">{passwordError}</p>}
              </div>

              <div className="lg-form-links">
                <Link to="/reset-password" className="lg-link">
                  Forgot Password?
                </Link>
              </div>

              <button
                type="submit"
                className="lg-btn"
                disabled={loading || emailError || passwordError}
              >
                {loading ? 'Logging in...' : 'Login'}
              </button>
            </form>

            <p className="lg-signup-text">
              Don't have an account?{" "}
              <Link to="/signup" className="lg-signup-link">
                Create Account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;