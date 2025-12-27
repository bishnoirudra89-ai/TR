import React from 'react';
import MoonScene from './MoonScene';

export default function Landing() {
  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-2 items-center bg-[#1a1625] text-white p-6">
      <div className="space-y-6">
        <h1 className="text-4xl font-bold">Find your match under the Doon Valley moonlight.</h1>
        <p className="text-lg text-gray-300">DehraMoon Connect is a premium, hyper-localized social discovery app for Dehradun.</p>

        <div className="flex items-center space-x-3">
          <button className="rounded-full bg-yellow-400 px-6 py-3 font-semibold text-black">Join the Community</button>
          <div className="text-sm text-gray-400">Verified Dehradun Users: <span className="font-bold">1,234</span></div>
        </div>

        <div className="mt-4 text-sm text-gray-500">Local Vibes · Cafes · Maggi Points · Events</div>
      </div>

      <div className="flex items-center justify-center">
        <div className="relative">
          <div className="absolute inset-0 -z-10">
            {/* Parallax stars background - simple CSS animated dots for now */}
            <div className="bg-stars w-full h-full" />
          </div>
          <MoonScene />
        </div>
      </div>
    </div>
  );
}
