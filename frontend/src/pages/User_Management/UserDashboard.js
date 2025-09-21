// src/pages/UserDashboard.js
import React from "react";
import DashboardNavbar from "../../Components/Navbar";  // Nav bar (Feedbacks | Register)
import LandingPage from "../../Components/LandingPage"; // Logged-in homepage

const UserDashboard = () => {
  return (
    <div>
      {/* Top Navigation Bar */}
      <DashboardNavbar />

      {/* Landing Page content as dashboard */}
      <div className="mt-20">
        <LandingPage />
      </div>
    </div>
  );
};

export default UserDashboard;