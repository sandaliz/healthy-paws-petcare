import React from 'react';

export default function Skeleton({ rows = 6, className = '' }) {
  return (
    <div className={`skeleton ${className}`}>
      {Array.from({ length: rows }).map((_, i) => (
        <div className="skeleton-row" key={i} />
      ))}
    </div>
  );
}