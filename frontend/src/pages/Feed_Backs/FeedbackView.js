// src/pages/FeedbackView.js
import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import StarRating from "../../Components/StarRating";

const FeedbackView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [feedback, setFeedback] = useState(null);
  const [message] = useState(location.state?.message || "");

  useEffect(() => {
    const fetchFeedback = async () => {
      try {
        const res = await axios.get(
          `http://localhost:5001/api/feedback/${id}`
        );
        if (res.data.success) setFeedback(res.data.data);
      } catch (err) {
        console.error("Error fetching feedback:", err);
      }
    };
    fetchFeedback();
  }, [id]);

  const deleteFeedback = async () => {
    try {
      await axios.delete(`http://localhost:5001/api/feedback/${id}`, {
        data: { email: feedback.email },
      });
      alert("Feedback deleted successfully!");
      navigate("/feedback");
    } catch (err) {
      alert("Failed to delete feedback");
    }
  };

  if (!feedback) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{
          background: "linear-gradient(180deg, #FFFFFF 0%, #FFD58E 100%)",
        }}
      >
        <p className="text-xl">Loading feedback...</p>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center px-6"
      style={{
        background: "linear-gradient(180deg, #FFFFFF 0%, #FFD58E 100%)",
        fontFamily: "Roboto, sans-serif",
      }}
    >
      <div className="bg-white shadow-2xl rounded-lg w-full max-w-2xl p-8">
        {message && (
          <div className="bg-green-100 p-3 rounded mb-4 text-green-700 text-sm font-medium">
            {message}
          </div>
        )}

        <h2
          className="text-3xl font-bold mb-6 text-center"
          style={{ fontFamily: "Poppins, sans-serif", color: "#2D2D2D" }}
        >
          Feedback Details 🐾
        </h2>

        <div className="space-y-3">
          <p>
            <strong style={{ color: "#54413C" }}>Owner:</strong>{" "}
            {feedback.petOwnerName}
          </p>
          <p>
            <strong style={{ color: "#54413C" }}>Pet:</strong> {feedback.petName}
          </p>
          <p>
            <strong style={{ color: "#54413C" }}>Email:</strong>{" "}
            {feedback.email}
          </p>
          <div className="flex items-center gap-2">
            <strong style={{ color: "#54413C" }}>Rating:</strong>
            <StarRating rating={feedback.rating} readOnly />
          </div>
          <p className="text-gray-700 mt-2">{feedback.message}</p>
        </div>

        <div className="flex gap-4 mt-8 justify-center">
          <button
            onClick={() => navigate(`/feedback/edit/${id}`)}
            className="px-6 py-2 rounded-lg font-semibold transition-all"
            style={{
              backgroundColor: "#FFD58E",
              color: "#54413C",
              fontFamily: "Poppins, sans-serif",
            }}
          >
            ✏️ Edit
          </button>
          <button
            onClick={deleteFeedback}
            className="px-6 py-2 rounded-lg font-semibold transition-all"
            style={{
              backgroundColor: "#54413C",
              color: "#FFFFFF",
              fontFamily: "Poppins, sans-serif",
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
            🗑 Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default FeedbackView;