import React from "react";
import { FaComments } from "react-icons/fa"; // Chat bubble icon
import { useNavigate } from "react-router-dom"; // ✅ Router hook
import "./ChatbotButton.css";

export default function ChatbotButton() {
  const navigate = useNavigate(); // ✅ Navigation hook

  const handleClick = () => {
    navigate("/chatbot"); // ✅ Redirect to chatbot route
  };

  return (
    <button className="chatbot-btn" onClick={handleClick}>
      <FaComments />
    </button>
  );
}