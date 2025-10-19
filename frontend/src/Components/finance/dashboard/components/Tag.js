import React from 'react';

export default function Tag({ status, className = '' }) {
  const s = (status || '').toLowerCase();
  let cls = 'tag-pill';
  if (s === 'paid' || s === 'completed') cls += ' green';
  else if (s === 'pending') cls += ' yellow';
  else if (s === 'overdue') cls += ' red';
  else if (s === 'refunded' || s === 'cancelled') cls += ' gray';

  return <span className={`${cls} ${className}`}>{status || '-'}</span>;
}