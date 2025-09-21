import React, { useState } from 'react';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import assets from '../../assets/assets';

const EmailVerify = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const email = location.state?.email;

  const [otp, setOtp] = useState(Array(6).fill(''));
  const [loading, setLoading] = useState(false);

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
        document.getElementById(`otp-${index + 1}`).focus();
      }

      // Auto-submit if 6 digits are entered
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

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4"
      style={{ background: 'linear-gradient(180deg, #FFFFFF 0%, #FFD58E 100%)' }}
    >
      {/* Top Image */}
      <img src={assets.verify_otp} alt="Verify OTP" className="w-32 sm:w-36 mb-6" />

      <h2 className="text-3xl font-bold mb-6 text-[#54413C] text-center">
        Email Verification
      </h2>

      <div className="flex flex-col gap-4 bg-white p-8 rounded-2xl shadow-lg w-full max-w-md">
        <div className="flex justify-between gap-2">
          {otp.map((value, index) => (
            <input
              key={index}
              id={`otp-${index}`}
              type="text"
              maxLength="1"
              value={value}
              disabled={loading}
              onChange={(e) => handleChange(e, index)}
              className="w-12 h-12 text-center border rounded-xl text-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
            />
          ))}
        </div>

        {loading && (
          <p className="text-center text-yellow-600 font-medium">Verifying...</p>
        )}
      </div>

      <ToastContainer position="top-center" autoClose={3000} />
    </div>
  );
};

export default EmailVerify;