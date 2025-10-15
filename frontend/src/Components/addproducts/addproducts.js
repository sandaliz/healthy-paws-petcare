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
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    setInputs((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleFileChange = (e) => setFile(e.target.files[0]);

  // Validation 
  const validateInputs = () => {
    const newErrors = {};

    if (!inputs.id) newErrors.id = "ID is required";
    if (!inputs.name) newErrors.name = "Name is required";
    if (!inputs.expirationDate) newErrors.expirationDate = "Expiration Date is required";
    if (inputs.cost === "") newErrors.cost = "Cost is required";
    if (inputs.currantStock === "") newErrors.currantStock = "Current Stock is required";
    if (inputs.minimumThreshold === "") newErrors.minimumThreshold = "Minimum Threshold is required";
    if (!inputs.category) newErrors.category = "Category is required";
    if (!inputs.productStatus) newErrors.productStatus = "Status is required";

    // negatives
    if (Number(inputs.cost) < 0) newErrors.cost = "Cost cannot be negative";
    if (Number(inputs.currantStock) < 0) newErrors.currantStock = "Stock cannot be negative";
    if (Number(inputs.minimumThreshold) < 0) newErrors.minimumThreshold = "Threshold cannot be negative";

    // stock vs threshold
    if (
      inputs.currantStock !== "" &&
      inputs.minimumThreshold !== "" &&
      Number(inputs.currantStock) < Number(inputs.minimumThreshold)
    ) {
      newErrors.currantStock = "Stock cannot be less than threshold";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

   
    if (!validateInputs()) {
      return; 
    }

    setLoading(true);

    try {
      const formData = new FormData();
      Object.keys(inputs).forEach((key) => {
        let value = inputs[key];
        if (key === "expirationDate") {
          formData.append(key, value);
        } else if (key === "currantStock" || key === "cost" || key === "minimumThreshold") {
          const num = Number(value);
          formData.append(key, isNaN(num) ? 0 : num);
        } else {
          formData.append(key, value);
        }
      });

      if (file) formData.append("image", file);

      await axios.post("http://localhost:5001/products", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${localStorage.getItem("token")}`
        }
      });

      navigate("/product");
    } catch (err) {
      console.error("Error submitting form:", err);
      alert("Failed to add product. Check backend logs for details.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="add-product-container">
      <h1>Add New Product</h1>
      <form className="add-product-form" onSubmit={handleSubmit}>

        <label>ID</label>
        <input type="text" name="id" value={inputs.id} onChange={handleChange} />
        {errors.id && <span className="error">{errors.id}</span>}

        <label>Name</label>
        <input type="text" name="name" value={inputs.name} onChange={handleChange} />
        {errors.name && <span className="error">{errors.name}</span>}

        <label>Expiration Date</label>
        <input
          type="date"
          name="expirationDate"
          value={inputs.expirationDate}
          onChange={handleChange}
          min={new Date().toISOString().split("T")[0]}
        />
        {errors.expirationDate && <span className="error">{errors.expirationDate}</span>}

        <label>Cost</label>
        <input type="number" name="cost" value={inputs.cost} onChange={handleChange} />
        {errors.cost && <span className="error">{errors.cost}</span>}

        <label>Current Stock</label>
        <input type="number" name="currantStock" value={inputs.currantStock} onChange={handleChange} />
        {errors.currantStock && <span className="error">{errors.currantStock}</span>}

        <label>Minimum Threshold</label>
        <input
          type="number"
          name="minimumThreshold"
          value={inputs.minimumThreshold}
          onChange={handleChange}
        />
        {errors.minimumThreshold && <span className="error">{errors.minimumThreshold}</span>}

        <label>Category</label>
        <select name="category" value={inputs.category} onChange={handleChange}>
          <option value="">-- Select Category --</option>
          <option value="Medicine">Medicine</option>
          <option value="Equipment">Equipment</option>
          <option value="Food">Food</option>
          <option value="Accessory">Accessory</option>
          <option value="Toy">Toy</option>
          <option value="Grooming">Grooming</option>
        </select>
        {errors.category && <span className="error">{errors.category}</span>}

        <label>Status</label>
        <select name="productStatus" value={inputs.productStatus} onChange={handleChange}>
          <option value="Active">Active</option>
          <option value="Inactive">Inactive</option>
        </select>
        {errors.productStatus && <span className="error">{errors.productStatus}</span>}

        <label>Product Image</label>
        <input type="file" accept="image/*" onChange={handleFileChange} />

        <button type="submit" className="submit-btn" disabled={loading}>
          {loading ? "Adding..." : "Add Product"}
        </button>
      </form>

      {loading && (
        <div className="inline-loader">
          <div className="spinner"></div>
          <span>Saving your product... hang tight ⏳</span>
        </div>
      )}
    </div>
  );
}

export default Addproducts;