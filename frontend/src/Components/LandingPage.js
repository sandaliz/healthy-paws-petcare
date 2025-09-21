import React from "react";
import Navbar from "./Navbar"; 
import assets from "../assets/assets"; 

const LandingPage = () => {
  return (
    <div
      className="min-h-screen flex flex-col"
      style={{
        background: "linear-gradient(180deg, #FFFFFF 0%, #FFD58E 100%)",
        fontFamily: "Roboto, sans-serif",
      }}
    >
      {/* Navigation bar */}
      <Navbar />

      {/* Hero Section in Two Columns */}
      <main className="flex flex-col md:flex-row items-center justify-center flex-grow mt-24 px-6 max-w-6xl mx-auto gap-10">
        
        {/* Left Column: Text */}
        <div className="md:w-1/2 text-center md:text-left">
          <h1
            className="text-4xl sm:text-5xl font-bold mb-6"
            style={{ fontFamily: "Poppins, sans-serif", color: "#2D2D2D" }}
          >
            Welcome to <span style={{ color: "#54413C" }}>Healthy Paws</span>
          </h1>

          <p className="text-lg text-gray-700 leading-relaxed">
            At Healthy Paws, we care for your furry family members with love,
            compassion, and modern veterinary technology.  
            <br /><br />
            From preventive checkups, online consultations, to emergency care —
            we’re here to make sure tails keep wagging and paws stay healthy .
          </p>
        </div>

        {/* Right Column: Image */}
        <div className="md:w-1/2 flex justify-center">
          <img
            src={assets.home_dog || "https://placekitten.com/600/400"}
            alt="Pet Hospital"
            className="w-full max-w-md rounded-lg shadow-xl object-cover"
          />
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center py-4 bg-[#54413C] text-[#FFFFFF]">
        <p style={{ fontFamily: "Roboto, sans-serif" }}>
          © {new Date().getFullYear()} Healthy Paws · Loving Care for Every Paw
        </p>
      </footer>
    </div>
  );
};

export default LandingPage;