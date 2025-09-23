import React from "react";
import "./Hero.css";

const Hero = () => {
  return (
    <section id="home" className="hero-section">
      <div className="hero-overlay">
        <div className="hero-content">
          <h1>Your pet,<br />our priority</h1>
          <p>Because every pet deserves love, care, and the best!</p>
          <div className="cta-buttons">
            <button className="glass-btn">Learn more</button>
            <button className="glass-btn highlight">Make a reservation</button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;