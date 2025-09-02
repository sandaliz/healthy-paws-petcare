import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './product.css';
import DisplayProducts from '../productDetails/displayproducts';
import { useNavigate, useLocation } from 'react-router-dom';

const URL = "http://localhost:5000/products";

function Products() {
  const [products, setProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState(""); // ✅ search state
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    axios.get(URL)
      .then(res => {
        setProducts(res.data.products || []);
      })
      .catch(err => console.log(err));
  }, [location]);

  // ✅ filter products with search
  const filteredProducts = products.filter((p) =>
    Object.values(p).some((field) =>
      field && field.toString().toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  return (
    <div className="products-container">
      
      {/* Header */}
      <div className="products-header">
        <h1>Product Catalogue</h1>
        <button 
          className="add-product-btn"
          onClick={() => navigate("/addproduct")}
        >
          + Add Product
        </button>
      </div>

      {/* ✅ Search Bar */}
      <div className="product-search">
        <input
          type="text"
          placeholder="Search products..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Table */}
      <div className="product-table-wrapper">
        <table className="product-table">
          <thead>
            <tr>
              <th>Image</th>
              <th>ID</th>
              <th>Name</th>
              <th>Expiration</th>
              <th>Cost</th>
              <th>Stock</th>
              <th>Threshold</th>
              <th>Category</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.length > 0 ? (
              filteredProducts.map((product) => (
                <DisplayProducts key={product._id} product={product} />
              ))
            ) : (
              <tr>
                <td colSpan="10" style={{ textAlign: "center" }}>No products found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Products;