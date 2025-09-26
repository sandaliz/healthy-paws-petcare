import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import assets from "../../assets/assets";
import "../../styles/ProfilePage.css"

const BASE_URL = "http://localhost:5001"; // hardcoded backend

const ProfilePage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({});

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
      setFormData(JSON.parse(storedUser));
    } else {
      navigate("/login");
    }
  }, [navigate]);

  const handleChange = (e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSave = async () => {
    try {
      await axios.put(`${BASE_URL}/api/users/${user._id}`, formData, { withCredentials: true });
      localStorage.setItem("user", JSON.stringify(formData));
      setUser(formData);
      setEditMode(false);
      alert("Profile updated successfully");
    } catch (err) {
      alert("Profile update failed: " + (err.response?.data?.message || err.message));
    }
  };

  const handleLogout = async () => {
    try {
      await axios.post(`${BASE_URL}/api/auth/logout`, {}, { withCredentials: true });
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      navigate("/login");
    } catch (err) {
      alert("Logout failed: " + (err.response?.data?.message || err.message));
    }
  };

  const handleSignOut = async () => {
    try {
      await axios.post(`${BASE_URL}/api/auth/logout`, {}, { withCredentials: true });
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      navigate("/signup");
    } catch (err) {
      alert("Sign out failed: " + (err.response?.data?.message || err.message));
    }
  };

  if (!user) return null;

  return (
    <div className="profile-wrapper">
      <div className="profile-card">
        
        {/* Avatar */}
        <img src={assets.profile} alt="avatar" className="profile-avatar" />
        
        {/* User Info or Editable Form */}
        {!editMode ? (
          <>
            <h2 className="profile-title">{user.name}</h2>
            <p className="profile-email">{user.email}</p>
          </>
        ) : (
          <div className="profile-form">
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="profile-input"
            />
            <input
              type="text"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="profile-input"
            />
          </div>
        )}

        {/* Buttons */}
        <div className="profile-actions">
          {!editMode ? (
            <button onClick={() => setEditMode(true)} className="profile-btn edit">
              Edit
            </button>
          ) : (
            <>
              <button onClick={handleSave} className="profile-btn save">Save</button>
              <button onClick={() => setEditMode(false)} className="profile-btn cancel">Cancel</button>
            </>
          )}
        </div>

        <div className="profile-actions">
          <button onClick={handleLogout} className="profile-btn logout">Logout</button>
          <button onClick={handleSignOut} className="profile-btn signout">Sign Out</button>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;