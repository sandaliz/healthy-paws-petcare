import React from 'react';
import SidebarDC from '../SideBarDC/SideBarDC';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import './DashboardDC.css';

function DashboardDC() {
  const navigate = useNavigate();
  const location = useLocation();

  // Determine active tab from URL
  const path = location.pathname.split('/')[2] || 'dashboard';
  const activeTab = (() => {
    switch (path) {
      case 'todaysPets': return 'todaysPets';
      case 'pendingAppointments': return 'pending';
      case 'upcomingAppointments': return 'upcoming';
      case 'appointmentHistory': return 'history';
      default: return 'dashboard';
    }
  })();

  const handleSetActiveTab = (tab) => {
    switch (tab) {
      case 'todaysPets':
        navigate('/dashboardDC/todaysPets');
        break;
      case 'pending':
        navigate('/dashboardDC/pendingAppointments');
        break;
      case 'upcoming':
        navigate('/dashboardDC/upcomingAppointments');
        break;
      case 'history':
        navigate('/dashboardDC/appointmentHistory');
        break;
      default:
        navigate('/dashboardDC');
    }
  };

  return (
    <div className="dashboard-container">
      <SidebarDC
        activeTab={activeTab}
        setActiveTab={handleSetActiveTab}
        todaysPetsCount={0}
        pendingAppointmentsCount={0}
      />
      <main className="dashboard-main">
        <header className="dashboard-header">
          <h1>Daycare Dashboard</h1>
        </header>
        <Outlet /> {/* Nested route content renders here */}
      </main>
    </div>
  );
}

export default DashboardDC;
