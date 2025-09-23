import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { EnvelopeIcon, ExclamationCircleIcon } from '@heroicons/react/24/outline';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import assets from '../../assets/assets';
import '../../styles/ResetPassword.css';

const ResetPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState('');
  const navigate = useNavigate();

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleEmailChange = (e) => {
    const value = e.target.value;
    setEmail(value);
    if (value && !validateEmail(value)) {
      setEmailError('Please enter a valid email address');
    } else {
      setEmailError('');
    }
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!validateEmail(email)) {
      setEmailError('Please enter a valid email address');
      return;
    }
    setLoading(true);
    try {
      const res = await axios.post('http://localhost:5000/api/auth/send-reset-otp', { email });
      setLoading(false);
      if (res.data.success) {
        toast.success(res.data.message);
        setTimeout(() => navigate('/email-verify', { state: { email } }), 1500);
      } else {
        toast.error(res.data.message || 'Something went wrong');
      }
    } catch (err) {
      setLoading(false);
      toast.error(err.response?.data?.message || 'Failed to send OTP');
    }
  };

  return (
    <div className="reset-password-page">
      <div className="reset-background-container">
        <div className="reset-overlay-content">
          <div className="reset-side-image-container">
            <img src={assets.reset_side_image} alt="Password reset illustration" />
          </div>
          <div className="reset-form-container">
            <h1 className="reset-title">Reset Password</h1>
            <p className="reset-subtitle">
              Enter the email associated with your account and we'll send an email with instructions to reset your password.
            </p>
            <form onSubmit={handleSendOtp} className="reset-form">
              <div className="reset-input-group">
                <EnvelopeIcon className="reset-email-icon" />
                <input
                  type="email"
                  placeholder="Email address"
                  value={email}
                  onChange={handleEmailChange}
                  className={`reset-email-input ${emailError ? 'reset-input-error' : ''}`}
                  required
                />
              </div>
              {emailError && (
                <p className="reset-error-message">
                  <ExclamationCircleIcon className="reset-error-icon" />
                  {emailError}
                </p>
              )}
              <button type="submit" disabled={loading || emailError} className="reset-button">
                {loading ? (
                  <span className="reset-loading-spinner">
                    <svg
                      className="animate-spin reset-spinner-icon"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Sending OTP...
                  </span>
                ) : (
                  'Reset password'
                )}
              </button>
            </form>
            <a href="/login" className="reset-remember-link">
              Wait, I remember my password
            </a>
          </div>
        </div>
      </div>
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} />
    </div>
  );
};

export default ResetPassword;