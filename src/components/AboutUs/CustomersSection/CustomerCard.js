import React from 'react';
import './CustomerCard.css';

const CustomerCard = ({ icon, description }) => {
  return (
    <div className="customer-card">
      <div className="customer-card__icon-container">
        <div className="customer-card__icon">
          {icon}
        </div>
      </div>
      <div className="customer-card__content">
        <p className="customer-card__description">{description}</p>
      </div>
    </div>
  );
};

export default CustomerCard;

