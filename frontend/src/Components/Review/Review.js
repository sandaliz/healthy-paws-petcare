import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ReviewDisplay from '../ReviewsDisplay/ReviewsDisplay';

const URL = "http://localhost:5001/reviews";

const fetchHandler = async () => {
  return await axios.get(URL).then((res) => res.data);
}

function Review() {
  const [reviews, setReviews] = useState([]);
  
  useEffect(() => {
    fetchHandler().then((data) => {
      if (data && data.reviews) {
        setReviews(data.reviews);
      }
    });
  }, []);

  const handleDeleteReview = (deletedId) => {
    // Remove the deleted review from state
    setReviews(prevReviews => prevReviews.filter(review => review._id !== deletedId));
  };

  return (
    <div>
      {/* Pass ALL reviews as a prop, don't map here */}
      <ReviewDisplay reviews={reviews} onDelete={handleDeleteReview} />
    </div>
  );
}

export default Review;