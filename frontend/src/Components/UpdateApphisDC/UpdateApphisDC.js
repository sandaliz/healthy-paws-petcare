import React, { useEffect, useState } from 'react';
//import axios from 'axios';
import api from '../../utils/api';
import { useParams } from 'react-router';
import { useNavigate } from 'react-router';

function UpdateApphisDC() {
    const [inputs, setInputs] = useState({
        ownerName: "",
        contactNumber: "",
        email: "",
        petName: "",
        species: "",
        healthDetails: "",
        dateStay: "",
        pickUpDate: "",
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

    const history = useNavigate();
    const id = useParams().id;

    useEffect(() => {
        const fetchHandler = async () => {
            try {
                const response = await api.get(`/careCustomers/${id}`);


                const data = response.data.careCustomer || {};

                if (data.dateStay) {
                    data.dateStay = new Date(data.dateStay).toISOString().split("T")[0];
                }
                if (data.pickUpDate) {
                    data.pickUpDate = new Date(data.pickUpDate).toISOString().split("T")[0];
                }

                setInputs(data);
            } catch (error) {
                console.error('Error fetching appointment:', error);
                console.error('Error response:', error.response?.data);
            }
        };
        fetchHandler();
    }, [id]);

    const sendRequest = async () => {
        try {
            await api.put(`/careCustomers/${id}`, {
                ownerName: String(inputs.ownerName),
                contactNumber: String(inputs.contactNumber),
                email: String(inputs.email),
                petName: String(inputs.petName),
                species: String(inputs.species),
                healthDetails: String(inputs.healthDetails),
                dateStay: inputs.dateStay ? new Date(inputs.dateStay) : null,
                pickUpDate: inputs.pickUpDate ? new Date(inputs.pickUpDate) : null,
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
            return true;
        } catch (error) {
            console.error('Error updating appointment:', error);
            return false;
        }
    };

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

            if (isEmailTouched || value) {
                validateEmail(value);
            }
            return;
        }

        // Checkbox handling
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

    const handleSubmit = async (e) => {
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

        console.log('Updating appointment:', inputs);
        const success = await sendRequest();
        if (success) {
            history('/appointmentDC');
        } else {
            alert('Failed to update appointment. Please try again.');
        }
    };

    return (
        <div className="dc-back">
            <div className="appointment-container">
                <form onSubmit={handleSubmit} className="appointment-form">
                    <h2 className="form-title">Update Pet Care Booking</h2>

                    {/* Pet Owner Details */}
                    <div className="form-section">
                        <h3 className="section-title">Pet Owner Details</h3>
                        <div className="input-group">
                            <label>Owner Name *</label>
                            <input
                                type="text"
                                name="ownerName"
                                placeholder="Enter owner's full name"
                                value={inputs.ownerName || ''}
                                onChange={handleChange}
                                required
                            />
                            <span className="instruction">Letters and spaces only</span>
                        </div>

                        <div className="input-group">
                            <label>Contact Number *</label>
                            <input
                                type="text"
                                name="contactNumber"
                                placeholder="07XXXXXXXX"
                                value={inputs.contactNumber || ''}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                required
                                maxLength="10"
                                className={contactError ? 'error-input' : ''}
                            />
                            {contactError && <span className="error-message">{contactError}</span>}
                            <span className="instruction">Must start with 0 and contain exactly 10 digits</span>
                        </div>

                        <div className="input-group">
                            <label>Email Address *</label>
                            <input
                                type="email"
                                name="email"
                                placeholder="your.email@example.com"
                                value={inputs.email || ''}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                required
                                className={emailError ? 'error-input' : ''}
                            />
                            {emailError && <span className="error-message">{emailError}</span>}
                            <span className="instruction">Enter a valid email address (e.g., name@domain.com)</span>
                        </div>
                    </div>

                    {/* Pet Details */}
                    <div className="form-section">
                        <h3 className="section-title">Pet Details</h3>
                        <div className="input-group">
                            <label>Pet Name *</label>
                            <input
                                type="text"
                                name="petName"
                                placeholder="Enter pet's name"
                                value={inputs.petName || ''}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="input-group">
                            <label>Species *</label>
                            <select
                                name="species"
                                value={inputs.species || ''}
                                onChange={handleChange}
                                required
                            >
                                <option value="">Select Species</option>
                                <option value="dog">Dog</option>
                                <option value="cat">Cat</option>
                            </select>
                        </div>

                        <div className="input-group">
                            <label>Health Details</label>
                            <textarea
                                name="healthDetails"
                                placeholder="Any health conditions, allergies, or special needs..."
                                value={inputs.healthDetails || ''}
                                onChange={handleChange}
                            ></textarea>
                        </div>
                    </div>

                    {/* Booking Details */}
                    <div className="form-section">
                        <h3 className="section-title">Booking Details</h3>
                        <div className="input-group">
                            <label>Drop off date *</label>
                            <input
                                type="date"
                                name="dateStay"
                                value={inputs.dateStay || ''}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="input-group">
                            <label>Pick up date *</label>
                            <input
                                type="date"
                                name="pickUpDate"
                                value={inputs.pickUpDate || ''}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="input-group">
                            <label>Number of Nights Stay *</label>
                            <input
                                type="number"
                                name="nightsStay"
                                placeholder="Enter number of nights"
                                value={inputs.nightsStay || ''}
                                onChange={handleChange}
                                required
                                min="1"
                            />
                        </div>

                        <div className="input-group">
                            <label>Drop Off Time *</label>
                            <input
                                type="time"
                                name="dropOffTime"
                                value={inputs.dropOffTime || ''}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="input-group">
                            <label>Pick Up Time *</label>
                            <input
                                type="time"
                                name="pickUpTime"
                                value={inputs.pickUpTime || ''}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="input-group">
                            <label>Food Type *</label>
                            <select
                                name="foodType"
                                value={inputs.foodType || ''}
                                onChange={handleChange}
                                required
                            >
                                <option value="">Select Food Type</option>
                                <option value="owner-provided">Owner Provided</option>
                                <option value="hospital-provided">Hospital Provided</option>
                            </select>
                        </div>

                        <div className="input-group">
                            <label>Feeding Times</label>
                            <input
                                type="text"
                                name="feedingTimes"
                                placeholder="e.g., 8:00 AM, 1:00 PM, 6:00 PM"
                                value={inputs.feedingTimes || ''}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="checkbox-group">
                            <label className="checkbox-label">
                                <input
                                    type="checkbox"
                                    name="grooming"
                                    checked={inputs.grooming || false}
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
                                    checked={inputs.walking || false}
                                    onChange={handleChange}
                                />
                                <span>Walking Service</span>
                            </label>
                        </div>

                        <div className="input-group">
                            <label>Emergency Action *</label>
                            <select
                                name="emergencyAction"
                                value={inputs.emergencyAction || ''}
                                onChange={handleChange}
                                required
                            >
                                <option value="">Select Emergency Action</option>
                                <option value="contact-owner">Contact Owner First</option>
                                <option value="authorize-treatment">Authorize Necessary Treatment</option>
                            </select>
                        </div>

                        <div className="checkbox-group agreement">
                            <label className="checkbox-label">
                                <input
                                    type="checkbox"
                                    name="agree"
                                    checked={inputs.agree || false}
                                    onChange={handleChange}
                                    required
                                />
                                <span>I agree to the terms and conditions *</span>
                            </label>
                        </div>
                    </div>

                    <button type="submit" className="submit-btn">Update Booking</button>
                </form>
            </div>
        </div>
    );
}

export default UpdateApphisDC;