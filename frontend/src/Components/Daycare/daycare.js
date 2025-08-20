import React from 'react';
import './daycare.css';


function daycare() {
  return (
    <div className="daycare-container">
      {/* Hero Section */}
      <section className="daycare-hero">
        <h1>🐾 Safe & Loving Pet Daycare & Boarding</h1>
        <p>Give your pet a second home while you’re away.</p>
        
        <a href="/daycare/appointment" className="btn-appointment">
          Make Appointment
        </a>
      </section>

      {/* Why Choose Us */}
      <section className="why-choose">
        <h2>Why Choose Our Daycare?</h2>
        <div className="why-list">
          <div className="why-item">💖 Loving Care</div>
          <div className="why-item">🍖 Healthy Meals</div>
          <div className="why-item">🏃 Play & Exercise</div>
          <div className="why-item">👩‍⚕️ Vet Support</div>
        </div>
      </section>

      {/* Services */}
      <section className="services">
        <h2>Our Daycare Services</h2>
        <div className="service-cards">
          <div className="service-card">
            <h3>Daycare Stay</h3>
            <p>Half-day or full-day stays with supervised playtime.</p>
            <a href="/daycare/appointment" className="btn-small">
              Book Now
            </a>
          </div>
          <div className="service-card">
            <h3>Overnight Boarding</h3>
            <p>Comfortable boarding with feeding & walks included.</p>
            <a href="/daycare/appointment" className="btn-small">
              Book Now
            </a>
          </div>
          <div className="service-card">
            <h3>Grooming</h3>
            <p>Keep your pet fresh & clean with our grooming service.</p>
            <a href="/daycare/appointment" className="btn-small">
              Book Now
            </a>
          </div>
          <div className="service-card">
            <h3>Walking</h3>
            <p>Daily walks to keep your pet active and happy.</p>
            <a href="/daycare/appointment" className="btn-small">
              Book Now
            </a>
          </div>
        </div>
      </section>

      {/* Booking CTA */}
      <section className="booking-cta">
        <h2>Ready to Book?</h2>
        <p>Fill out our daycare appointment form and reserve a spot for your pet today.</p>
        <a href="/daycare/appointment" className="btn-appointment">
          Make Appointment
        </a>
      </section>

      {/* Testimonials */}
      <section className="testimonials">
        <h2>Happy Pets, Happy Owners</h2>
        <div className="testimonial-list">
          <div className="testimonial">🐶 "Max loves his playtime here!" – Sarah</div>
          <div className="testimonial">🐱 "Luna is always cared for like family." – David</div>
        </div>
      </section>

      {/* Rules & Policies */}
      <section className="rules">
        <h2>Daycare Rules & Policies</h2>
        <ul>
          <li>Pets must be fully vaccinated.</li>
          <li>Owners must provide feeding & medical instructions.</li>
          <li>Emergency vet care will be authorized if needed.</li>
        </ul>
      </section>

      {/* Contact Section */}
      <section className="contact">
        <h2>Contact Us</h2>
        <p>Pet Hospital Daycare Center</p>
        <p>+94 77 123 4567</p>
        <p>daycare@pethospital.com</p>
        <p>Open: Mon – Sat, 8:00 AM – 7:00 PM</p>
      </section>
    </div>
  )
}

export default daycare