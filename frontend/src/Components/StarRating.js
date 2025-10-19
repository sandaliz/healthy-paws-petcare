// src/Components/StarRating.js
// src/Components/StarRating.js
import React from "react";
 
const StarRating = ({ rating, setRating, disabled }) => {
  return (
    <div className="star-rating">
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          className={`star ${star <= rating ? "filled" : ""} ${disabled ? "disabled" : ""}`}
          onClick={() => !disabled && setRating(star)}
          style={{ cursor: disabled ? "not-allowed" : "pointer", fontSize: "24px" }}
        >
          {star <= rating ? "★" : "☆"}
        </span>
      ))}
    </div>
  );
};
 
export default StarRating;
