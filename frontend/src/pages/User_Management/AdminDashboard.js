import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom"; // ✅ added useNavigate
import Calendar from "react-calendar";
import "../../styles/admindashbord.css";
import "react-calendar/dist/Calendar.css";
import heroImage from "../../assets/welcome_image.png"; 

const AdminDashboard = () => {
  const [date, setDate] = useState(new Date());
  const navigate = useNavigate(); // ✅ hook for navigation

  // ✅ Define Logout function
  const handleLogout = () => {
    localStorage.removeItem("user"); // clear auth/session
    navigate("/login"); // redirect back to login
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
    setTasks(
      tasks.map((task) =>
        task.id === id ? { ...task, completed: !task.completed } : task
      )
    );
  };

  return (
    <div className="dashboard-container">
      {/* Sidebar */}
      <aside className="sidebar">
        <h2 className="logo">🐾 Admin</h2>
        <ul>
          <li><NavLink to="/admin-dashboard">📊 Dashboard</NavLink></li>
          <li><NavLink to="/admin-dashboard/feedbacks">📝 Feedback</NavLink></li>
          <li><NavLink to="/admin-dashboard/petRegister">🐕 Pet Registration</NavLink></li>
          <li><NavLink to="/admin-dashboard/users">🔐 Users</NavLink></li>
        </ul>
        {/* ✅ Logout Button now works */}
        <button className="logout-btn" onClick={handleLogout}>🚪 Logout</button>
      </aside>

      {/* Main Content */}
      <main className="dashboard-content">
        {/* Full Hero Image Banner */}
        <section
          className="hero-banner"
          style={{ backgroundImage: `url(${heroImage})` }}
        >
          <div className="hero-overlay">
            <h1>Welcome Back, Admin 👋</h1>
            <p>Here’s an overview of today’s schedule and activities</p>
          </div>
        </section>

        {/* Calendar + Timeline */}
        <div className="top-section">
          <section className="calendar-card">
            <h2>📅 Calendar</h2>
            <Calendar onChange={setDate} value={date} />
            <p className="selected-date">
              Selected: <b>{date.toDateString()}</b>
            </p>
          </section>

          <section className="timeline-card">
            <h2>🕒 Today's Timeline</h2>
            <ul className="timeline">
              {events.map((event) => (
                <li key={event.id}>
                  <span className={`dot ${event.color}`}></span>
                  <div className="timeline-info">
                    <p className="timeline-title">{event.title}</p>
                    <p className="timeline-time">{event.time}</p>
                  </div>
                  {event.tag && <span className="tag">{event.tag}</span>}
                </li>
              ))}
            </ul>
          </section>
        </div>

        {/* Task Section */}
        <section className="task-section">
          <h2>Today's Tasks</h2>
          <ul className="task-list">
            {tasks.map((task) => (
              <li
                key={task.id}
                className={task.completed ? "completed" : ""}
                onClick={() => toggleTask(task.id)}
              >
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