import React from 'react';
import { Link } from 'react-router-dom';
import './daycare.css';

function Daycare() {
  return (
    <div className="dc-container">
      {/* Hero */}
      <section className="dc-hero">
      <img
        src="/images/daycare-hero.jpg"
        alt="Happy pets at daycare"
        className="dc-hero-image"
      />
      <div className="dc-hero-overlay">
        <h1>Safe & Loving Pet Daycare & Boarding</h1>
        <p>Give your pet a second home while you’re away.</p>
        <div className="dc-hero-buttons">
          <Link to="/addappointmentDC" className="dc-btn dc-btn-appointment">
            Make Appointment
          </Link>
          <Link to="/appointmentDC" className="dc-btn dc-btn-secondary">
            My Bookings
          </Link>
          <Link to="/reviews" className="dc-btn dc-btn-review">
            Add Review
          </Link>
        </div>
      </div>
    </section>

      {/* Why Choose */}
      <section className="dc-why">
        <h2>Why Choose Our Daycare?</h2>
        <div className="dc-why-list">
          <div className="dc-why-item">Loving Care</div>
          <div className="dc-why-item">Healthy Meals</div>
          <div className="dc-why-item">Play & Exercise</div>
          <div className="dc-why-item">Vet Support</div>
        </div>
      </section>

      {/* Services */}
      <section className="dc-services">
        <h2>Our Daycare Services</h2>
        <div className="dc-service-cards">
          <div className="dc-service-card">
            <img src="/images/daycare-stay.jpg" alt="Daycare Stay" className="dc-service-img" />
            <h3>Daycare Stay</h3>
            <p>Half-day or full-day stays with supervised playtime.</p>
            <Link to="/addappointmentDC" className="dc-btn dc-btn-small">Book Now</Link>
          </div>
          <div className="dc-service-card">
            <img src="/images/overnight-boarding.jpg" alt="Overnight Boarding" className="dc-service-img" />
            <h3>Overnight Boarding</h3>
            <p>Comfortable boarding with feeding & walks included.</p>
            <Link to="/addappointmentDC" className="dc-btn dc-btn-small">Book Now</Link>
          </div>
          <div className="dc-service-card dc-no-booking">
            <img src="/images/grooming.jpg" alt="Grooming" className="dc-service-img" />
            <h3>Grooming</h3>
            <p>Keep your pet fresh & clean with our grooming service.<br />
              <span className="dc-note">(Available only for pets staying in daycare)</span>
            </p>
          </div>
          <div className="dc-service-card dc-no-booking">
            <img src="/images/walking.jpg" alt="Walking" className="dc-service-img" />
            <h3>Walking</h3>
            <p>Daily walks to keep your pet active and happy.<br />
              <span className="dc-note">(Available only for pets staying in daycare)</span>
            </p>
          </div>
        </div>
      </section>

      {/* Booking CTA */}
      <section className="dc-booking-cta">
        <h2>Ready to Book?</h2>
        <p>Fill out our daycare appointment form and reserve a spot for your pet today.</p>
        
      </section>

      {/* Testimonials */}
      <section className="dc-testimonials">
        <h2>Happy Pets, Happy Owners</h2>
        <div className="dc-testimonial-list">
          <div className="dc-testimonial"> "Max loves his playtime here!" – Sarah</div>
          <div className="dc-testimonial"> "Luna is always cared for like family." – David</div>
        </div>
      </section>

      {/* Rules */}
      <section className="dc-rules">
        <h2>Daycare Rules & Policies</h2>
        <ul>
          <li>Pets must be fully vaccinated.</li>
          <li>Owners must provide medical instructions.</li>
          <li>Emergency vet care will be authorized if needed.</li>
        </ul>
      </section>

      {/* Contact */}
      <section className="dc-contact">
        <h2>Contact Us</h2>
        <p>Pet Hospital Daycare Center</p>
        <p>+94 77 123 4567</p>
        <p>daycare@pethospital.com</p>
        <p>Open: Mon – Sat, 8:00 AM – 7:00 PM</p>
      </section>
    </div>
  );
}

export default Daycare;
