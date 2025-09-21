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

  // ---------- Delete staff ----------
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

  // ---------- Toggle staff active status ----------
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
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Super Admin Dashboard</h2>
        <button
          onClick={fetchStaffUsers}
          disabled={loading}
          className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:bg-blue-300 transition-colors"
        >
          <FaSync className={loading ? "animate-spin mr-2" : "mr-2"} />
          Refresh
        </button>
      </div>

      {/* Create Staff Form */}
      <form
        onSubmit={handleCreateStaff}
        className="bg-white p-6 rounded-lg shadow-md mb-8"
      >
        <h3 className="text-lg font-semibold mb-4">Create New Staff Member</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <input
            name="name"
            type="text"
            placeholder="Full Name"
            className="border border-gray-300 rounded-lg px-4 py-2"
            required
            disabled={creating}
          />
          <input
            name="email"
            type="email"
            placeholder="Email"
            className="border border-gray-300 rounded-lg px-4 py-2"
            required
            disabled={creating}
          />
          <input
            name="password"
            type="password"
            placeholder="Password"
            className="border border-gray-300 rounded-lg px-4 py-2"
            required
            minLength="6"
            disabled={creating}
          />
          <select
            name="role"
            className="border border-gray-300 rounded-lg px-4 py-2"
            required
            disabled={creating}
          >
            <option value="">Select Role</option>
            {staffRoles.map((role) => (
              <option key={role} value={role}>
                {role.replace(/_/g, " ")}
              </option>
            ))}
          </select>
        </div>
        <button
          type="submit"
          disabled={creating}
          className="mt-4 bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700"
        >
          {creating ? "Creating..." : "Create Staff"}
        </button>
      </form>

      {/* Staff List */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold">Staff Members</h3>
        </div>

        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading staff users...</div>
        ) : staffUsers.length === 0 ? (
          <div className="p-8 text-center text-gray-500">No staff users found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {staffUsers.map((user) => (
                  <tr key={user._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      {editingUser === user._id ? (
                        <input
                          type="text"
                          value={editForm.name}
                          onChange={(e) => handleEditChange("name", e.target.value)}
                          className="border rounded px-2 py-1"
                        />
                      ) : (
                        user.name
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {editingUser === user._id ? (
                        <input
                          type="email"
                          value={editForm.email}
                          onChange={(e) => handleEditChange("email", e.target.value)}
                          className="border rounded px-2 py-1"
                        />
                      ) : (
                        user.email
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {editingUser === user._id ? (
                        <select
                          value={editForm.role}
                          onChange={(e) => handleEditChange("role", e.target.value)}
                          className="border rounded px-2 py-1"
                        >
                          {allRoles.map((role) => (
                            <option key={role} value={role}>
                              {role.replace(/_/g, " ")}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                          {user.role}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {editingUser === user._id ? (
                        <select
                          value={editForm.isActive}
                          onChange={(e) => handleEditChange("isActive", e.target.value === "true")}
                          className="border rounded px-2 py-1"
                        >
                          <option value={true}>Active</option>
                          <option value={false}>Inactive</option>
                        </select>
                      ) : (
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${user.isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                          {user.isActive ? "Active" : "Inactive"}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex space-x-2">
                        {editingUser === user._id ? (
                          <>
                            <button onClick={() => saveEditUser(user._id)} className="text-green-600 hover:text-green-900">
                              <FaSave size={16} />
                            </button>
                            <button onClick={cancelEdit} className="text-red-600 hover:text-red-900">
                              <FaTimes size={16} />
                            </button>
                          </>
                        ) : (
                          <>
                            <button onClick={() => startEditUser(user)} className="text-blue-600 hover:text-blue-900">
                              <FaEdit size={16} />
                            </button>
                            <button
                              onClick={() => handleToggleActive(user._id, user.isActive)}
                              className={`p-1 rounded ${
                                user.isActive ? "text-green-600 hover:text-green-900" : "text-gray-400 hover:text-gray-600"
                              }`}
                            >
                              {user.isActive ? <FaToggleOn size={18} /> : <FaToggleOff size={18} />}
                            </button>
                            <button onClick={() => handleDelete(user._id)} className="text-red-600 hover:text-red-900">
                              <FaTrash size={16} />
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