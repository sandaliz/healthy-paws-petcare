// import React, { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import axios from "axios";
// import assets from "../../../assets/assets";
// import "../../../styles/ProfilePage.css";
// import PromotionTab from "./PromotionTab"
// import PaymentSummary from "./PaymentSummary";

// const BASE_URL = "http://localhost:5001";

// const ProfilePage = () => {
//   const navigate = useNavigate();
//   const [user, setUser] = useState(null);
//   const [editMode, setEditMode] = useState(false);
//   const [formData, setFormData] = useState({});
//   const [activeTab, setActiveTab] = useState("profile");

//   useEffect(() => {
//     const token = localStorage.getItem("token");

//     if (!token) {
//       navigate("/login");
//       return;
//     }

//     axios
//       .get(`${BASE_URL}/api/users/me`, {
//         headers: { Authorization: `Bearer ${token}` },
//       })
//       .then((res) => {
//         const { user, register } = res.data;
//         setUser(user);
//         setFormData({ ...user, ...register });
//       })
//       .catch(() => {
//         navigate("/login");
//       });
//   }, [navigate]);

//   const handleChange = (e) =>
//     setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));

//   const handleSave = async () => {
//     try {
//       const token = localStorage.getItem("token");

//       const response = await axios.put(
//         `${BASE_URL}/api/users/me`,
//         formData,
//         {
//           headers: { Authorization: `Bearer ${token}` },
//           withCredentials: true,
//         }
//       );

//       localStorage.setItem("user", JSON.stringify(response.data.user));
//       setUser(response.data.user);
//       setFormData({ ...response.data.user, ...response.data.register });
//       setEditMode(false);
//       alert("Profile updated successfully");
//     } catch (err) {
//       alert(
//         "Profile update failed: " +
//         (err.response?.data?.message || err.message)
//       );
//     }
//   };

//   const handleLogout = async () => {
//     try {
//       await axios.post(
//         `${BASE_URL}/api/auth/logout`,
//         {},
//         { withCredentials: true }
//       );
//       localStorage.removeItem("user");
//       localStorage.removeItem("token");
//       navigate("/login");
//     } catch (err) {
//       alert(
//         "Logout failed: " +
//         (err.response?.data?.message || err.message)
//       );
//     }
//   };

//   const handleSignOut = async () => {
//     try {
//       await axios.post(
//         `${BASE_URL}/api/auth/logout`,
//         {},
//         { withCredentials: true }
//       );
//       localStorage.removeItem("user");
//       localStorage.removeItem("token");
//       navigate("/signup");
//     } catch (err) {
//       alert(
//         "Sign out failed: " +
//         (err.response?.data?.message || err.message)
//       );
//     }
//   };

//   if (!user) return null;

//   return (
//     <div className="user-profile-modern">
//       <div className="user-profile-container">
//         {/* Sidebar */}
//         <div className="user-profile-sidebar">
//           <div className="user-sidebar-header">
//             <img src={assets.profile} alt="avatar" className="user-profile-avatar" />
//             <div className="user-basic-info">
//               <h2 className="user-display-name">{user.name}</h2>
//               <p className="user-role">User</p>
//             </div>
//           </div>

//           <div className="user-sidebar-menu">
//             <div
//               className={`user-menu-item ${activeTab === "profile" ? "user-menu-active" : ""}`}
//               onClick={() => setActiveTab("profile")}
//             >
//               <span>Profile Information</span>
//             </div>
//             <div
//               className={`user-menu-item ${activeTab === "ledger" ? "user-menu-active" : ""
//                 }`}
//               onClick={() => setActiveTab("ledger")}
//             >
//               <span>PayLog</span>
//             </div>

//             <div
//               className={`user-menu-item ${activeTab === "promotion" ? "user-menu-active" : ""}`}
//               onClick={() => setActiveTab("promotion")}
//             >
//               <span>PawPerks</span>
//             </div>
//           </div>
//         </div>

//         {/* Main Content */}
//         <div className="user-profile-content">
//           <div className="user-content-header">
//             <h1 className="user-page-title">User Profile</h1>
//           </div>

//           {activeTab === "profile" && (
//             <div className="user-tab-content">
//               <div className="user-section-card">
//                 <div className="user-section-header">
//                   <h3 className="user-section-title">Personal Information</h3>
//                   {!editMode ? (
//                     <button
//                       onClick={() => setEditMode(true)}
//                       className="user-edit-btn"
//                     >
//                       Edit Profile
//                     </button>
//                   ) : (
//                     <div className="user-edit-actions">
//                       <button onClick={handleSave} className="user-save-btn">
//                         Save Changes
//                       </button>
//                       <button
//                         onClick={() => setEditMode(false)}
//                         className="user-cancel-btn"
//                       >
//                         Cancel
//                       </button>
//                     </div>
//                   )}
//                 </div>

