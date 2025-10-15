import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

// ---------------- Public pages ----------------
import Login from './pages/User_Management/Login';
import Register from './pages/User_Management/Register';
import EmailVerify from './pages/User_Management/EmailVerify';
import ResetPassword from './pages/User_Management/ResetPassword';
import NewPassword from './pages/User_Management/NewPassword';

// ---------------- Feedback pages ----------------
import FeedbackForm from "./pages/Feed_Backs/FeedbackForm";
import FeedbackView from "./pages/Feed_Backs/FeedbackView";
import FeedbackEdit from "./pages/Feed_Backs/FeedbackEdit";
import FeedbackList from "./pages/Feed_Backs/FeedbackList";

// ---------------- Dashboards ----------------
import SuperAdminDashboard from './pages/User_Management/SuperAdminDashboard';
import AdminDashboard from './pages/admin_dashbord/AdminDashboard';
import FinanceManagerDashboard from './pages/User_Management/FinanceManagerDashbord';
import UserDashboard from './pages/User_Management/UserDashboard';
import DoctorDashboard from "./pages/doctor_dashboard/DoctorDashboard";
import UserHome from "./pages/user-dashboard/UserHome/UserHome";
import UserAppointments from "./pages/user-dashboard/UserAppontments/UserAppointments";
import UserEvents from "./pages/user-dashboard/UserEvents/UserEvents";
import UserQuesions from "./pages/user-dashboard/UserQuesions/UserQuesions";

// ---------------- Registration pages ----------------
import RegisterOwner from "./pages/Register_pet/RegisterOwner";
import RegisterPet from "./pages/Register_pet/RegisterPet";
import RegisterList from "./pages/Register_pet/RegisterList";
import RegisterView from "./pages/Register_pet/RegisterView";
import RegisterEdit from "./pages/Register_pet/RegisterEdit";

// ---------------- Chatbot & Profile ----------------
import Chatbot from "./Components/Chatbot";
import ProfilePage from "./Components/finance/client/ProfilePage";

// ---------------- Admin Panel ----------------
import FeedbackPage from "./pages/admin_dashbord/FeedbackPage";
import UsersPage from "./pages/admin_dashbord/Users";
import PetRegisterPage from "./pages/admin_dashbord/petRegister";

// ---------------- Protected Route ----------------
import ProtectedRoute from "./Components/ProtectedRoute";

// ---------------- Inventory System ----------------
import Products from "./Components/product/product";
import Addproducts from "./Components/addproducts/addproducts";
import Updateproduct from "./Components/updateproducts/updateproduct";
import Alerts from "./Components/notifications&alerts/alerts";
import PrescriptionList from "./Components/prescription/PrescriptionList";
import Insights from "./Components/insights/insights";
import ShippingLogs from "./Components/ShippingLogs/ShippingLogs";
import InventoryHome from "./Components/Home/home";

// Layouts
import InventoryLayout from "./layouts/InventoryLayout";
import StoreLayout from "./layouts/StoreLayout";

// ---------------- Pet Store ----------------
import PetStore from "./Components/petstore/PetStore";
import Cart from "./Components/petstore/Cart";
import PrescriptionForm from "./Components/prescription/prescriptionform";

// ---------------- Daycare & Reviews ----------------
import Daycare from "./Components/Daycare/daycare";
import AppointmentDCs from "./Components/AppointmentDCs/AppointmentDCs";
import AddAppointmentDC from "./Components/AddAppointmentDC/AddAppointmentDC";
import UpdateAppointmentDC from "./Components/UpdateAppointmentDC/UpdateAppointmentDC";
import UpdateApphisDC from "./Components/UpdateApphisDC/UpdateApphisDC";
import Review from "./Components/Review/Review";
import AddReviews from "./Components/AddReviews/AddReviews";
import UpdateReviews from "./Components/UpdateReviews/UpdateReviews";
import StarRating from "./Components/StarRating/StarRating";
import AppointmentDisplayDC from "./Components/AppointmentDisplayDC/AppointmentDisplayDC";
import DailyLogsPet from "./Components/DailyLogsPet/DailyLogsPet";
import VaccinePlanPage from "./Components/VaccinePlanPage/VaccinePlanPage";

// ---------------- Dashboard & nested pages (Daycare) ----------------
import DashboardDC from "./Components/DashboardDC/DashboardDC/DashboardDC";
import AnalyticsDashboardDC from "./Components/DashboardDC/AnalyticsDashboardDC/AnalyticsDashboardDC";
import TodaysPets from "./Components/DashboardDC/TodaysPets/TodaysPets";
import PendingAppointments from "./Components/DashboardDC/PendingAppointmentsDC/PendingAppointmentsDC";
import UpcomingAppointmentsDC from "./Components/DashboardDC/UpcomingAppointmentsDC/UpcomingAppointmentsDC";
import AppointmentHistory from "./Components/DashboardDC/AppointmentDCHistory/AppointmentDCHistory";
import DailyLogs from "./Components/DashboardDC/DailyLogs/DailyLogs";
import EmergencyPage from "./Components/DashboardDC/EmergencyPage/EmergencyPage";
import AppointmentDetailsDC from "./Components/DashboardDC/AppointmentDetailsDC/AppointmentDetailsDC";
import ReviewsDC from "./Components/DashboardDC/ReviewsDC/ReviewsDC";

