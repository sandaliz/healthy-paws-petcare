// src/pages/FeedbackForm.js (improved error handling)
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import StarRating from "../../Components/StarRating";
import assets from "../../assets/assets";
import DashboardNavbar from "../../Components/Navbar";

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
      // ✅ Ensure rating is number before sending
      const payload = { 
        ...formData, 
        rating: Number(formData.rating) 
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
    <div
      className="min-h-screen flex flex-col"
      style={{
        background: "linear-gradient(180deg, #FFFFFF 0%, #FFD58E 100%)",
        fontFamily: "Roboto, sans-serif",
      }}
    >
      <DashboardNavbar />
      <ToastContainer position="top-center" autoClose={3000} />

      <div className="flex flex-1 items-center justify-center px-6 mt-20">
        <div className="bg-white shadow-2xl rounded-lg flex flex-col md:flex-row max-w-5xl w-full overflow-hidden">
          <div className="md:w-1/2 flex items-center justify-center bg-[#FFD58E] p-8">
            <img
              src={assets.feedbacks}
              alt="Feedback Illustration"
              className="w-80 h-auto object-contain"
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

            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                className="w-full border p-3 rounded focus:ring-2 focus:ring-[#FFD58E] focus:outline-none"
                name="petOwnerName"
                placeholder="Your Name"
                value={formData.petOwnerName}
                onChange={handleChange}
                required
                disabled={isSubmitting}
              />
              <input
                className="w-full border p-3 rounded focus:ring-2 focus:ring-[#FFD58E] focus:outline-none"
                name="petName"
                placeholder="Pet's Name"
                value={formData.petName}
                onChange={handleChange}
                required
                disabled={isSubmitting}
              />
              <input
                className="w-full border p-3 rounded focus:ring-2 focus:ring-[#FFD58E] focus:outline-none"
                type="email"
                name="email"
                placeholder="Your Email"
                value={formData.email}
                onChange={handleChange}
                required
                disabled={isSubmitting}
              />
              <textarea
                className="w-full border p-3 rounded focus:ring-2 focus:ring-[#FFD58E] focus:outline-none"
                name="message"
                placeholder="Your Feedback"
                value={formData.message}
                onChange={handleChange}
                rows={4}
                required
                disabled={isSubmitting}
              />

              <div>
                <label
                  className="block mb-2 font-semibold"
                  style={{ fontFamily: "Poppins, sans-serif" }}
                >
                  Rating:
                </label>
                <StarRating
                  rating={formData.rating}
                  setRating={(r) => setFormData({ ...formData, rating: r })}
                  disabled={isSubmitting}
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  backgroundColor: "#54413C",
                  color: "#FFFFFF",
                  fontFamily: "Poppins, sans-serif",
                  fontWeight: 600,
                }}
                onMouseOver={(e) => {
                  if (!isSubmitting) {
                    e.currentTarget.style.backgroundColor = "#FFD58E";
                    e.currentTarget.style.color = "#54413C";
                  }
                }}
                onMouseOut={(e) => {
                  if (!isSubmitting) {
                    e.currentTarget.style.backgroundColor = "#54413C";
                    e.currentTarget.style.color = "#FFFFFF";
                  }
                }}
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