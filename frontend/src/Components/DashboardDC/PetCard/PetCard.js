import React from 'react';
import './PetCard.css';

function PetCard({ pet }) {
  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'active':
        return '#4CAF50';
      case 'completed':
        return '#2196F3';
      case 'pending':
        return '#FF9800';
      default:
        return '#9E9E9E';
    }
  };

  return (
    <div className="pet-card">
      <div className="pet-header">
        <h4>{pet.name}</h4>
        <span 
          className="status-badge"
          style={{ backgroundColor: getStatusColor(pet.status) }}
        >
          {pet.status}
        </span>
      </div>
      
      <div className="pet-details">
        <p><strong>Owner:</strong> {pet.owner}</p>
        <p><strong>Service:</strong> {pet.service}</p>
      </div>
      
      <div className="pet-actions">
        <button className="btn-view">View Details</button>
        <button className="btn-log">Add Log</button>
      </div>
    </div>
  );
}

export default PetCard;