import React from "react";
import "./ReviewsDisplay.css";
import { Link } from "react-router-dom";
import axios from "axios";
import StarRating from "../StarRating/StarRating";

function ReviewsDisplay(props) {
  const { reviews, onDelete } = props;

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this review?")) {
      try {
        await axios.delete(`http://localhost:5000/reviews/${id}`);
        if (onDelete) onDelete(id);
      } catch (err) {
        console.error("Error deleting review:", err);
      }
    }
  };

  return (
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
          <p className="motto">"Where Pets Are Family and Every Tail Tells a Story"</p>
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
          reviews.map((review, index) => (
            <div key={index} className="review-card">
              <div className="review-header">{review.ownerName}'s {review.petName}</div>

              <div className="review-detail">
                <span className="review-label">Owner Name:</span> {review.ownerName}
              </div>
              <div className="review-detail">
                <span className="review-label">Pet Name:</span> {review.petName}
              </div>
              <div className="review-detail">
                <span className="review-label">Grooming:</span> {review.grooming ? "Yes" : "No"}
              </div>
              <div className="review-detail">
                <span className="review-label">Walking:</span> {review.walking ? "Yes" : "No"}
              </div>
              <div className="review-detail">
                <span className="review-label">Species:</span> {review.species}
              </div>

              <div className="review-detail review-rating">
                <span className="review-label">Rating:</span>{" "}
                <StarRating rating={review.rating} readOnly />
              </div>

              <div className="review-comment">"{review.comment}"</div>

              <div className="review-actions">
                <Link to={`/updatereview/${review._id}`} className="update-btn">
                  Update
                </Link>
                <button className="delete-btn" onClick={() => handleDelete(review._id)}>
                  Delete
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="no-reviews">
            <p>No reviews yet. Be the first to share your experience!</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default ReviewsDisplay;
