import React, { useEffect, useState } from "react";
import axios from "axios";
import "./PetStore.css";
import { useNavigate } from "react-router-dom";
import Navbar from "../Home/Navbar";

const URL = "http://localhost:5001/products";

function PetStore() {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState(
    () => JSON.parse(localStorage.getItem("cart")) || []
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [category, setCategory] = useState("all"); 
  const [sortOption, setSortOption] = useState("default"); 
  const navigate = useNavigate();

  // Fetch products 
  useEffect(() => {
    axios
      .get(URL)
      .then((res) => {
        const activeProducts = (res.data || []).filter(
          (p) => p.productStatus?.toLowerCase() === "active"
        );
        setProducts(activeProducts);
      })
      .catch((err) => console.log("Error fetching products:", err));
  }, []);

  const addToCart = (product) => {
    if (product.currantStock <= 0) return;

    let updatedCart = [...cart];
    const index = updatedCart.findIndex((item) => item._id === product._id);

    if (index >= 0) {
      if (updatedCart[index].quantity < product.currantStock) {
        updatedCart[index].quantity++;
      } else {
        alert("Not enough stock available!");
        return;
      }
    } else {
      updatedCart.push({ ...product, quantity: 1 });
    }

    setCart(updatedCart);
    localStorage.setItem("cart", JSON.stringify(updatedCart));
  };

  // Apply filters
  let filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase().trim())
  );

  if (category !== "all") {
    filteredProducts = filteredProducts.filter(
      (p) => p.category?.toLowerCase() === category.toLowerCase()
    );
  }

  //  Apply sorting
  if (sortOption === "priceLow") {
    filteredProducts.sort((a, b) => a.cost - b.cost);
  } else if (sortOption === "priceHigh") {
    filteredProducts.sort((a, b) => b.cost - a.cost);
  } else if (sortOption === "stockHigh") {
    filteredProducts.sort((a, b) => b.currantStock - a.currantStock);
  }

  return (
        <>
      <Navbar />
    <div className="ps-container">
      <div className="ps-header">
        <h1>Healthy Paws Pet Store</h1>
        <button
          className="ps-go-to-cart"
          onClick={() => navigate("/cart")}
          disabled={cart.length === 0}
        >
          🛒 Go to Cart ({cart.reduce((acc, item) => acc + item.quantity, 0)})
        </button>
      </div>

      <div className="ps-hero-banner">
        <img
          src="/images/hero-banner.jpg"
          alt="Happy pets with treats and toys"
          className="ps-hero-image"
        />
        <div className="ps-hero-content">
          <h2>Celebrate Pet-titude this September</h2>
          <p>From bedding to treats and toys, we've got all the must-haves.</p>
          <button
            className="ps-hero-cta"
            onClick={() =>
              document
                .querySelector(".ps-product-cards")
                .scrollIntoView({ behavior: "smooth" })
            }
          >
            Shop now
          </button>
        </div>
      </div>

      {/* Search + Filters + Sorting */}
      <div className="ps-search-container">
        <input
          type="text"
          className="ps-search-bar"
          placeholder="🔎 Search for products (e.g. dog food, cat bed)"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        <select
          className="ps-filter-dropdown"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          <option value="all">All Categories</option>
          <option value="food">Food</option>
          <option value="toy">Toys</option>
          <option value="Grooming">Grooming</option>
          <option value="Equipment">Equipment</option>
        </select>

        <select
          className="ps-sort-dropdown"
          value={sortOption}
          onChange={(e) => setSortOption(e.target.value)}
        >
          <option value="default">Sort By</option>
          <option value="priceLow">Price: Low to High</option>
          <option value="priceHigh">Price: High to Low</option>
          <option value="stockHigh">Stock: High to Low</option>
        </select>
      </div>

      <div className="ps-product-cards">
        {filteredProducts.length > 0 ? (
          filteredProducts.map((p) => (
            <div key={p._id} className="ps-product-card">
              <div className="ps-product-image-wrapper">
                <img src={p.imageUrl} alt={p.name} />
                {p.currantStock <= 0 && (
                  <span className="ps-out-of-stock-badge">Out of Stock</span>
                )}
              </div>
              <h3>{p.name}</h3>
              <p>Category: {p.category}</p>
              <p>In Stock: {p.currantStock}</p>
              <p>Price: LKR {p.cost}</p>
              <button
                onClick={() => addToCart(p)}
                disabled={p.currantStock <= 0}
              >
                {p.currantStock <= 0 ? "Unavailable" : "Add to Cart"}
              </button>
            </div>
          ))
        ) : (
          <p className="ps-no-results">c No products found!</p>
        )}
      </div>
    </div>
    </>
  );
}

export default PetStore;
