// src/pages/FeedbackForm.js
import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import StarRating from "../../Components/StarRating";
import assets from "../../assets/assets";
import '../../styles/feedback.css'

const FeedbackForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    petOwnerName: "",
    petName: "",
    email: "",
    message: "",
    rating: 0,
  });

  const [errors, setErrors] = useState({});
  const [initialMessage] = useState(location.state?.message || "");

  // Email regex
  const validateEmail = (email) => /\S+@\S+\.\S+/.test(email);

  // Validate individual field
  const validateField = (name, value) => {
    let message = "";
    if (name === "petOwnerName" && !value.trim())
      message = "Pet owner's name is required.";
    if (name === "petName" && !value.trim())
      message = "Pet's name is required.";
    if (name === "email") {
      if (!value.trim()) message = "Email is required.";
      else if (!validateEmail(value)) message = "Please enter a valid email.";
    }
    if (name === "message" && !value.trim())
      message = "Message cannot be empty.";
    setErrors((prev) => ({ ...prev, [name]: message }));
  };

  // Handle change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    validateField(name, value);
  };

  // Validate form on submit
  const validateForm = () => {
    const newErrors = {};
    if (!formData.petOwnerName.trim())
      newErrors.petOwnerName = "Pet owner's name is required.";
    if (!formData.petName.trim())
      newErrors.petName = "Pet's name is required.";
    if (!formData.email.trim())
      newErrors.email = "Email is required.";
    else if (!validateEmail(formData.email))
      newErrors.email = "Please enter a valid email.";
    if (!formData.message.trim())
      newErrors.message = "Message cannot be empty.";
    if (formData.rating === 0) newErrors.rating = "Please give a rating.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Reset form after submission
  const resetForm = () => {
    setFormData({
      petOwnerName: "",
      petName: "",
      email: "",
      message: "",
      rating: 0,
    });
    setErrors({});
  };

  // Handle submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      toast.error("Please fix the errors before submitting.");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = { ...formData, rating: Number(formData.rating) };
      const res = await axios.post("http://localhost:5000/api/feedback", payload);

      if (res.data.success) {
        resetForm();
        toast.success("Feedback submitted successfully!");
        setTimeout(() => {
          navigate(`/feedback/${res.data.data._id}`, {
            state: { message: "Feedback submitted successfully!" },
          });
        }, 1200);
      } else {
        toast.error("Something went wrong.");
      }
    } catch (err) {
      console.error("Error:", err.response?.data || err.message);
      toast.error("Failed to submit feedback. Try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="feedback-fullpage">
      {/* Toast messages (success/failure) */}
      <ToastContainer position="top-center" autoClose={3000} />

      {/* Success message banner */}
      {initialMessage && (
        <div
          style={{
            background: "#e0ffe0",
            padding: "10px",
            margin: "10px 20px",
            borderRadius: "6px",
            color: "#256029",
          }}
        >
          {initialMessage}
        </div>
      )}

      <div className="feedback-content">
        {/* LEFT */}
        <div className="feedback-left">
          <div className="feedback-text-content">
            <h1>Let's improve your pet's health, together</h1>
            <p>Get started with Healthy Paws</p>
          </div>
          <div className="feedback-image">
            <img src={assets.feedbacks} alt="Pet Health Illustration" />
          </div>
        </div>

        {/* RIGHT */}
        <div className="feedback-right">
          <div className="feedback-form-container">
            <h2>We Value Your Feedback</h2>
            <form onSubmit={handleSubmit} className="feedback-form">
              <div className="form-group">
                <label>Name*</label>
                <input
                  type="text"
                  name="petOwnerName"
                  value={formData.petOwnerName}
                  onChange={handleChange}
                  disabled={isSubmitting}
                  placeholder="Type your name"
                />
                {errors.petOwnerName && (
                  <p className="error-text">{errors.petOwnerName}</p>
                )}
              </div>

              <div className="form-group">
                <label>Pet's Name*</label>
                <input
                  type="text"
                  name="petName"
                  value={formData.petName}
                  onChange={handleChange}
                  disabled={isSubmitting}
                  placeholder="Type pet's name"
                />
                {errors.petName && (
                  <p className="error-text">{errors.petName}</p>
                )}
              </div>

              <div className="form-group">
                <label>Email*</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  disabled={isSubmitting}
                  placeholder="Type email address"
                />
                {errors.email && <p className="error-text">{errors.email}</p>}
              </div>

              <div className="form-group">
                <label>Message*</label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  rows={4}
                  disabled={isSubmitting}
                  placeholder="Share your feedback here"
                />
                {errors.message && (
                  <p className="error-text">{errors.message}</p>
                )}
              </div>

              <div className="form-group">
                <label>Rating*</label>
                <StarRating
                  rating={formData.rating}
                  setRating={(r) => setFormData({ ...formData, rating: r })}
                  disabled={isSubmitting}
                />
                {errors.rating && <p className="error-text">{errors.rating}</p>}
              </div>

              <button type="submit" disabled={isSubmitting} className="submit-btn">
                {isSubmitting ? "Submitting…" : "Submit Feedback"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeedbackForm;