// src/pages/FeedbackList.js
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const FeedbackList = ({ user }) => {
  const [feedbacks, setFeedbacks] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (user?.email) {
      axios
        .get(`http://localhost:5000/api/feedback/user/${user.email}`)
        .then((res) => {
          if (res.data.success) setFeedbacks(res.data.data);
        })
        .catch((err) => console.error("Error fetching feedbacks:", err));
    }
  }, [user]);

  return (
    <div
      className="min-h-screen flex items-center justify-center px-6"
      style={{
        background: "linear-gradient(180deg, #FFFFFF 0%, #FFD58E 100%)",
        fontFamily: "Roboto, sans-serif",
      }}
    >
      <div className="bg-white shadow-2xl rounded-lg w-full max-w-4xl p-8">
        <h2
          className="text-3xl font-bold mb-6 text-center"
          style={{ fontFamily: "Poppins, sans-serif", color: "#2D2D2D" }}
        >
          My Feedbacks 🐾
        </h2>

        {feedbacks.length === 0 ? (
          <div className="text-center text-gray-600">
            <p>No feedbacks yet. 📝</p>
          </div>
        ) : (
          <ul className="space-y-4">
            {feedbacks.map((f) => (
              <li
                key={f._id}
                className="p-6 bg-[#FFD58E]/30 rounded-lg shadow hover:shadow-lg hover:bg-[#FFD58E]/60 transition cursor-pointer"
                onClick={() => navigate(`/feedback/${f._id}`)}
              >
                <div className="flex justify-between items-center">
                  <h3
                    className="font-semibold text-xl"
                    style={{ fontFamily: "Poppins, sans-serif", color: "#54413C" }}
                  >
                    {f.petName}
                  </h3>
                  <span className="text-yellow-500 font-bold">
                    {"★".repeat(f.rating)}{"☆".repeat(5 - f.rating)}
                  </span>
                </div>
                <p className="text-gray-700 mt-2">{f.message}</p>
                <p className="text-sm text-gray-500 mt-1">
                  Submitted on: {new Date(f.createdAt).toLocaleDateString()}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default FeedbackList;