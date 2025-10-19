import React from 'react';

export default function Modal({ open, onClose, title, children, className = '' }) {
  if (!open) return null;
  return (
    <div className={`fm-modal ${className}`}>
      <div className="fm-modal-box">
        <div className="fm-modal-head">
          <h3>{title}</h3>
          <button className="btn ghost" onClick={onClose}>
            ✕
          </button>
        </div>
        <div className="fm-modal-body">{children}</div>
      </div>
    </div>
  );
}