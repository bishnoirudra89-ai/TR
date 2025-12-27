Integration tests

This folder contains a simple integration script `test_moderation.ts` that creates a test user, calls the `perform_moderation_action` RPC and verifies the profile state.

Requirements:
- `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE` environment variables set
- `ts-node` available (install via `npm i -D ts-node typescript @types/node`)

Run (PowerShell):

```
# Temporary env vars in PowerShell
$env:SUPABASE_URL = 'https://qnvacxzpjsqdaolccjzo.supabase.co'
$env:SUPABASE_SERVICE_ROLE = 'your_service_role_key'
npx ts-node scripts/integration/test_moderation.ts
```

Run (bash):

```
SUPABASE_URL='https://qnvacxzpjsqdaolccjzo.supabase.co' SUPABASE_SERVICE_ROLE='your_service_role_key' npx ts-node scripts/integration/test_moderation.ts
```

Or copy `.env.example` to `.env` and fill values (do NOT commit `.env`).

CI:
- Add the service role as a secret if you want to run this in CI.
