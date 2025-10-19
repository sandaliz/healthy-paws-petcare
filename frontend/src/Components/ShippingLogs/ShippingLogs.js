import React, { useEffect, useState } from "react";
import axios from "axios";
import "./ShippingLogs.css";   // ✅ import new CSS file

function ShippingLogs() {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    const fetchShipping = async () => {
      try {
        const res = await axios.get("http://localhost:5001/shipping");
        setLogs(res.data);
      } catch (err) {
        console.error("Error loading shipping logs:", err.message);
      }
    };
    fetchShipping();
  }, []);

  // ✅ update order status
  const updateStatus = async (id, newStatus) => {
    try {
      const res = await axios.patch(
        `http://localhost:5001/shipping/${id}/status`,
        {
          orderStatus: newStatus,
        }
      );

      // Update logs in state with new status
      setLogs((prevLogs) =>
        prevLogs.map((log) =>
          log._id === id ? { ...log, orderStatus: res.data.orderStatus } : log
        )
      );
    } catch (err) {
      console.error("Error updating status:", err.message);
    }
  };

  return (
    <div className="shipping-logs">
      <h1>Shipping Logs</h1>
      {logs.length === 0 ? (
        <p>No shipping records found.</p>
      ) : (
        <div className="shipping-logs-table-wrapper">
          <table className="shipping-logs-table">
            <thead>
              <tr>
                <th>Full Name</th>
                <th>Address</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Total Price</th>
                <th>Status</th>
                <th>Created</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log._id}>
                  <td>{log.fullName} {log.lastName}</td>
                  <td>{log.address}</td>
                  <td>{log.email}</td>
                  <td>{log.phone}</td>
                  <td>LKR {log.totalPrice}</td>
                  <td>
                    {/* Status dropdown with styling */}
                    <select
                      className="shipping-status-select"
                      value={log.orderStatus}
                      onChange={(e) =>
                        updateStatus(log._id, e.target.value)
                      }
                    >
                      <option value="pending">Pending</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </td>
                  <td>{new Date(log.createdAt).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default ShippingLogs;