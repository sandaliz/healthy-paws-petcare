import "./Navbar.css";

const Navbar = () => {
  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-brand">
          <h2>PetCare Management</h2>
        </div>
        <div className="navbar-links">
          <a href="/appointments" className="navbar-link">
            Appointments
          </a>
          {/* <a href="/blogs" className="navbar-link">
            Blogs
          </a> */}
          <a href="/events" className="navbar-link">
            Events
          </a>
          <a href="/ask-quesions" className="navbar-link">
            Ask Quesions
          </a>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
