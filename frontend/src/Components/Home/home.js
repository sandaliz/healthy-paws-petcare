import React from "react";
import Navbar from "./Navbar";
import Hero from "./Hero";
import PetStore from "./PetStore";
import PetDaycare from "./PetDaycare";
import About from "./About";
import "./home.css";

const Home = () => {
  return (
    <div>
      <Navbar />
      <Hero />
      <PetStore />
      <PetDaycare />
      <About />

    </div>
  );
};

export default Home;