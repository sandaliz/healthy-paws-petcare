import React from 'react';
import { Routes, Route } from 'react-router-dom';
import './App.css';
import Home from './Components/Home/home';

// Finance imports
import CouponWall from './Components/finance/CouponWall';
import ClientPay from './Components/finance/ClientPay';
import OnlinePay from './Components/finance/OnlinePay';
import PaySuccess from './Components/finance/PaySuccess';
import PaymentSummary from './Components/finance/PaymentSummary';
import DashboardApp from './Components/finance/dashboard/DashboardApp';

function App() {
  return (
    <Routes>
      {/* Home as base */}
      <Route path="/" element={<Home />} />

      {/* Finance routes */}
      <Route path="/pay" element={<ClientPay />} />
      <Route path="/pay/online" element={<OnlinePay />} />
      <Route path="/pay/success" element={<PaySuccess />} />
      <Route path="/pay/summary" element={<PaymentSummary />} />
      <Route path="/fm/*" element={<DashboardApp />} />

      {/* CouponWall as its own page */}
      <Route path="/coupon-wall" element={<CouponWall />} />
    </Routes>
  );
}

export default App;
