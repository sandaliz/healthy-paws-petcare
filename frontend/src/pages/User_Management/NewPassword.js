import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';
import { AiOutlineEye, AiOutlineEyeInvisible } from 'react-icons/ai';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const NewPassword = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const searchParams = new URLSearchParams(location.search);
  const email = searchParams.get('email');
  const otp = searchParams.get('otp');

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!email || !otp) {
      toast.error('Missing email or OTP! Redirecting...');
      setTimeout(() => navigate('/reset-password'), 2000);
    }
  }, [email, otp, navigate]);

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) return toast.error('Passwords do not match!');
    if (newPassword.length < 6) return toast.error('Password must be at least 6 characters!');

    setLoading(true);
    try {
      const res = await axios.post('http://localhost:5000/api/auth/reset-password', { email, otp, newPassword });
      setLoading(false);
      if (res.data.success) {
        toast.success('Password reset successfully! Redirecting...');
        setTimeout(() => navigate('/login'), 2000);
      } else toast.error(res.data.message || 'Failed to reset password');
    } catch (err) {
      setLoading(false);
      toast.error(err.response?.data?.message || 'Something went wrong');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: 'linear-gradient(180deg, #FFFFFF 0%, #FFD58E 100%)' }}>
      <div className="bg-white shadow-2xl rounded-3xl p-10 w-full max-w-md flex flex-col items-center">
        <h1 className="text-3xl font-extrabold mb-6 text-[#54413C] text-center">Set New Password</h1>
        <form onSubmit={handleResetPassword} className="w-full flex flex-col gap-5">
          {/* New Password */}
          <div className="relative">
            <input
              type={showNewPassword ? 'text' : 'password'}
              placeholder="Enter new password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full py-3 px-4 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-yellow-400 pr-12 transition-all duration-200"
              required
            />
            <div className="absolute right-3 top-3 cursor-pointer text-gray-500" onClick={() => setShowNewPassword(!showNewPassword)}>
              {showNewPassword ? <AiOutlineEyeInvisible size={22} /> : <AiOutlineEye size={22} />}
            </div>
          </div>

          {/* Confirm Password */}
          <div className="relative">
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full py-3 px-4 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-yellow-400 pr-12 transition-all duration-200"
              required
            />
            <div className="absolute right-3 top-3 cursor-pointer text-gray-500" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
              {showConfirmPassword ? <AiOutlineEyeInvisible size={22} /> : <AiOutlineEye size={22} />}
            </div>
          </div>

          <button type="submit" disabled={loading} className="w-full py-3 rounded-xl bg-[#54413C] text-white font-semibold hover:bg-[#43332b] transition-all duration-300 shadow-md">
            {loading ? 'Resetting...' : 'Reset Password'}
          </button>
        </form>
      </div>
      <ToastContainer position="top-center" autoClose={3000} />
    </div>
  );
};

export default NewPassword;
