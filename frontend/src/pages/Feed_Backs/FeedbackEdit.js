// src/pages/FeedbackEdit.js
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import StarRating from "../../Components/StarRating";

const FeedbackEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    petOwnerName: "",
    petName: "",
    email: "",
    message: "",
    rating: 0,
  });

  useEffect(() => {
    const fetchFeedback = async () => {
      try {
        const res = await axios.get(
          `http://localhost:5001/api/feedback/${id}`
        );
        if (res.data.success) setFormData(res.data.data);
      } catch (err) {
        console.error("Error fetching feedback:", err);
      }
    };
    fetchFeedback();
  }, [id]);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(
        `http://localhost:5001/api/feedback/${id}`,
        formData
      );
      navigate(`/feedback/${id}`, {
        state: { message: "✅ Feedback updated successfully!" },
      });
    } catch (err) {
      alert("Update failed!");
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-6"
      style={{
        background: "linear-gradient(180deg, #FFFFFF 0%, #FFD58E 100%)",
        fontFamily: "Roboto, sans-serif",
      }}
    >
      <div className="bg-white shadow-2xl rounded-lg w-full max-w-2xl p-8">
        <h2
          className="text-3xl font-bold mb-6 text-center"
          style={{ fontFamily: "Poppins, sans-serif", color: "#2D2D2D" }}
        >
          Edit Your Feedback 📝
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            className="w-full border p-3 rounded focus:ring-2 focus:ring-[#FFD58E]"
            name="petOwnerName"
            placeholder="Your Name"
            value={formData.petOwnerName}
            onChange={handleChange}
            required
          />
          <input
            className="w-full border p-3 rounded focus:ring-2 focus:ring-[#FFD58E]"
            name="petName"
            placeholder="Pet's Name"
            value={formData.petName}
            onChange={handleChange}
            required
          />
          <input
            className="w-full border p-3 rounded focus:ring-2 focus:ring-[#FFD58E]"
            type="email"
            name="email"
            placeholder="Your Email"
            value={formData.email}
            onChange={handleChange}
            required
          />
          <textarea
            className="w-full border p-3 rounded focus:ring-2 focus:ring-[#FFD58E]"
            name="message"
            placeholder="Feedback Message"
            value={formData.message}
            onChange={handleChange}
            rows={4}
            required
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
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-lg transition-all"
            style={{
              backgroundColor: "#54413C",
              color: "#FFFFFF",
              fontFamily: "Poppins, sans-serif",
              fontWeight: 600,
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = "#FFD58E";
              e.currentTarget.style.color = "#54413C";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = "#54413C";
              e.currentTarget.style.color = "#FFFFFF";
            }}
          >
            Update Feedback
          </button>
        </form>
      </div>
    </div>
  );
};

export default FeedbackEdit;