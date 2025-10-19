import React, { useState } from "react";
import Calendar from "react-calendar";
import "../../styles/admindashbord.css";
import "react-calendar/dist/Calendar.css";
import heroImage from "../../assets/welcome_image.png"; 
import AdminSidebar from "./AdminSidebar";

const AdminDashboard = () => {
  const [date, setDate] = useState(new Date());

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
    setTasks(tasks.map((t) => 
      t.id === id ? { ...t, completed: !t.completed } : t
    ));
  };

  return (
    <div className="admin-dashboard-container">
      <AdminSidebar />

      <main className="admin-main-content">
        <section className="admin-hero-section" style={{ backgroundImage: `url(${heroImage})` }}>
          <div className="admin-hero-overlay">
            <h1 className="admin-welcome-title">Welcome Back, Admin</h1>
            <p className="admin-welcome-subtitle">Here's an overview of today's schedule and activities</p>
          </div>
        </section>

        <div className="admin-content-grid">
          <section className="admin-calendar-section">
            <div className="admin-card">
              <h2>Calendar</h2>
              <Calendar onChange={setDate} value={date} />
              <p className="admin-selected-date">Selected: <strong>{date.toDateString()}</strong></p>
            </div>
          </section>

          <section className="admin-timeline-section">
            <div className="admin-card">
              <h2>Today's Timeline</h2>
              <ul className="admin-timeline-list">
                {events.map((event) => (
                  <li key={event.id} className="admin-timeline-item">
                    <span className={`admin-timeline-dot admin-dot-${event.color}`}></span>
                    <div className="admin-timeline-content">
                      <p className="admin-timeline-title">{event.title}</p>
                      <p className="admin-timeline-time">{event.time}</p>
                    </div>
                    {event.tag && <span className="admin-timeline-tag">{event.tag}</span>}
                  </li>
                ))}
              </ul>
            </div>
          </section>

          <section className="admin-tasks-section">
            <div className="admin-card">
              <h2>Today's Tasks</h2>
              <ul className="admin-task-list">
                {tasks.map((task) => (
                  <li
                    key={task.id}
                    className={`admin-task-item ${task.completed ? 'admin-task-completed' : 'admin-task-pending'}`}
                    onClick={() => toggleTask(task.id)}
                  >
                    <span className="admin-task-checkbox">
                      {task.completed ? "✓" : "○"}
                    </span>
                    <span className="admin-task-text">{task.text}</span>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;