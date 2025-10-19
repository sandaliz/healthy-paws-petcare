import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import assets from "../../../assets/assets";
import "../css/ProfilePage.css";
import PromotionTab from "./PromotionTab";
import PaymentSummary from "./PaymentSummary";
import banner from "../images/profile_banner.jpg";
import { User, Receipt, Sparkles } from "lucide-react";

const BASE_URL = "http://localhost:5001";

export default function ProfilePage() {
  const nav = useNavigate();
  const [user, setUser] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({});
  const [activeTab, setActiveTab] = useState("profile");
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return nav("/login");
    axios
      .get(`${BASE_URL}/api/users/me`, { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => {
        const { user, register } = res.data;
        setUser(user);
        setFormData({ ...user, ...register });
      })
      .catch(() => nav("/login"));
  }, [nav]);

  const change = (e) => setFormData((p) => ({ ...p, [e.target.name]: e.target.value }));

  const save = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.put(`${BASE_URL}/api/users/me`, formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUser(res.data.user);
      setEditMode(false);
      alert("Profile updated!");
    } catch (e) {
      alert(e.message);
    }
  };

  const logout = () => {
    localStorage.clear();
    nav("/login");
  };

  const labelIcon = (label) => {
    if (/pet/i.test(label)) return "🐾";
    if (/phone/i.test(label)) return "📞";
    if (/email/i.test(label)) return "📧";
    if (/address/i.test(label)) return "🏠";
    if (/emergency/i.test(label)) return "🚨";
    if (/owner/i.test(label)) return "👤";
    return "📄";
  };

  if (!user) return null;

  return (
    <div className="profileU-wrapper">
      <div className="profileU-shell">
        {/* Sidebar */}
        <aside className="profileU-side">
          <button
            className="client-finance-sidebar-brand"
            onClick={() => nav('/')}
            aria-label="Back to home"
          >
            <span className="client-finance-sidebar-logo">🐾</span>
            <span className="client-finance-sidebar-title">Healthy Paws</span>
          </button>
          <div className="client-finance-sidebar-divider" aria-hidden="true"></div>
          <nav className="profileU-nav">
            <button
              className={`profileU-navLink ${activeTab === "profile" ? "active" : ""}`}
              onClick={() => setActiveTab("profile")}
            >
              <User size={22} /> <span>Profile</span>
            </button>
            <button
              className={`profileU-navLink ${activeTab === "ledger" ? "active" : ""}`}
              onClick={() => setActiveTab("ledger")}
            >
              <Receipt size={22} /> <span>PayLog</span>
            </button>
            <button
              className={`profileU-navLink ${activeTab === "promotion" ? "active" : ""}`}
              onClick={() => setActiveTab("promotion")}
            >
              <Sparkles size={22} /> <span>PawPerks</span>
            </button>
          </nav>
          <div className="client-finance-sidebar-footer">
            <button
              className="profileU-logout client-finance-sidebar-logout"
              onClick={() => setShowModal(true)}
            >
              Logout
            </button>
          </div>
        </aside>

        {/* Main */}
        <main className="profileU-main">
          {activeTab === "profile" && (
            <>
              <div className="profileU-banner">
                <img src={banner} alt="cover" className="profileU-bannerImg" />
                <img
                  src={user.avatarUrl || assets.profile}
                  alt="avatar"
                  className="profileU-avatar"
                />
                <div className="profileU-basic">
                  <h1>{user.name}</h1>
                  <p className="profileU-role">Pet Owner</p>
                </div>
                <button
                  onClick={() => setEditMode((m) => !m)}
                  className="profileU-editBtn"
                >
                  {editMode ? "Cancel" : "Edit Profile"}
                </button>
              </div>

              <div className="profileU-content">
                <div className="profileU-card">
                  <h2>Your Details</h2>
                  <div className="profileU-grid">
                    {[
                      "name",
                      "email",
                      "OwnerName",
                      "OwnerPhone",
                      "EmergencyContact",
                      "OwnerAddress",
                      "PetName",
                    ].map((f) => (
                      <div key={f} className="profileU-field">
                        <label>
                          {labelIcon(f)} {f}
                        </label>
                        {!editMode ? (
                          <p>{formData[f] || "–"}</p>
                        ) : (
                          <input
                            name={f}
                            value={formData[f] || ""}
                            onChange={change}
                          />
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="profileU-btnRow">
                    {editMode && (
                      <button className="profileU-saveBtn" onClick={save}>
                        Save Changes
                      </button>
                    )}
                    <button
                      className="profileU-logout"
                      onClick={() => setShowModal(true)}
                    >
                      Logout
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}

          {activeTab === "ledger" && (
            <div className="profileU-content profileU-ledger">
              <PaymentSummary embedded />
            </div>
          )}
          {activeTab === "promotion" && (
            <div className="profileU-full pawperks-full">
              <PromotionTab userId={user._id} />
            </div>
          )}
        </main>
      </div>

      {/* --- LOGOUT MODAL --- */}
      {showModal && (
        <div className="profileU-modalBackdrop" onClick={() => setShowModal(false)}>
          <div className="profileU-modal" onClick={(e) => e.stopPropagation()}>
            <div className="profileU-modalIcon">🐾</div>
            <h3>Leaving so soon?</h3>
            <p>Do you want to log out of your Healthy Paws account?</p>
            <div className="profileU-modalActions">
              <button
                className="profileU-btnCancel"
                onClick={() => setShowModal(false)}
              >
                Stay
              </button>
              <button className="profileU-btnConfirm" onClick={logout}>
                Yes, Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}