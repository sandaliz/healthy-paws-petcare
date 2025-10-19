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

  // Better email regex (allows subdomains, "+" etc.)
  const validateEmail = (email) => {
    return /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(email);
  };

  const handleEmailChange = (e) => {
    const value = e.target.value.trim();
    setEmail(value);

    // Revalidate immediately
    if (!value) {
      setEmailError('Email is required');
    } else if (!validateEmail(value)) {
      setEmailError('Please enter a valid email address');
    } else {
      setEmailError('');
    }
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();

    // Final validation before submit
    if (!email) {
      setEmailError('Email is required');
      return;
    }
    if (!validateEmail(email)) {
      setEmailError('Please enter a valid email address');
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post('http://localhost:5001/api/auth/send-reset-otp', { email });
      setLoading(false);

      if (res.data.success) {
        toast.success(res.data.message);
        setTimeout(() => {
          // Navigate to email verify page with email in query param
          navigate(`/email-verify?email=${encodeURIComponent(email)}`);
        }, 1200);
      } else {
        toast.error(res.data.message || 'Something went wrong');
      }
    } catch (err) {
      setLoading(false);
      toast.error(err.response?.data?.message || 'Failed to send reset email');
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
              Enter your email address and we’ll send you a link to reset your password.
            </p>

            <form onSubmit={handleSendOtp} className="reset-form">
              <div className="reset-input-group">
                <EnvelopeIcon className="reset-email-icon" />
                <input
                  id="reset-email-input"
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

              <button
                type="submit"
                disabled={loading || !!emailError || !email}
                className="reset-button"
              >
                {loading ? 'Sending email…' : 'Reset password'}
              </button>
            </form>

            <a href="/login" className="reset-remember-link">
              Wait, I remember my password
            </a>
          </div>
        </div>
      </div>
      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
};

export default ResetPassword;