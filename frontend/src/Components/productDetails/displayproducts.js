import React from 'react';
import { useNavigate } from 'react-router-dom';
import './displayproducts.css';
import axios from 'axios';

function DisplayProducts({ product }) {
  const { _id, id, name, expirationDate, cost, currantStock, minimumThreshold, category, productStatus, imageUrl } = product;
  const navigate = useNavigate();

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      try {
        await axios.delete(`http://localhost:5001/products/${_id}`);
        window.location.reload();
      } catch (err) {
        console.error("Error deleting product:", err);
      }
    }
  };

  return (
    <tr>
      <td>
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={name}
            style={{ width: "60px", height: "60px", objectFit: "cover", borderRadius: "6px" }}
          />
        ) : (
          <span>No Image</span>
        )}
      </td>
      <td>{id}</td>
      <td>{name}</td>
      <td>{expirationDate ? expirationDate.split("T")[0] : ""}</td>
      <td>LKR {cost}</td>
      <td>{currantStock}</td>
      <td>{minimumThreshold}</td>
      <td>{category}</td>
      <td>
        <span className={`dp-status-badge ${productStatus?.toLowerCase() === 'active' ? 'dp-status-active' : 'dp-status-inactive'}`}>
          {productStatus}
        </span>
      </td>
      <td>
        <div className="dp-action-buttons">
          <button
            className="dp-btn-update"
            onClick={() => navigate(`/updateproduct/${_id}`)}
          >
            Edit
          </button>
          <button className="dp-btn-delete" onClick={handleDelete}>
            Delete
          </button>
        </div>
      </td>
    </tr>
  );
}

export default DisplayProducts;