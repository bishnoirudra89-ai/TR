import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabaseClient';

export type ModerationAction = 'suspend' | 'ban' | 'revoke';

export function useSuspension() {
  const qc = useQueryClient();

  const mutation = useMutation(async (payload: { targetUserId: string; action: ModerationAction; reason?: string; durationHours?: number }) => {
    const { targetUserId, action, reason, durationHours } = payload;

    const { data, error } = await supabase.rpc('perform_moderation_action', {
      target_user_id: targetUserId,
      action_type: action,
      reason: reason ?? null,
      duration_hours: durationHours ?? null,
      admin_id: supabase.auth.user()?.id ?? null
    });

    if (error) throw error;
    return data;
  }, {
    onSuccess: () => {
      // Invalidate caches for profile lists and user detail
      qc.invalidateQueries(['profiles']);
      qc.invalidateQueries(['profile']);
    }
  });

  return mutation;
}
