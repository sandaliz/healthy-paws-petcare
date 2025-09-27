import React from "react";
import { Link } from "react-router-dom";
import "./Hero.css";

const Hero = () => {
  return (
    <section id="home" className="hero-section">
      <div className="hero-overlay">
        <div className="hero-content">
          <h1>Your pet,<br />our priority</h1>
          <p>Because every pet deserves love, care, and the best!</p>
          <div className="cta-buttons">
            <Link to="/ask-quesions"><button className="glass-btn">Ask A Vet</button></Link>
            <Link to="/appointments"><button className="glass-btn highlight">Make a reservation</button></Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;