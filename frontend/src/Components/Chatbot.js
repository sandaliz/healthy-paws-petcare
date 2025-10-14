import React, { useState, useRef, useEffect } from "react";
import "../styles/chatbot.css";
import assets from "../assets/assets";

const Chatbot = () => {
  const [messages, setMessages] = useState([
    {
      text: "👋 Hello! I'm your PetCare Assistant. Ask me about doctors, pharmacy, grooming, payments, or pet care.",
      sender: "bot",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [filteredSuggestions, setFilteredSuggestions] = useState([]);
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom when messages change
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // suggestion
  const allSuggestions = [
    "Doctor timings",
    "Consultation fee",
    "Book appointment",
    "Pharmacy hours",
    "Grooming services",
    "Grooming cost",
    "Boarding services",
    "Boarding fee",
    "Opening hours",
    "Adoption info",
    "Lost pet help",
    "Pet shop",
    "Vet contact",
    "Emergency number",
    "Hospital address"
  ];

  const sendMessage = async (customInput) => {
    const textToSend = customInput || input;
    if (!textToSend.trim()) return;

    setMessages((prev) => [...prev, { text: textToSend, sender: "user" }]);
    setInput("");
    setFilteredSuggestions([]);
    setIsLoading(true);

    try {
      const res = await fetch("http://localhost:5001/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: textToSend }),
      });
      const data = await res.json();

      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          { text: data.reply, sender: "bot" },
        ]);
        setIsLoading(false);
      }, 800);
    } catch {
      setMessages((prev) => [
        ...prev,
        { text: "⚠️ Server unavailable", sender: "bot" },
      ]);
      setIsLoading(false);
    }
  };

  // Handle input typing → show filtered suggestions
  const handleInputChange = (e) => {
    const value = e.target.value;
    setInput(value);

    if (value.length > 1) {
      const filtered = allSuggestions.filter((s) =>
        s.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredSuggestions(filtered);
    } else {
      setFilteredSuggestions([]);
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
        {/* Invisible element for auto-scrolling */}
        <div ref={messagesEndRef} />
      </div>

      {/* Suggestions */}
      {filteredSuggestions.length > 0 && (
        <div className="cb-autocomplete">
          {filteredSuggestions.map((s, i) => (
            <div
              key={i}
              className="cb-suggestion-item"
              onClick={() => sendMessage(s)}
            >
              {s}
            </div>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="cb-input">
        <input
          type="text"
          value={input}
          placeholder="💬 Type your message here..."
          onChange={handleInputChange}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        />
        <button onClick={() => sendMessage()}>➤</button>
      </div>
    </div>
  );
};

export default Chatbot;