//                 <div className="user-info-grid">
//                   {!editMode ? (
//                     <>
//                       <div className="user-info-item">
//                         <label className="user-info-label">Full Name</label>
//                         <p className="user-info-value">{user.name}</p>
//                       </div>
//                       <div className="user-info-item">
//                         <label className="user-info-label">Email</label>
//                         <p className="user-info-value">{user.email}</p>
//                       </div>
//                       <div className="user-info-item">
//                         <label className="user-info-label">Owner Name</label>
//                         <p className="user-info-value">{formData.OwnerName || "Not provided"}</p>
//                       </div>
//                       <div className="user-info-item">
//                         <label className="user-info-label">Phone</label>
//                         <p className="user-info-value">{formData.OwnerPhone || "Not provided"}</p>
//                       </div>
//                       <div className="user-info-item">
//                         <label className="user-info-label">Emergency Contact</label>
//                         <p className="user-info-value">{formData.EmergencyContact || "Not provided"}</p>
//                       </div>
//                       <div className="user-info-item">
//                         <label className="user-info-label">Address</label>
//                         <p className="user-info-value">{formData.OwnerAddress || "Not provided"}</p>
//                       </div>
//                       <div className="user-info-item">
//                         <label className="user-info-label">Pet Name</label>
//                         <p className="user-info-value">{formData.PetName || "Not provided"}</p>
//                       </div>
//                     </>
//                   ) : (
//                     <>
//                       <div className="user-info-item user-info-edit">
//                         <label className="user-info-label">Full Name</label>
//                         <input
//                           type="text"
//                           name="name"
//                           value={formData.name || ""}
//                           onChange={handleChange}
//                           className="user-edit-input"
//                         />
//                       </div>
//                       <div className="user-info-item user-info-edit">
//                         <label className="user-info-label">Email</label>
//                         <input
//                           type="text"
//                           name="email"
//                           value={formData.email || ""}
//                           onChange={handleChange}
//                           className="user-edit-input"
//                         />
//                       </div>
//                       <div className="user-info-item user-info-edit">
//                         <label className="user-info-label">Owner Name</label>
//                         <input
//                           type="text"
//                           name="OwnerName"
//                           value={formData.OwnerName || ""}
//                           onChange={handleChange}
//                           className="user-edit-input"
//                           placeholder="Owner Name"
//                         />
//                       </div>
//                       <div className="user-info-item user-info-edit">
//                         <label className="user-info-label">Phone</label>
//                         <input
//                           type="text"
//                           name="OwnerPhone"
//                           value={formData.OwnerPhone || ""}
//                           onChange={handleChange}
//                           className="user-edit-input"
//                           placeholder="Telephone Number"
//                         />
//                       </div>
//                       <div className="user-info-item user-info-edit">
//                         <label className="user-info-label">Emergency Contact</label>
//                         <input
//                           type="text"
//                           name="EmergencyContact"
//                           value={formData.EmergencyContact || ""}
//                           onChange={handleChange}
//                           className="user-edit-input"
//                           placeholder="Emergency Contact"
//                         />
//                       </div>
//                       <div className="user-info-item user-info-edit">
//                         <label className="user-info-label">Address</label>
//                         <input
//                           type="text"
//                           name="OwnerAddress"
//                           value={formData.OwnerAddress || ""}
//                           onChange={handleChange}
//                           className="user-edit-input"
//                           placeholder="Address"
//                         />
//                       </div>
//                       <div className="user-info-item user-info-edit">
//                         <label className="user-info-label">Pet Name</label>
//                         <input
//                           type="text"
//                           name="PetName"
//                           value={formData.PetName || ""}
//                           onChange={handleChange}
//                           className="user-edit-input"
//                           placeholder="Pet Name"
//                         />
//                       </div>
//                     </>
//                   )}
//                 </div>
//               </div>

//               <div className="user-action-buttons">
//                 <button onClick={handleLogout} className="user-logout-btn">
//                   Logout
//                 </button>
//                 <button onClick={handleSignOut} className="user-signout-btn">
//                   Sign Out
//                 </button>
//               </div>
//             </div>
//           )}

//           {activeTab === "ledger" && (
//             <div className="user-tab-content">
//               <PaymentSummary />
//             </div>
//           )}

//           {activeTab === "promotion" && (
//             <div className="user-tab-content">
//               <PromotionTab userId={user._id} />
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default ProfilePage;

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
          <div className="profileU-sideHeader">
            <img
              src={user.avatarUrl || assets.profile}
              alt="avatar"
              className="profileU-sideAvatar"
            />
            <div className="profileU-sideName">{user.name}</div>
          </div>
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
            <div className="profileU-full">
              <PaymentSummary />
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