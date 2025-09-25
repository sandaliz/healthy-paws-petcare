import React from "react";
import "./Footer.css";
import { FaFacebookF, FaInstagram, FaTwitter, FaLinkedinIn } from "react-icons/fa";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-container">

        {/* Column 1 - Logo / About */}
        <div className="footer-column">
          <h3>PetCare</h3>
          <p>
            Caring for pets, one paw at a time.   
            Providing love, resources, and awareness to pet lovers everywhere. 
          </p>
        </div>

        {/* Column 2 - Links */}
        <div className="footer-column">
          <h3>Quick Links</h3>
          <ul className="footer-links">
            <li><a href="/about">About</a></li>
            <li><a href="/blog">Blog</a></li>
            <li><a href="/events">Events</a></li>
            <li><a href="/contact">Contact</a></li>
            <li><a href="/privacy">Privacy Policy</a></li>
          </ul>
        </div>

        {/* Column 3 - Social */}
        <div className="footer-column">
          <h3>Follow Us</h3>
          <div className="footer-social">
  <a href="https://www.facebook.com" target="_blank" rel="noopener noreferrer"><FaFacebookF /></a>
  <a href="https://www.instagram.com" target="_blank" rel="noopener noreferrer"><FaInstagram /></a>
  <a href="https://www.twitter.com" target="_blank" rel="noopener noreferrer"><FaTwitter /></a>
  <a href="https://www.linkedin.com" target="_blank" rel="noopener noreferrer"><FaLinkedinIn /></a>
</div>
        </div>

      </div>

      {/* Bottom bar */}
      <div className="footer-bottom">
        © {new Date().getFullYear()} <span>Healthy Paws PetCare</span>. All Rights Reserved.
      </div>
    </footer>
  );
}