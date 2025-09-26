// src/pages/DashboardDC/ReviewsDC.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable'; 
import './ReviewsDC.css';

function ReviewsDC() {
  const [reviews, setReviews] = useState([]);
  const [filteredReviews, setFilteredReviews] = useState([]);
  const [sentimentFilter, setSentimentFilter] = useState('all');

  // Fetch reviews from backend
  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const response = await axios.get('http://localhost:5001/reviews');
        setReviews(response.data.reviews || []);
        setFilteredReviews(response.data.reviews || []);
      } catch (err) {
        console.error('Error fetching reviews:', err);
      }
    };
    fetchReviews();
  }, []);

  // Filter reviews based on sentiment choice
  useEffect(() => {
    if (sentimentFilter === 'all') {
      setFilteredReviews(reviews);
    } else {
      setFilteredReviews(reviews.filter(r => r.sentiment === sentimentFilter));
    }
  }, [sentimentFilter, reviews]);

  // Generate PDF of current reviews
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
        services || "—",
        review.rating,
        review.sentiment,
        review.comment
      ]);
    });

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 25,
      styles: { fontSize: 10 },
      headStyles: { fillColor: [84, 65, 60], textColor: 255 },
      didParseCell: function (data) {
        if (data.column.index === 5) {
          const val = data.cell.raw;
          if (val === 'good') data.cell.styles.textColor = [0, 128, 0];
          else if (val === 'bad') data.cell.styles.textColor = [255, 0, 0];
          else if (val === 'neutral') data.cell.styles.textColor = [85, 65, 60];
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
        <span key={i} className={`dcd-star ${i <= rating ? 'filled' : ''}`}>
          {i <= rating ? '★' : '☆'}
        </span>
      );
    }
    return stars;
  };

  return (
    <div className="dcd-reviews-container">
      <div className="dcd-reviews-header">
        <h1>Customer Reviews</h1>

        <div className="dcd-reviews-header-actions">
          <select
            value={sentimentFilter}
            onChange={(e) => setSentimentFilter(e.target.value)}
            className="dcd-reviews-filter"
          >
            <option value="all">All Sentiments</option>
            <option value="good">Positive</option>
            <option value="bad">Negative</option>
            <option value="neutral">Neutral</option>
          </select>

          <button className="dcd-reviews-pdf-btn" onClick={generatePDF}>
            Download PDF
          </button>
        </div>
      </div>

      {filteredReviews.length === 0 ? (
        <p className="dcd-no-reviews">No reviews found.</p>
      ) : (
        <div className="dcd-reviews-grid">
          {filteredReviews.map((review) => (
            <div key={review._id} className="dcd-review-card">
              <h3 className="dcd-review-owner">{review.ownerName}'s Review</h3>
              <p><strong>Pet:</strong> {review.petName} ({review.species})</p>
              <p><strong>Services:</strong> {review.grooming ? 'Grooming ' : ''}{review.walking ? 'Walking' : ''}</p>
              <p className="dcd-review-rating"><strong>Rating:</strong> {renderStars(review.rating)}</p>
              <p className={`dcd-review-sentiment ${review.sentiment}`}>
                <strong>Sentiment:</strong> {review.sentiment}
              </p>
              <p className="dcd-review-comment">"{review.comment}"</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default ReviewsDC;