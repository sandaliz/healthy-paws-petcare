import React from "react";
import Navbar from "./Navbar";
import Hero from "./Hero";
import PetStore from "./PetStore";
import PetDaycare from "./PetDaycare";
import Awareness from "./Awareness";
import About from "./About";
import Footer from "./Footer";
import ChatbotButton from "./ChatbotButton"; // ✅ Import chatbot button

import "./home.css";

const Home = () => {
  return (
    <div>
      <Navbar />
      <Hero />
      <PetStore />
      <PetDaycare />
      <Awareness />
      <About />
      <Footer />

      {/* ✅ Fixed chatbot button, always visible at bottom-right */}
      <ChatbotButton />
    </div>
  );
};

export default Home;