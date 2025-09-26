import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

const RegisterEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const API_BASE = "http://localhost:5001";

  const [form, setForm] = useState(null);

  useEffect(() => {
    axios
      .get(`${API_BASE}/api/register/${id}`)
      .then((res) => {
        if (res.data.success) setForm(res.data.data);
      })
      .catch((err) => console.error(err));
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const user = JSON.parse(localStorage.getItem("user"));

      const payload = {
        ...form,
        PetAge: form.PetAge ? Number(form.PetAge) : 0,
        PetWeight: form.PetWeight ? Number(form.PetWeight) : 0,
        userId: user?._id, // ✅ attach userId
      };

      await axios.put(`${API_BASE}/api/register/${id}`, payload);
      alert("Updated successfully ✅");
      navigate(`/register/view/${id}`);
    } catch (err) {
      console.error(err?.response?.data || err);
      alert("❌ Update failed, please check inputs");
    }
  };

  if (!form) return <p className="mt-20">Loading...</p>;

  return (
    <div
      className="min-h-screen flex items-center justify-center px-6"
      style={{ background: "linear-gradient(180deg,#fff 0%,#FFD58E 100%)" }}
    >
      <div className="bg-white shadow-2xl rounded-lg max-w-3xl p-8 w-full">
        <h2 className="text-2xl font-bold mb-6">Edit Registration ✏️</h2>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Owner */}
          <div className="md:col-span-2 font-semibold text-[#54413C]">Owner Information</div>

          <label className="block">
            <span className="text-sm text-gray-700">Owner Name</span>
            <input
              name="OwnerName"
              className="w-full border p-2 rounded"
              value={form.OwnerName || ""}
              onChange={handleChange}
              required
            />
          </label>

          <label className="block">
            <span className="text-sm text-gray-700">Owner Email</span>
            <input
              type="email"
              name="OwnerEmail"
              className="w-full border p-2 rounded"
              value={form.OwnerEmail || ""}
              onChange={handleChange}
              required
            />
          </label>

          <label className="block">
            <span className="text-sm text-gray-700">Owner Phone</span>
            <input
              name="OwnerPhone"
              className="w-full border p-2 rounded"
              value={form.OwnerPhone || ""}
              onChange={handleChange}
              required
            />
          </label>

          <label className="block">
            <span className="text-sm text-gray-700">Emergency Contact</span>
            <input
              name="EmergencyContact"
              className="w-full border p-2 rounded"
              value={form.EmergencyContact || ""}
              onChange={handleChange}
              required
            />
          </label>

          <label className="block md:col-span-2">
            <span className="text-sm text-gray-700">Address</span>
            <input
              name="OwnerAddress"
              className="w-full border p-2 rounded"
              value={form.OwnerAddress || ""}
              onChange={handleChange}
              required
            />
          </label>

          {/* Pet */}
          <div className="md:col-span-2 font-semibold text-[#54413C] mt-2">Pet Information</div>

          <label className="block">
            <span className="text-sm text-gray-700">Pet Name</span>
            <input
              name="PetName"
              className="w-full border p-2 rounded"
              value={form.PetName || ""}
              onChange={handleChange}
              required
            />
          </label>

          <label className="block">
            <span className="text-sm text-gray-700">Species</span>
            <select
              name="PetSpecies"
              className="w-full border p-2 rounded"
              value={form.PetSpecies || "dog"}
              onChange={handleChange}
              required
            >
              <option value="dog">Dog</option>
              <option value="cat">Cat</option>
            </select>
          </label>

          <label className="block">
            <span className="text-sm text-gray-700">Breed</span>
            <input
              name="PetBreed"
              className="w-full border p-2 rounded"
              value={form.PetBreed || ""}
              onChange={handleChange}
              required
            />
          </label>

          <label className="block">
            <span className="text-sm text-gray-700">Age (years)</span>
            <input
              type="number"
              min="0"
              name="PetAge"
              className="w-full border p-2 rounded"
              value={form.PetAge ?? ""}
              onChange={handleChange}
              required
            />
          </label>

          <label className="block">
            <span className="text-sm text-gray-700">Weight (kg)</span>
            <input
              type="number"
              step="0.1"
              min="0"
              name="PetWeight"
              className="w-full border p-2 rounded"
              value={form.PetWeight ?? ""}
              onChange={handleChange}
              required
            />
          </label>

          <label className="block">
            <span className="text-sm text-gray-700">Blood Group</span>
            <select
              name="BloodGroup"
              className="w-full border p-2 rounded"
              value={form.BloodGroup || "O+"}
              onChange={handleChange}
              required
            >
              <option value="A+">A+</option>
              <option value="A-">A-</option>
              <option value="B+">B+</option>
              <option value="B-">B-</option>
              <option value="AB+">AB+</option>
              <option value="AB-">AB-</option>
              <option value="O+">O+</option>
              <option value="O-">O-</option>
            </select>
          </label>

          <label className="block">
            <span className="text-sm text-gray-700">Gender</span>
            <select
              name="PetGender"
              className="w-full border p-2 rounded"
              value={form.PetGender || "Male"}
              onChange={handleChange}
              required
            >
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </select>
          </label>

          <label className="block md:col-span-2">
            <span className="text-sm text-gray-700">Special Notes</span>
            <textarea
              name="SpecialNotes"
              className="w-full border p-2 rounded"
              value={form.SpecialNotes || ""}
              onChange={handleChange}
              rows={3}
            />
          </label>

          <div className="md:col-span-2 flex gap-3 justify-end mt-2">
            <button
              type="button"
              className="px-4 py-2 rounded bg-gray-200"
              onClick={() => navigate(-1)}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded text-white"
              style={{ backgroundColor: "#54413C" }}
            >
              ✅ Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegisterEdit;