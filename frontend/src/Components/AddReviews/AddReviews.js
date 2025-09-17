// AddReviews.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import axios from 'axios';
import './AddReviews.css'; 

function AddReviews() {
  const history = useNavigate();
  const [inputs, setInputs] = useState({
    ownerName: "",
    petName: "",
    species: "",
    grooming: false,
    walking: false,
    rating: "",
    sentiment: "",
    comment: ""
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    // Owner name validation: only letters and spaces
    if (name === "ownerName") {
      if (/^[a-zA-Z\s]*$/.test(value)) {
        setInputs((prev) => ({ ...prev, [name]: value }));
      }
      return;
    }

    // Pet name validation: only letters and spaces
    if (name === "petName") {
      if (/^[a-zA-Z\s]*$/.test(value)) {
        setInputs((prev) => ({ ...prev, [name]: value }));
      }
      return;
    }

    // Checkbox handling
    if (type === "checkbox") {
      setInputs((prev) => ({ ...prev, [name]: checked }));
      return;
    }

    setInputs((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(inputs);
    sendRequest().then(() => history('/reviews'));
  };

  const sendRequest = async () => {
    await axios.post("http://localhost:5000/reviews", {
      ownerName: String(inputs.ownerName),
      petName: String(inputs.petName),
      species: String(inputs.species),
      grooming: Boolean(inputs.grooming),
      walking: Boolean(inputs.walking),
      rating: Number(inputs.rating),
      sentiment: String(inputs.sentiment),
      comment: String(inputs.comment)
    });
  };

  return (
    <div className="appointment-container">
      <form onSubmit={handleSubmit} className="appointment-form">
        <h2 className="form-title">Add a Review</h2>

        {/* Owner + Pet Info */}
        <div className="form-section">
          <div className="input-group">
            <label>Owner Name *</label>
            <input
              type="text"
              name="ownerName"
              placeholder="Enter owner's name"
              value={inputs.ownerName}
              onChange={handleChange}
              required
            />
          </div>

          <div className="input-group">
            <label>Pet Name *</label>
            <input
              type="text"
              name="petName"
              placeholder="Enter pet's name"
              value={inputs.petName}
              onChange={handleChange}
              required
            />
          </div>

          <div className="input-group">
            <label>Species *</label>
            <select
              name="species"
              value={inputs.species}
              onChange={handleChange}
              required
            >
              <option value="">Select Species</option>
              <option value="dog">Dog</option>
              <option value="cat">Cat</option>
              
            </select>
          </div>
        </div>

        {/* Services */}
        <div className="form-section">
          <div className="checkbox-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                name="grooming"
                checked={inputs.grooming}
                onChange={handleChange}
              />
              <span>Grooming Service</span>
            </label>
          </div>

          <div className="checkbox-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                name="walking"
                checked={inputs.walking}
                onChange={handleChange}
              />
              <span>Walking Service</span>
            </label>
          </div>
        </div>

        {/* Rating & Comment */}
        <div className="form-section">
          <div className="input-group">
            <label>Rating (1–5) *</label>
            <input
              type="number"
              name="rating"
              min="1"
              max="5"
              value={inputs.rating}
              onChange={handleChange}
              required
            />
          </div>

          <div className="input-group">
            <label>Sentiment *</label>
            <select
              name="sentiment"
              value={inputs.sentiment}
              onChange={handleChange}
              required
            >
              <option value="">Select Sentiment</option>
              <option value="good">Good</option>
              <option value="bad">Bad</option>
              <option value="neutral">Neutral</option>
            </select>
          </div>

          <div className="input-group">
            <label>Comment *</label>
            <textarea
              name="comment"
              placeholder="Write your feedback..."
              value={inputs.comment}
              onChange={handleChange}
              required
            ></textarea>
          </div>
        </div>


        <button type="submit" className="submit-btn">
          Submit Review
        </button>
      </form>
    </div>
  );
}

export default AddReviews;
