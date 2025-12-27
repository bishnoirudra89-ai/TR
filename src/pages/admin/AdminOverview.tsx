import React from 'react';

export default function AdminOverview() {
  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold">Overview</h2>
      <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded bg-white text-black">Active Users<br/><span className="text-2xl font-bold">1,234</span></div>
        <div className="p-4 rounded bg-white text-black">Revenue (₹)<br/><span className="text-2xl font-bold">₹12,345</span></div>
        <div className="p-4 rounded bg-white text-black">Pending Reports<br/><span className="text-2xl font-bold">7</span></div>
      </div>
      <div className="mt-6 p-4 rounded bg-white text-black">User Growth chart placeholder (use Recharts)</div>
    </div>
  );
}
