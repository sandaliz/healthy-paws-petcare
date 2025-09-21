import React from "react";

const StarRating = ({ rating, setRating, readOnly = false }) => {
  return (
    <div className="flex space-x-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          onClick={!readOnly ? () => setRating(star) : undefined}
          className={`cursor-pointer text-3xl transition-colors ${
            star <= rating ? "text-yellow-500" : "text-gray-300"
          }`}
        >
          ★
        </span>
      ))}
    </div>
  );
};

export default StarRating;