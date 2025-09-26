import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import {
  FaEdit,
  FaTrash,
  FaToggleOn,
  FaToggleOff,
  FaSync,
  FaSave,
  FaTimes,
} from "react-icons/fa";
import "../../styles/superAdminDashboard.css";// ✅ import CSS

const SuperAdminDashboard = () => {
  const [staffUsers, setStaffUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [editForm, setEditForm] = useState({
    name: "",
    email: "",
    role: "",
    isActive: true,
  });

  const staffRoles = [
    "ADMIN",
    "INVENTORY_MANAGER",
    "RECEPTIONIST",
    "PET_CARE_TAKER",
    "FINANCE_MANAGER",
  ];

  const allRoles = [...staffRoles, "USER"];

  // ---------- Fetch staff users ----------
  const fetchStaffUsers = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("http://localhost:5001/api/users/staff", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setStaffUsers(response.data);
    } catch (error) {
      console.error("Fetch error:", error);
      toast.error(error.response?.data?.message || "Failed to fetch staff users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaffUsers();
  }, []);

  // ---------- Create new staff ----------
  const handleCreateStaff = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const { name, email, password, role } = Object.fromEntries(formData);

    if (!name || !email || !password || !role) {
      toast.error("All fields are required");
      return;
    }

    setCreating(true);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        "http://localhost:5001/api/users/staff",
        { name, email, password, role },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        toast.success("Staff created successfully");
        setStaffUsers((prev) => [...prev, response.data.user]);
        e.target.reset();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Staff creation failed");
    } finally {
      setCreating(false);
    }
  };

  // ---------- Editing functions ----------
  const startEditUser = (user) => {
    setEditingUser(user._id);
    setEditForm({
      name: user.name,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
    });
  };

  const cancelEdit = () => {
    setEditingUser(null);
    setEditForm({ name: "", email: "", role: "", isActive: true });
  };

  const saveEditUser = async (userId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.put(
        `http://localhost:5001/api/users/${userId}`,
        editForm,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        toast.success("User updated successfully");
        setStaffUsers((prev) =>
          prev.map((user) =>
            user._id === userId ? response.data.user : user
          )
        );
        setEditingUser(null);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update user");
    }
  };

  const handleEditChange = (field, value) => {
    setEditForm((prev) => ({ ...prev, [field]: value }));
  };

  // ---------- Delete staff ----------
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this staff member?")) return;

    try {
      const token = localStorage.getItem("token");
      const response = await axios.delete(
        `http://localhost:5001/api/users/staff/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        toast.success("Staff deleted successfully");
        setStaffUsers((prev) => prev.filter((user) => user._id !== id));
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete staff");
    }
  };

  // ---------- Toggle staff active status ----------
  const handleToggleActive = async (id, currentStatus) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.put(
        `http://localhost:5001/api/users/staff/${id}/toggle`,
        { isActive: !currentStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        toast.success("Status updated successfully");
        setStaffUsers((prev) =>
          prev.map((user) =>
            user._id === id ? { ...user, isActive: !currentStatus } : user
          )
        );
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update status");
    }
  };

  return (
    <div className="sad-container">
      {/* Header */}
      <div className="sad-header">
        <h2 className="sad-title">Super Admin Dashboard</h2>
        <button
          onClick={fetchStaffUsers}
          disabled={loading}
          className="sad-refresh-btn"
        >
          <FaSync className={loading ? "animate-spin" : ""} /> Refresh
        </button>
      </div>

      {/* Create Staff Form */}
      <form onSubmit={handleCreateStaff} className="sad-form">
        <h3>Create New Staff Member</h3>
        <div className="sad-form-grid">
          <input name="name" type="text" placeholder="Full Name" className="sad-input" required disabled={creating} />
          <input name="email" type="email" placeholder="Email" className="sad-input" required disabled={creating} />
          <input name="password" type="password" placeholder="Password" className="sad-input" required minLength="6" disabled={creating} />
          <select name="role" className="sad-select" required disabled={creating}>
            <option value="">Select Role</option>
            {staffRoles.map((role) => (
              <option key={role} value={role}>{role.replace(/_/g, " ")}</option>
            ))}
          </select>
        </div>
        <button type="submit" disabled={creating} className="sad-submit-btn">
          {creating ? "Creating..." : "Create Staff"}
        </button>
      </form>

      {/* Staff List */}
      <div className="sad-list-container">
        <div className="sad-list-header">
          <h3>Staff Members</h3>
        </div>

        {loading ? (
          <div className="p-8 text-center">Loading staff users...</div>
        ) : staffUsers.length === 0 ? (
          <div className="p-8 text-center">No staff users found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="sad-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {staffUsers.map((user) => (
                  <tr key={user._id} className="sad-row">
                    <td>
                      {editingUser === user._id ? (
                        <input
                          type="text"
                          value={editForm.name}
                          onChange={(e) => handleEditChange("name", e.target.value)}
                          className="sad-input"
                        />
                      ) : (
                        user.name
                      )}
                    </td>
                    <td>
                      {editingUser === user._id ? (
                        <input
                          type="email"
                          value={editForm.email}
                          onChange={(e) => handleEditChange("email", e.target.value)}
                          className="sad-input"
                        />
                      ) : (
                        user.email
                      )}
                    </td>
                    <td>
                      {editingUser === user._id ? (
                        <select
                          value={editForm.role}
                          onChange={(e) => handleEditChange("role", e.target.value)}
                          className="sad-select"
                        >
                          {allRoles.map((role) => (
                            <option key={role} value={role}>{role.replace(/_/g, " ")}</option>
                          ))}
                        </select>
                      ) : (
                        <span className="sad-status active">{user.role}</span>
                      )}
                    </td>
                    <td>
                      {editingUser === user._id ? (
                        <select
                          value={editForm.isActive}
                          onChange={(e) => handleEditChange("isActive", e.target.value === "true")}
                          className="sad-select"
                        >
                          <option value={true}>Active</option>
                          <option value={false}>Inactive</option>
                        </select>
                      ) : (
                        <span className={`sad-status ${user.isActive ? "active" : "inactive"}`}>
                          {user.isActive ? "Active" : "Inactive"}
                        </span>
                      )}
                    </td>
                    <td>
                      <div className="sad-actions">
                        {editingUser === user._id ? (
                          <>
                            <button onClick={() => saveEditUser(user._id)} className="save"><FaSave /></button>
                            <button onClick={cancelEdit} className="cancel"><FaTimes /></button>
                          </>
                        ) : (
                          <>
                            <button onClick={() => startEditUser(user)} className="edit"><FaEdit /></button>
                            <button
                              onClick={() => handleToggleActive(user._id, user.isActive)}
                              className={user.isActive ? "toggle-active" : "toggle-inactive"}
                            >
                              {user.isActive ? <FaToggleOn /> : <FaToggleOff />}
                            </button>
                            <button onClick={() => handleDelete(user._id)} className="delete"><FaTrash /></button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default SuperAdminDashboard;