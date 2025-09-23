import React, { useState } from 'react';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../../styles/EmailVerify.css';

const EmailVerify = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const email = location.state?.email;

  const [otp, setOtp] = useState(Array(6).fill(''));
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  if (!email) {
    navigate('/reset-password');
  }

  const handleChange = (e, index) => {
    const value = e.target.value;
    if (/^\d*$/.test(value)) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);

      // Move to next input
      if (value && index < 5) {
        document.getElementById(`verify-otp-${index + 1}`).focus();
      }

      // Auto-submit when 6 digits entered
      if (newOtp.join('').length === 6) {
        handleSubmit(newOtp.join(''));
      }
    }
  };

  const handleSubmit = async (otpValue) => {
    if (otpValue.length !== 6) {
      toast.error('Please enter a 6-digit OTP');
      return;
    }

    setLoading(true);

    try {
      const res = await axios.post(
        'http://localhost:5000/api/auth/reset-password-verify',
        { email, otp: otpValue }
      );
      setLoading(false);

      if (res.data.success) {
        toast.success('✅ OTP Verified! Redirecting...');
        setTimeout(() => {
          navigate(`/new-password?email=${email}&otp=${otpValue}`);
        }, 2000);
      } else {
        toast.error(res.data.message || 'Invalid OTP');
      }
    } catch (err) {
      setLoading(false);
      const errorMsg = err.response?.data?.message || 'Verification failed';
      toast.error(errorMsg);
    }
  };

  const handleResendCode = async () => {
    if (!email) return;
    setResending(true);
    try {
      const res = await axios.post(
        'http://localhost:5000/api/auth/send-reset-otp',
        { email }
      );
      setResending(false);
      if (res.data.success) {
        toast.success('📩 A new OTP has been sent to your email');
      } else {
        toast.error(res.data.message || 'Failed to resend code');
      }
    } catch (err) {
      setResending(false);
      toast.error(err.response?.data?.message || 'Error resending code');
    }
  };

  return (
    <div className="email-verify-page">
      <div className="verify-background-container">
        <div className="verify-content">
          <h2 className="verify-title">Reset your password</h2>
          <p className="verify-subtitle">
            Enter the 6-digit code sent to your email. This code is valid for the next 10 minutes.
          </p>

          <div className="verify-otp-inputs">
            {otp.map((value, index) => (
              <input
                key={index}
                id={`verify-otp-${index}`}
                type="text"
                maxLength="1"
                value={value}
                disabled={loading}
                onChange={(e) => handleChange(e, index)}
                className="verify-otp-input"
              />
            ))}
          </div>

          <button
            className="verify-reset-button"
            disabled={loading}
            onClick={() => handleSubmit(otp.join(''))}
          >
            {loading ? 'Verifying...' : 'Reset password'}
          </button>

          <p className="verify-resend-text">
            Didn't get the code?{" "}
            <span
              className="verify-resend-link"
              style={{ cursor: "pointer", color: "blue" }}
              onClick={handleResendCode}
            >
              {resending ? "Resending..." : "Resend code"}
            </span>
          </p>
        </div>
      </div>
      <ToastContainer position="top-center" autoClose={3000} />
    </div>
  );
};

export default EmailVerify;