import React, { useState } from "react";
import "../styles/chatbot.css";
import assets from "../assets/assets";

const Chatbot = () => {
  const [messages, setMessages] = useState([
    {
      text: "👋 Hello! I’m your PetCare Assistant. Ask me about doctors, pharmacy, grooming, payments, or pet care.",
      sender: "bot",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMsg = { text: input, sender: "user" };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    try {
      const res = await fetch("http://localhost:5001/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input }),
      });
      const data = await res.json();

      setTimeout(() => {
        setMessages((prev) => [...prev, { text: data.reply, sender: "bot" }]);
        setIsLoading(false);
      }, 900);
    } catch {
      setMessages((prev) => [
        ...prev,
        { text: "⚠️ Server unavailable", sender: "bot" },
      ]);
      setIsLoading(false);
    }
  };

  return (
    <div
      className="cb-container"
      style={{ backgroundImage: `url(${assets.pawbackground})` }}
    >
      {/* Header */}
      <div className="cb-header">
        PetCare <span className="cb-highlight">Assistant</span> 🐾
        <p className="cb-subtitle">
          Your friendly virtual vet – helping with health, timings, diet & more
        </p>
      </div>

      {/* Messages */}
      <div className="cb-messages">
        {messages.map((msg, idx) => (
          <div key={idx} className={`cb-row ${msg.sender}`}>
            {msg.sender === "bot" && (
              <img src={assets.botavatar} alt="bot" className="cb-avatar" />
            )}

            <div className={`cb-message ${msg.sender}`}>{msg.text}</div>

            {msg.sender === "user" && (
              <img src={assets.useravatar} alt="user" className="cb-avatar" />
            )}
          </div>
        ))}

        {isLoading && (
          <div className="cb-row bot">
            <img src={assets.botavatar} alt="bot" className="cb-avatar" />
            <div className="cb-message bot cb-typing">
              <span>.</span><span>.</span><span>.</span>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="cb-input">
        <input
          type="text"
          value={input}
          placeholder="💬 Type your message here..."
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        />
        <button onClick={sendMessage}>➤ Send</button>
      </div>
    </div>
  );
};

export default Chatbot;