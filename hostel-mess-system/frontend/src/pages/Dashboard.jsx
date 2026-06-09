import React, { useEffect, useState } from 'react';

export default function Dashboard() {
  const [message, setMessage] = useState('');

  useEffect(() => {
    // Placeholder: dashboard API endpoints are not part of the required backend spec.
    setMessage('Use Students / Mess Plans / Billing to manage records.');
  }, []);

  return (
    <div className="p-4 md:p-6">
      <div className="card2 rounded-2xl p-6">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-slate-200/90 mt-2">{message}</p>
      </div>
    </div>
  );
}

