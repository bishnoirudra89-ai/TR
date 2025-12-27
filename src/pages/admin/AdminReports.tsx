import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../lib/supabaseClient';
import { useSuspension } from '../../hooks/useSuspension';

export default function AdminReports() {
  const { data: reports } = useQuery(['reports'], async () => {
    const { data, error } = await supabase.from('reports').select('*').order('created_at', { ascending: true }).limit(200);
    if (error) throw error;
    return data;
  });

  const suspension = useSuspension();

  const approveAndBan = async (r: any) => {
    await suspension.mutateAsync({ targetUserId: r.reported_user_id, action: 'ban', reason: 'Approved by admin report' });
    await supabase.from('reports').delete().eq('id', r.id);
  };

  const dismiss = async (r: any) => {
    await supabase.from('reports').delete().eq('id', r.id);
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold">Reports Queue</h2>
      <div className="mt-4 space-y-4">
        {(!reports || reports.length === 0) ? (
          <div className="text-gray-400">No reports</div>
        ) : reports.map((r: any) => (
          <div key={r.id} className="p-4 rounded bg-white text-black flex justify-between items-center">
            <div>
              <div className="font-semibold">Reported: {r.reported_user_id}</div>
              <div className="text-sm text-gray-600">Reason: {r.reason}</div>
            </div>
            <div className="space-x-2">
              <button onClick={() => approveAndBan(r)} className="px-3 py-1 rounded bg-red-600 text-white">Approve (Ban)</button>
              <button onClick={() => dismiss(r)} className="px-3 py-1 rounded bg-gray-200">Dismiss</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
