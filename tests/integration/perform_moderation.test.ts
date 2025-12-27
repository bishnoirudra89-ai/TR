import { describe, it, expect } from 'vitest';

// This integration test requires SUPABASE_URL and SUPABASE_SERVICE_ROLE to be set.
// It will be skipped when not provided.

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE) {
  console.warn('Skipping integration tests: SUPABASE_URL or SUPABASE_SERVICE_ROLE not provided');
}

describe('perform_moderation_action RPC (integration)', () => {
  it('suspends and revokes a test user (requires service role)', async () => {
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE) return;

    // Import supabase client dynamically to avoid failing import when envs are not present
    const { createClient } = await import('@supabase/supabase-js');
    const sb = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE);

    // Create a temporary test user
    const { user, error: uErr } = await sb.auth.signUp({ email: `test-${Date.now()}@example.com`, password: 'P@ssw0rd!' });
    expect(uErr).toBeNull();
    const userId = user!.id;

    // Insert profile
    await sb.from('profiles').insert([{ id: userId, account_status: 'active', is_verified: false, is_admin: false }]);

    // Call RPC to suspend for 1 hour
    const { error: rpcErr } = await sb.rpc('perform_moderation_action', { target_user_id: userId, action_type: 'suspend', reason: 'integration test', duration_hours: 1 });
    expect(rpcErr).toBeNull();

    const { data: profile } = await sb.from('profiles').select('account_status').eq('id', userId).single();
    expect(profile.account_status).toBe('suspended');

    // Revoke
    await sb.rpc('perform_moderation_action', { target_user_id: userId, action_type: 'revoke' });
    const { data: profile2 } = await sb.from('profiles').select('account_status').eq('id', userId).single();
    expect(profile2.account_status).toBe('active');

    // Cleanup
    await sb.from('suspension_logs').delete().eq('user_id', userId);
    await sb.from('profiles').delete().eq('id', userId);
    await sb.auth.admin.deleteUser(userId);
  }, 20000);
});
