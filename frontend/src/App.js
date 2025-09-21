// App.js (Frontend)
import './App.css';
import React from 'react';
import { Routes, Route } from 'react-router-dom';

// Public pages
import Home from './pages/Home';
import Login from './pages/User_Management/Login';
import Register from './pages/User_Management/Register'; 
import EmailVerify from './pages/User_Management/EmailVerify';
import ResetPassword from './pages/User_Management/ResetPassword';
import NewPassword from './pages/User_Management/NewPassword';

// Feedback pages
import FeedbackForm from './pages/Feed_Backs/FeedbackForm';
import FeedbackView from './pages/Feed_Backs/FeedbackView';
import FeedbackEdit from './pages/Feed_Backs/FeedbackEdit';
import FeedbackList from './pages/Feed_Backs/FeedbackList';

// Dashboards
import SuperAdminDashboard from './pages/User_Management/SuperAdminDashboard';
import AdminDashboard from './pages/User_Management/AdminDashboard';
import UserDashboard from './pages/User_Management/UserDashboard';
import FinanceManagerDashboard from './pages/User_Management/FinanceManagerDashbord';
import InventoryManagerDashboard from './pages/User_Management/InventoryManagerDashboard';
import PetCaretakerDashboard from './pages/User_Management/PetCaretakerDashbord';
import ReceptionistDashboard from './pages/User_Management/ReceptionistDashbord';

// Registration pages
import RegisterOwner from './pages/Register_pet/RegisterOwner';
import RegisterPet from './pages/Register_pet/RegisterPet';
import RegisterList from './pages/Register_pet/RegisterList';
import RegisterView from './pages/Register_pet/RegisterView';
import RegisterEdit from './pages/Register_pet/RegisterEdit';

// Chatbot
import Chatbot from './Components/Chatbot';

// New Profile Page
import ProfilePage from './pages/User_Management/ProfilePage';

//Admin panale
import FeedbackPage from "./pages/admin_dashbord/FeedbackPage";
import UsersPage from './pages/admin_dashbord/Users';
import PetRegisterPage from './pages/admin_dashbord/petRegister';

function App() {
  const currentUser = JSON.parse(localStorage.getItem("user")) || {};

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Register />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/new-password" element={<NewPassword />} />
      <Route path="/email-verify" element={<EmailVerify />} />

      {/* Feedback Routes */}
      <Route path="/feedback" element={<FeedbackForm />} />
      <Route path="/feedback/:id" element={<FeedbackView />} />
      <Route path="/feedback/edit/:id" element={<FeedbackEdit />} />
      <Route path="/my-feedbacks" element={<FeedbackList user={currentUser} />} />

      {/* Dashboard Routes */}
      <Route path="/super-admin-dashboard" element={<SuperAdminDashboard />} />
      <Route path="/admin-dashboard" element={<AdminDashboard />} />
      <Route path="/user-dashboard" element={<UserDashboard />} />
      <Route path="/finance-dashboard" element={<FinanceManagerDashboard />} />
      <Route path="/inventory-dashboard" element={<InventoryManagerDashboard />} />
      <Route path="/pet-caretaker-dashboard" element={<PetCaretakerDashboard />} />
      <Route path="/receptionist-dashboard" element={<ReceptionistDashboard />} />

      {/* Registration Routes */}
      <Route path="/register/owner" element={<RegisterOwner user={currentUser} />} />
      <Route path="/register/pet" element={<RegisterPet />} />
      <Route path="/register/list" element={<RegisterList user={currentUser} />} />
      <Route path="/register/view/:id" element={<RegisterView />} />
      <Route path="/register/edit/:id" element={<RegisterEdit />} />

      {/* Chatbot */}
      <Route path="/chatbot" element={<Chatbot />} />

      {/*Profile Page */}
      <Route path="/profile" element={<ProfilePage />} />

       {/* Admin panale Routes */}
       <Route path="/admin-dashboard/feedbacks" element={<FeedbackPage />} />
       <Route path="/admin-dashboard/users" element={<UsersPage />} />
       <Route path="/admin-dashboard/petRegister" element={<PetRegisterPage />} />
    </Routes>
  );
}

export default App;