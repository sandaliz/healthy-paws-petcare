// Review.js
import React, { useState, useEffect } from "react";
import api from "../../utils/api";
import ReviewDisplay from "../ReviewsDisplay/ReviewsDisplay";

function Review() {
  const [reviews, setReviews] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);

  // Fetch logged-in user ID from token
  useEffect(() => {
    try {
      const token = localStorage.getItem("token");
      if (token) {
        const payload = JSON.parse(atob(token.split(".")[1])); // decode JWT payload
        setCurrentUser({ id: payload.id }); // match backend's JWT structure
      }
    } catch (err) {
      console.error("Error decoding token:", err);
      setCurrentUser(null);
    }
  }, []);

  // Fetch reviews from backend
  const fetchHandler = async () => {
    try {
      const res = await api.get("/reviews");
      return res.data;
    } catch (err) {
      console.error("Error fetching reviews:", err);
      return { reviews: [] };
    }
  };

  useEffect(() => {
    fetchHandler().then((data) => {
      if (data && data.reviews) {
        setReviews(data.reviews);
      }
    });
  }, []);

  const handleDeleteReview = (deletedId) => {
    setReviews((prevReviews) =>
      prevReviews.filter((review) => review._id !== deletedId)
    );
  };

  return (
    <div>
      <ReviewDisplay
        reviews={reviews}
        onDelete={handleDeleteReview}
        currentUser={currentUser}
      />
    </div>
  );
}

export default Review;
