// AddReviews.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import api from '../../utils/api';
import './AddReviews.css'; 
import StarRating from "../StarRating/StarRating"; 

function AddReviews() {
  const history = useNavigate();
  const [inputs, setInputs] = useState({
    ownerName: "",
    petName: "",
    species: "",
    grooming: false,
    walking: false,
    rating: 0,
    comment: ""
  });

  // Update handler for stars
  const handleRatingChange = (value) => {
    setInputs({ ...inputs, rating: value });
  };

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
    await api.post("/reviews", {
      ownerName: String(inputs.ownerName),
      petName: String(inputs.petName),
      species: String(inputs.species),
      grooming: Boolean(inputs.grooming),
      walking: Boolean(inputs.walking),
      rating: Number(inputs.rating),
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
            <label>Owner Name </label>
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
            <label>Pet Name </label>
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
            <label>Species </label>
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
            <label>Rating  </label>
            <StarRating rating={inputs.rating} setRating={handleRatingChange} />
          </div>

          
          <div className="input-group">
            <label>Comment </label>
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
