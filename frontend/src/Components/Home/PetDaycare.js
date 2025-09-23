import React from "react";
import "./PetDaycare.css";

const PetDaycare = () => {
  return (
    <section id="daycare" className="daycare-section">
      <div className="daycare-container">
        
        {/* LEFT SIDE IMAGES */}
        <div className="daycare-images">
          <img src="/images/dayc2.jpg" alt="Pet Care 1" className="daycare-img" />
          <img src="/images/dayc3.jpg" alt="Pet Care 2" className="daycare-img" />
        </div>

        {/* RIGHT SIDE CONTENT */}
        <div className="daycare-content">
          <h2>Pet Daycare & Training</h2>
          <p className="subtitle">caring, playful and safe environment for your pets</p>

          <h3>Key Features</h3>
          <ul className="feature-list">
            <li><span className="dot" /> <strong>Behavior care:</strong> Activities to improve social and emotional skills.</li>
            <li><span className="dot" /> <strong>Custom play plans:</strong> Fun routines adapted to your pet’s needs.</li>
            <li><span className="dot" /> <strong>Ongoing support:</strong> Consistent care ensuring happy, healthy pets.</li>
          </ul>

          <button className="glass-btn cta-btn">Get Training</button>
        </div>
      </div>
    </section>
  );
};

export default PetDaycare;