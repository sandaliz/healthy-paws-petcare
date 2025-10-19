// ReviewsDisplay.js
import React from "react";
import "./ReviewsDisplay.css";
import { Link } from "react-router-dom";
import api from "../../utils/api";
import StarRating from "../StarRating/StarRating";
import Navbar from '../Home/Navbar';

function ReviewsDisplay({ reviews, onDelete, currentUser }) {
  const handleDelete = async (id) => {
  if (!window.confirm("Are you sure you want to delete this review?")) return;

  try {
    const response = await api.delete(`/reviews/${id}`);
    
    if (response.status === 200) {
      // Successfully deleted
      if (onDelete) onDelete(id);
      alert("Review deleted successfully!");
    } else {
      // Some other unexpected status
      alert("Failed to delete review. Please try again.");
    }
  } catch (err) {
    console.error("Error deleting review:", err);

    // Check for backend message
    if (err.response && err.response.data && err.response.data.message) {
      alert(`Delete failed: ${err.response.data.message}`);
    } else {
      alert("Delete failed: Server or network error.");
    }
  }
};

  return (
    <>
    <Navbar />
    <div className="reviews-page-container">
      {/* Hero Section */}
      <section className="reviews-hero">
        <img
          src="/images/cat-reviews.jpg"
          alt="Happy pets at daycare"
          className="reviews-hero-image"
        />
        <div className="reviews-hero-overlay">
          <h1>Customer Reviews</h1>
          <p className="motto">
            "Where Pets Are Family and Every Tail Tells a Story"
          </p>
          <p className="subtitle">
            Read what our beloved pet parents have to say about their experience
            at our day care center. Your feedback helps us provide the best care
            for your furry family members.
          </p>
          <Link to="/addreviews" className="add-review-btn">
            + Add Your Review
          </Link>
        </div>
      </section>

      {/* Reviews Grid */}
      <div className="reviews-grid">
        {reviews && reviews.length > 0 ? (
          reviews.map((review) => {
            const isOwner =
              currentUser &&
              currentUser.id &&
              review.owner &&
              currentUser.id.toString() === review.owner.toString();

            return (
              <div key={review._id} className="review-card">
                <div className="review-header">
                  {review.ownerName || "Anonymous"}'s {review.petName || ""}
                </div>

                <div className="review-detail">
                  <span className="review-label">Owner Name:</span>{" "}
                  {review.ownerName || "N/A"}
                </div>
                <div className="review-detail">
                  <span className="review-label">Pet Name:</span>{" "}
                  {review.petName || "N/A"}
                </div>
                <div className="review-detail">
                  <span className="review-label">Grooming:</span>{" "}
                  {review.grooming ? "Yes" : "No"}
                </div>
                <div className="review-detail">
                  <span className="review-label">Walking:</span>{" "}
                  {review.walking ? "Yes" : "No"}
                </div>
                <div className="review-detail">
                  <span className="review-label">Species:</span>{" "}
                  {review.species || "N/A"}
                </div>

                <div className="review-detail review-rating">
                  <span className="review-label">Rating:</span>{" "}
                  <StarRating rating={review.rating || 0} readOnly />
                </div>

                <div className="review-comment">
                  "{review.comment || "No comment"}"
                </div>

                {/* ✅ Show Update/Delete only for the correct owner */}
                {isOwner && (
                  <div className="review-actions">
                    <Link
                      to={`/updatereview/${review._id}`}
                      className="re-update-btn"
                    >
                      Update
                    </Link>
                    <button
                      className="re-delete-btn"
                      onClick={() => handleDelete(review._id)}
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div className="no-reviews">
            <p>No reviews yet. Be the first to share your experience!</p>
          </div>
        )}
      </div>
    </div>
    </>
  );
}

export default ReviewsDisplay;
