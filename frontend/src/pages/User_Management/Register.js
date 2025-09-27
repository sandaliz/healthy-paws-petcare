import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import assets from '../../assets/assets';
import {
  EyeIcon,
  EyeSlashIcon,
  ExclamationCircleIcon,
  CheckCircleIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../../styles/Register.css';

// Password rules
const requirements = [
  { label: '8–12 characters minimum', test: /^.{8,12}$/ },
  { label: 'One uppercase letter (A–Z)', test: /[A-Z]/ },
  { label: 'One lowercase letter (a–z)', test: /[a-z]/ },
  { label: 'One number (0–9)', test: /[0-9]/ },
  { label: 'One special character (!@#$%^&*)', test: /[!@#$%^&*()_\-+=]/ },
];

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const [nameError, setNameError] = useState('');
  const [emailError, setEmailError] = useState('');

  const [passwordChecks, setPasswordChecks] = useState(requirements.map(() => false));
  const [confirmedPasswordRequirements, setConfirmedPasswordRequirements] = useState(false);

  const navigate = useNavigate();

  // Validation helpers
  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const validateName = (name) => name.trim().length >= 2;

  const handlePasswordChange = (e) => {
    const value = e.target.value;
    setPassword(value);

    const checks = requirements.map((req) => req.test.test(value));
    setPasswordChecks(checks);

    if (confirmPassword && value !== confirmPassword) {
      setConfirmPasswordError('Passwords do not match');
    } else {
      setConfirmPasswordError('');
    }

    if (value && checks.includes(false)) {
      setPasswordError('Invalid password. Must meet all requirements.');
    } else {
      setPasswordError('');
    }
  };

  const handleConfirmPasswordChange = (e) => {
    const value = e.target.value;
    setConfirmPassword(value);
    setConfirmPasswordError(value !== password ? 'Passwords do not match' : '');
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    if (passwordChecks.includes(false)) {
      toast.error('Password must meet all requirements');
      return;
    }

    if (!confirmedPasswordRequirements) {
      toast.error('Please confirm that your password meets all requirements');
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post(
        'http://localhost:5000/api/auth/register',
        { name, email, password },
        { withCredentials: true }
      );

      setLoading(false);

      if (res.data.success) {
        toast.success("✅ " + res.data.message);
        // ✅ Redirect user directly to login page after a brief success notification
        setTimeout(() => {
          navigate('/login');
        }, 1200);
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
          {/* NAME INPUT */}
          <div className="input-group">
            <div className="input-wrapper register-input-wrapper">
              <input
                type="text"
                placeholder="Full Name"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setNameError(!validateName(e.target.value) ? 'Name must be at least 2 characters long' : '');
                }}
                className={`register-input ${nameError ? 'input-error' : ''}`}
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

          {/* EMAIL INPUT */}
          <div className="input-group">
            <div className="input-wrapper register-input-wrapper">
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setEmailError(!validateEmail(e.target.value) ? 'Please enter a valid email address' : '');
                }}
                className={`register-input ${emailError ? 'input-error' : ''}`}
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

          {/* PASSWORD INPUT */}
          <div className="input-group">
            <div className="input-wrapper register-input-wrapper with-toggle">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Password"
                value={password}
                onChange={handlePasswordChange}
                className={`register-input ${passwordError ? 'input-error' : ''}`}
                required
              />
              <div
                className="register-password-toggle"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeSlashIcon /> : <EyeIcon />}
              </div>
            </div>
            {passwordError && (
              <p className="input-error-message">
                <ExclamationCircleIcon className="error-icon" />
                {passwordError}
              </p>
            )}
          </div>

          {/* PASSWORD REQUIREMENTS */}
          <ul className="password-requirements-list">
            {requirements.map((req, index) => (
              <li
                key={index}
                className={passwordChecks[index] ? 'requirement-met' : 'requirement-unmet'}
              >
                {passwordChecks[index] ? (
                  <CheckCircleIcon className="requirement-icon success" />
                ) : (
                  <XCircleIcon className="requirement-icon error" />
                )}
                {req.label}
              </li>
            ))}
          </ul>

          {/* CONFIRM PASSWORD */}
          <div className="input-group">
            <div className="input-wrapper register-input-wrapper with-toggle">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={handleConfirmPasswordChange}
                className={`register-input ${confirmPasswordError ? 'input-error' : ''}`}
                required
              />
              <div
                className="register-password-toggle"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? <EyeSlashIcon /> : <EyeIcon />}
              </div>
            </div>
            {confirmPasswordError && (
              <p className="input-error-message">
                <ExclamationCircleIcon className="error-icon" />
                {confirmPasswordError}
              </p>
            )}
          </div>

          {/* CONFIRM CHECKBOX */}
          <div className="checkbox-group">
            <label>
              <input
                type="checkbox"
                checked={confirmedPasswordRequirements}
                onChange={(e) => setConfirmedPasswordRequirements(e.target.checked)}
              />
              I confirm my password meets all requirements
            </label>
          </div>

          {/* SUBMIT BUTTON */}
          <button
            type="submit"
            disabled={
              loading ||
              nameError ||
              emailError ||
              passwordError ||
              confirmPasswordError ||
              passwordChecks.includes(false) ||
              !confirmedPasswordRequirements
            }
            className="submit-btn"
          >
            {loading ? 'Creating Account...' : 'Sign Up'}
          </button>
        </form>

        <p className="login-text">
          Already have an account?{' '}
          <Link to="/login" className="login-link">Login</Link>
        </p>
      </div>
      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
};

export default Register;