import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import "./updateproduct.css";

function Updateproduct() {
  const [inputs, setInputs] = useState({
    id: "",
    name: "",
    expirationDate: "",
    cost: "",
    currantStock: "",
    minimumThreshold: "",
    category: "",
    productStatus: "Active",
    imageUrl: ""
  });

  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({}); // ✅ state for validation errors
  const navigate = useNavigate();
  const { id } = useParams();

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await axios.get(`http://localhost:5001/products/${id}`);
        let product = res.data;

        if (product.expirationDate) {
          product.expirationDate = product.expirationDate.split("T")[0];
        }
        setInputs(product);
      } catch (err) {
        console.error("Error fetching product:", err);
      }
    };
    fetchProduct();
  }, [id]);

  const handleChange = (e) => {
    setInputs((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleFileChange = (e) => setFile(e.target.files[0]);

  // ✅ Validation function (same logic as Add Product)
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
        if (key === "expirationDate") {
          formData.append(key, new Date(inputs.expirationDate).toISOString());
        } else {
          formData.append(key, inputs[key]);
        }
      });
      if (file) formData.append("image", file);

      await axios.put(`http://localhost:5001/products/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      navigate("/product");
    } catch (err) {
      console.error("Error updating product:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="add-product-container">
      <h1>Edit Product</h1>
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
        <input type="number" name="minimumThreshold" value={inputs.minimumThreshold} onChange={handleChange} />
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
        <select name="productStatus" value={inputs.productStatus || "Active"} onChange={handleChange}>
          <option value="Active">Active</option>
          <option value="Inactive">Inactive</option>
        </select>
        {errors.productStatus && <span className="error">{errors.productStatus}</span>}

        <label>Update Image</label>
        <input type="file" accept="image/*" onChange={handleFileChange} />

        <button type="submit" className="submit-btn" disabled={loading}>
          {loading ? "Updating..." : "Update Product"}
        </button>
      </form>

      {/* Loader */}
      {loading && (
        <div className="center-loader">
          <div className="loader-circle"></div>
        </div>
      )}
    </div>
  );
}

export default Updateproduct;