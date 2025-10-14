import React, { useState } from 'react'
import { useNavigate } from 'react-router';

import './AddAppointmentDC.css';
import api from "../../utils/api";

function AddAppointmentDC() {
    const history = useNavigate();
    const [inputs, setInputs] = useState({
        ownerName: "",
        contactNumber: "",
        email: "",
        petName: "",
        species: "",
        healthDetails: "",
        dateStay: "",
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

    const [emailError, setEmailError] = useState("");
    const [contactError, setContactError] = useState("");
    const [isEmailTouched, setIsEmailTouched] = useState(false);
    const [isContactTouched, setIsContactTouched] = useState(false);

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

            // Validate contact number only if it's been touched or has value
            if (isContactTouched || value) {
                validateContactNumber(value);
            }
            return;
        }

        // Email validation
        if (name === "email") {
            setInputs((prevState) => ({
                ...prevState,
                [name]: value,
            }));

            // Validate email only if it's been touched or has value
            if (isEmailTouched || value) {
                validateEmail(value);
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

    const handleBlur = (e) => {
        const { name, value } = e.target;
        
        if (name === "email") {
            setIsEmailTouched(true);
            validateEmail(value);
        }
        
        if (name === "contactNumber") {
            setIsContactTouched(true);
            validateContactNumber(value);
        }
    };

    const validateEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            setEmailError("Please enter a valid email address");
        } else {
            setEmailError("");
        }
    };

    const validateContactNumber = (contactNumber) => {
        const contactRegex = /^0\d{9}$/;
        if (contactNumber && !contactRegex.test(contactNumber)) {
            setContactError("Contact number must start with 0 and contain exactly 10 digits");
        } else {
            setContactError("");
        }
    };

    const handleSubmit = (e) => {
    e.preventDefault();

    setIsEmailTouched(true);
    setIsContactTouched(true);
    validateEmail(inputs.email);
    validateContactNumber(inputs.contactNumber);

    if (emailError || contactError) {
        return;
    }

    if (!inputs.contactNumber || inputs.contactNumber.length !== 10) {
        setContactError("Contact number is required and must be 10 digits");
        return;
    }

    if (!inputs.nightsStay || isNaN(inputs.nightsStay) || Number(inputs.nightsStay) < 1) {
        alert("Number of nights stay must be a number and at least 1");
        return;
    }

    sendRequest().then((res) => {
        history(`/appointmentDisplayDC/${res.careCustomer._id}`);
    });
};

const sendRequest = async () => {
    const res = await api.post("/careCustomers", {
        ownerName: String(inputs.ownerName),
        contactNumber: String(inputs.contactNumber),
        email: String(inputs.email),
        petName: String(inputs.petName),
        species: String(inputs.species),
        healthDetails: String(inputs.healthDetails),
        dateStay: inputs.dateStay,
        pickUpDate: inputs.pickUpDate,
        nightsStay: Number(inputs.nightsStay),
        dropOffTime: String(inputs.dropOffTime),
        pickUpTime: String(inputs.pickUpTime),
        foodType: String(inputs.foodType),
        feedingTimes: String(inputs.feedingTimes),
        grooming: Boolean(inputs.grooming),
        walking: Boolean(inputs.walking),
        emergencyAction: String(inputs.emergencyAction),
        agree: Boolean(inputs.agree)
    });

    return res.data; 
};

    return (
        <div className="dc-back">
            
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
                        <label>Contact Number </label>
                        <input
                            type="text"
                            name="contactNumber"
                            placeholder="07XXXXXXXX"
                            value={inputs.contactNumber}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            required
                            maxLength="10"
                            className={contactError ? 'error-input' : ''}
                        />
                        {/* Show error message if invalid */}
                        {contactError && <span className="error-message">{contactError}</span>}
                        <span className="instruction">Must start with 0 and contain exactly 10 digits</span>
                    </div>

                    <div className="input-group">
                        <label>Email Address </label>
                        <input
                            type="email"
                            name="email"
                            placeholder="your.email@example.com"
                            value={inputs.email}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            required
                            className={emailError ? 'error-input' : ''}
                        />
                        {/* Show error message if invalid */}
                        {emailError && <span className="error-message">{emailError}</span>}
                        <span className="instruction">Enter a valid email address (e.g., name@domain.com)</span>
                    </div>
                </div>

                {/* Pet Details Section */}
                <div className="form-section">
                    <h3 className="section-title">Pet Details</h3>
                    <div className="input-group">
                        <label>Pet Name </label>
                        <input type="text" name="petName" placeholder="Enter pet's name" value={inputs.petName} onChange={handleChange} required />
                    </div>

                    <div className="input-group">
                        <label>Species </label>
                        <select name="species" value={inputs.species} onChange={handleChange} required>
                            <option value="">Select Species</option>
                            <option value="dog">Dog</option>
                            <option value="cat">Cat</option>
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
                    <label>Drop off date</label>
                    <input
                        type="date"
                        name="dateStay"
                        value={inputs.dateStay}
                        onChange={handleChange}
                        required
                        min={new Date().toISOString().split("T")[0]}
                        />
                    </div>
                    <div className="input-group">
                    <label>Pick up date</label>
                    <input
                        type="date"
                        name="pickUpDate"
                        value={inputs.pickUpDate}
                        onChange={handleChange}
                        required
                        min={new Date().toISOString().split("T")[0]}
                        />
                    </div>
                    <div className="input-group">
                        <label>Number of Nights Stay </label>
                        <input type="number" name="nightsStay" placeholder="Enter number of nights" value={inputs.nightsStay} onChange={handleChange} required min="1" />
                    </div>

                    <div className="input-group">
                        <label>Drop Off Time </label>
                        <input type="time" name="dropOffTime" value={inputs.dropOffTime} onChange={handleChange} required />
                    </div>

                    <div className="input-group">
                        <label>Pick Up Time </label>
                        <input type="time" name="pickUpTime" value={inputs.pickUpTime} onChange={handleChange} required />
                    </div>

                    <div className="input-group">
                        <label>Food Type </label>
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
                        <label>Emergency Action </label>
                        <select name="emergencyAction" value={inputs.emergencyAction} onChange={handleChange} required>
                            <option value="">Select Emergency Action</option>
                            <option value="contact-owner">Contact Owner First</option>
                            <option value="authorize-treatment">Authorize Necessary Treatment</option>
                        </select>
                    </div>
                    <p>Pets must be fully vaccinated.
                        Owners must provide medical instructions.
                        Emergency vet care will be authorized if needed.</p>

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
        </div>
    )
}

export default AddAppointmentDC