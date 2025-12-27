import React from 'react';

export default function Suspended() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="max-w-md rounded bg-white p-6 text-center">
        <h1 className="text-2xl font-bold">Account Suspended</h1>
        <p className="mt-4 text-gray-700">Your account is currently suspended or banned. If you believe this is a mistake, please contact support at <a className="text-primary" href="mailto:support@dehramoon.app">support@dehramoon.app</a>.</p>
      </div>
    </div>
  );
}
