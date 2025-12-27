import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function AdminRoute({ children }: { children: React.ReactElement }) {
  const { profile, loading } = useAuth();

  if (loading) return <div>Loading...</div>;
  if (!profile || !profile.is_admin) return <Navigate to="/" replace />;

  return children;
}
