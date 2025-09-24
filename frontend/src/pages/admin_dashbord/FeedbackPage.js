// src/pages/admin_dashbord/FeedbackPage.js
import React, { useEffect, useState } from "react";
import axios from "axios";
import { NavLink, useNavigate } from "react-router-dom";

// Chart.js
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import ChartDataLabels from "chartjs-plugin-datalabels";

// PDF Export
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

// Styles
import "../../styles/admindashbord.css";
import "../../styles/feedback.css";

// Assets
import logo from "../../assets/logo.png";

// Register Chart plugins
ChartJS.register(ArcElement, Tooltip, Legend, ChartDataLabels);

const FeedbackPage = () => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [report, setReport] = useState(null);
  const [readFeedbacks, setReadFeedbacks] = useState({});
  const navigate = useNavigate();

  /* ================================
     AUTH HANDLER
  ================================= */
  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/login");
  };

  /* ================================
     FETCHING DATA
  ================================= */
  const fetchFeedbacks = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/feedback");
      if (res.data.success) setFeedbacks(res.data.data);
    } catch (err) {
      console.error("Error fetching feedbacks:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/feedback/stats/average-rating");
      if (res.data.success) setStats(res.data.data);
    } catch (err) {
      console.error("Error fetching stats:", err);
    }
  };

  const fetchReport = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/feedback/report");
      if (res.data.success) setReport(res.data);
    } catch (err) {
      console.error("Report fetch error:", err);
    }
  };

  useEffect(() => {
    fetchFeedbacks();
    fetchStats();
    fetchReport();
  }, []);

  /* ================================
     ACTION HANDLERS
  ================================= */
  const deleteFeedback = async (id) => {
    if (!window.confirm("Delete this feedback?")) return;
    try {
      await axios.delete(`http://localhost:5000/api/feedback/${id}`);
      setFeedbacks(feedbacks.filter((f) => f._id !== id));
      fetchStats();
      fetchReport();
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  const toggleRead = (id) => {
    setReadFeedbacks((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  /* ================================
     CHART CONFIG
  ================================= */
  const pieData = stats
    ? {
        labels: ["Positive", "Negative"],
        datasets: [
          {
            data: [stats.goodRatings, stats.badRatings],
            backgroundColor: ["#54413C", "#FFD58E"],
            borderColor: ["#fff", "#fff"],
            borderWidth: 2,
          },
        ],
      }
    : null;

  const pieOptions = {
    plugins: {
      legend: { position: "bottom" },
      datalabels: {
        formatter: (value, context) => {
          const total = context.dataset.data.reduce((a, b) => a + b, 0);
          return total ? `${((value / total) * 100).toFixed(0)}%` : "0%";
        },
        color: "#fff",
        font: { weight: "bold", size: 12 },
      },
    },
    maintainAspectRatio: false,
  };

  /* ================================
     PDF BUILDER
  ================================= */
  const buildPDF = () => {
    const doc = new jsPDF("p", "mm", "a4");

    // Header
    doc.setFillColor(84, 65, 60);
    doc.rect(0, 0, 210, 40, "F");
    doc.addImage(logo, "PNG", 15, 5, 25, 25);
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(255, 255, 255);
    doc.text("PetCare Admin", 15, 37);
    doc.setFontSize(18);
    doc.text("Customer Feedback Report", 60, 22);
    const today = new Date().toLocaleDateString();
    doc.setFontSize(10);
    doc.text(`Generated on: ${today}`, 160, 22);

    // Summary
    let y = 50;
    doc.setFontSize(12);
    doc.setTextColor(20);
    doc.text(`Total Feedbacks: ${report.counts.total}`, 15, y);
    y += 8;
    doc.text(`Good Feedbacks: ${report.counts.good}`, 15, y);
    y += 8;
    doc.text(`Bad Feedbacks: ${report.counts.bad}`, 15, y);
    y += 10;

    // Pie Chart
    const chartCanvas = document.querySelector("canvas");
    if (chartCanvas) {
      const chartImg = chartCanvas.toDataURL("image/png", 1.0);
      doc.addImage(chartImg, "PNG", 55, y, 100, 100);
      y += 110;
    }

    // Good Feedbacks Table
    doc.setTextColor(0, 100, 0);
    doc.text("Good Feedbacks", 15, y);
    const goodRows = report.feedbacks.good.map(fb => [
      fb.petOwnerName, fb.petName, `${fb.rating}/5`, fb.message,
    ]);
    autoTable(doc, {
      startY: y + 5,
      head: [["Owner", "Pet", "Rating", "Message"]],
      body: goodRows,
      theme: "grid",
      styles: { fontSize: 10, cellPadding: 3 },
      headStyles: { fillColor: [84, 65, 60], textColor: 255 },
    });

    // Bad Feedbacks Table
    y = doc.lastAutoTable.finalY + 10;
    doc.setTextColor(150, 0, 0);
    doc.text("Bad Feedbacks", 15, y);
    const badRows = report.feedbacks.bad.map(fb => [
      fb.petOwnerName, fb.petName, `${fb.rating}/5`, fb.message,
    ]);
    autoTable(doc, {
      startY: y + 5,
      head: [["Owner", "Pet", "Rating", "Message"]],
      body: badRows,
      theme: "grid",
      styles: { fontSize: 10, cellPadding: 3 },
      headStyles: { fillColor: [200, 50, 50], textColor: 255 },
    });

    return doc;
  };

  const previewPDF = () => {
    const doc = buildPDF();
    const pdfUrl = doc.output("bloburl");
    window.open(pdfUrl, "_blank");
  };

  const downloadPDF = () => {
    const doc = buildPDF();
    doc.save("Feedback_Report.pdf");
  };

  /* ================================
     RENDER
  ================================= */
  return (
    <div className="dashboard-container">
      {/* Sidebar */}
      <aside className="sidebar">
        <h2 className="logo">🐾 Admin</h2>
        <ul>
          <li><NavLink to="/admin-dashboard">📊 Dashboard</NavLink></li>
          <li><NavLink to="/admin-dashboard/feedbacks">📝 Feedback</NavLink></li>
          <li><NavLink to="/admin-dashboard/petRegister">🐕 Pet Registration</NavLink></li>
          <li><NavLink to="/admin-dashboard/users">👥 Users</NavLink></li>
        </ul>
        <button className="logout-btn" onClick={handleLogout}>🚪 Logout</button>
      </aside>

      {/* Main Content */}
      <main className="dashboard-content">
        <div className="section-header">
          <h2>📝 Customer Feedback</h2>
          <p className="subtitle">
            Insights into customer experience, satisfaction trends, and service quality
          </p>
        </div>

        {loading ? (
          <p>Loading feedbacks...</p>
        ) : feedbacks.length === 0 ? (
          <p>No feedback available.</p>
        ) : (
          <table className="feedback-table">
            <thead>
              <tr>
                <th>Read</th>
                <th>Owner</th>
                <th>Pet</th>
                <th>Email</th>
                <th>Message</th>
                <th>Rating</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {feedbacks.map((fb) => (
                <tr key={fb._id}>
                  <td>
                    <input
                      type="checkbox"
                      checked={!!readFeedbacks[fb._id]}
                      onChange={() => toggleRead(fb._id)}
                    />
                  </td>
                  <td>{fb.petOwnerName}</td>
                  <td>{fb.petName}</td>
                  <td>{fb.email}</td>
                  <td>{fb.message}</td>
                  <td>{"⭐".repeat(fb.rating)}</td>
                  <td>
                    <button className="btn-delete" onClick={() => deleteFeedback(fb._id)}>
                      🗑 Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {stats && (
          <div className="feedback-stats-container">
            {/* Chart */}
            <div className="chart-container small-chart">
              <h3>📊 Feedback Ratio</h3>
              <div className="chart-wrapper">
                <Pie data={pieData} options={pieOptions} />
              </div>
            </div>

            {/* Tips */}
            <div className="tips-container">
              <h3>💡 How to Improve Feedback</h3>
              <ul>
                <li>Respond quickly to customer concerns ⏱</li>
                <li>Show gratitude for every feedback 🙏</li>
                <li>Train staff for empathy and care 💕</li>
                <li>Turn negatives into opportunities ✨</li>
                <li>Reward loyal and positive customers 🎁</li>
              </ul>
            </div>
          </div>
        )}

        {report && (
          <div className="report-buttons">
            <button className="btn-preview" onClick={previewPDF}>👀 Preview Report</button>
            <button className="btn-download" onClick={downloadPDF}>📥 Download Report</button>
          </div>
        )}
      </main>
    </div>
  );
};

export default FeedbackPage;
