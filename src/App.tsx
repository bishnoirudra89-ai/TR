import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AdminRoute from './components/AdminRoute';
import BottomNav from './components/BottomNav';

const Landing = lazy(() => import('./pages/landing/Landing'));
const AdminPage = lazy(() => import('./pages/admin/Admin'));
const Suspended = lazy(() => import('./pages/suspended/Suspended'));
const Explore = lazy(() => import('./pages/explore/Explore'));
const Chat = lazy(() => import('./pages/chat/Chat'));
const Profile = lazy(() => import('./pages/profile/Profile'));
const Directory = lazy(() => import('./pages/directory/Directory'));
const Forbidden = lazy(() => import('./pages/forbidden/Forbidden'));

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-[var(--bg-midnight)] text-white app-safe-area">
        <Suspense fallback={<div>Loading...</div>}>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/explore" element={<Explore />} />
            <Route path="/chat" element={<Chat />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/directory" element={<Directory />} />
            <Route path="/forbidden" element={<Forbidden />} />
            <Route path="/suspended" element={<Suspended />} />
            <Route path="/admin/*" element={<AdminRoute><AdminPage /></AdminRoute>} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
        <BottomNav />
      </div>
    </BrowserRouter>
  );
}
