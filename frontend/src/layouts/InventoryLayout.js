import React from "react";
import { Outlet } from "react-router-dom";
import InventoryNav from "../Components/inventoryNav/inventoryNav";

function InventoryLayout() {
  return (
    <div>
      <InventoryNav />
      <Outlet /> {/* This will render child routes */}
    </div>
  );
}

export default InventoryLayout;