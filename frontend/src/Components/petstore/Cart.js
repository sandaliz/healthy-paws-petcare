import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import "./Cart.css";

function Cart() {
  const { id } = useParams();
  const [cart, setCart] = useState(() => JSON.parse(localStorage.getItem("cart")) || []);
  const [prescription, setPrescription] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (id) {
      axios
        .get(`http://localhost:5000/prescriptions/${id}`)
        .then((res) => setPrescription(res.data))
        .catch((err) => console.error("Error fetching prescription:", err));
    }
  }, [id]);

  const updateQuantity = (pid, delta) => {
    let updated = cart.map((item) =>
      item._id === pid ? { ...item, quantity: Math.max(1, item.quantity + delta) } : item
    );
    setCart(updated);
    localStorage.setItem("cart", JSON.stringify(updated));
  };

  const removeItem = (pid) => {
    let updated = cart.filter((item) => item._id !== pid);
    setCart(updated);
    localStorage.setItem("cart", JSON.stringify(updated));
  };

  const subtotal = prescription
    ? prescription.items.reduce((acc, item) => acc + item.quantity * item.cost, 0)
    : cart.reduce((acc, item) => acc + item.quantity * item.cost, 0);

  const delivery = (prescription ? prescription.items.length : cart.length) > 0 ? 150 : 0;
  const total = subtotal + delivery;

  const placeOrder = async () => {
    try {
      setLoading(true);

      if (prescription) {
        await axios.put(`http://localhost:5000/prescriptions/${prescription._id}`, {
          status: "paid",
        });
        alert("✅ Prescription Order Completed!");
      } else {
        const response = await axios.post("http://localhost:5000/checkout", {
          items: cart.map((item) => ({
            productMongoId: item._id, // MUST be actual product _id
            productName: item.name,
            quantity: item.quantity,
            cost: item.cost,
          })),
          source: "petstore",
          // userId: "guest" → backend will default since no login yet
        });

        console.log("Checkout Response:", response.data);

        localStorage.removeItem("cart");
        setCart([]);
        alert("✅ Normal Order Completed! Thank you for shopping 🐾");
      }

      navigate("/store");
    } catch (err) {
      console.error("Error placing order:", err.response?.data || err.message);
      alert("❌ Failed to process order: " + (err.response?.data?.error || err.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="cart-page">
      {!prescription && cart.length === 0 ? (
        <div className="empty-cart">
          <h1>Your Basket</h1>
          <p>Your cart is empty </p>
        </div>
      ) : (
        <>
          {prescription ? (
            <div className="cart-items">
              <h1>Prescription Basket</h1>
              {prescription.items.map((item, i) => (
                <div key={i} className="cart-item">
                  <div className="item-info"><h2>{item.productName}</h2></div>
                  <div className="quantity"><input type="text" value={item.quantity} readOnly /></div>
                  <div className="price">LKR {item.quantity * item.cost}</div>
                </div>
              ))}
            </div>
          ) : (
            <div className="cart-items">
              <h1>Your Basket</h1>
              {cart.map((item) => (
                <div key={item._id} className="cart-item">
                  <div className="item-info"><h2>{item.name}</h2></div>
                  <div className="quantity">
                    <button onClick={() => updateQuantity(item._id, -1)}>-</button>
                    <input type="text" value={item.quantity} readOnly />
                    <button onClick={() => updateQuantity(item._id, 1)}>+</button>
                  </div>
                  <div className="price">LKR {item.quantity * item.cost}</div>
                  <button className="remove-btn" onClick={() => removeItem(item._id)}>Remove</button>
                </div>
              ))}
            </div>
          )}

          <div className="cart-summary">
            <h2>Basket Summary</h2>
            <div className="summary-box">
              <p>Subtotal: <strong>LKR {subtotal}</strong></p>
              <p>Estimated delivery: <strong>LKR {delivery}</strong></p>
              <hr />
              <p className="summary-total">Total: <strong>LKR {total}</strong></p>

              <button
                className="checkout-btn"
                onClick={placeOrder}
                disabled={loading || (prescription ? prescription.items.length === 0 : cart.length === 0)}
              >
                {loading
                  ? "Processing..."
                  : prescription
                  ? prescription.items.length === 0
                    ? "No Prescription Items"
                    : "Continue to Checkout"
                  : cart.length === 0
                  ? "Cart is Empty"
                  : "Continue to Checkout"}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default Cart;