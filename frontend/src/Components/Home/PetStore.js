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
          We believe every pet deserves love, comfort, and the very best products to keep them happy and healthy. From nutritious food to cozy beds and playful toys, we’re here to make caring for your furry and feathered! friends simple and joyful.
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