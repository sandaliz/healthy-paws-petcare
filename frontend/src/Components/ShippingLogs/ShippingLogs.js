// src/components/ShippingLogs.js
import React, { useEffect, useState } from "react";
import axios from "axios";

function ShippingLogs() {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    const fetchShipping = async () => {
      try {
        const res = await axios.get("http://localhost:5000/shipping");
        setLogs(res.data);
      } catch (err) {
        console.error("Error loading shipping logs:", err.message);
      }
    };
    fetchShipping();
  }, []);

  return (
    <div className="shipping-logs">
      <h1>📦 Shipping Logs</h1>
      {logs.length === 0 ? (
        <p>No shipping records found.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>User</th>
              <th>Full Name</th>
              <th>Address</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Total Price</th>
              <th>Created</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => (
              <tr key={log._id}>
                <td>{log.userId?.name || "Unknown User"}</td>
                <td>{log.fullName} {log.lastName}</td>
                <td>{log.address}</td>
                <td>{log.email}</td>
                <td>{log.phone}</td>
                <td>LKR {log.totalPrice}</td>
                <td>{new Date(log.createdAt).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default ShippingLogs;