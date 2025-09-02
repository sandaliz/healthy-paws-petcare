import React from 'react';
import './inventoryNav.css';
import { Link } from 'react-router-dom';

function InventoryNav() {
  return (
    <div className="inventory-nav-container">
      <ul className="Nav-ul">
        <li className="Nav-li">
          <Link to="/product" className="active products">
            <h1>Product Catalogue</h1>
          </Link>
        </li>
      </ul>
      <ul className="Nav-ul">
        <li className="Nav-li">
          <Link to="/alerts" className="active products">
            <h1>Notification & Alerts</h1>
          </Link>
        </li>
      </ul>
      <ul className="Nav-ul">
        <li className="Nav-li">
          <Link to="/prescription-list" className="active products">
            <h1>Prescription Management</h1>
          </Link>
        </li>
      </ul>
      <ul className="Nav-ul">
        <li className="Nav-li">
          <Link to="/report" className="active products">
            <h1>Report</h1>
          </Link>
        </li>
      </ul>

      {/* 👇 NEW BUTTON / LINK to Pet Store */}
      <ul className="Nav-ul">
        <li className="Nav-li">
          <Link to="/store" className="active products">
            <h1>Go to Pet Store</h1>
          </Link>
        </li>
      </ul>
    </div>
  );
}

export default InventoryNav;