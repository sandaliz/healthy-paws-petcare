import React, { useState } from 'react'
import { useNavigate } from 'react-router';
import axios from 'axios';
import './AddAppointmentDC.css';

function AddAppointmentDC() {
    const history = useNavigate();
    const [inputs, setInputs] = useState({
        ownerName: "",
        contactNumber: "",
        email: "",
        alternateContact: "",
        petName: "",
        species: "",
        breed: "",
        age: "",
        gender: "",
        healthDetails: "",
        nightsStay: "",
        dropOffTime: "",
        pickUpTime: "",
        foodType: "",
        feedingTimes: "",
        grooming: false,
        walking: false,
        emergencyAction: "",
        agree: false
    });

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;

        // Owner Name validation: only letters and spaces
        if (name === "ownerName") {
            if (/^[a-zA-Z\s]*$/.test(value)) {
                setInputs((prevState) => ({
                    ...prevState,
                    [name]: value,
                }));
            }
            return;
        }

        // Contact Number validation: only digits, 10 max, must start with 0
        if (name === "contactNumber") {
            if (/^0\d{0,9}$/.test(value) || value === "") {
                setInputs((prevState) => ({
                    ...prevState,
                    [name]: value,
                }));
            }
            return;
        }

        // Alternate Contact validation: same as contact number
        if (name === "alternateContact") {
            if (/^0\d{0,9}$/.test(value) || value === "") {
                setInputs((prevState) => ({
                    ...prevState,
                    [name]: value,
                }));
            }
            return;
        }

        // Age validation: only numbers 0-30
        if (name === "age") {
            if (value === "" || (/^\d+$/.test(value) && parseInt(value) >= 0 && parseInt(value) <= 30)) {
                setInputs((prevState) => ({
                    ...prevState,
                    [name]: value,
                }));
            }
            return;
        }

        // Breed validation: only letters and spaces
        if (name === "breed") {
            if (/^[a-zA-Z\s]*$/.test(value)) {
                setInputs((prevState) => ({
                    ...prevState,
                    [name]: value,
                }));
            }
            return;
        }

        // Checkbox handling - allow unchecking
        if (type === "checkbox") {
            setInputs((prevState) => ({
                ...prevState,
                [name]: checked
            }));
            return;
        }

        // Normal inputs
        setInputs((prevState) => ({
            ...prevState,
            [name]: value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log(inputs);
        sendRequest().then(() => history('/appointmentDC'))
    }

    const sendRequest = async () => {
        await axios.post("http://localhost:5000/careCustomers", {
            ownerName: String(inputs.ownerName),
            contactNumber: String(inputs.contactNumber),
            email: String(inputs.email),
            alternateContact: String(inputs.alternateContact),
            petName: String(inputs.petName),
            species: String(inputs.species),
            breed: String(inputs.breed),
            age: String(inputs.age),
            gender: String(inputs.gender),
            healthDetails: String(inputs.healthDetails),
            nightsStay: Number(inputs.nightsStay),
            dropOffTime: String(inputs.dropOffTime),
            pickUpTime: String(inputs.pickUpTime),
            foodType: String(inputs.foodType),
            feedingTimes: String(inputs.feedingTimes),
            grooming: Boolean(inputs.grooming),
            walking: Boolean(inputs.walking),
            emergencyAction: String(inputs.emergencyAction),
            agree: Boolean(inputs.agree)
        })
    }

    return (
        <div className="appointment-container">
            <form onSubmit={handleSubmit} className="appointment-form">
                <h2 className="form-title">Pet Care Booking Form</h2>

                {/* Pet Owner Details Section */}
                <div className="form-section">
                    <h3 className="section-title">Pet Owner Details</h3>
                    <div className="input-group">
                        <label>Owner Name *</label>
                        <input type="text" name="ownerName" placeholder="Enter owner's full name" value={inputs.ownerName} onChange={handleChange} required />
                        <span className="instruction">Letters and spaces only</span>
                    </div>

                    <div className="input-group">
                        <label>Contact Number *</label>
                        <input type="text" name="contactNumber" placeholder="07XXXXXXXX" value={inputs.contactNumber} onChange={handleChange} required />
                        <span className="instruction">Must start with 0 and contain 10 digits</span>
                    </div>

                    <div className="input-group">
                        <label>Email Address *</label>
                        <input type="email" name="email" placeholder="your.email@example.com" value={inputs.email} onChange={handleChange} required />
                        <span className="instruction">Enter a valid email address (e.g., name@domain.com)</span>
                    </div>

                    <div className="input-group">
                        <label>Alternate Contact</label>
                        <input type="text" name="alternateContact" placeholder="07XXXXXXXX" value={inputs.alternateContact} onChange={handleChange} />
                        <span className="instruction">Same format as contact number</span>
                    </div>
                </div>

                {/* Pet Details Section */}
                <div className="form-section">
                    <h3 className="section-title">Pet Details</h3>
                    <div className="input-group">
                        <label>Pet Name *</label>
                        <input type="text" name="petName" placeholder="Enter pet's name" value={inputs.petName} onChange={handleChange} required />
                    </div>

                    <div className="input-group">
                        <label>Species *</label>
                        <select name="species" value={inputs.species} onChange={handleChange} required>
                            <option value="">Select Species</option>
                            <option value="dog">Dog</option>
                            <option value="cat">Cat</option>
                        </select>
                    </div>

                    <div className="input-group">
                        <label>Breed *</label>
                        <input type="text" name="breed" placeholder="Enter breed" value={inputs.breed} onChange={handleChange} required />
                        <span className="instruction">Letters and spaces only</span>
                    </div>

                    <div className="input-group">
                        <label>Age *</label>
                        <input type="text" name="age" placeholder="Enter age" value={inputs.age} onChange={handleChange} required />
                        <span className="instruction">Must be between 0 and 30</span>
                    </div>

                    <div className="input-group">
                        <label>Gender *</label>
                        <select name="gender" value={inputs.gender} onChange={handleChange} required>
                            <option value="">Select Gender</option>
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                        </select>
                    </div>

                    <div className="input-group">
                        <label>Health Details</label>
                        <textarea name="healthDetails" placeholder="Any health conditions, allergies, or special needs..." value={inputs.healthDetails} onChange={handleChange}></textarea>
                    </div>
                </div>

                {/* Booking Details Section */}
                <div className="form-section">
                    <h3 className="section-title">Booking Details</h3>
                    <div className="input-group">
                        <label>Number of Nights Stay *</label>
                        <input type="number" name="nightsStay" placeholder="Enter number of nights" value={inputs.nightsStay} onChange={handleChange} required min="1" />
                    </div>

                    <div className="input-group">
                        <label>Drop Off Time *</label>
                        <input type="time" name="dropOffTime" value={inputs.dropOffTime} onChange={handleChange} required />
                    </div>

                    <div className="input-group">
                        <label>Pick Up Time *</label>
                        <input type="time" name="pickUpTime" value={inputs.pickUpTime} onChange={handleChange} required />
                    </div>

                    <div className="input-group">
                        <label>Food Type *</label>
                        <select name="foodType" value={inputs.foodType} onChange={handleChange} required>
                            <option value="">Select Food Type</option>
                            <option value="owner-provided">Owner Provided</option>
                            <option value="hospital-provided">Hospital Provided</option>
                        </select>
                    </div>

                    <div className="input-group">
                        <label>Feeding Times</label>
                        <input type="text" name="feedingTimes" placeholder="e.g., 8:00 AM, 1:00 PM, 6:00 PM" value={inputs.feedingTimes} onChange={handleChange} />
                    </div>

                    <div className="checkbox-group">
                        <label className="checkbox-label">
                            <input type="checkbox" name="grooming" checked={inputs.grooming} onChange={handleChange} />
                            <span>Grooming Service</span>
                        </label>
                    </div>

                    <div className="checkbox-group">
                        <label className="checkbox-label">
                            <input type="checkbox" name="walking" checked={inputs.walking} onChange={handleChange} />
                            <span>Walking Service</span>
                        </label>
                    </div>

                    <div className="input-group">
                        <label>Emergency Action *</label>
                        <select name="emergencyAction" value={inputs.emergencyAction} onChange={handleChange} required>
                            <option value="">Select Emergency Action</option>
                            <option value="contact-owner">Contact Owner First</option>
                            <option value="authorize-treatment">Authorize Necessary Treatment</option>
                        </select>
                    </div>

                    <div className="checkbox-group agreement">
                        <label className="checkbox-label">
                            <input type="checkbox" name="agree" checked={inputs.agree} onChange={handleChange} required />
                            <span>I agree to the terms and conditions *</span>
                        </label>
                    </div>
                </div>

                <button type="submit" className="submit-btn">Submit Booking</button>
            </form>
        </div>
    )
}

export default AddAppointmentDC