// ---------------- Finance ----------------
import CouponWall from "./Components/finance/CouponWall";
import ClientPay from "./Components/finance/client/offline/ClientPay";
import OnlinePay from "./Components/finance/client/online/OnlinePay";
import PaySuccess from "./Components/finance/client/PaySuccess";
import PaymentSummary from "./Components/finance/client/PaymentSummary";
import DashboardApp from "./Components/finance/dashboard/DashboardApp";

function App() {
  const currentUser = JSON.parse(localStorage.getItem("user")) || {};

  return (
    <Routes>
      {/* -------- Public Routes -------- */}
      <Route path="/" element={<InventoryHome />} />
      <Route path="/home" element={<InventoryHome />} />
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
      <Route path="/super-admin-dashboard" element={<ProtectedRoute><SuperAdminDashboard /></ProtectedRoute>} />
      <Route path="/admin-dashboard" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
      <Route path="/finance-dashboard" element={<ProtectedRoute><FinanceManagerDashboard /></ProtectedRoute>} />
      <Route path="/inventory-dashboard" element={<ProtectedRoute><InventoryLayout /></ProtectedRoute>} />
      <Route path="/pet-caretaker-dashboard" element={<ProtectedRoute><DashboardDC /></ProtectedRoute>} />
      <Route path="/receptionist-dashboard" element={<ProtectedRoute><DoctorDashboard /></ProtectedRoute>} />
      <Route path="/user-dashboard" element={<ProtectedRoute><UserDashboard /></ProtectedRoute>} />

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
      <Route element={<InventoryLayout />}>
        <Route path="/product" element={<Products />} />
        <Route path="/addproduct" element={<Addproducts />} />
        <Route path="/updateproduct/:id" element={<Updateproduct />} />
        <Route path="/alerts" element={<Alerts />} />
        <Route path="/prescription-list" element={<PrescriptionList />} />
        <Route path="/report" element={<Products />} />
        <Route path="/shipping-logs" element={<ShippingLogs />} />
        <Route path="/insights" element={<Insights />} />
      </Route>

      {/* -------- Pet Store -------- */}
      <Route element={<StoreLayout />}>
        <Route path="/store" element={<PetStore />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/cart/:id" element={<Cart />} />
      </Route>

      {/* -------- Prescription -------- */}
      <Route path="/prescription/:appointmentId" element={<PrescriptionForm />} />

      {/* -------- Daycare & Reviews -------- */}
      <Route path="/daycare" element={<Daycare />} />
      <Route path="/appointmentDC" element={<AppointmentDCs />} />
      <Route path="/addappointmentDC" element={<AddAppointmentDC />} />
      <Route path="/updateAppointmentDC/:id" element={<UpdateAppointmentDC />} />
      <Route path="/updateApphisDC/:id" element={<UpdateApphisDC />} />
      <Route path="/reviews" element={<Review />} />
      <Route path="/addreviews" element={<AddReviews />} />
      <Route path="/updatereview/:id" element={<UpdateReviews />} />
      <Route path="/StarRating" element={<StarRating />} />
      <Route path="/appointmentDisplayDC/:id" element={<AppointmentDisplayDC />} />
      <Route path="/daycareLogs/:appointmentId" element={<DailyLogsPet />} />
      <Route path="/vaccine" element={<VaccinePlanPage />} />

      {/* -------- Daycare Dashboard (Nested) -------- */}
      <Route path="/dashboardDC/*" element={<DashboardDC />}>
        <Route index element={<AnalyticsDashboardDC />} />
        <Route path="analyticDC" element={<AnalyticsDashboardDC />} />
        <Route path="todaysPets" element={<TodaysPets />} />
        <Route path="pendingAppointments" element={<PendingAppointments />} />
        <Route path="upcomingAppointments" element={<UpcomingAppointmentsDC />} />
        <Route path="appointmentHistory" element={<AppointmentHistory />} />
        <Route path="dailyLogs/:appointmentId" element={<DailyLogs />} />
        <Route path="emergency" element={<EmergencyPage />} />
        <Route path="appointmentDetailsDC/:id" element={<AppointmentDetailsDC />} />
        <Route path="reviews" element={<ReviewsDC />} />
      </Route>

      {/* -------- Doctor Routes -------- */}
      <Route path="/doctor-login" element={<DoctorDashboard />} />
      <Route path="/doctor-dashboard" element={<DoctorDashboard />} />

      {/* -------- User Routes -------- */}
      <Route
        path="/"
        element={
          currentUser && currentUser.role === "USER" ? (
            <Navigate to="/user-home" replace />
          ) : (
            <InventoryHome />
          )
        }
      />
      <Route path="/user-home" element={<UserHome />} />
      <Route path="/appointments" element={<UserAppointments />} />
      <Route path="/events" element={<UserEvents />} />
      <Route path="/ask-quesions" element={<UserQuesions />} />

      {/* -------- Finance -------- */}
      <Route path="/pay/:invoiceId" element={<ClientPay />} />
      <Route path="/pay/online" element={<OnlinePay />} />
      <Route path="/pay/success" element={<PaySuccess />} />
      <Route path="/pay/summary" element={<PaymentSummary />} />
      <Route path="/fm/*" element={<DashboardApp />} />
      <Route path="/coupon-wall" element={<CouponWall />} />
    </Routes>
  );
}

export default App;
