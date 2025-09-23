import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import assets from "../assets/assets";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState("");
  const [user, setUser] = useState(null);

  // Load logged-in user from localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) setUser(JSON.parse(storedUser));
  }, []);

  // Highlight active tab
  useEffect(() => {
    const path = location.pathname;
    if (path.includes("feedback")) setActiveTab("feedback");
    else if (path.includes("register")) setActiveTab("register");
    else if (path.includes("chatbot")) setActiveTab("chatbot");
    else if (path.includes("user-dashboard")) setActiveTab("home");
    else setActiveTab("");
  }, [location]);

  const handleTabClick = (tab) => {
    setActiveTab(tab);
    if (tab === "home") navigate("/user-dashboard");
    else if (tab === "feedback") navigate("/feedback");
    else if (tab === "register") navigate("/register/owner");
    else if (tab === "chatbot") navigate("/chatbot");
  };

  const handleProfileClick = () => {
    navigate("/profile");
  };

  return (
    <div className="w-full border-b border-gray-200 bg-white shadow-sm fixed top-0 left-0 z-50">
      <div className="max-w-6xl mx-auto px-6 flex justify-between items-center">
        
        {/* --- Navigation tabs --- */}
        <div className="flex space-x-12 justify-center">
          <button
            onClick={() => handleTabClick("home")}
            className={`py-3 px-2 font-semibold text-md border-b-2 transition-colors ${
              activeTab === "home"
                ? "border-[#54413C] text-[#54413C]"
                : "border-transparent text-gray-600 hover:text-[#FFD58E] hover:border-[#FFD58E]"
            }`}
          >Home</button>

          <button
            onClick={() => handleTabClick("feedback")}
            className={`py-3 px-2 font-semibold text-md border-b-2 transition-colors ${
              activeTab === "feedback"
                ? "border-[#54413C] text-[#54413C]"
                : "border-transparent text-gray-600 hover:text-[#FFD58E] hover:border-[#FFD58E]"
            }`}
          >Feedback</button>

          <button
            onClick={() => handleTabClick("register")}
            className={`py-3 px-2 font-semibold text-md border-b-2 transition-colors ${
              activeTab === "register"
                ? "border-[#54413C] text-[#54413C]"
                : "border-transparent text-gray-600 hover:text-[#FFD58E] hover:border-[#FFD58E]"
            }`}
          >Register</button>

          <button
            onClick={() => handleTabClick("chatbot")}
            className={`py-3 px-2 font-semibold text-md border-b-2 transition-colors ${
              activeTab === "chatbot"
                ? "border-[#54413C] text-[#54413C]"
                : "border-transparent text-gray-600 hover:text-[#FFD58E] hover:border-[#FFD58E]"
            }`}
          >Chatbot</button>
        </div>

        {/* --- User Profile (avatar + greeting) --- */}
        {user && (
          <div
            className="flex items-center space-x-2 cursor-pointer hover:opacity-80"
            onClick={handleProfileClick}
          >
            {/* 👇 always same image for all users */}
            <img
              src={assets.profile}
              alt="profile"
              className="w-10 h-10 rounded-full border-2 border-[#54413C]"
            />
            <span className="font-semibold text-[#54413C]">
              Hi, {user.name}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default Navbar;