// src/pages/FeedbackList.js
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import '../../styles/FeedbackList.css'

const FeedbackList = ({ user }) => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (user?.email) {
      axios
        .get(`http://localhost:5000/api/feedback/user/${user.email}`)
        .then((res) => {
          if (res.data.success) setFeedbacks(res.data.data);
        })
        .catch((err) => console.error("Error fetching feedbacks:", err))
        .finally(() => setLoading(false));
    }
  }, [user]);

  const getRatingColor = (rating) => {
    if (rating >= 4) return "#4CAF50"; // Green for high ratings
    if (rating >= 3) return "#FF9800"; // Orange for medium ratings
    return "#F44336"; // Red for low ratings
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="feedback-list-loading">
        <div className="loading-spinner"></div>
        <p>Loading your feedbacks...</p>
      </div>
    );
  }

  return (
    <div className="feedback-list-container">
      <div className="feedback-list-content">
        <div className="feedback-list-header">
          <h2>My Feedback History</h2>
          <p>Review your previous feedback submissions</p>
          <div className="feedback-stats">
            <div className="stat-item">
              <span className="stat-number">{feedbacks.length}</span>
              <span className="stat-label">Total Feedbacks</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">
                {feedbacks.length > 0 
                  ? (feedbacks.reduce((sum, f) => sum + f.rating, 0) / feedbacks.length).toFixed(1)
                  : '0.0'
                }
              </span>
              <span className="stat-label">Average Rating</span>
            </div>
          </div>
        </div>

        {feedbacks.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📝</div>
            <h3>No Feedback Yet</h3>
            <p>You haven't submitted any feedback yet. Share your experience to help us improve!</p>
            <button 
              className="primary-btn"
              onClick={() => navigate('/feedback')}
            >
              Submit Your First Feedback
            </button>
          </div>
        ) : (
          <div className="feedbacks-grid">
            {feedbacks.map((feedback) => (
              <div 
                key={feedback._id}
                className="feedback-card"
                onClick={() => navigate(`/feedback/${feedback._id}`)}
              >
                <div className="feedback-card-header">
                  <div className="pet-info">
                    <h3>{feedback.petName}</h3>
                    <span className="owner-name">by {feedback.petOwnerName}</span>
                  </div>
                  <div 
                    className="rating-badge"
                    style={{ backgroundColor: getRatingColor(feedback.rating) }}
                  >
                    <span className="rating-stars">
                      {"★".repeat(feedback.rating)}
                    </span>
                    <span className="rating-number">{feedback.rating}.0</span>
                  </div>
                </div>

                <div className="feedback-preview">
                  <p>{feedback.message.length > 120 
                    ? `${feedback.message.substring(0, 120)}...` 
                    : feedback.message
                  }</p>
                </div>

                <div className="feedback-meta">
                  <div className="meta-item">
                    <span className="meta-label">Submitted:</span>
                    <span className="meta-value">{formatDate(feedback.createdAt)}</span>
                  </div>
                  <div className="meta-item">
                    <span className="meta-label">Status:</span>
                    <span className="status-badge">Completed</span>
                  </div>
                </div>

                <div className="view-details">
                  <span>Click to view details →</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FeedbackList;