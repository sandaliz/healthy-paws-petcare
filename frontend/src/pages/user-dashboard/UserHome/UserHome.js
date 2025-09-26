import "./UserHome.css";
import { Link } from "react-router-dom";

const UserHome = () => {
  return (
    <div className="user-home">

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <h1>Trusted Veterinary Care</h1>
          <h2>
            Caring for your pets with <span className="highlight">love</span>{" "}
            and <span className="highlight">expertise</span>
          </h2>
          <p>
            Book appointments, explore services, and keep your furry friends
            happy and healthy with our dedicated veterinary team.
          </p>
          <div className="hero-buttons">
            <Link to="/appointments" className="btn-primary">
              Book Appointment
            </Link>
          </div>
        </div>
        <div className="hero-image">
          <img
            src="https://hips.hearstapps.com/hmg-prod/images/dog-puppy-on-garden-royalty-free-image-1586966191.jpg?crop=1xw:0.74975xh;0,0.190xh&resize=1200:*"
            alt="Happy dog in garden"
          />
        </div>
      </section>

      {/* Additional Content Section */}
      <section className="content-section">
        <h2>Our Services</h2>
        <div className="services-grid">
          <div className="service-card">
            <img
              src="https://media.4-paws.org/9/c/9/7/9c97c38666efa11b79d94619cc1db56e8c43d430/Molly_006-2829x1886-2726x1886-1920x1328.jpg"
              alt="Cat receiving care"
            />
            <h3>Preventive Care</h3>
            <p>Regular check-ups and vaccinations to keep your pets healthy.</p>
          </div>
          <div className="service-card">
            <img
              src="https://cdn.britannica.com/16/234216-050-C66F8665/beagle-hound-dog.jpg"
              alt="Beagle dog"
            />
            <h3>Emergency Services</h3>
            <p>
              24/7 emergency care for when your pet needs immediate attention.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default UserHome;
