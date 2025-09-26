import React, { useEffect, useState } from "react";
import axios from "axios";
import "./alerts.css";

const URL = "http://localhost:5001/products";

function Alerts() {
  const [notifications, setNotifications] = useState([]);
  const [alertTypeFilter, setAlertTypeFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("");

  useEffect(() => {
    axios.get(URL)
      .then(res => {
        // ✅ Backend returns an array, not { products: [] }
        const allProducts = Array.isArray(res.data) ? res.data : res.data.products || [];
        const today = new Date();
        let alerts = [];

        allProducts.forEach((p) => {
          let expiryDate = p.expirationDate ? new Date(p.expirationDate) : null;

          // 1. Low stock alert
          if (p.currantStock <= p.minimumThreshold) {
            alerts.push({
              ...p,
              type: "lowStock",
              notificationDate: new Date(),
              message: `${p.name} stock is at ${p.currantStock}, below threshold ${p.minimumThreshold}.`
            });
          }

          // 2. Expired alert
          if (expiryDate && expiryDate <= today) {
            alerts.push({
              ...p,
              type: "expired",
              notificationDate: new Date(),
              message: `${p.name} has expired on ${expiryDate.toLocaleDateString()}.`
            });
          }

          // 3. Expiring soon alert
          let diffDays = expiryDate
            ? Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24))
            : null;
          if (expiryDate && diffDays > 0 && diffDays <= 2) {
            alerts.push({
              ...p,
              type: "expiringSoon",
              notificationDate: new Date(),
              message: `${p.name} will expire on ${expiryDate.toLocaleDateString()} (in ${diffDays} days).`
            });
          }
        });

        // Sort newest first
        alerts.sort((a, b) => b.notificationDate - a.notificationDate);

        setNotifications(alerts);
      })
      .catch(err => console.log("Error fetching alerts:", err));
  }, []);

  // 🔎 Filtering logic
  const filteredNotifications = notifications.filter((notif) => {
    let matchesType =
      alertTypeFilter === "all" ? true : notif.type === alertTypeFilter;

    let matchesDate = true;
    if (dateFilter) {
      let notifDate = notif.notificationDate.toLocaleDateString("en-CA");
      matchesDate = notifDate === dateFilter;
    }

    return matchesType && matchesDate;
  });

  // 🔎 Group by Date
  const groupByDate = () => {
    const groups = {};
    filteredNotifications.forEach((n) => {
      const dateKey = n.notificationDate.toLocaleDateString();
      if (!groups[dateKey]) groups[dateKey] = [];
      groups[dateKey].push(n);
    });
    return groups;
  };

  const groupedNotifications = groupByDate();

  return (
    <div className="alerts-container">
      {/* Page Header */}
      <div className="alerts-header">
        <h1>Notifications & Alerts</h1>
      </div>

      {/* Filters */}
      <div className="alerts-filters">
        {/* Filter by Alert Type */}
        <select
          value={alertTypeFilter}
          onChange={(e) => setAlertTypeFilter(e.target.value)}
        >
          <option value="all">All Alerts</option>
          <option value="lowStock">Low Stock</option>
          <option value="expired">Expired</option>
          <option value="expiringSoon">Expiring Soon</option>
        </select>

        {/* Filter by Date */}
        <input
          type="date"
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
        />

        {/* Reset Filters */}
        <button
          onClick={() => {
            setAlertTypeFilter("all");
            setDateFilter("");
          }}
        >
          Reset
        </button>
      </div>

      {/* Alert Results */}
      {filteredNotifications.length > 0 ? (
        <div className="alerts-list">
          {Object.keys(groupedNotifications).map((date) => (
            <div key={date} className="alert-date-group">
              <h2 className="alert-date-heading">{date}</h2>
              <table className="alerts-table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Current Stock</th>
                    <th>Threshold</th>
                    <th>Expiry Date</th>
                    <th>Time</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {groupedNotifications[date].map((alert) => (
                    <tr key={alert._id + alert.type}>
                      <td>{alert.name}</td>
                      <td>{alert.currantStock}</td>
                      <td>{alert.minimumThreshold}</td>
                      <td>
                        {alert.expirationDate
                          ? alert.expirationDate.split("T")[0]
                          : "N/A"}
                      </td>
                      <td>
                        {alert.notificationDate.toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                          second: "2-digit"
                        })}
                      </td>
                      <td>
                        {alert.type === "lowStock" && (
                          <span className="low-stock-alert">⚠️ Low Stock</span>
                        )}
                        {alert.type === "expired" && (
                          <span className="expired-alert">❌ Expired</span>
                        )}
                        {alert.type === "expiringSoon" && (
                          <span className="soon-expire-alert">⏳ Expiring Soon</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
        </div>
      ) : (
        <p className="all-stocked">No alerts found for the selected filters!</p>
      )}
    </div>
  );
}

export default Alerts;