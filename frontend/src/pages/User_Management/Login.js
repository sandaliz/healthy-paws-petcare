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

const BASE_URL = "http://localhost:5000";

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
      // Step 1: Login
      const res = await axios.post(
        `${BASE_URL}/api/auth/login`,
        { email, password },
        { withCredentials: true }
      );

      if (res.data.success) {
        const token = res.data.token;
        const user = res.data.user;

        // Save token + user temporarily
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(user));

        // Step 2: Verify account active with /check-auth
        try {
          const authCheck = await axios.get(`${BASE_URL}/api/auth/check-auth`, {
            headers: { Authorization: `Bearer ${token}` },
            withCredentials: true,
          });

          if (authCheck.data.success && authCheck.data.user.isActive) {
            // ✅ Active → allow login
            navigate(res.data.redirectUrl);
          } else {
            // ❌ Inactive → block
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
    <div className="login-page-wrapper">
      <div className="login-page">
        <div className="doodle-panel">
          <div className="login-content">

            {/* Dog image circle */}
            <div className="image-circle">
              <img src={assets.dog_img} alt="Dog" />
            </div>

            {/* Login card */}
            <div className="login-card">
              <h2 className="login-card__title">Login to Your Account</h2>
              <p className="login-card__subtitle">
                Welcome back! Please enter your details to continue.
              </p>

              {error && (
                <div className="error-box">
                  <ExclamationCircleIcon className="error-icon" />
                  {error}
                </div>
              )}

              <form onSubmit={handleLogin} className="form">

                {/* Email */}
                <div className="form-field">
                  <div className="input-wrapper login-input-wrapper">
                    <EnvelopeIcon className="input-icon login-left-icon" />
                    <input
                      id="email"
                      name="email"
                      type="email"
                      value={email}
                      onChange={handleEmailChange}
                      placeholder="Email"
                      className={`input login-input ${emailError ? 'input-error' : ''}`}
                    />
                  </div>
                  {emailError && <p className="error-text">{emailError}</p>}
                </div>

                {/* Password */}
                <div className="form-field">
                  <div className="input-wrapper login-input-wrapper">
                    <LockClosedIcon className="input-icon login-left-icon" />
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={handlePasswordChange}
                      placeholder="Password"
                      className={`input login-input ${passwordError ? 'input-error' : ''}`}
                    />
                    <span
                      className="input-icon login-right-icon login-eye-toggle"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeSlashIcon /> : <EyeIcon />}
                    </span>
                  </div>
                  {passwordError && <p className="error-text">{passwordError}</p>}
                </div>

                {/* Forgot Password */}
                <div className="form-links">
                  <Link to="/reset-password" className="link">
                    Forgot Password?
                  </Link>
                </div>

                {/* Login Button */}
                <button
                  type="submit"
                  className="login-btn"
                  disabled={loading || emailError || passwordError}
                >
                  {loading ? 'Logging in...' : 'Login'}
                </button>
              </form>

              {/* Signup */}
              <p className="signup-text">
                Don't have an account?{" "}
                <Link to="/signup" className="signup-link">
                  Create Account
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;