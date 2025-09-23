import './App.css';
import React from 'react';
import { Routes, Route } from 'react-router-dom';

// ---------------- Public pages ----------------
import Home from './pages/Home';
import Login from './pages/User_Management/Login';
import Register from './pages/User_Management/Register'; 
import EmailVerify from './pages/User_Management/EmailVerify';
import ResetPassword from './pages/User_Management/ResetPassword';
import NewPassword from './pages/User_Management/NewPassword';

// ---------------- Feedback pages ----------------
import FeedbackForm from './pages/Feed_Backs/FeedbackForm';
import FeedbackView from './pages/Feed_Backs/FeedbackView';
import FeedbackEdit from './pages/Feed_Backs/FeedbackEdit';
import FeedbackList from './pages/Feed_Backs/FeedbackList';

// ---------------- Dashboards ----------------
import SuperAdminDashboard from './pages/User_Management/SuperAdminDashboard';
import AdminDashboard from './pages/User_Management/AdminDashboard';
import UserDashboard from './pages/User_Management/UserDashboard';
import FinanceManagerDashboard from './pages/User_Management/FinanceManagerDashbord';
import InventoryManagerDashboard from './pages/User_Management/InventoryManagerDashboard';
import PetCaretakerDashboard from './pages/User_Management/PetCaretakerDashbord';
import ReceptionistDashboard from './pages/User_Management/ReceptionistDashbord';

// ---------------- Registration pages ----------------
import RegisterOwner from './pages/Register_pet/RegisterOwner';
import RegisterPet from './pages/Register_pet/RegisterPet';
import RegisterList from './pages/Register_pet/RegisterList';
import RegisterView from './pages/Register_pet/RegisterView';
import RegisterEdit from './pages/Register_pet/RegisterEdit';

// ---------------- Chatbot & Profile ----------------
import Chatbot from './Components/Chatbot';
import ProfilePage from './pages/User_Management/ProfilePage';

// ---------------- Admin Panel ----------------
import FeedbackPage from "./pages/admin_dashbord/FeedbackPage";
import UsersPage from './pages/admin_dashbord/Users';
import PetRegisterPage from './pages/admin_dashbord/petRegister';

// ---------------- Protected Route ----------------
import ProtectedRoute from "./Components/ProtectedRoute";

// ---------------- Inventory System ----------------
import Products from "./Components/product/product";
import Addproducts from "./Components/addproducts/addproducts";
import Updateproduct from "./Components/updateproducts/updateproduct";
import Alerts from "./Components/notifications&alerts/alerts";
import PrescriptionList from "./Components/prescription/PrescriptionList";
import Insights from "./Components/insights/insights";
import InventoryHome from "./Components/Home/home";   // renamed to avoid clash with pages/Home

// Layouts
import InventoryLayout from "./layouts/InventoryLayout";
import StoreLayout from "./layouts/StoreLayout";

// ---------------- Pet Store ----------------
import PetStore from "./Components/petstore/PetStore";
import Cart from "./Components/petstore/Cart";
import PrescriptionForm from "./Components/prescription/prescriptionform";

function App() {
  const currentUser = JSON.parse(localStorage.getItem("user")) || {};

  return (
    <Routes>
      {/* -------- Public Routes -------- */}
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Register />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/new-password" element={<NewPassword />} />
      <Route path="/email-verify" element={<EmailVerify />} />

      {/* -------- Feedback -------- */}
      <Route path="/feedback" element={<FeedbackForm />} />
      <Route path="/feedback/:id" element={<FeedbackView />} />
      <Route path="/feedback/edit/:id" element={<FeedbackEdit />} />
      <Route path="/my-feedbacks" element={<FeedbackList user={currentUser} />} />

      {/* -------- Dashboards (Protected) -------- */}
      <Route path="/super-admin-dashboard" element={
        <ProtectedRoute><SuperAdminDashboard /></ProtectedRoute>
      }/>
      <Route path="/admin-dashboard" element={
        <ProtectedRoute><AdminDashboard /></ProtectedRoute>
      }/>
      <Route path="/user-dashboard" element={
        <ProtectedRoute><UserDashboard /></ProtectedRoute>
      }/>
      <Route path="/finance-dashboard" element={
        <ProtectedRoute><FinanceManagerDashboard /></ProtectedRoute>
      }/>
      <Route path="/inventory-dashboard" element={
        <ProtectedRoute><InventoryManagerDashboard /></ProtectedRoute>
      }/>
      <Route path="/pet-caretaker-dashboard" element={
        <ProtectedRoute><PetCaretakerDashboard /></ProtectedRoute>
      }/>
      <Route path="/receptionist-dashboard" element={
        <ProtectedRoute><ReceptionistDashboard /></ProtectedRoute>
      }/>

      {/* -------- Registration -------- */}
      <Route path="/register/owner" element={<RegisterOwner user={currentUser} />} />
      <Route path="/register/pet" element={<RegisterPet />} />
      <Route path="/register/list" element={<RegisterList user={currentUser} />} />
      <Route path="/register/view/:id" element={<RegisterView />} />
      <Route path="/register/edit/:id" element={<RegisterEdit />} />

      {/* -------- Profile & Chatbot -------- */}
      <Route path="/chatbot" element={<Chatbot />} />
      <Route path="/profile" element={<ProfilePage />} />

      {/* -------- Admin Panel -------- */}
      <Route path="/admin-dashboard/feedbacks" element={<FeedbackPage />} />
      <Route path="/admin-dashboard/users" element={<UsersPage />} />
      <Route path="/admin-dashboard/petRegister" element={<PetRegisterPage />} />

      {/* -------- Inventory System -------- */}
      <Route path="/home" element={<InventoryHome />} />
      <Route element={<InventoryLayout />}>
        <Route path="/product" element={<Products />} />
        <Route path="/addproduct" element={<Addproducts />} />
        <Route path="/updateproduct/:id" element={<Updateproduct />} />
        <Route path="/alerts" element={<Alerts />} />   
        <Route path="/prescription-list" element={<PrescriptionList />} />
        <Route path="/report" element={<Products />} />
        <Route path="/insights" element={<Insights />} />
      </Route>

      {/* -------- Pet Store -------- */}
      <Route element={<StoreLayout />}>
        <Route path="/store" element={<PetStore />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/cart/:id" element={<Cart />} />
      </Route>

      {/* -------- Standalone -------- */}
      <Route path="/prescription" element={<PrescriptionForm />} />
    </Routes>
  );
}

export default App;