import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const RegisterList = ({ user }) => {
  const [email, setEmail] = useState(user?.email || "");
  const [registration, setRegistration] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const API_BASE = "http://localhost:5001";

  useEffect(() => {
    if (user?.email) setEmail(user.email);
  }, [user?.email]);

  const fetchLatest = async (targetEmail) => {
    if (!targetEmail) {
      setRegistration(null);
      return;
    }
    try {
      setLoading(true);
      const encoded = encodeURIComponent(targetEmail);
      const res = await axios.get(`${API_BASE}/api/register/user/${encoded}/latest`);
      if (res.data.success) setRegistration(res.data.data || null);
    } catch (err) {
      console.error("Error fetching latest registration:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (email) fetchLatest(email);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchLatest(email);
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-6"
      style={{ background: "linear-gradient(180deg, #FFFFFF 0%, #FFD58E 100%)" }}
    >
      <div className="bg-white shadow-2xl rounded-lg w-full max-w-4xl p-8">
        <h2 className="text-3xl font-bold mb-6 text-center">🐾 My Current Registration</h2>

        {/* Search only shows the latest registration */}
        <form onSubmit={handleSearch} className="flex gap-3 mb-6">
          <input
            className="flex-1 border p-3 rounded"
            type="email"
            placeholder="Enter your submitted email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <button
            type="submit"
            className="px-4 py-2 rounded text-white"
            style={{ backgroundColor: "#54413C" }}
          >
            View
          </button>
        </form>

        {loading ? (
          <div className="text-center text-gray-600">Loading...</div>
        ) : !registration ? (
          <div className="text-center text-gray-600">No current registration found 📝</div>
        ) : (
          <div
            onClick={() => navigate(`/register/view/${registration._id}`)}
            className="p-6 bg-[#FFD58E]/30 rounded-lg shadow hover:shadow-lg cursor-pointer"
          >
            <div className="flex justify-between items-center">
              <h3 className="font-semibold text-xl text-[#54413C]">
                {registration.PetName} ({registration.PetSpecies})
              </h3>
              <span className="text-sm text-gray-500">
                {new Date(registration.createdAt).toLocaleDateString()}
              </span>
            </div>
            <p className="text-gray-700">Breed: {registration.PetBreed}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default RegisterList;