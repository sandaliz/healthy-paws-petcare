import React, { useState, useEffect } from "react";
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
  const [showAutoScan, setShowAutoScan] = useState(true);
  const [countdown, setCountdown] = useState(5);

  // Auto-scan countdown
  useEffect(() => {
    if (showAutoScan && countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0) {
      setShowAutoScan(false);
    }
  }, [showAutoScan, countdown]);

  // Auto-submit when OTP is fully filled
  useEffect(() => {
    const otpValue = otp.join("");
    if (otpValue.length === 6 && otp.every((digit) => digit !== "")) {
      handleSubmit(true); // auto trigger
    }
    // eslint-disable-next-line
  }, [otp]);

  const handleChange = (e, index) => {
    const value = e.target.value;
    if (/^\d?$/.test(value)) {  // ✅ only digits allowed, 1 char max
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);

      // move focus forward
      if (value && index < 5) {
        document.getElementById(`reset-otp-${index + 1}`).focus();
      }
      // move focus back on delete
      if (!value && index > 0) {
        document.getElementById(`reset-otp-${index - 1}`).focus();
      }
    }
  };

  const handleSubmit = async (autoTriggered = false) => {
    const otpValue = otp.join("");
    if (otpValue.length !== 6) {
      if (!autoTriggered) toast.error("Please enter all 6 digits");
      return;
    }
    setLoading(true);
    try {
      const res = await axios.post("http://localhost:5001/api/auth/verify-reset-otp", { email, otp: otpValue });
      setLoading(false);
      if (res.data.success) {
        // Add success animation to inputs
        const inputs = document.querySelectorAll('.verify-otp-input');
        inputs.forEach(input => {
          input.classList.add('success');
        });

        toast.success("✅ OTP verified!");
        setTimeout(() => {
          navigate(`/new-password?email=${email}&otp=${otpValue}`);
        }, 1000);
      } else {
        toast.error(res.data.message || "Invalid OTP");
        // Add error animation to inputs
        const inputs = document.querySelectorAll('.verify-otp-input');
        inputs.forEach(input => {
          input.classList.add('error');
          setTimeout(() => {
            input.classList.remove('error');
          }, 400);
        });
        setOtp(Array(6).fill("")); // reset input
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
      if (res.data.success) {
        toast.success("📩 New OTP sent");
        // Reset auto-scan notification
        setShowAutoScan(true);
        setCountdown(5);
      } else {
        toast.error(res.data.message || "Error resending");
      }
    } catch (err) {
      setResending(false);
      toast.error(err.response?.data?.message || "Server error while resending");
    }
  };

  return (
    <div className="email-verify-page">
      <div className="verify-background-container">
        <div className="verify-content">
          <div className="verify-icon">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
              <path d="M4.5 3.75a3 3 0 0 0-3 3v.75h21v-.75a3 3 0 0 0-3-3h-15Z" />
              <path fillRule="evenodd" d="M22.5 9.75h-21v7.5a3 3 0 0 0 3 3h15a3 3 0 0 0 3-3v-7.5Zm-18 3.75a.75.75 0 0 1 .75-.75h6a.75.75 0 0 1 0 1.5h-6a.75.75 0 0 1-.75-.75Zm.75 2.25a.75.75 0 0 0 0 1.5h3a.75.75 0 0 0 0-1.5h-3Z" clipRule="evenodd" />
            </svg>
          </div>
          <h2 className="verify-title">OTP Verification</h2>
          <p className="verify-subtitle">
            Enter the 6‑digit code sent to <b>{email}</b>
          </p>

          {showAutoScan && (
            <div className="auto-scan-notification">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="auto-scan-text">
                Auto-scanning for OTP in <span className="auto-scan-countdown">{countdown}s</span>
              </span>
            </div>
          )}

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
                className={`verify-otp-input ${value ? "filled" : ""}`}
              />
            ))}
          </div>
          <button
            onClick={() => handleSubmit(false)}
            disabled={loading}
            className="verify-reset-button"
          >
            {loading ? <span className="verifying-loader"></span> : "Verify OTP"}
          </button>
          <p className="verify-resend-text">
            Didn't get it?{" "}
            <span
              onClick={handleResend}
              className="verify-resend-link"
              style={{ cursor: resending ? "default" : "pointer" }}
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

export default ResetVerifyOtp;