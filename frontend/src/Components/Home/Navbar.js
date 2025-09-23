import React from "react";
import "./Navbar.css";

const Navbar = () => {
  return (
    <nav className="navbar glass-effect">
      {/* Left Logo */}
      <div className="logo">Healthy Paws PetCare</div>

      {/* Center Links */}
      <ul className="nav-links">
        <li><a href="#home">Home</a></li>
        <li className="dropdown">
          <a href="#services">Services ▾</a>
          <ul className="dropdown-content">
            <li><a href="#reservation">Reservation</a></li>
            <li><a href="#petstore">Pet Store</a></li>
            <li><a href="#daycare">Pet Daycare</a></li>
          </ul>
        </li>
        <li><a href="#feedbacks">Feedbacks</a></li>
        <li><a href="#contact">Contact Us</a></li>
      </ul>

      {/* Right side buttons */}
      <div className="auth-buttons">
        <button className="btn-outline">Signup</button>
        <button className="btn-primary">Login</button>
      </div>
    </nav>
  );
};

export default Navbar;