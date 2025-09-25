import React from "react";
import "./Awareness.css";
import awarenessImg from "../../assets/awareness.jpg"; // ✅ update with correct image name

export default function Awareness() {
  return (
    <section className="awareness-section">
      <div className="awareness-container">

        {/* LEFT CONTENT */}
        <div className="awareness-content">
          <h2>Pet Awareness</h2>
          <p>
            Discover how to provide the best care and build stronger bonds with 
            your pets. Explore our curated resources, helping you become the 
            ultimate pet guardian. 
          </p>

          {/* SINGLE BUTTON */}
          <button className="glass-btn">Blog & Events</button>
        </div>

        {/* RIGHT IMAGE */}
        <div className="awareness-image">
          <img src={awarenessImg} alt="Pet Awareness" className="awareness-img" />
        </div>

      </div>
    </section>
  );
}