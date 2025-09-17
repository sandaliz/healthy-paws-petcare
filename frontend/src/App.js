import React from 'react';
import { Routes, Route } from 'react-router-dom';
import './App.css';

// Public
import Home from './Components/Home/home';
import Daycare from './Components/Daycare/daycare';
import AppointmentDCs from './Components/AppointmentDCs/AppointmentDCs';
import AddAppointmentDC from './Components/AddAppointmentDC/AddAppointmentDC';
import UpdateAppointmentDC from './Components/UpdateAppointmentDC/UpdateAppointmentDC';
import Review from './Components/Review/Review';
import AddReviews from './Components/AddReviews/AddReviews';
import UpdateReviews from './Components/UpdateReviews/UpdateReviews';
import AppointmentDisplayDC from './Components/AppointmentDisplayDC/AppointmentDisplayDC';
import DailyLogsPet from './Components/DailyLogsPet/DailyLogsPet'

// Dashboard & nested pages
import DashboardDC from './Components/DashboardDC/DashboardDC/DashboardDC';
import TodaysPets from './Components/DashboardDC/TodaysPets/TodaysPets';
import PendingAppointments from './Components/DashboardDC/PendingAppointmentsDC/PendingAppointmentsDC';
import UpcomingAppointmentsDC from './Components/DashboardDC/UpcomingAppointmentsDC/UpcomingAppointmentsDC';
import AppointmentHistory from './Components/DashboardDC/AppointmentDCHistory/AppointmentDCHistory';
import DailyLogs from './Components/DashboardDC/DailyLogs/DailyLogs';
import AppointmentDetailsDC from './Components/DashboardDC/AppointmentDetailsDC/AppointmentDetailsDC';

function App() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Home />} />
      <Route path="/daycare" element={<Daycare />} />
      <Route path="/appointmentDC" element={<AppointmentDCs />} />
      <Route path="/addappointmentDC" element={<AddAppointmentDC />} />
      <Route path="/updateAppointmentDC/:id" element={<UpdateAppointmentDC />} />
      <Route path="/reviews" element={<Review />} />
      <Route path="/addreviews" element={<AddReviews />} />
      <Route path="/updatereview/:id" element={<UpdateReviews />} />
      <Route path="/appointmentDisplayDC/:id" element={<AppointmentDisplayDC />} />
      <Route path="/daycareLogs/:appointmentId" element={<DailyLogsPet />} />

      {/* Dashboard Layout with Nested Routes */}
      <Route path="/dashboardDC/*" element={<DashboardDC />}>
        <Route path="" element={<div>Welcome to HealthyPaws Daycare Dashboard</div>} />
        <Route path="todaysPets" element={<TodaysPets />} />
        <Route path="pendingAppointments" element={<PendingAppointments />} />
        <Route path="upcomingAppointments" element={<UpcomingAppointmentsDC />} />
        <Route path="appointmentHistory" element={<AppointmentHistory />} />
        <Route path="dailyLogs/:appointmentId" element={<DailyLogs />} />
        <Route path="appointmentDetailsDC/:id" element={<AppointmentDetailsDC />} />
      </Route>
    </Routes>
  );
}

export default App;
