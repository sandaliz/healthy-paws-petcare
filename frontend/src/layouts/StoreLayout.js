import React from "react";
import { Outlet } from "react-router-dom";

function StoreLayout() {
  return (
    <div>
      {/* If you want a store-specific header or navbar, you can add here */}
      <Outlet />
    </div>
  );
}

export default StoreLayout;