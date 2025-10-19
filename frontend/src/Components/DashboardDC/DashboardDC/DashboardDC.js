import React from 'react';
import SidebarDC from '../SideBarDC/SideBarDC';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import './DashboardDC.css';

function DashboardDC() {
  const navigate = useNavigate();
  const location = useLocation();

  const path = location.pathname.split('/')[2] || 'dashboard';
  const activeTab = (() => {
    switch (path) {
      case 'analyticDC': return 'analyticDC';
      case 'todaysPets': return 'todaysPets';
      case 'pendingAppointments': return 'pending';
      case 'upcomingAppointments': return 'upcoming';
      case 'appointmentHistory': return 'history';
      case 'reviews': return 'reviews';
      default: return 'dashboard';
    }
  })();

  const handleSetActiveTab = (tab) => {
    switch (tab) {
      case 'analyticDC': navigate('/dashboardDC/analyticDC'); break;
      case 'todaysPets': navigate('/dashboardDC/todaysPets'); break;
      case 'pending': navigate('/dashboardDC/pendingAppointments'); break;
      case 'upcoming': navigate('/dashboardDC/upcomingAppointments'); break;
      case 'history': navigate('/dashboardDC/appointmentHistory'); break;
      case 'reviews': navigate('/dashboardDC/reviews'); break;
      default: navigate('/dashboardDC');
    }
  };

  return (
    <div className="dcd-container">
      <SidebarDC
        activeTab={activeTab}
        setActiveTab={handleSetActiveTab}
        todaysPetsCount={0}
        pendingAppointmentsCount={0}
      />
      <main className="dcd-main">
        <header className="dcd-header">
          <h1>Daycare Dashboard</h1>
        </header>
        <div className="dcd-content">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

export default DashboardDC;