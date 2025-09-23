import React from "react";

const StarRating = ({ rating, setRating }) => {
  return (
    <div style={{ display: "flex", gap: "5px", cursor: "pointer" }}>
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          onClick={() => setRating(star)}
          style={{
            fontSize: "24px",
            color: star <= rating ? "#FFD700" : "#ccc", // gold if active
          }}
        >
          ★
        </span>
      ))}
    </div>
  );
};

export default StarRating;
