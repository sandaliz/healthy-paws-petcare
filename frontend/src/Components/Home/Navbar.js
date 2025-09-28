import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { UserCircleIcon } from "@heroicons/react/24/solid";
import "./Navbar.css";

const Navbar = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    setUser(null);
    navigate("/login");
  };

  return (
    <nav className="navbar glass-effect">
      {/* Left Logo */}
      <div className="logo">Healthy Paws PetCare</div>

      {/* Center Links */}
      <ul className="nav-links">
        <li><a href="#home">Home</a></li>
        <li><a href="/register/owner">Register</a></li>
        <li><a href="#about">Vaccine Plan</a></li>
        <li><a href="/feedback">Feedbacks</a></li>
      </ul>

      {/* Right Side (Auth) */}
      <div className="auth-buttons">
        {user ? (
          <>
            <div className="profile-section">
             <Link to="/profile"> <UserCircleIcon /> </Link>
              <span>{user.name}</span>
             
            </div>
            <button onClick={handleLogout} className="btn-outline">Logout</button>
          </>
        ) : (
          <>
            <Link to="/signup"><button className="btn-outline">Signup</button></Link>
            <Link to="/login"><button className="btn-primary">Login</button></Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;