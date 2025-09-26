import React, { useState } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../../styles/EmailVerify.css";

const ResetVerifyOtp = () => {
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(useLocation().search);
  const email = searchParams.get("email");

  const [otp, setOtp] = useState(Array(6).fill(""));
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  const handleChange = (e, index) => {
    const value = e.target.value;
    if (/^\d*$/.test(value)) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);
      if (value && index < 5) {
        document.getElementById(`reset-otp-${index+1}`).focus();
      }
    }
  };

  const handleSubmit = async () => {
    const otpValue = otp.join("");
    if (otpValue.length !== 6) {
      toast.error("Please enter a 6‑digit OTP");
      return;
    }
    setLoading(true);
    try {
      // ✅ matches backend route now
      const res = await axios.post("http://localhost:5001/api/auth/verify-reset-otp", { email, otp: otpValue });
      setLoading(false);
      if (res.data.success) {
        toast.success("✅ OTP verified!");
        setTimeout(() => {
          navigate(`/new-password?email=${email}&otp=${otpValue}`);
        }, 1200);
      } else {
        toast.error(res.data.message || "Invalid OTP");
      }
    } catch (err) {
      setLoading(false);
      toast.error(err.response?.data?.message || "OTP verification failed");
    }
  };

  const handleResend = async () => {
    setResending(true);
    try {
      const res = await axios.post("http://localhost:5001/api/auth/send-reset-otp", { email });
      setResending(false);
      if (res.data.success) toast.success("📩 New OTP sent");
      else toast.error(res.data.message || "Error resending");
    } catch (err) {
      setResending(false);
      toast.error(err.response?.data?.message || "Server error while resending");
    }
  };

  return (
    <div className="email-verify-page">
      <div className="verify-background-container">
        <div className="verify-content">
          <h2 className="verify-title">Verify OTP</h2>
          <p className="verify-subtitle">Enter the 6‑digit code sent to <b>{email}</b></p>
          <div className="verify-otp-inputs">
            {otp.map((value, i) => (
              <input
                key={i}
                id={`reset-otp-${i}`}
                type="text"
                maxLength="1"
                value={value}
                disabled={loading}
                onChange={(e) => handleChange(e, i)}
                className="verify-otp-input"
              />
            ))}
          </div>
          <button onClick={handleSubmit} disabled={loading} className="verify-reset-button">
            {loading ? "Verifying..." : "Verify OTP"}
          </button>
          <p className="verify-resend-text">Didn’t get it?{" "}
            <span onClick={handleResend} className="verify-resend-link" style={{ cursor:'pointer' }}>
              {resending ? "Resending..." : "Resend code"}
            </span>
          </p>
        </div>
      </div>
      <ToastContainer position="top-center" autoClose={3000}/>
    </div>
  );
};

export default ResetVerifyOtp;