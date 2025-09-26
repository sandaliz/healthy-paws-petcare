import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

const RegisterView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [registration, setRegistration] = useState(null);

  const API_BASE = "http://localhost:5001";

  useEffect(() => {
    axios
      .get(`${API_BASE}/api/register/${id}`)
      .then((res) => {
        if (res.data.success) setRegistration(res.data.data);
      })
      .catch((err) => console.error("Error fetching registration:", err));
  }, [id]);

  const deleteRegistration = async () => {
    try {
      await axios.delete(`${API_BASE}/api/register/${id}`);
      alert("🐾 Registration deleted successfully!");
      navigate("/register/list");
    } catch (err) {
      alert("❌ Failed to delete registration");
    }
  };

  if (!registration) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading registration...</p>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center px-6"
      style={{ background: "linear-gradient(180deg, #FFFFFF 0%, #FFD58E 100%)" }}
    >
      <div className="bg-white shadow-2xl rounded-lg w-full max-w-3xl p-8">
        <h2 className="text-3xl font-bold mb-6 text-center">Pet Registration Details 🐶🐱</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="col-span-1 md:col-span-2 font-semibold text-[#54413C]">Owner Information</div>
          <div><strong>Owner Name:</strong> {registration.OwnerName}</div>
          <div><strong>Owner Email:</strong> {registration.OwnerEmail}</div>
          <div><strong>Owner Phone:</strong> {registration.OwnerPhone}</div>
          <div><strong>Emergency Contact:</strong> {registration.EmergencyContact}</div>
          <div className="md:col-span-2"><strong>Address:</strong> {registration.OwnerAddress}</div>

          <div className="col-span-1 md:col-span-2 font-semibold text-[#54413C] mt-4">Pet Information</div>
          <div><strong>Pet Name:</strong> {registration.PetName}</div>
          <div><strong>Species:</strong> {registration.PetSpecies}</div>
          <div><strong>Breed:</strong> {registration.PetBreed}</div>
          <div><strong>Age:</strong> {registration.PetAge}</div>
          <div><strong>Weight:</strong> {registration.PetWeight} kg</div>
          <div><strong>Blood Group:</strong> {registration.BloodGroup}</div>
          <div><strong>Gender:</strong> {registration.PetGender}</div>
          <div className="md:col-span-2"><strong>Notes:</strong> {registration.SpecialNotes || "—"}</div>

          <div className="col-span-1 md:col-span-2 text-sm text-gray-500 mt-2">
            <div>Created: {new Date(registration.createdAt).toLocaleString()}</div>
            <div>Updated: {new Date(registration.updatedAt).toLocaleString()}</div>
          </div>
        </div>

        <div className="flex gap-4 mt-8 justify-center">
          <button
            onClick={() => navigate(`/register/edit/${id}`)}
            className="px-6 py-2 bg-[#FFD58E] text-[#54413C] rounded-lg"
          >
            ✏ Edit
          </button>
          <button
            onClick={deleteRegistration}
            className="px-6 py-2 bg-[#54413C] text-white rounded-lg"
          >
            🗑 Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default RegisterView;