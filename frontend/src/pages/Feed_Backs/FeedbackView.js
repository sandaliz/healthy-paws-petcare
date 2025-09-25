// src/pages/FeedbackView.js
import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import StarRating from "../../Components/StarRating";
import "../../styles/FeedbackView.css";

const FeedbackView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [feedback, setFeedback] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [message] = useState(location.state?.message || "");

  // Fetch one feedback
  useEffect(() => {
    const fetchOne = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/feedback/${id}`);
        if (res.data.success) {
          setFeedback(res.data.data);
        } else {
          navigate("/feedback", { state: { message: "Feedback not found." } });
        }
      } catch (e) {
        console.error("Error fetching feedback:", e);
        navigate("/feedback", { state: { message: "Feedback not found or unavailable." } });
      } finally {
        setIsLoading(false);
      }
    };
    fetchOne();
  }, [id, navigate]);

  // Handle delete
  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this feedback?")) return;
    try {
      setIsDeleting(true);
      await axios.delete(`http://localhost:5000/api/feedback/${id}`);
      navigate("/feedback", { state: { message: "Feedback deleted successfully." } });
    } catch (e) {
      console.error("Delete error:", e);
      alert("Could not delete feedback. Try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  // UI states
  if (isLoading) {
    return (
      <div className="feedback-view-loading">
        <div className="feedback-view-spinner"></div>
        <p className="feedback-view-loading-text">Loading feedback...</p>
      </div>
    );
  }

  if (!feedback) {
    return (
      <div className="feedback-view-error">
        <p className="feedback-view-error-text">Feedback not found.</p>
        <button
          onClick={() => navigate("/feedback")}
          className="feedback-view-button feedback-view-newfeedback-btn"
        >
          Submit New Feedback
        </button>
      </div>
    );
  }

  return (
    <div className="feedback-view-container">
      <div className="feedback-view-card">
        {message && <div className="feedback-view-success-message">{message}</div>}

        <h2 className="feedback-view-title">Feedback Details</h2>

        <div className="feedback-view-content">
          <div className="feedback-view-detail">
            <span className="feedback-view-label">Owner:</span>
            <span className="feedback-view-value">{feedback.petOwnerName}</span>
          </div>

          <div className="feedback-view-detail">
            <span className="feedback-view-label">Pet:</span>
            <span className="feedback-view-value">{feedback.petName}</span>
          </div>

          <div className="feedback-view-detail">
            <span className="feedback-view-label">Email:</span>
            <span className="feedback-view-value">{feedback.email}</span>
          </div>

          <div className="feedback-view-detail">
            <span className="feedback-view-label">Rating:</span>
            <div className="feedback-view-rating">
              <StarRating rating={feedback.rating} readOnly />
              <span className="feedback-view-rating-badge">
                {feedback.rating}.0
              </span>
            </div>
          </div>

          <div className="feedback-view-detail">
            <span className="feedback-view-label">Message:</span>
          </div>
          <p className="feedback-view-message">{feedback.message}</p>
        </div>

        <div className="feedback-view-meta">
          <span>Posted on: {new Date(feedback.createdAt || Date.now()).toLocaleDateString()}</span>
        </div>

        <div className="feedback-view-actions">
          <button
            onClick={() => navigate(`/feedback/edit/${id}`)}
            className="feedback-view-button feedback-view-edit-button"
          >
            Edit Feedback
          </button>
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="feedback-view-button feedback-view-delete-button"
          >
            {isDeleting ? "Deleting..." : "Delete Feedback"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default FeedbackView;