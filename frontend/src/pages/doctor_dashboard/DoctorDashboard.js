import { useState } from "react";
import "./DoctorDashboard.css";
import DoctorBlogs from "../doctor-blogs/DoctorBlogs";
import DoctorEvents from "../doctor-events/DoctorEvents";
import DoctorAppontments from "../doctor-appointments/DoctorAppontments";
import DoctorQuesions from "../doctor_quesions/DoctorQuesions";

const DoctorDashboard = () => {
  const keys = [

    "event-management",
    "appointment-management",
    "quesion-management",

  ];
  const [activeKey, setActiveKey] = useState("blog-management");

  return (
    <div className="dashboard-container">
      <div className="sidebar">
        <div className="sidebar-header">
          <h2>Vet Dashboard</h2>
        </div>
        <div className="sidebar-menu">
          {keys.map((key) => (
            <div
              key={key}
              className={`menu-item ${activeKey === key ? "active" : ""}`}
              onClick={() => setActiveKey(key)}
            >
              {key.replace("-", " ").replace(/\b\w/g, (l) => l.toUpperCase())}
            </div>
          ))}
        </div>
      </div>
      <div className="main-content">
        <div className="content-area">
          {activeKey === "blog-management" && <DoctorBlogs />}
          {activeKey === "event-management" && <DoctorEvents />}
          {activeKey === "appointment-management" && <DoctorAppontments />}
          {activeKey === "quesion-management" && <DoctorQuesions />}
        </div>
      </div>
    </div>
  );
};

export default DoctorDashboard;
