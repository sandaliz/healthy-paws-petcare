import React from 'react';

export default function Tag({ status }) {
  const s = (status || '').toLowerCase();
  let cls = 'tag-pill';
  if (s === 'paid'  || s === 'completed') cls += ' green';
  else if (s === 'pending') cls += ' yellow';
  else if (s === 'overdue') cls += ' red';
  else if (s === 'refunded') cls += ' gray';
  else if (s === 'cancelled') cls += ' gray';
  return <span className={cls}>{status || '-'}</span>;
}