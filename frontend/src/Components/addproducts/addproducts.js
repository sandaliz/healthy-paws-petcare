import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './addproducts.css';

function Addproducts() {
  const navigate = useNavigate();
  const [inputs, setInputs] = useState({
    id: "",
    name: "",
    expirationDate: "",
    cost: "",
    currantStock: "",
    minimumThreshold: "",
    category: "",
    productStatus: "Active"
  });

  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setInputs((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleFileChange = (e) => setFile(e.target.files[0]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formData = new FormData();
      Object.keys(inputs).forEach((key) => {
        if (key === "expirationDate") {
          formData.append(key, new Date(inputs.expirationDate).toISOString());
        } else if (key === "currantStock" || key === "cost" || key === "minimumThreshold") {
          formData.append(key, Number(inputs[key]));
        } else {
          formData.append(key, inputs[key]);
        }
      });
      if (file) formData.append("image", file);

      await axios.post("http://localhost:5000/products", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      navigate("/product");
    } catch (err) {
      console.error("Error submitting form:", err);
      alert("Failed to add product. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="add-product-container">
      <h1>Add New Product</h1>
      <form className="add-product-form" onSubmit={handleSubmit}>

        <label>ID</label>
        <input type="text" name="id" value={inputs.id} onChange={handleChange} required />

        <label>Name</label>
        <input type="text" name="name" value={inputs.name} onChange={handleChange} required />

        <label>Expiration Date</label>
        <input type="date" name="expirationDate" value={inputs.expirationDate} onChange={handleChange} required />

        <label>Cost</label>
        <input type="number" name="cost" value={inputs.cost} onChange={handleChange} required />

        <label>Current Stock</label>
        <input type="number" name="currantStock" value={inputs.currantStock} onChange={handleChange} required />

        <label>Minimum Threshold</label>
        <input type="number" name="minimumThreshold" value={inputs.minimumThreshold} onChange={handleChange} required />

        <label>Category</label>
        <select name="category" value={inputs.category} onChange={handleChange} required>
          <option value="">-- Select Category --</option>
          <option value="Medicine">Medicine</option>
          <option value="Equipment">Equipment</option>
          <option value="Food">Food</option>
          <option value="Accessory">Accessory</option>
          <option value="Toy">Toy</option>
          <option value="Grooming">Grooming</option>
        </select>

        <label>Status</label>
        <select name="productStatus" value={inputs.productStatus} onChange={handleChange}>
          <option value="Active">Active</option>
          <option value="Inactive">Inactive</option>
        </select>

        <label>Product Image</label>
        <input type="file" accept="image/*" onChange={handleFileChange} />

        <button type="submit" className="submit-btn" disabled={loading}>
          {loading ? "Adding..." : "Add Product"}
        </button>
      </form>

      {loading && (
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Saving your product... hang tight ⏳</p>
        </div>
      )}
    </div>
  );
}

export default Addproducts;