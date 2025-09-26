import React from 'react';
export default function Skeleton({ rows = 6 }) {
  return (
    <div className="skeleton">
      {Array.from({ length: rows }).map((_, i) => <div className="skeleton-row" key={i} />)}
    </div>
  );
}