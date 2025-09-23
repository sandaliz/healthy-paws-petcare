import React from 'react'
import Hero from '../components/Hero';
import Services from '../components/Services';
import Availability from '../components/Availability';
import Stats from '../components/Stats';
import FAQ from '../components/FAQ';
import Contact from '../components/Contact';
const HomePage = () => {
  return (
    <div>
              <Hero />
              <Services />
              <Availability />
              <Stats />
              <FAQ />
              <Contact />
      
    </div>
  )
}

export default HomePage
