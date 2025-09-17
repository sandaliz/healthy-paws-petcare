import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import './UpdateReviews.css'; 

function UpdateReviews() {
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

    const history = useNavigate();
    const { id } = useParams();

    useEffect(() => {
        const fetchHandler = async () => {
            try {
                const response = await axios.get(`http://localhost:5000/reviews/${id}`);
                const data = response.data.review || {}; // Note: it's 'review' not 'reviews'
                setInputs(data);
            } catch (error) {
                console.error('Error fetching review:', error);
            }
        };
        fetchHandler();
    }, [id]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;

        if (name === "ownerName" || name === "petName") {
            if (/^[a-zA-Z\s]*$/.test(value)) {
                setInputs((prev) => ({ ...prev, [name]: value }));
            }
            return;
        }

        if (type === "checkbox") {
            setInputs((prev) => ({ ...prev, [name]: checked }));
            return;
        }

        setInputs((prev) => ({ ...prev, [name]: value }));
    };

    const sendRequest = async () => {
        try {
            await axios.put(`http://localhost:5000/reviews/${id}`, {
                ownerName: String(inputs.ownerName),
                petName: String(inputs.petName),
                species: String(inputs.species),
                grooming: Boolean(inputs.grooming),
                walking: Boolean(inputs.walking),
                rating: Number(inputs.rating),
                sentiment: String(inputs.sentiment),
                comment: String(inputs.comment)
            });
            return true;
        } catch (error) {
            console.error('Error updating review:', error);
            return false;
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        sendRequest().then(() => history('/reviews'));
    };

    return (
        <div className="appointment-container">
            <form onSubmit={handleSubmit} className="appointment-form">
                <h2 className="form-title">Update Review</h2>

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
                    Update Review
                </button>
            </form>
        </div>
    );
}

export default UpdateReviews;