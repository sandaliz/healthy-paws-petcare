import React from "react";
import { Routes, Route } from "react-router-dom";
import "./App.css";

// Inventory Components
import Products from "./Components/product/product";
import Addproducts from "./Components/addproducts/addproducts";
import Updateproduct from "./Components/updateproducts/updateproduct";
import Alerts from "./Components/notifications&alerts/alerts";
import PrescriptionList from "./Components/prescription/PrescriptionList";

// Layouts
import InventoryLayout from "./layouts/InventoryLayout";
import StoreLayout from "./layouts/StoreLayout";

// Pet Store Components
import PetStore from "./Components/petstore/PetStore";
import Cart from "./Components/petstore/Cart";

import PrescriptionForm from "./Components/prescription/prescriptionform";

function App() {
  return (
    <Routes>
      
      <Route element={<InventoryLayout />}>
        <Route path="/" element={<Products />} />
        <Route path="/product" element={<Products />} />
        <Route path="/addproduct" element={<Addproducts />} />
        <Route path="/updateproduct/:id" element={<Updateproduct />} />
        <Route path="/alerts" element={<Alerts />} />   
        <Route path="/prescription-list" element={<PrescriptionList />} />
        <Route path="/report" element={<Products />} />
      </Route>

     
      <Route element={<StoreLayout />}>
        <Route path="/store" element={<PetStore />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/cart/:id" element={<Cart />} /> 
      </Route>

      <Route path="/prescription" element={<PrescriptionForm />} />
    </Routes>
  );
}

export default App;