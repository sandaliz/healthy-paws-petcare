import React from "react";
import Navbar from "./Navbar";
import Hero from "./Hero";
import PetStore from "./PetStore";
import PetDaycare from "./PetDaycare";
import About from "./About";
import "./home.css";

const Home = () => {
import React from 'react'
import {Link} from 'react-router-dom';

function home() {
  return (
    <div>
      <Navbar />
      <Hero />
      <PetStore />
      <PetDaycare />
      <About />

        <Link to = "/daycare" className = "active daycare">
        <h2>Daycare</h2>
        </Link>
        <Link to = "/dashboardDC" className = "active daycare">
        <h2>Daycare</h2>
        </Link>
    </div>
  );
};

export default Home;