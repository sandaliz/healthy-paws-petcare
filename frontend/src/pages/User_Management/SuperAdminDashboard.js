import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import {
  FaEdit,
  FaTrash,
  FaToggleOn,
  FaToggleOff,
  FaSync,
  FaSave,
  FaTimes,
  FaSignOutAlt,
  FaPlus,
  FaUsers,
} from "react-icons/fa";
import "../../styles/superAdminDashboard.css";

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

  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    toast.success("Logged out successfully");
    navigate("/login");
  };

  const fetchStaffUsers = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("http://localhost:5000/api/users/staff", {
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
        "http://localhost:5000/api/users/staff",
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
        `http://localhost:5000/api/users/${userId}`,
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

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this staff member?")) return;

    try {
      const token = localStorage.getItem("token");
      const response = await axios.delete(
        `http://localhost:5000/api/users/staff/${id}`,
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

  const handleToggleActive = async (id, currentStatus) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.put(
        `http://localhost:5000/api/users/staff/${id}/toggle`,
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
    <div className="sad-modern-container">
      {/* Header */}
      <div className="sad-modern-header">
        <div className="sad-header-content">
          <div className="sad-title-section">
            <FaUsers className="sad-title-icon" />
            <h1 className="sad-modern-title">Super Admin Dashboard</h1>
          </div>

          <div className="sad-header-actions-modern">
            <button
              onClick={fetchStaffUsers}
              disabled={loading}
              className="sad-refresh-btn-modern"
            >
              <FaSync className={loading ? "sad-spin-animation" : ""} />
              <span>Refresh</span>
            </button>

            <button onClick={handleLogout} className="sad-logout-btn-modern">
              <FaSignOutAlt />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>

      {/* Create Staff Form */}
      <div className="sad-card-modern">
        <div className="sad-card-header">
          <FaPlus className="sad-card-icon" />
          <h3 className="sad-card-title">Create New Staff Member</h3>
        </div>
        <form onSubmit={handleCreateStaff} className="sad-form-modern">
          <div className="sad-form-grid-modern">
            <div className="sad-input-group">
              <label className="sad-input-label">Full Name</label>
              <input name="name" type="text" placeholder="Enter full name" className="sad-input-modern" required disabled={creating} />
            </div>
            <div className="sad-input-group">
              <label className="sad-input-label">Email</label>
              <input name="email" type="email" placeholder="Enter email address" className="sad-input-modern" required disabled={creating} />
            </div>
            <div className="sad-input-group">
              <label className="sad-input-label">Password</label>
              <input name="password" type="password" placeholder="Enter password" className="sad-input-modern" required minLength="6" disabled={creating} />
            </div>
            <div className="sad-input-group">
              <label className="sad-input-label">Role</label>
              <select name="role" className="sad-select-modern" required disabled={creating}>
                <option value="">Select Role</option>
                {staffRoles.map((role) => (
                  <option key={role} value={role}>{role.replace(/_/g, " ")}</option>
                ))}
              </select>
            </div>
          </div>
          <button type="submit" disabled={creating} className="sad-submit-btn-modern">
            {creating ? "Creating..." : "Create Staff Member"}
          </button>
        </form>
      </div>

      {/* Staff List */}
      <div className="sad-card-modern">
        <div className="sad-card-header">
          <FaUsers className="sad-card-icon" />
          <h3 className="sad-card-title">Staff Members ({staffUsers.length})</h3>
        </div>

        {loading ? (
          <div className="sad-loading-state">
            <FaSync className="sad-spin-animation" />
            <p>Loading staff users...</p>
          </div>
        ) : staffUsers.length === 0 ? (
          <div className="sad-empty-state">
            <FaUsers className="sad-empty-icon" />
            <p>No staff users found</p>
          </div>
        ) : (
          <div className="sad-table-container">
            <table className="sad-table-modern">
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
                  <tr key={user._id} className="sad-table-row-modern">
                    <td>
                      {editingUser === user._id ? (
                        <input
                          type="text"
                          value={editForm.name}
                          onChange={(e) => handleEditChange("name", e.target.value)}
                          className="sad-input-modern"
                        />
                      ) : (
                        <span className="sad-user-name">{user.name}</span>
                      )}
                    </td>
                    <td>
                      {editingUser === user._id ? (
                        <input
                          type="email"
                          value={editForm.email}
                          onChange={(e) => handleEditChange("email", e.target.value)}
                          className="sad-input-modern"
                        />
                      ) : (
                        <span className="sad-user-email">{user.email}</span>
                      )}
                    </td>
                    <td>
                      {editingUser === user._id ? (
                        <select
                          value={editForm.role}
                          onChange={(e) => handleEditChange("role", e.target.value)}
                          className="sad-select-modern"
                        >
                          {allRoles.map((role) => (
                            <option key={role} value={role}>{role.replace(/_/g, " ")}</option>
                          ))}
                        </select>
                      ) : (
                        <span className="sad-role-badge">{user.role.replace(/_/g, " ")}</span>
                      )}
                    </td>
                    <td>
                      {editingUser === user._id ? (
                        <select
                          value={editForm.isActive}
                          onChange={(e) => handleEditChange("isActive", e.target.value === "true")}
                          className="sad-select-modern"
                        >
                          <option value={true}>Active</option>
                          <option value={false}>Inactive</option>
                        </select>
                      ) : (
                        <span className={`sad-status-modern ${user.isActive ? "active" : "inactive"}`}>
                          {user.isActive ? "Active" : "Inactive"}
                        </span>
                      )}
                    </td>
                    <td>
                      <div className="sad-actions-modern">
                        {editingUser === user._id ? (
                          <>
                            <button onClick={() => saveEditUser(user._id)} className="sad-action-btn sad-save-btn" title="Save">
                              <FaSave />
                            </button>
                            <button onClick={cancelEdit} className="sad-action-btn sad-cancel-btn" title="Cancel">
                              <FaTimes />
                            </button>
                          </>
                        ) : (
                          <>
                            <button onClick={() => startEditUser(user)} className="sad-action-btn sad-edit-btn" title="Edit">
                              <FaEdit />
                            </button>
                            <button
                              onClick={() => handleToggleActive(user._id, user.isActive)}
                              className={`sad-action-btn ${user.isActive ? "sad-toggle-active" : "sad-toggle-inactive"}`}
                              title={user.isActive ? "Deactivate" : "Activate"}
                            >
                              {user.isActive ? <FaToggleOn /> : <FaToggleOff />}
                            </button>
                            <button onClick={() => handleDelete(user._id)} className="sad-action-btn sad-delete-btn" title="Delete">
                              <FaTrash />
                            </button>
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