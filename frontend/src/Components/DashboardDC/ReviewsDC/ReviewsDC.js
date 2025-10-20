// src/pages/DashboardDC/ReviewsDC.js
import React, { useEffect, useState } from 'react';
import api from '../../../utils/api';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import './ReviewsDC.css';

function ReviewsDC() {
  const [reviews, setReviews] = useState([]);
  const [filteredReviews, setFilteredReviews] = useState([]);
  const [sentimentFilter, setSentimentFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch reviews from backend
  useEffect(() => {
    const fetchReviews = async () => {
      try {
        setLoading(true);
        const response = await api.get('/reviews');
        setReviews(response.data.reviews || []);
        setFilteredReviews(response.data.reviews || []);
      } catch (err) {
        console.error('Error fetching reviews:', err);
        setError('Failed to load reviews');
      } finally {
        setLoading(false);
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

  // Delete review
  const handleDelete = async (reviewId) => {
    if (!window.confirm('Are you sure you want to delete this review?')) return;

    try {
      await api.delete(`/reviews/${reviewId}`);
      // Remove the deleted review from the state
      const updatedReviews = reviews.filter(review => review._id !== reviewId);
      setReviews(updatedReviews);
      alert('Review deleted successfully!');
    } catch (err) {
      console.error('Error deleting review:', err);
      alert(err.response?.data?.message || 'Failed to delete review');
    }
  };

  // Generate PDF of current reviews
  const generatePDF = () => {
    try {
      const doc = new jsPDF();

      // 🏢 Load logo (from public/images/HPlogo.png)
      const logo = new Image();
      logo.src = `${window.location.origin}/images/HPlogo.png`;

      logo.onload = () => {
        // Add logo top-left
        doc.addImage(logo, "PNG", 14, 10, 25, 25);

        // 📄 Title centered
        doc.setFont("helvetica", "bold");
        doc.setFontSize(16);
        doc.text("Customer Reviews Report", 105, 20, { align: "center" });

        // 📅 Date top-right
        doc.setFontSize(10);
        const generatedDate = new Date().toLocaleString("en-GB", {
          timeZone: "Asia/Colombo",
        });
        doc.text(`Generated on: ${generatedDate}`, 195, 12, { align: "right" });

        // Separator line
        doc.setLineWidth(0.5);
        doc.line(14, 38, 195, 38);

        // Table setup
        const tableColumn = ["Owner", "Pet", "Species", "Services", "Rating", "Sentiment", "Comment"];
        const tableRows = [];

        filteredReviews.forEach((review) => {
          const services = `${review.grooming ? "Grooming " : ""}${review.walking ? "Walking" : ""}`.trim();
          tableRows.push([
            review.ownerName,
            review.petName,
            review.species,
            services || "—",
            review.rating,
            review.sentiment,
            review.comment || "—",
          ]);
        });

        autoTable(doc, {
          head: [tableColumn],
          body: tableRows,
          startY: 45,
          styles: { fontSize: 9, cellPadding: 3 },
          headStyles: { fillColor: [84, 65, 60], textColor: 255 },
          didParseCell: function (data) {
            if (data.column.index === 5) {
              const val = data.cell.raw;
              if (val === "good") data.cell.styles.textColor = [0, 128, 0];
              else if (val === "bad") data.cell.styles.textColor = [255, 0, 0];
              else if (val === "neutral") data.cell.styles.textColor = [85, 65, 60];
            }
          },
        });

        doc.save("CustomerReviewsReport.pdf");
        alert("PDF report downloaded successfully!");
      };
    } catch (err) {
      console.error("PDF export error:", err);
      alert("Error exporting to PDF");
    }
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

  if (loading) {
    return <div className="dcd-reviews-container">Loading reviews...</div>;
  }

  if (error) {
    return (
      <div className="dcd-reviews-container">
        <p className="error-message">{error}</p>
        <button onClick={() => window.location.reload()}>Try Again</button>
      </div>
    );
  }

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
              <div className="dcd-review-header">
                <h3 className="dcd-review-owner">{review.ownerName}'s Review</h3>
                <button
                  className="dcd-delete-btn"
                  onClick={() => handleDelete(review._id)}
                  title="Delete Review"
                >
                  🗑️
                </button>
              </div>
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