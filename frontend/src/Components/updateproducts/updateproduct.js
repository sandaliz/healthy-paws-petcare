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

  const handleSubmit = async (e) => {
    e.preventDefault();
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
    }
  };

  return (
    <div className="add-product-container">
      <h1>Edit Product</h1>
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
          <option value="Food">Foods</option>
          <option value="Accessory">Accessory</option>
          <option value="Toy">Toy</option>
          <option value="Grooming">Grooming</option>
        </select>

        <label>Status</label>
        <select name="productStatus" value={inputs.productStatus || "Active"} onChange={handleChange}>
          <option value="Active">Active</option>
          <option value="Inactive">Inactive</option>
        </select>

        <label>Update Image</label>
        <input type="file" accept="image/*" onChange={handleFileChange} />

        <button type="submit" className="submit-btn">Update Product</button>
      </form>
    </div>
  );
}

export default Updateproduct;