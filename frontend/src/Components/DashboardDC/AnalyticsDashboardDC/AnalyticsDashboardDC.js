// src/Components/DashboardDC/AnalyticsDashboardDC.js
import React, { useEffect, useState } from "react";
import { Pie, Doughnut, Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
} from "chart.js";
import api from "../../../utils/api";
import "./AnalyticsDashboardDC.css";

ChartJS.register(
  Title,
  Tooltip,
  Legend,
  ArcElement,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement
);

function AnalyticsDashboardDC() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await api.get("/api/analytics");
        console.log("Analytics response:", res.data);
        setAnalytics(res.data);
      } catch (err) {
        console.error("Failed to load analytics:", err);
        setAnalytics(null);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  // Fallback empty data
  const defaultAnalytics = {
    reviews: { good: 0, neutral: 0, bad: 0 },
    appointments: { pending: 0, upcoming: 0, completed: 0, rejected: 0, cancelled: 0 },
    services: { grooming: 0, walking: 0, both: 0, none: 0 },
    daycareUsage: Array.from({ length: 7 }, (_, i) => ({
      date: new Date(Date.now() - (6 - i) * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0],
      count: 0,
    })),
  };

  const data = analytics || defaultAnalytics;

  // Charts data
  const reviewsData = {
    labels: ["Good", "Neutral", "Bad"],
    datasets: [
      {
        data: [
          data.reviews?.good ?? 0,
          data.reviews?.neutral ?? 0,
          data.reviews?.bad ?? 0,
        ],
        backgroundColor: ["#4CAF50", "#FFEB3B", "#F44336"],
      },
    ],
  };

  const appointmentsData = {
    labels: ["Pending", "Upcoming", "Completed", "Rejected", "Cancelled"],
    datasets: [
      {
        data: [
          data.appointments?.pending ?? 0,
          data.appointments?.upcoming ?? 0,
          data.appointments?.completed ?? 0,
          data.appointments?.rejected ?? 0,
          data.appointments?.cancelled ?? 0,
        ],
        backgroundColor: ["#9E9E9E", "#42A5F5", "#4CAF50", "#F44336", "#FF9800"],
      },
    ],
  };

  const servicesData = {
    labels: ["Grooming", "Walking", "Both", "None"],
    datasets: [
      {
        data: [
          data.services?.grooming ?? 0,
          data.services?.walking ?? 0,
          data.services?.both ?? 0,
          data.services?.none ?? 0,
        ],
        backgroundColor: ["#FF9800", "#03A9F4", "#9C27B0", "#BDBDBD"],
      },
    ],
  };

  const daycareLabels = data.daycareUsage.map((d) => d.date);
  const daycareCounts = data.daycareUsage.map((d) => d.count);

  const daycareData = {
    labels: daycareLabels,
    datasets: [
      {
        label: "Pets Stayed",
        data: daycareCounts,
        borderColor: "#42A5F5",
        backgroundColor: "rgba(66, 165, 245, 0.4)",
        fill: true,
        tension: 0.3,
      },
    ],
  };

  return (
    <div className="analytics-dashboard-dc">
      <h2>Analytics Dashboard</h2>

      {loading && <p className="loading-text">Loading analytics...</p>}

      <div className="charts-grid-dc">
        {/* Reviews */}
        <div className="chart-card-dc">
          <h3>Reviews Sentiment</h3>
          <Doughnut
            data={reviewsData}
            options={{
              plugins: {
                legend: {
                  position: "right",
                },
              },
              maintainAspectRatio: false,
            }}
          />
        </div>

        {/* Appointments */}
        <div className="chart-card-dc">
          <h3>Appointments Status</h3>
          <Pie
            data={appointmentsData}
            options={{
              plugins: {
                legend: {
                  position: "right",
                },
              },
              maintainAspectRatio: false,
            }}
          />
        </div>

        {/* Services */}
        <div className="chart-card-dc">
          <h3>Services Breakdown</h3>
          <Pie
            data={servicesData}
            options={{
              plugins: {
                legend: {
                  position: "right",
                },
              },
              maintainAspectRatio: false,
            }}
          />
        </div>

        {/* Daycare Usage */}
        <div className="chart-card full-width-dc">
          <h3>Daycare Usage (Last 7 Days)</h3>
          <Line data={daycareData} />
        </div>
      </div>
    </div>
  );
}

export default AnalyticsDashboardDC;
