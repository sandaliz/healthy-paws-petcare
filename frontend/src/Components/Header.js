import React from 'react';
import { useNavigate } from "react-router-dom";
import assets from '../assets/assets';
import './Header.css'; // Import custom CSS

const Header = () => {
  const navigate = useNavigate();

  return (
    <div className="header-container">
      {/* Header Image */}
      <img 
        src={assets.header_img} 
        alt="Pet mascot" 
        className="header-img" 
      />

      {/* Heading */}
      <h1 className="header-title">
        Hey PetLover 
        <img 
          className="header-wave" 
          src={assets.hand_wave} 
          alt="wave hand" 
        />
      </h1>

      <h2 className="header-subtitle">
        Welcome to our website
      </h2>
      
      <p className="header-text">
        Welcome to our Pet Care Center! Let’s take a quick tour so you can see 
        how we keep your furry friends happy and healthy.
      </p>

      {/* Get Started → Goes to Login */}
      <button 
        onClick={() => navigate("/login")}
        className="header-btn"
      >
        Log in
      </button>
    </div>
  );
};

export default Header;