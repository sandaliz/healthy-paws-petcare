import React from "react";
import "./PetStore.css";

const PetStore = () => {
  return (
    <section id="petstore" className="petstore-section">
      
      {/* LEFT SIDE (Image) */}
      <div className="petstore-left">
        <img src="/images/store.jpg" alt="Pet Store" className="main-pet-img" />
      </div>

      {/* RIGHT SIDE (Text + Buttons) */}
      <div className="petstore-right">
        <h2>
          Pet Supplies For Your <br />
          <span className="highlight-text">Trusted Companion</span>
        </h2>
        <p>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod
          tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim
          veniam, quis nostrud exercitation ullamco laboris nisi ut.
        </p>
        <div className="petstore-buttons">
          <button className="glass-btn highlight">Shop Now</button>
          <button className="glass-btn">View Product →</button>
        </div>
      </div>

    </section>
  );
};

export default PetStore;