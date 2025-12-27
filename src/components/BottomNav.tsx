import React from 'react';
import { Home, Compass, MessageCircle, User } from 'lucide-react';

export default function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[#1a1625] border-t border-gray-800 p-2 md:hidden">
      <div className="mx-auto flex max-w-lg justify-between px-4">
        <button className="flex flex-col items-center text-sm text-gray-200"><Home size={20} /><span>Home</span></button>
        <button className="flex flex-col items-center text-sm text-gray-200"><Compass size={20} /><span>Explore</span></button>
        <button className="flex flex-col items-center text-sm text-gray-200"><MessageCircle size={20} /><span>Chat</span></button>
        <button className="flex flex-col items-center text-sm text-gray-200"><User size={20} /><span>Profile</span></button>
      </div>
    </nav>
  );
}
