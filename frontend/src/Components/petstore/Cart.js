// src/components/Cart.js
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import "./Cart.css";

function Cart() {
  const { id } = useParams();
  const [user, setUser] = useState(null);   // ✅ logged-in user
  const [cart, setCart] = useState(() => JSON.parse(localStorage.getItem("cart")) || []);
  const [prescription, setPrescription] = useState(null);
  const [loading, setLoading] = useState(false);
  const [paymentOption, setPaymentOption] = useState("payNow"); 
  const [shippingDetails, setShippingDetails] = useState({
    fullName: "",
    lastName: "",
    address: "",
    email: "",
    phone: ""
  });

  const navigate = useNavigate();

  // Load user from localStorage at mount
  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  // If prescription exists
  useEffect(() => {
    if (id) {
      axios
        .get(`http://localhost:5001/prescriptions/${id}`)
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
      if (!user?._id) {
        alert("❌ You must log in before checking out.");
        navigate("/login"); // optional redirect to login page
        return;
      }

      setLoading(true);

      // 1. Save Cart
      const cartResponse = await axios.post("http://localhost:5001/checkout", {
        userId: user._id, // 🔥 actual user ObjectId
        items: cart.map((item) => ({
          productMongoId: item._id,
          productName: item.name,
          quantity: item.quantity,
          cost: item.cost,
        })),
        totalPrice: total,
        source: "petstore",
      });

      const savedCart = cartResponse.data;

      // 2. If Pay Online → save Shipping too
      if (paymentOption === "payOnline") {
        await axios.post("http://localhost:5000/shipping", {
          ...shippingDetails,
          userId: user._id,       // 🔥 logged-in User
          cartId: savedCart._id,  // link Shipping ↔ Cart
          items: cart.map((item) => ({
            productName: item.name,
            quantity: item.quantity,
            cost: item.cost,
          })),
          totalPrice: total,
        });

        alert("✅ Shipping Info + Order saved! Redirecting to payment page...");
        localStorage.removeItem("cart");
        setCart([]);
        navigate("/payment");
      } else {
        alert("✅ Order placed! (Cash on Delivery)");
        localStorage.removeItem("cart");
        setCart([]);
        navigate("/store");
      }
    } catch (err) {
      console.error("Error placing order:", err.response?.data || err.message);
      alert("❌ Error: " + (err.response?.data?.error || err.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="cart-page">
      {!prescription && cart.length === 0 ? (
        <div className="empty-cart">
          <h1>Your Basket</h1>
          <p>Your cart is empty 😿</p>
        </div>
      ) : (
        <>
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

          <div className="cart-summary">
            <h2>Basket Summary</h2>
            <div className="summary-box">
              <p>Subtotal: <strong>LKR {subtotal}</strong></p>
              <p>Estimated delivery: <strong>LKR {delivery}</strong></p>
              <hr />
              <p className="summary-total">Total: <strong>LKR {total}</strong></p>

              {/* Payment choice */}
              <div className="payment-options">
                <label>
                  <input
                    type="radio"
                    value="payNow"
                    checked={paymentOption === "payNow"}
                    onChange={(e) => setPaymentOption(e.target.value)}
                  /> Pay on Delivery
                </label>
                <label>
                  <input
                    type="radio"
                    value="payOnline"
                    checked={paymentOption === "payOnline"}
                    onChange={(e) => setPaymentOption(e.target.value)}
                  /> Pay Online
                </label>
              </div>

              {paymentOption === "payOnline" && (
                <div className="shipping-form">
                  <h3>Shipping Details</h3>
                  <input
                    type="text"
                    placeholder="Full Name"
                    value={shippingDetails.fullName}
                    onChange={(e) =>
                      setShippingDetails({ ...shippingDetails, fullName: e.target.value })
                    }
                  />
                  <input
                    type="text"
                    placeholder="Last Name"
                    value={shippingDetails.lastName}
                    onChange={(e) =>
                      setShippingDetails({ ...shippingDetails, lastName: e.target.value })
                    }
                  />
                  <input
                    type="text"
                    placeholder="Address"
                    value={shippingDetails.address}
                    onChange={(e) =>
                      setShippingDetails({ ...shippingDetails, address: e.target.value })
                    }
                  />
                  <input
                    type="email"
                    placeholder="Email"
                    value={shippingDetails.email}
                    onChange={(e) =>
                      setShippingDetails({ ...shippingDetails, email: e.target.value })
                    }
                  />
                  <input
                    type="tel"
                    placeholder="Phone"
                    value={shippingDetails.phone}
                    onChange={(e) =>
                      setShippingDetails({ ...shippingDetails, phone: e.target.value })
                    }
                  />
                </div>
              )}

              <button
                className="checkout-btn"
                onClick={placeOrder}
                disabled={loading || cart.length === 0}
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