import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

// Usage: Set SUPABASE_URL and SUPABASE_SERVICE_ROLE (service role key) and run:
// PowerShell: $env:SUPABASE_URL='https://...'; $env:SUPABASE_SERVICE_ROLE='...'; npx ts-node scripts/integration/test_moderation.ts
// bash: SUPABASE_URL='https://...' SUPABASE_SERVICE_ROLE='...' npx ts-node scripts/integration/test_moderation.ts

(async function(){
  const url = process.env.SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_ROLE!;
  if (!url || !key) { console.error('Set SUPABASE_URL and SUPABASE_SERVICE_ROLE'); process.exit(1); }

  const sb = createClient(url, key);

  // Create a test user and profile
  const { user, error: uErr } = await sb.auth.signUp({ email: 'test-moderator@example.com', password: 'P@ssw0rd!' });
  if (uErr) throw uErr;
  const userId = user!.id;

  // insert a profile if needed
  await sb.from('profiles').insert([{ id: userId, account_status: 'active', is_verified: false, is_admin: false }]);

  console.log('Calling perform_moderation_action: suspend for 1 hour');
  const { error: rpcErr } = await sb.rpc('perform_moderation_action', { target_user_id: userId, action_type: 'suspend', reason: 'test', duration_hours: 1, admin_id: null });
  if (rpcErr) throw rpcErr;

  const { data: profile } = await sb.from('profiles').select('account_status').eq('id', userId).single();
  console.log('Resulting account_status:', profile.account_status);

  if (profile.account_status !== 'suspended') { console.error('RPC failed to suspend'); process.exit(2); }
  console.log('RPC suspend OK');

  console.log('Now revoke...');
  await sb.rpc('perform_moderation_action', { target_user_id: userId, action_type: 'revoke', reason: 'test revoke', duration_hours: null, admin_id: null });
  const { data: profile2 } = await sb.from('profiles').select('account_status').eq('id', userId).single();
  console.log('After revoke:', profile2.account_status);
  if (profile2.account_status !== 'active') { console.error('Revoke failed'); process.exit(3); }
  console.log('Revoke OK');

  console.log('Cleaning up test data...');
  await sb.from('suspension_logs').delete().eq('user_id', userId);
  await sb.from('profiles').delete().eq('id', userId);
  await sb.auth.admin.deleteUser(userId);

  console.log('Integration test successful');
})();