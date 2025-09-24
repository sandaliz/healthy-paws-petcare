import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';
import { AiOutlineEye, AiOutlineEyeInvisible } from 'react-icons/ai';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import assets from '../../assets/assets';
import '../../styles/NewPassword.css';  // ✅ scoped version

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

  // ✅ Password Requirement Checks
  const requirements = [
    { label: '8–12 characters minimum', test: /^.{8,12}$/ },
    { label: 'One uppercase letter (A–Z)', test: /[A-Z]/ },
    { label: 'One lowercase letter (a–z)', test: /[a-z]/ },
    { label: 'One number (0–9)', test: /[0-9]/ },
    { label: 'One special character (!@#$%^&*)', test: /[!@#$%^&*()_\-+=]/ },
  ];

  const validRequirements = requirements.map(req => ({
    ...req,
    valid: req.test.test(newPassword),
  }));

  const allValid = validRequirements.every(req => req.valid);

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) return toast.error('Passwords do not match!');
    if (!allValid) return toast.error('Password does not meet requirements!');

    setLoading(true);
    try {
      const res = await axios.post('http://localhost:5000/api/auth/reset-password', {
        email,
        otp,
        newPassword,
      });
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
    <div className="np-page">
      <div className="np-container">
        
        {/* Left side image */}
        <div className="np-img-box">
          <img
            src={assets.reset_password_illustration}
            alt="Reset Password Illustration"
            className="np-illustration"
          />
        </div>

        {/* Right side form card */}
        <div className="np-card">
          <h1 className="np-title">Set New Password</h1>
          <form onSubmit={handleResetPassword} className="np-form">
            
            {/* New Password Input */}
            <div className="np-input-group">
              <input
                type={showNewPassword ? 'text' : 'password'}
                placeholder="Enter new password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="np-input"
                required
              />
              <div className="np-toggle"
                onClick={() => setShowNewPassword(!showNewPassword)}
              >
                {showNewPassword ? <AiOutlineEyeInvisible size={22} /> : <AiOutlineEye size={22} />}
              </div>
            </div>

            {/* Password Requirements Live */}
            <ul className="np-requirements">
              {validRequirements.map((req, index) => (
                <li key={index} className={req.valid ? "valid" : "invalid"}>
                  <input type="checkbox" checked={req.valid} readOnly />
                  <span>{req.label}</span>
                </li>
              ))}
            </ul>

            {/* Confirm Password Input */}
            <div className="np-input-group">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="np-input"
                required
              />
              <div className="np-toggle"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? <AiOutlineEyeInvisible size={22} /> : <AiOutlineEye size={22} />}
              </div>
            </div>

            <button type="submit" disabled={loading} className="np-submit">
              {loading ? 'Resetting...' : 'Reset Password'}
            </button>
          </form>
        </div>
      </div>
      <ToastContainer position="top-center" autoClose={3000} />
    </div>
  );
};

export default NewPassword;