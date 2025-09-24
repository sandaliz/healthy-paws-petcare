import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import Calendar from "react-calendar";
import "../../styles/admindashbord.css";
import "react-calendar/dist/Calendar.css";
import heroImage from "../../assets/welcome_image.png"; 

const AdminDashboard = () => {
  const [date, setDate] = useState(new Date());
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/login");
  };

  const events = [
    { id: 1, title: "All Hands Meeting", time: "10:00 AM", color: "red" },
    { id: 2, title: "Build Production Release", time: "1:00 PM", color: "green", tag: "NEW" },
    { id: 3, title: "Client Feedback Review", time: "3:00 PM", color: "blue" },
    { id: 4, title: "Database Backup", time: "5:30 PM", color: "orange" }
  ];

  const [tasks, setTasks] = useState([
    { id: 1, text: "Review user feedback", completed: false },
    { id: 2, text: "Approve pending pet registrations", completed: false },
    { id: 3, text: "Check daily activity logs", completed: false },
    { id: 4, text: "Backup system database", completed: false }
  ]);

  const toggleTask = (id) => {
    setTasks(tasks.map((t) => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  return (
    <div className="ad-container">
      {/* Sidebar */}
      <aside className="ad-sidebar">
        <h2 className="ad-logo">🐾 Admin</h2>
        <ul>
          <li><NavLink to="/admin-dashboard">📊 Dashboard</NavLink></li>
          <li><NavLink to="/admin-dashboard/feedbacks">📝 Feedback</NavLink></li>
          <li><NavLink to="/admin-dashboard/petRegister">🐕 Pet Registration</NavLink></li>
          <li><NavLink to="/admin-dashboard/users">🔐 Users</NavLink></li>
        </ul>
        <button className="ad-logout-btn" onClick={handleLogout}>🚪 Logout</button>
      </aside>

      {/* Main Content */}
      <main className="ad-main">
        <section className="ad-hero-banner" style={{ backgroundImage: `url(${heroImage})` }}>
          <div className="ad-hero-overlay">
            <h1>Welcome Back, Admin 👋</h1>
            <p>Here’s an overview of today’s schedule and activities</p>
          </div>
        </section>

        <div className="ad-top-section">
          <section className="ad-calendar-card">
            <h2>📅 Calendar</h2>
            <Calendar onChange={setDate} value={date} />
            <p className="ad-selected-date">Selected: <b>{date.toDateString()}</b></p>
          </section>

          <section className="ad-timeline-card">
            <h2>🕒 Today's Timeline</h2>
            <ul className="ad-timeline">
              {events.map((event) => (
                <li key={event.id}>
                  <span className={`ad-dot ${event.color}`}></span>
                  <div className="ad-timeline-info">
                    <p className="ad-timeline-title">{event.title}</p>
                    <p className="ad-timeline-time">{event.time}</p>
                  </div>
                  {event.tag && <span className="ad-tag">{event.tag}</span>}
                </li>
              ))}
            </ul>
          </section>
        </div>

        <section className="ad-task-section">
          <h2>Today's Tasks</h2>
          <ul className="ad-task-list">
            {tasks.map((task) => (
              <li key={task.id} className={task.completed ? "completed" : ""} onClick={() => toggleTask(task.id)}>
                {task.completed ? "✔ " : "⬜ "} {task.text}
              </li>
            ))}
          </ul>
        </section>
      </main>
    </div>
  );
};

export default AdminDashboard;