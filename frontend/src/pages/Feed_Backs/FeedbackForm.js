// src/pages/FeedbackForm.js
// src/pages/FeedbackForm.js
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import StarRating from "../../Components/StarRating";
import assets from "../../assets/assets";
import DashboardNavbar from "../../Components/Navbar";
import "./FeedbackForm.css"; // ✅ Import custom CSS

const FeedbackForm = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    petOwnerName: "",
    petName: "",
    email: "",
    message: "",
    rating: 0,
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.rating === 0) {
      toast.warning("Please provide a rating!");
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        ...formData,
        rating: Number(formData.rating),
      };

      const res = await axios.post("http://localhost:5000/api/feedback", payload);

      if (res.data.success) {
        toast.success("🎉 Feedback submitted successfully! Check your email for confirmation.");
        console.log("✅ Server response:", res.data);

        setTimeout(() => {
          navigate(`/feedback/${res.data.data._id}`, {
            state: { message: "Feedback submitted successfully! Confirmation email sent." },
          });
        }, 2000);
      } else {
        toast.error("⚠️ Something went wrong on the server.");
      }
    } catch (err) {
      console.error("❌ Error submitting feedback:", err.response?.data || err.message);

      if (err.response?.data?.message) {
        toast.error(`❌ ${err.response.data.message}`);
      } else {
        toast.error("❌ Failed to submit feedback. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="feedback-page">
      <DashboardNavbar />
      <ToastContainer position="top-center" autoClose={3000} />

      <div className="feedback-container">
        <div className="feedback-card">
          {/* LEFT SECTION */}
          <div className="feedback-card-left">
            <img
              src={assets.feedbacks}
              alt="Feedback Illustration"
            />
          </div>

          <div className="md:w-1/2 p-10">
            <h2
              className="text-3xl font-bold mb-4"
              style={{ fontFamily: "Poppins, sans-serif", color: "#2D2D2D" }}
            >
              We Value Your Feedback 🐾
            </h2>
            <p className="mb-6 text-gray-600">
              Help us improve by sharing your experience with Healthy Paws.
            </p>

            <form onSubmit={handleSubmit} className="feedback-form">
              <input
                name="petOwnerName"
                placeholder="Your Name"
                value={formData.petOwnerName}
                onChange={handleChange}
                required
                disabled={isSubmitting}
              />
              <input
                name="petName"
                placeholder="Pet's Name"
                value={formData.petName}
                onChange={handleChange}
                required
                disabled={isSubmitting}
              />
              <input
                type="email"
                name="email"
                placeholder="Your Email"
                value={formData.email}
                onChange={handleChange}
                required
                disabled={isSubmitting}
              />
              <textarea
                name="message"
                placeholder="Your Feedback"
                value={formData.message}
                onChange={handleChange}
                rows={4}
                required
                disabled={isSubmitting}
              />

              <div>
                <label className="feedback-rating-label">Rating:</label>
                <StarRating
                  rating={formData.rating}
                  setRating={(r) => setFormData({ ...formData, rating: r })}
                  disabled={isSubmitting}
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="feedback-btn"
              >
                {isSubmitting ? "Submitting..." : "Submit Feedback"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeedbackForm;