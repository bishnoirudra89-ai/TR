import React, { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../lib/supabaseClient';
import { useSuspension, ModerationAction } from '../../hooks/useSuspension';

// Shadcn UI / Tailwind style placeholders
import { Link, useLocation } from 'react-router-dom';
import AdminOverview from './AdminOverview';
import AdminReports from './AdminReports';

export default function AdminPage() {
  const location = useLocation();
  const tab = location.pathname.includes('/admin/reports') ? 'reports' : location.pathname.includes('/admin/overview') ? 'overview' : 'users';

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Admin Dashboard</h1>

      <div className="mt-4 flex space-x-3">
        <Link to="/admin/overview" className={`px-3 py-2 rounded ${tab === 'overview' ? 'bg-yellow-400 text-black' : 'bg-white/10'}`}>Overview</Link>
        <Link to="/admin" className={`px-3 py-2 rounded ${tab === 'users' ? 'bg-yellow-400 text-black' : 'bg-white/10'}`}>Users</Link>
        <Link to="/admin/reports" className={`px-3 py-2 rounded ${tab === 'reports' ? 'bg-yellow-400 text-black' : 'bg-white/10'}`}>Reports</Link>
      </div>

      <div className="mt-6">
        {tab === 'overview' && <AdminOverview />}
        {tab === 'reports' && <AdminReports />}
        {tab === 'users' && (
          <section>
            {/* Existing Users table */}
            {/* Fetch profiles list */}
            <UserManagement />
          </section>
        )}
      </div>
    </div>
  );
}


function UserManagement() {
  // Keep the previous user management implementation here (extracted for clarity)
  const { data: profiles, isLoading } = useQuery(['profiles'], async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, full_name, is_verified, account_status, is_admin')
      .order('created_at', { ascending: false })
      .limit(200);

    if (error) throw error;
    return data;
  });

  const suspension = useSuspension();
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [duration, setDuration] = useState<number | undefined>(24);
  const [reason, setReason] = useState('');
  const [actionType, setActionType] = useState<ModerationAction>('suspend');

  const openFor = (user: any, action: ModerationAction) => {
    setSelectedUser(user);
    setActionType(action);
    setModalOpen(true);
  };

  const submit = async () => {
    if (!selectedUser) return;
    await suspension.mutateAsync({ targetUserId: selectedUser.id, action: actionType, reason, durationHours: actionType === 'suspend' ? duration : undefined });
    setModalOpen(false);
  };

  const rows = useMemo(() => profiles || [], [profiles]);

  return (
    <>
      <section>
        <h2 className="text-lg font-semibold">User Management</h2>
        <div className="mt-4 overflow-auto rounded border">
          <table className="w-full table-auto text-left">
            <thead className="bg-gray-50">
              <tr>
                <th className="p-2">Name</th>
                <th className="p-2">Verified</th>
                <th className="p-2">Status</th>
                <th className="p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={4} className="p-4">Loading...</td></tr>
              ) : rows.length === 0 ? (
                <tr><td colSpan={4} className="p-4">No users</td></tr>
              ) : rows.map((r: any) => (
                <tr key={r.id} className="border-t">
                  <td className="p-2">{r.full_name ?? r.id}</td>
                  <td className="p-2">{r.is_verified ? '✅' : '—'}</td>
                  <td className="p-2">{r.account_status}</td>
                  <td className="p-2 space-x-2">
                    <button className="px-3 py-1 rounded bg-yellow-500 text-white" onClick={() => openFor(r, 'suspend')}>Suspend</button>
                    <button className="px-3 py-1 rounded bg-red-600 text-white" onClick={() => openFor(r, 'ban')}>Ban</button>
                    <button className="px-3 py-1 rounded bg-green-600 text-white" onClick={() => openFor(r, 'revoke')}>Revoke</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Modal */}
      {modalOpen && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded bg-white p-6">
            <h3 className="text-lg font-semibold">{actionType === 'suspend' ? 'Suspend user' : actionType === 'ban' ? 'Ban user' : 'Revoke access'}</h3>
            <p className="mt-2 text-sm text-gray-600">User: {selectedUser.full_name ?? selectedUser.id}</p>

            {actionType === 'suspend' && (
              <div className="mt-4">
                <label className="block text-sm font-medium">Duration</label>
                <select className="mt-1 block w-full" value={duration} onChange={(e) => setDuration(Number(e.target.value))}>
                  <option value={24}>24 hours</option>
                  <option value={24*7}>7 days</option>
                  <option value={24*30}>30 days</option>
                </select>
              </div>
            )}

            <div className="mt-4">
              <label className="block text-sm font-medium">Reason</label>
              <textarea className="mt-1 block w-full rounded border p-2" value={reason} onChange={(e) => setReason(e.target.value)} />
            </div>

            <div className="mt-6 flex justify-end space-x-2">
              <button className="px-4 py-2 rounded border" onClick={() => setModalOpen(false)}>Cancel</button>
              <button className="px-4 py-2 rounded bg-primary text-white" onClick={submit} disabled={suspension.isLoading}>{suspension.isLoading ? 'Processing...' : 'Confirm'}</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
