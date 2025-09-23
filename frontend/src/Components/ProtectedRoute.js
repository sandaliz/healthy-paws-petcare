import React from "react";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user"));

  // If no token or no user → redirect to login
  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  // If token + user but user marked inactive → block
  if (user.isActive === false) {
    return (
      <div style={{ padding: "50px", textAlign: "center", color: "red" }}>
        <h2>Your account has been deactivated ❌</h2>
        <p>Please contact Admin</p>
      </div>
    );
  }

  return children;
};

export default ProtectedRoute;