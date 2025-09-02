import React, { useState, useEffect } from "react";
import axios from "axios";

function PrescriptionForm() {
  const [products, setProducts] = useState([]);
  const [items, setItems] = useState([{ productMongoId: "", quantity: 1 }]);

  // ✅ Fetch products from backend
  useEffect(() => {
  axios
    .get("http://localhost:5000/products")
    .then((res) => {
      if (Array.isArray(res.data)) {
        setProducts(res.data);
      } else if (Array.isArray(res.data.products)) {
        setProducts(res.data.products);
      } else {
        console.error("Unexpected products format:", res.data);
        setProducts([]); 
      }
    })
    .catch((err) => {
      console.error("Error fetching products:", err);
      setProducts([]);
    });
}, []);

  // Add a new row
  const addRow = () => {
    setItems([...items, { productMongoId: "", quantity: 1 }]);
  };

  // Update dropdown or quantity
  const updateItem = (index, field, value) => {
    const newItems = [...items];
    newItems[index][field] = value;
    setItems(newItems);
  };

  // Submit prescription
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:5000/prescriptions", { items });
      alert("Prescription saved!");
      setItems([{ productMongoId: "", quantity: 1 }]); // reset form
    } catch (err) {
      alert(err.response?.data?.error || "Failed to save prescription");
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Create Prescription</h2>
      <form onSubmit={handleSubmit}>
        {items.map((item, i) => (
          <div key={i} style={{ marginBottom: "10px" }}>
            {/* Dropdown */}
            <select
              value={item.productMongoId}
              onChange={(e) => updateItem(i, "productMongoId", e.target.value)}
              required
            >
              <option value="">Select Medicine</option>
              {products.map((p) => (
                <option key={p._id} value={p._id}>
                  {p.name} (Stock: {p.currantStock})
                </option>
              ))}
            </select>

            {/* Quantity */}
            <input
              type="number"
              min="1"
              value={item.quantity}
              onChange={(e) => updateItem(i, "quantity", e.target.value)}
              style={{ marginLeft: "8px", width: "80px" }}
              required
            />

            {/* + button only on last row */}
            {i === items.length - 1 && (
              <button
                type="button"
                onClick={addRow}
                style={{
                  marginLeft: "8px",
                  background: "green",
                  color: "white",
                  border: "none",
                  cursor: "pointer",
                  padding: "4px 10px",
                }}
              >
                +
              </button>
            )}
          </div>
        ))}

        <button
          type="submit"
          style={{
            marginTop: "12px",
            background: "blue",
            color: "white",
            border: "none",
            padding: "6px 14px",
            cursor: "pointer",
          }}
        >
          Save Prescription
        </button>
      </form>
    </div>
  );
}

export default PrescriptionForm;