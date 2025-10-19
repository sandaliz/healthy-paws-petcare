import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './product.css';
import DisplayProducts from '../productDetails/displayproducts';
import { useNavigate, useLocation } from 'react-router-dom';

const URL = "http://localhost:5001/products";

function Products() {
  const [products, setProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true); // loading state
  const productsPerPage = 7;

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    setLoading(true);
    axios.get(URL)
      .then(res => {
        console.log("Fetched products:", res.a); // debug log
        setProducts(res.data);  // backend returns array directly
        setCurrentPage(1);
      })
      .catch(err => console.log("Error fetching products:", err))
      .finally(() => setLoading(false));
  }, [location]);

  //  Filter products with search
  const filteredProducts = products.filter((p) =>
    Object.values(p).some((field) =>
      field && field.toString().toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  //  Pagination logic
  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct);
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);

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

      {/* Search Bar */}
      <div className="product-search">
        <input
          type="text"
          placeholder="Search products..."
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setCurrentPage(1);
          }}
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
            {loading ? (
              <tr>
                <td colSpan="10" style={{ textAlign: "center" }}>
                  Loading products...
                </td>
              </tr>
            ) : currentProducts.length > 0 ? (
              currentProducts.map((product) => (
                <DisplayProducts key={product._id} product={product} />
              ))
            ) : (
              <tr>
                <td colSpan="10" style={{ textAlign: "center" }}>
                  No products found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="pagination">
          <button 
            disabled={currentPage === 1} 
            onClick={() => setCurrentPage(prev => prev - 1)}
          >
            ⬅ Prev
          </button>
          
          {[...Array(totalPages)].map((_, i) => (
            <button
              key={i}
              className={currentPage === i + 1 ? "active" : ""}
              onClick={() => setCurrentPage(i + 1)}
            >
              {i + 1}
            </button>
          ))}
          
          <button 
            disabled={currentPage === totalPages} 
            onClick={() => setCurrentPage(prev => prev + 1)}
          >
            Next ➡
          </button>
        </div>
      )}
    </div>
  );
}

export default Products;