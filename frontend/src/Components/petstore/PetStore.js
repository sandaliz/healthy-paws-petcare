import React, { useEffect, useState } from "react";
import axios from "axios";
import "./PetStore.css";
import { useNavigate } from "react-router-dom";

const URL = "http://localhost:5000/products";

function PetStore() {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState(
    () => JSON.parse(localStorage.getItem("cart")) || []
  );
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    axios
      .get(URL)
      .then((res) => {
        const activeProducts = (res.data.products || []).filter(
          (p) => p.productStatus?.toLowerCase() === "active"
        );
        setProducts(activeProducts);
      })
      .catch((err) => console.log(err));
  }, []);

  const addToCart = (product) => {
    if (product.currantStock <= 0) return;

    let updatedCart = [...cart];
    const index = updatedCart.findIndex((item) => item._id === product._id);

    if (index >= 0) {
      if (updatedCart[index].quantity < product.currantStock) {
        updatedCart[index].quantity++;
      } else {
        alert("❌ Not enough stock available!");
        return;
      }
    } else {
      updatedCart.push({ ...product, quantity: 1 });
    }

    setCart(updatedCart);
    localStorage.setItem("cart", JSON.stringify(updatedCart));
  };

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase().trim())
  );

  return (
    <div className="petstore-container">
      <div className="petstore-header">
        <h1>Healthy Paws Pet Store</h1>
        <button
          className="go-to-cart"
          onClick={() => navigate("/cart")}
          disabled={cart.length === 0}
        >
          🛒 Go to Cart ({cart.reduce((acc, item) => acc + item.quantity, 0)})
        </button>
      </div>

      <div className="hero-banner">
        <img
          src="/images/hero-banner.jpg"
          alt="Happy pets with treats and toys"
          className="hero-image"
        />
        <div className="hero-content">
          <h2>Celebrate Pet-titude this September</h2>
          <p>From bedding to treats and toys, we've got all the must-haves.</p>
          <button className="hero-cta">Shop now</button>
        </div>
      </div>

      <div className="promo-section">
        <div className="promo-grid">
          <div className="promo-card deals">
            <h3>Super Deals</h3>
            <p>Limited time only!</p>
            <button className="promo-cta">Shop now</button>
          </div>
          <div className="promo-card featured">
            <h3>Premium Quality</h3>
            <p>The finest ingredients for your beloved pets.</p>
            <button className="promo-cta">Shop now</button>
          </div>
        </div>
      </div>

      <div className="search-container">
        <input
          type="text"
          className="search-bar"
          placeholder="🔎 Search for products (e.g. dog food, cat bed)"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="product-cards">
        {filteredProducts.length > 0 ? (
          filteredProducts.map((p) => (
            <div key={p._id} className="product-card">
              <div className="product-image-wrapper">
                <img src={p.imageUrl} alt={p.name} />
                {p.currantStock <= 0 && (
                  <span className="out-of-stock-badge">Out of Stock</span>
                )}
              </div>
              <h3>{p.name}</h3>
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
          <p className="no-results">❌ No products found!</p>
        )}
      </div>
    </div>
  );
}

export default PetStore;