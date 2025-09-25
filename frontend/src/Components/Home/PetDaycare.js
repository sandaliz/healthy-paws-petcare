import React from "react";
import { Link } from "react-router-dom";
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
          <p className="subtitle">At our Pet Daycare, we create a loving environment where every wag and purr matters.</p>

          <h3>Key Features</h3>
          <ul className="feature-list">
            <li><span className="dot" /> <strong>Behavior care:</strong>Build better social & emotional skills.</li>
            <li><span className="dot" /> <strong>Custom play plans:</strong> Fun routines adapted to your pet’s needs.</li>
            <li><span className="dot" /> <strong>Ongoing support:</strong> Consistent care ensuring happy, healthy pets.</li>
          </ul>

          <Link to="/daycare"><button className="glass-btn cta-btn">Go to DayCare</button></Link>
        </div>
      </div>
    </section>
  );
};

export default PetDaycare;