import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import "./Cart.css";
import InvoiceModal from "../finance/client/InvoiceModal";
import OfflinePaymentModal from "../finance/client/offline/OfflinePaymentModal";

function Cart() {
  const { id } = useParams(); 
  const [user, setUser] = useState(null);
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


  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [latestInvoice, setLatestInvoice] = useState(null);
  const [showOfflineModal, setShowOfflineModal] = useState(false);


  const [errors, setErrors] = useState({});

  const navigate = useNavigate();

  // Load user 
  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  // Load prescription 
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

  // ------------------ VALIDATION FUNCTION ------------------
  const validateShippingDetails = () => {
    let newErrors = {};

    if (!shippingDetails.fullName.trim()) {
      newErrors.fullName = "Full Name is required";
    }
    if (!shippingDetails.lastName.trim()) {
      newErrors.lastName = "Last Name is required";
    }
    if (!shippingDetails.address.trim()) {
      newErrors.address = "Address is required";
    }
    if (!shippingDetails.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(shippingDetails.email)) {
      newErrors.email = "Invalid email format";
    }
    if (!shippingDetails.phone.trim()) {
      newErrors.phone = "Phone is required";
    } else if (!/^\d{10}$/.test(shippingDetails.phone)) {
      newErrors.phone = "Phone must be 10 digits";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0; 
  };

  const placeOrder = async () => {
    try {
      if (!user?._id) {
        alert("❌ You must log in before checking out.");
        navigate("/login");
        return;
      }
      setLoading(true);

  
      if (paymentOption === "payOnline" && !validateShippingDetails()) {
        alert("Please fix the errors in the form.");
        setLoading(false);
        return;
      }

      if (prescription) {
  
        // 🔹 PRESCRIPTION CHECKOUT
  
        await axios.put(`http://localhost:5001/prescriptions/${prescription._id}`, {
          status: "pending", 
        });

        const cartRes = await axios.post("http://localhost:5001/checkout", {
          userId: user._id,
          items: prescription.items.map((item) => ({
            productMongoId: item.productMongoId || null,
            productName: item.productName,
            quantity: item.quantity,
            cost: item.cost,
          })),
          totalPrice: total,
          source: "prescription",
        });

        const savedCart = cartRes.data;

        const invoiceRes = await axios.post("http://localhost:5001/api/finance/invoice/cart", {
          cartId: savedCart.cartId,
          userId: savedCart.userId,
        });

        const invoice = invoiceRes.data.invoice;

        if (paymentOption === "payOnline") {
          await axios.post("http://localhost:5001/shipping", {
            ...shippingDetails,
            userId: user._id,
            cartId: savedCart._id,
            items: prescription.items.map((item) => ({
              productName: item.productName,
              quantity: item.quantity,
              cost: item.cost,
            })),
            totalPrice: total,
          });
          navigate(`/pay/online?invoice=${invoice._id}`);
        } else {
          setLatestInvoice(invoice);
          setShowOfflineModal(true);
        }

      } else {

        //  NORMAL CART CHECKOUT

        const cartResponse = await axios.post("http://localhost:5001/checkout", {
          userId: user._id,
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

        const invoiceRes = await axios.post("http://localhost:5001/api/finance/invoice/cart", {
          cartId: savedCart.cartId,
          userId: savedCart.userId,
        });

        const invoice = invoiceRes.data.invoice;

        if (paymentOption === "payOnline") {
          await axios.post("http://localhost:5001/shipping", {
            ...shippingDetails,
            userId: user._id,
            cartId: savedCart._id,
            items: cart.map((item) => ({
              productName: item.name,
              quantity: item.quantity,
              cost: item.cost,
            })),
            totalPrice: total,
          });

          localStorage.removeItem("cart");
          setCart([]);
          navigate(`/pay/online?invoice=${invoice._id}`);
        } else {
          setLatestInvoice(invoice);
          setShowOfflineModal(true);
        }
      }
    } catch (err) {
      console.error("Error placing order:", err.response?.data || err.message);
      alert("❌ Error: " + (err.response?.data?.error || err.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="cart-page">
        {!prescription && cart.length === 0 ? (
          <div className="empty-cart">
            <h1>Your Basket</h1>
            <p>Your cart is empty 😿</p>
          </div>
        ) : (
          <>
            <div className="cart-items">
              <h1>{prescription ? "Prescription Basket" : "Your Basket"}</h1>
              {prescription
                ? prescription.items.map((item, i) => (
                  <div key={i} className="cart-item">
                    <div className="item-info">
                      <h2>{item.productName}</h2>
                    </div>
                    <div className="quantity">
                      <input type="text" value={item.quantity} readOnly />
                    </div>
                    <div className="price">LKR {item.quantity * item.cost}</div>
                  </div>
                ))
                : cart.map((item) => (
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
                    <button
                      className="remove-btn"
                      onClick={() => removeItem(item._id)}
                    >
                      Remove
                    </button>
                  </div>
                ))}
            </div>

            <div className="cart-summary">
              <h2>Basket Summary</h2>
              <div className="summary-box">
                <p>
                  Subtotal: <strong>LKR {subtotal}</strong>
                </p>
                <p>
                  Estimated delivery: <strong>LKR {delivery}</strong>
                </p>
                <hr />
                <p className="summary-total">
                  Total: <strong>LKR {total}</strong>
                </p>

                <div className="payment-options">
                  <label>
                    <input
                      type="radio"
                      value="payNow"
                      checked={paymentOption === "payNow"}
                      onChange={(e) => setPaymentOption(e.target.value)}
                    />{" "}
                    Pay on Delivery
                  </label>
                  <label>
                    <input
                      type="radio"
                      value="payOnline"
                      checked={paymentOption === "payOnline"}
                      onChange={(e) => setPaymentOption(e.target.value)}
                    />{" "}
                    Pay Online
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
                    {errors.fullName && <p className="error">{errors.fullName}</p>}

                    <input
                      type="text"
                      placeholder="Last Name"
                      value={shippingDetails.lastName}
                      onChange={(e) =>
                        setShippingDetails({ ...shippingDetails, lastName: e.target.value })
                      }
                    />
                    {errors.lastName && <p className="error">{errors.lastName}</p>}

                    <input
                      type="text"
                      placeholder="Address"
                      value={shippingDetails.address}
                      onChange={(e) =>
                        setShippingDetails({ ...shippingDetails, address: e.target.value })
                      }
                    />
                    {errors.address && <p className="error">{errors.address}</p>}

                    <input
                      type="email"
                      placeholder="Email"
                      value={shippingDetails.email}
                      onChange={(e) =>
                        setShippingDetails({ ...shippingDetails, email: e.target.value })
                      }
                    />
                    {errors.email && <p className="error">{errors.email}</p>}

                    <input
                      type="tel"
                      placeholder="Phone"
                      value={shippingDetails.phone}
                      onChange={(e) =>
                        setShippingDetails({ ...shippingDetails, phone: e.target.value })
                      }
                    />
                    {errors.phone && <p className="error">{errors.phone}</p>}
                  </div>
                )}

                <button
                  className="checkout-btn"
                  onClick={placeOrder}
                  disabled={loading || (!prescription && cart.length === 0)}
                >
                  {loading ? "Processing..." : "Continue to Checkout"}
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {showInvoiceModal && latestInvoice && (
        <InvoiceModal
          invoice={latestInvoice}
          onClose={() => setShowInvoiceModal(false)}
        />
      )}

      {showOfflineModal && latestInvoice && (
        <OfflinePaymentModal
          invoice={latestInvoice}
          ownerId={user?._id}
          onClose={() => setShowOfflineModal(false)}
          onSuccess={() => {
            setShowOfflineModal(false);
            setShowInvoiceModal(true);
            if (!prescription) {
              localStorage.removeItem("cart");
              setCart([]);
            }
          }}
        />
      )}
    </>
  );
}

export default Cart;
