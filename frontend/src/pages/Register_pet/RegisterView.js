import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../../styles/Pet_RegisterView.css";

const RegisterView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [registration, setRegistration] = useState(null);

  const API_BASE = "http://localhost:5001";

  useEffect(() => {
    axios
      .get(`${API_BASE}/api/register/${id}`)
      .then((res) => {
        if (res.data.success) setRegistration(res.data.data);
      })
      .catch((err) => {
        console.error("Error fetching registration:", err);
        toast.error("Failed to load registration details");
      });
  }, [id]);

  const deleteRegistration = async () => {
    if (window.confirm("Are you sure you want to delete this registration? This action cannot be undone.")) {
      try {
        await axios.delete(`${API_BASE}/api/register/${id}`);
        toast.success("Registration deleted successfully!");
        setTimeout(() => {
          navigate("/register/list");
        }, 1000);
      } catch (err) {
        toast.error("Failed to delete registration");
      }
    }
  };

  if (!registration) {
    return (
      <main className="registration-view-page">
        <img
          src={require("../../assets/registration_bg.png")}
          alt="background"
          className="registration-view-bg"
        />
        <div className="registration-view-overlay">
          <div className="registration-loading">
            <p>Loading registration details...</p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="registration-view-page">
      <ToastContainer />
      
      <img
        src={require("../../assets/registration_bg.png")}
        alt="background"
        className="registration-view-bg"
      />

      <div className="registration-view-overlay">
        <div className="registration-view-header">
          <h2>Pet Registration Details</h2>
          <p>
            View the complete registration information for your pet. You can edit or delete this registration as needed.
          </p>
        </div>

        <div className="registration-details-wrapper">
          {/* Owner Information Container */}
          <div className="registration-info-card">
            <div className="registration-card-header">
              <h3>Owner Information</h3>
            </div>
            <div className="registration-card-content">
              <div className="registration-info-grid">
                <div className="registration-info-field">
                  <label className="registration-field-label">Owner Name</label>
                  <div className="registration-field-value">{registration.OwnerName}</div>
                </div>
                
                <div className="registration-info-field">
                  <label className="registration-field-label">Email Address</label>
                  <div className="registration-field-value">{registration.OwnerEmail}</div>
                </div>
                
                <div className="registration-info-field">
                  <label className="registration-field-label">Phone Number</label>
                  <div className="registration-field-value">{registration.OwnerPhone}</div>
                </div>
                
                <div className="registration-info-field">
                  <label className="registration-field-label">Emergency Contact</label>
                  <div className="registration-field-value">{registration.EmergencyContact}</div>
                </div>
                
                <div className="registration-info-field full-width">
                  <label className="registration-field-label">Address</label>
                  <div className="registration-field-value">{registration.OwnerAddress}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Pet Information Container */}
          <div className="registration-info-card">
            <div className="registration-card-header">
              <h3>Pet Information</h3>
            </div>
            <div className="registration-card-content">
              <div className="registration-info-grid">
                <div className="registration-info-field">
                  <label className="registration-field-label">Pet Name</label>
                  <div className="registration-field-value">{registration.PetName}</div>
                </div>
                
                <div className="registration-info-field">
                  <label className="registration-field-label">Species</label>
                  <div className="registration-field-value">{registration.PetSpecies}</div>
                </div>
                
                <div className="registration-info-field">
                  <label className="registration-field-label">Breed</label>
                  <div className="registration-field-value">{registration.PetBreed}</div>
                </div>
                
                <div className="registration-info-field">
                  <label className="registration-field-label">Age</label>
                  <div className="registration-field-value">{registration.PetAge} years</div>
                </div>
                
                <div className="registration-info-field">
                  <label className="registration-field-label">Weight</label>
                  <div className="registration-field-value">{registration.PetWeight} kg</div>
                </div>
                
                <div className="registration-info-field">
                  <label className="registration-field-label">Blood Group</label>
                  <div className="registration-field-value">{registration.BloodGroup}</div>
                </div>
                
                <div className="registration-info-field">
                  <label className="registration-field-label">Gender</label>
                  <div className="registration-field-value">{registration.PetGender}</div>
                </div>
                
                <div className="registration-info-field full-width">
                  <label className="registration-field-label">Special Notes</label>
                  <div className="registration-field-value">
                    {registration.SpecialNotes || "No special notes provided"}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="registration-actions">
          <button
            onClick={() => navigate(`/register/edit/${id}`)}
            className="registration-edit-btn"
          >
            Edit Registration
          </button>
          <button
            onClick={deleteRegistration}
            className="registration-delete-btn"
          >
            Delete Registration
          </button>
        </div>
      </div>
    </main>
  );
};

export default RegisterView;