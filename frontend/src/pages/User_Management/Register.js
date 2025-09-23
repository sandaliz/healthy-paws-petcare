import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import assets from '../../assets/assets'; // Your assets import with register_bg
import {
  EnvelopeIcon,
  LockClosedIcon,
  UserIcon,
  EyeIcon,
  EyeSlashIcon,
  ExclamationCircleIcon,
} from '@heroicons/react/24/outline';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../../styles/Register.css';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);

  const [nameError, setNameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');

  const navigate = useNavigate();

  // Validation helpers
  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const validatePassword = (password) => password.length >= 8;
  const validateName = (name) => name.trim().length >= 2;

  // Handlers for input change with validation
  const handleEmailChange = (e) => {
    const value = e.target.value;
    setEmail(value);
    setEmailError(value && !validateEmail(value) ? 'Please enter a valid email address' : '');
  };

  const handlePasswordChange = (e) => {
    const value = e.target.value;
    setPassword(value);
    setPasswordError(value && !validatePassword(value) ? 'Password must be at least 8 characters long' : '');

    if (confirmPassword && value !== confirmPassword) {
      setConfirmPasswordError('Passwords do not match');
    } else {
      setConfirmPasswordError('');
    }
  };

  const handleConfirmPasswordChange = (e) => {
    const value = e.target.value;
    setConfirmPassword(value);
    setConfirmPasswordError(value !== password ? 'Passwords do not match' : '');
  };

  const handleNameChange = (e) => {
    const value = e.target.value;
    setName(value);
    setNameError(value && !validateName(value) ? 'Name must be at least 2 characters long' : '');
  };

  // Submit handler
  const handleRegister = async (e) => {
    e.preventDefault();

    let hasError = false;
    if (!validateName(name)) {
      setNameError('Name must be at least 2 characters long');
      hasError = true;
    }
    if (!validateEmail(email)) {
      setEmailError('Please enter a valid email address');
      hasError = true;
    }
    if (!validatePassword(password)) {
      setPasswordError('Password must be at least 8 characters long');
      hasError = true;
    }
    if (password !== confirmPassword) {
      setConfirmPasswordError('Passwords do not match');
      hasError = true;
    }

    if (hasError) return;

    setLoading(true);
    try {
      const res = await axios.post('http://localhost:5000/api/auth/register', {
        name,
        email,
        password,
      });

      setLoading(false);

      if (res.data.success) {
        toast.success(res.data.message);
        setTimeout(() => {
          navigate('/email-verify', { state: { email } });
        }, 1500);
      } else {
        toast.error(res.data.message || 'Something went wrong');
      }
    } catch (err) {
      setLoading(false);
      toast.error(err.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div className="register-page">
      <img src={assets.register_bg} alt="Register Background" className="register-bg-image" />
      <div className="register-form-overlay">
        <h2 className="register-title">Create an Account</h2>
        <p className="register-description">
          Please fill in your details to create an account and enjoy our services.
        </p>
        <form onSubmit={handleRegister} className="register-form">
          <div className="input-group">
            <div className="input-wrapper register-input-wrapper">
              <UserIcon className="input-icon register-left-icon" />
              <input
                type="text"
                placeholder="Full Name"
                value={name}
                onChange={handleNameChange}
                className={`input-field register-input ${nameError ? 'input-error' : ''}`}
                required
              />
            </div>
            {nameError && (
              <p className="input-error-message">
                <ExclamationCircleIcon className="error-icon" />
                {nameError}
              </p>
            )}
          </div>

          <div className="input-group">
            <div className="input-wrapper register-input-wrapper">
              <EnvelopeIcon className="input-icon register-left-icon" />
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={handleEmailChange}
                className={`input-field register-input ${emailError ? 'input-error' : ''}`}
                required
              />
            </div>
            {emailError && (
              <p className="input-error-message">
                <ExclamationCircleIcon className="error-icon" />
                {emailError}
              </p>
            )}
          </div>

          <div className="input-group">
            <div className="input-wrapper register-input-wrapper">
              <LockClosedIcon className="input-icon register-left-icon" />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Password"
                value={password}
                onChange={handlePasswordChange}
                className={`input-field register-input ${passwordError ? 'input-error' : ''}`}
                required
              />
              <div className="register-password-toggle" onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? <EyeSlashIcon className="toggle-icon" /> : <EyeIcon className="toggle-icon" />}
              </div>
            </div>
            {passwordError && (
              <p className="input-error-message">
                <ExclamationCircleIcon className="error-icon" />
                {passwordError}
              </p>
            )}
            <div className="input-info-text">Password must be at least 8 characters long</div>
          </div>

          <div className="input-group">
            <div className="input-wrapper register-input-wrapper">
              <LockClosedIcon className="input-icon register-left-icon" />
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={handleConfirmPasswordChange}
                className={`input-field register-input ${confirmPasswordError ? 'input-error' : ''}`}
                required
              />
              <div className="register-password-toggle" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                {showConfirmPassword ? <EyeSlashIcon className="toggle-icon" /> : <EyeIcon className="toggle-icon" />}
              </div>
            </div>
            {confirmPasswordError && (
              <p className="input-error-message">
                <ExclamationCircleIcon className="error-icon" />
                {confirmPasswordError}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading || nameError || emailError || passwordError || confirmPasswordError}
            className="submit-btn"
          >
            {loading ? (
              <span className="loading-spinner">
                <svg
                  className="animate-spin spinner-icon"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Creating Account...
              </span>
            ) : (
              'Sign Up'
            )}
          </button>
        </form>
        <p className="login-text">
          Already have an account?{' '}
          <Link to="/login" className="login-link">
            Login
          </Link>
        </p>
      </div>
      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
};

export default Register;