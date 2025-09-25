import React from "react";
import { FaComments } from "react-icons/fa"; // Chat bubble icon
import "./ChatbotButton.css";

export default function ChatbotButton() {
  const handleClick = () => {
    alert("Chatbot will open here! 🤖"); 
    // Later you can replace with chatbot modal logic or API
  };

  return (
    <button className="chatbot-btn" onClick={handleClick}>
      <FaComments />
    </button>
  );
}