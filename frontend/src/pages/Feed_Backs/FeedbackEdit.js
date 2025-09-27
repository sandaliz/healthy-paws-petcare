// src/pages/FeedbackEdit.js
import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import StarRating from "../../Components/StarRating";
import "../../styles/FeedbackEdit.css";

const FeedbackEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [formData, setFormData] = useState({
    petOwnerName: "",
    petName: "",
    email: "",
    message: "",
    rating: 0,
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [initialMessage] = useState(location.state?.message || "");

  useEffect(() => {
    const fetchOne = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/feedback/${id}`);
        if (res.data.success) {
          setFormData(res.data.data);
        } else {
          navigate("/feedback", { state: { message: "Feedback not found." } });
        }
      } catch (e) {
        console.error("Load error:", e);
        navigate("/feedback", { state: { message: "Could not load feedback." } });
      } finally {
        setIsLoading(false);
      }
    };
    fetchOne();
  }, [id, navigate]);

  const validateEmail = (email) => /\S+@\S+\.\S+/.test(email);

  const validateForm = () => {
    let errs = {};
    if (!formData.petOwnerName?.trim()) errs.petOwnerName = "Name is required.";
    if (!formData.petName?.trim()) errs.petName = "Pet name is required.";
    if (!formData.email?.trim()) errs.email = "Email is required.";
    else if (!validateEmail(formData.email)) errs.email = "Invalid email address.";
    if (!formData.message?.trim()) errs.message = "Message is required.";
    if (!formData.rating) errs.rating = "Please provide a rating.";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      toast.error("Please correct errors before saving.");
      return;
    }
    try {
      setIsSubmitting(true);
      await axios.put(`http://localhost:5000/api/feedback/${id}`, formData);
      toast.success("Feedback updated successfully!");
      setTimeout(() => {
        // ✅ Redirect back to feedback form for new submission
        navigate("/feedback", { state: { message: "Feedback updated successfully! You can now submit a new feedback." } });
      }, 1000);
    } catch (e) {
      toast.error("Update failed. Try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this feedback?")) return;
    try {
      await axios.delete(`http://localhost:5000/api/feedback/${id}`);
      toast.success("Feedback deleted successfully!");
      setTimeout(() => {
        // ✅ Redirect back to feedback form for new submission
        navigate("/feedback", { state: { message: "Feedback deleted successfully! You can now submit a new feedback." } });
      }, 1000);
    } catch {
      toast.error("Delete failed. Try again.");
    }
  };

  if (isLoading) {
    return (
      <div className="feedback-edit-loading">
        <div className="feedback-edit-loading-spinner"></div>
        <p className="feedback-edit-loading-text">Loading your feedback...</p>
      </div>
    );
  }

  return (
    <div className="feedback-edit-container">
      <ToastContainer position="top-center" autoClose={3000} />
      {initialMessage && (
        <div
          style={{
            background: "#e0ffe0",
            padding: "10px",
            margin: "10px 0",
            borderRadius: "6px",
            color: "#256029",
          }}
        >
          {initialMessage}
        </div>
      )}

      <div className="feedback-edit-header">
        <h1 className="feedback-edit-title">Edit Feedback</h1>
        <p className="feedback-edit-subtitle">Modify your feedback below</p>
      </div>

      <div className="feedback-edit-form-card">
        <form onSubmit={handleSubmit} className="feedback-edit-form">
          <div className="feedback-edit-form-group">
            <label className="feedback-edit-label">Name*</label>
            <input
              className="feedback-edit-input"
              name="petOwnerName"
              value={formData.petOwnerName || ""}
              onChange={handleChange}
              disabled={isSubmitting}
            />
            {errors.petOwnerName && <p className="error-text">{errors.petOwnerName}</p>}
          </div>

          <div className="feedback-edit-form-group">
            <label className="feedback-edit-label">Pet's Name*</label>
            <input
              className="feedback-edit-input"
              name="petName"
              value={formData.petName || ""}
              onChange={handleChange}
              disabled={isSubmitting}
            />
            {errors.petName && <p className="error-text">{errors.petName}</p>}
          </div>

          <div className="feedback-edit-form-group">
            <label className="feedback-edit-label">Email*</label>
            <input
              type="email"
              className="feedback-edit-input"
              name="email"
              value={formData.email || ""}
              onChange={handleChange}
              disabled={isSubmitting}
            />
            {errors.email && <p className="error-text">{errors.email}</p>}
          </div>

          <div className="feedback-edit-form-group">
            <label className="feedback-edit-label">Message*</label>
            <textarea
              className="feedback-edit-textarea"
              name="message"
              value={formData.message || ""}
              onChange={handleChange}
              disabled={isSubmitting}
            />
            {errors.message && <p className="error-text">{errors.message}</p>}
          </div>

          <div className="feedback-edit-rating-section">
            <label className="feedback-edit-label">Rating*</label>
            <StarRating
              rating={formData.rating || 0}
              setRating={(r) => setFormData({ ...formData, rating: r })}
              disabled={isSubmitting}
            />
            {errors.rating && <p className="error-text">{errors.rating}</p>}
          </div>

          <div className="feedback-edit-button-group">
            <button
              type="submit"
              disabled={isSubmitting}
              className="feedback-edit-button feedback-edit-button-submit"
            >
              {isSubmitting ? "Saving…" : "Save Feedback"}
            </button>
            <button
              type="button"
              onClick={handleDelete}
              disabled={isSubmitting}
              className="feedback-edit-button feedback-edit-button-cancel"
              style={{ backgroundColor: "#EF4444", color: "#fff" }}
            >
              Delete Feedback
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FeedbackEdit;