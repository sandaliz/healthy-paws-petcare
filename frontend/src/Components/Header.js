import React from 'react';
import { useNavigate } from "react-router-dom";
import assets from '../assets/assets';

const Header = () => {
  const navigate = useNavigate();

  return (
    <div 
      className="flex flex-col items-center mt-20 px-4 text-center"
      style={{ fontFamily: 'Roboto, sans-serif', color: '#2D2D2D', lineHeight: '1.5' }}
    >
      {/* Header Image */}
      <img 
        src={assets.header_img} 
        alt="" 
        className="w-36 h-36 rounded-full mb-6" 
      />

      {/* Heading */}
      <h1 
        className="flex items-center gap-2 text-xl sm:text-3xl font-medium mb-2"
        style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, color: '#2D2D2D' }}
      >
        Hey PetLover{' '}
        <img 
          className="w-8 aspect-square" 
          src={assets.hand_wave} 
          alt="wave hand" 
        />
      </h1>

      <h2 
        className="text-3xl sm:text-5xl font-semibold mb-4"
        style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, color: '#2D2D2D' }}
      >
        Welcome to our website
      </h2>
      
      <p className="mb-8 max-w-md">
        Welcome to our Pet Care Center! Let’s take a quick tour so you can see 
        how we keep your furry friends happy and healthy.
      </p>

      {/* Get Started → Goes to Login */}
      <button 
        onClick={() => navigate("/login")}
        className="rounded-full px-8 py-2.5 transition-all duration-300 shadow-md hover:shadow-lg hover:scale-105"
        style={{ 
          backgroundColor: '#54413C', // Dark Brown background
          color: '#FFFFFF',           // White text
          fontFamily: 'Poppins, sans-serif',
          fontWeight: 600,
          fontSize: '16px'
        }}
      >
        Log in 
      </button>
    </div>
  );
};

export default Header;