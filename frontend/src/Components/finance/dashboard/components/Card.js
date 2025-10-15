import React from 'react';

export default function Card({ title, value, children, className = '' }) {
  return (
    <div className={`card ${className}`}>
      {title && <div className="kpi-title">{title}</div>}
      {value != null && <div className="kpi-value">{value}</div>}
      {children}
    </div>
  );
}