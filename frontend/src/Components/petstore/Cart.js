import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";  // ✅ useParams for prescription
import "./Cart.css";

function Cart() {
  const { id } = useParams(); // ✅ prescriptionId from /cart/:id
  const [cart, setCart] = useState(() => JSON.parse(localStorage.getItem("cart")) || []);
  const [prescription, setPrescription] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // ✅ Load data: either prescription OR normal cart
  useEffect(() => {
    if (id) {
      // load prescription from backend
      axios.get(`http://localhost:5000/prescriptions/${id}`)
        .then(res => setPrescription(res.data))
        .catch(err => console.error("Error fetching prescription:", err));
    }
  }, [id]);

  // ✅ Update qty (only in normal cart)
  const updateQuantity = (pid, delta) => {
    let updated = cart.map((item) =>
      item._id === pid ? { ...item, quantity: Math.max(1, item.quantity + delta) } : item
    );
    setCart(updated);
    localStorage.setItem("cart", JSON.stringify(updated));
  };

  // ✅ Remove item (only in normal cart)
  const removeItem = (pid) => {
    let updated = cart.filter((item) => item._id !== pid);
    setCart(updated);
    localStorage.setItem("cart", JSON.stringify(updated));
  };

  // ✅ Calculate totals (prescription OR normal)
  const subtotal = prescription
    ? prescription.items.reduce((acc, item) => acc + item.quantity * item.cost, 0)
    : cart.reduce((acc, item) => acc + item.quantity * item.cost, 0);

  const delivery = (prescription ? prescription.items.length : cart.length) > 0 ? 150 : 0;
  const total = subtotal + delivery;

  // ✅ Checkout: Prescription or Normal
  const placeOrder = async () => {
    try {
      setLoading(true);

      if (prescription) {
        // mark prescription as paid
        await axios.put(`http://localhost:5000/prescriptions/${prescription._id}`, {
          status: "paid"
        });
        alert("✅ Prescription Order Completed!");
      } else {
        // normal mode update stock
        for (const item of cart) {
          const newStock = item.currantStock - item.quantity;
          if (newStock < 0) {
            alert(`❌ Not enough stock for ${item.name}`);
            setLoading(false);
            return;
          }
          await axios.put(`http://localhost:5000/products/${item._id}`, {
            currantStock: newStock,
          });
        }
        localStorage.removeItem("cart");
        setCart([]);
        alert("✅ Normal Order Completed! Thank you for shopping 🐾");
      }

      navigate("/store"); // redirect
    } catch (err) {
      console.error("Error placing order:", err);
      alert("❌ Failed to process order.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="cart-page">
      {/* Empty cart state */}
      {!prescription && cart.length === 0 ? (
        <div className="empty-cart">
          <h1>Your Basket</h1>
          <p>Your cart is empty 🐾</p>
        </div>
      ) : (
        <>
          {/* Prescription Mode */}
          {prescription ? (
            <div className="cart-items">
              <h1>Prescription Basket</h1>
              {prescription.items.map((item, i) => (
                <div key={i} className="cart-item">
                  <div className="item-info">
                    <h2>{item.productName}</h2>
                  </div>
                  <div className="quantity">
                    <input type="text" value={item.quantity} readOnly />
                  </div>
                  <div className="price">LKR {item.quantity * item.cost}</div>
                </div>
              ))}
            </div>
          ) : (
            // Normal Cart Mode
            <div className="cart-items">
              <h1>Your Basket</h1>
              {cart.map((item) => (
                <div key={item._id} className="cart-item">
                  <div className="item-info">
                    <h2>{item.name}</h2>
                  </div>
                  <div className="quantity">
                    <button onClick={() => updateQuantity(item._id, -1)}>-</button>
                    <input type="text" value={item.quantity} readOnly />
                    <button onClick={() => updateQuantity(item._id, 1)}>+</button>
                  </div>
                  <div className="price">LKR {item.quantity * item.cost}</div>
                  <button className="remove-btn" onClick={() => removeItem(item._id)}>
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Summary */}
          <div className="cart-summary">
            <h2>Basket Summary</h2>
            <div className="summary-box">
              <p>
                Subtotal: <strong>LKR {subtotal}</strong>
              </p>
              <p>Estimated delivery: <strong>LKR {delivery}</strong></p>
              <hr />
              <p className="summary-total">Total: <strong>LKR {total}</strong></p>
              
              <button 
                className="checkout-btn" 
                onClick={placeOrder}
                disabled={loading}
              >
                {loading ? "Processing..." : "Continue to Checkout"}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default Cart;