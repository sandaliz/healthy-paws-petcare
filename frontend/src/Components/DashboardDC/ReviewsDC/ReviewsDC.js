// ReviewsDC.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable'; 
import './ReviewsDC.css';

function ReviewsDC() {
  const [reviews, setReviews] = useState([]);
  const [filteredReviews, setFilteredReviews] = useState([]);
  const [sentimentFilter, setSentimentFilter] = useState('all');

  // Fetch reviews
  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const response = await axios.get('http://localhost:5000/reviews');
        setReviews(response.data.reviews || []);
        setFilteredReviews(response.data.reviews || []);
      } catch (err) {
        console.error('Error fetching reviews:', err);
      }
    };
    fetchReviews();
  }, []);

  // Filter reviews based on sentiment
  useEffect(() => {
    if (sentimentFilter === 'all') {
      setFilteredReviews(reviews);
    } else {
      const filtered = reviews.filter(r => r.sentiment === sentimentFilter);
      setFilteredReviews(filtered);
    }
  }, [sentimentFilter, reviews]);

  // Generate PDF
  const generatePDF = () => {
    const doc = new jsPDF();
    doc.text("PetCare Reviews", 14, 15);

    const tableColumn = ["Owner", "Pet", "Species", "Services", "Rating", "Sentiment", "Comment"];
    const tableRows = [];

    filteredReviews.forEach(review => {
      const services = `${review.grooming ? 'Grooming ' : ''}${review.walking ? 'Walking' : ''}`.trim();
      tableRows.push([
        review.ownerName,
        review.petName,
        review.species,
        services,
        review.rating,           // Number instead of stars
        review.sentiment,
        review.comment
      ]);
    });

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 25,
      styles: { fontSize: 10 },
      headStyles: { fillColor: [85, 65, 60], textColor: 255 },
      didParseCell: function (data) {
        // Color-code sentiment
        if (data.column.index === 5) { // Sentiment column
          const val = data.cell.raw;
          if (val === 'good') data.cell.styles.textColor = [0, 128, 0];       // Green
          else if (val === 'bad') data.cell.styles.textColor = [255, 0, 0];   // Red
          else if (val === 'neutral') data.cell.styles.textColor = [85, 65, 60]; // Brownish
        }
      }
    });

    doc.save("PetCare_Reviews.pdf");
  };

  // Render stars in UI
  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span key={i} className={`star ${i <= rating ? 'filled' : ''}`}>
          {i <= rating ? '★' : '☆'}
        </span>
      );
    }
    return stars;
  };

  return (
    <div className="reviews-dc-container">
      <div className="reviews-header">
        <h1>Customer Reviews</h1>

        <div className="header-actions">
          <select
            value={sentimentFilter}
            onChange={(e) => setSentimentFilter(e.target.value)}
            className="sentiment-filter"
          >
            <option value="all">All Sentiments</option>
            <option value="good">Positive</option>
            <option value="bad">Negative</option>
            <option value="neutral">Neutral</option>
          </select>

          <button className="pdf-btn" onClick={generatePDF}>
            Download PDF
          </button>
        </div>
      </div>

      {filteredReviews.length === 0 ? (
        <p className="no-reviews">No reviews found.</p>
      ) : (
        <div className="reviews-grid">
          {filteredReviews.map((review) => (
            <div key={review._id} className="review-card">
              <h3 className="review-owner">{review.ownerName}'s Review</h3>
              <p><strong>Pet:</strong> {review.petName} ({review.species})</p>
              <p><strong>Services:</strong> {review.grooming ? 'Grooming ' : ''}{review.walking ? 'Walking' : ''}</p>
              <p className="review-rating"><strong>Rating:</strong> {renderStars(review.rating)}</p>
              <p className={`review-sentiment ${review.sentiment}`}><strong>Sentiment:</strong> {review.sentiment}</p>
              <p className="review-comment">"{review.comment}"</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default ReviewsDC;
