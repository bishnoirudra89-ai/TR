# DehraMoon Connect — Architecture Notes

## Quick Summary ✅
- Added DB migrations for `suspension_logs`, `kyc_documents`, device tracking (`device_logs`, `banned_devices`) and RPCs (`perform_moderation_action`, `is_device_banned`).
- Implemented hooks: `useSuspension`, `useKYC`, `usePhotoModeration`, `useDeviceTracking`, `usePullToRefresh`, and `useAuth` (with account_status enforcement).
- Admin Dashboard (`/admin`) with suspension modal implemented at `src/pages/admin/Admin.tsx`.
- Landing Page with a React Three Fiber Moon and parallax stars at `src/pages/landing`.
- PWA scaffolding: `public/manifest.webmanifest` and styles for safe-area and input behaviors.

## Migrations
Files placed in `supabase/migrations/`:
- `001_create_suspension_logs_and_rpc.sql`
- `002_kyc_documents_and_device_tables.sql`

To apply migrations:
1. Install and login the Supabase CLI
2. `supabase db push --db-url "<your-db-url>"` or use the Supabase dashboard to run the SQL files.

## Running integration tests
- There is a helper script at `scripts/integration/test_moderation.ts` which uses the Supabase service role key to run smoke tests.
- Example (requires `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE` environment variables):

```bash
# from project root
npx ts-node scripts/integration/test_moderation.ts
```

- For CI, set `SUPABASE_DB_URL` (for migrations), and `SUPABASE_URL` & `SUPABASE_SERVICE_ROLE` (for integration tests) as repository secrets.

### Running integration in GitHub Actions (manual run)
1. Go to your repository on GitHub → Settings → Secrets and Variables → Actions → New repository secret.
2. Add the following secrets (recommended names):
   - `SUPABASE_DB_URL` — your Postgres connection string used by `supabase db push` (use the DB URL from Supabase settings; treat as sensitive).
   - `SUPABASE_URL` — your Supabase project URL (e.g., `https://qnvacxzpjsqdaolccjzo.supabase.co`).
   - `SUPABASE_SERVICE_ROLE` — **service role** key (very sensitive; use only in CI jobs that are protected).
   - `MOD_API_KEY` — optional, moderation provider key if you integrate a real provider.
3. In GitHub, open the **Actions** tab, choose the CI workflow, click **Run workflow**, set the input `run_integration` to **true** (if you want to run integration tests), and run it.
4. The workflow will run `build`, then `migrations` (applies SQL), and then `integration-tests` (if you set `run_integration=true`). The workflow now validates secrets and fails early with a clear message if any required secret is missing.

**Security tip:** Consider using GitHub Environments for production secrets and restricting who can run workflows with secrets. Avoid printing secrets in logs. Use short-lived credentials where possible.

## Hooks & Components
- `src/hooks/useSuspension.ts`
- `src/hooks/useKYC.ts`
- `src/hooks/usePhotoModeration.ts`
- `src/hooks/useDeviceTracking.ts`
- `src/hooks/useAuth.ts` (enforces `suspended`/`banned` redirect)
- `src/hooks/usePullToRefresh.ts`

- `src/pages/admin/Admin.tsx` (Admin dashboard)
- `src/pages/landing/Landing.tsx` & `MoonScene.tsx`
- `src/components/BottomNav.tsx`, `AdminRoute.tsx`

## Next Recommended Steps
1. Review the SQL (especially privileges and roles) and apply to your Supabase instance.
2. Wire up routes (done) and protect `/admin` with `<AdminRoute>` (done).
3. Add server-side tests for RPCs and edge function integration tests (integration script and Vitest integration tests added).
4. Implement the `moderate-photo` edge function (a template + mock provider are included for local testing in `supabase/functions/moderate-photo`).
5. Add CI steps to run migrations and tests (CI now runs migrations and an integration test job using `SUPABASE_SERVICE_ROLE` and `SUPABASE_URL` secrets).


Developer tip — fixing `npm install` ERESOLVE errors:
- If you see an ERESOLVE peer dependency error, update the conflicting dev dependency versions. For example, Vitest requires `@types/node` >= 20; the project was using `@types/node` v18. We updated `@types/node` to `^20.11.0` in `package.json`.
- Recommended clean install steps (Windows PowerShell):
  1. Remove lockfile and node_modules: `rm -r node_modules; rm package-lock.json` (or delete in File Explorer)
  2. Clear npm cache: `npm cache clean --force`
  3. Install: `npm install`
- Quick workaround: `npm install --legacy-peer-deps` (accepts potentially mismatched peers). Use only if you cannot upgrade packages.

---
What I implemented in this round:
- Scaffolding for pages: `Explore`, `Chat`, `Profile`, `Directory`, `Forbidden` (with time-gated access).
- Admin split: `AdminOverview`, `AdminReports` and updated `Admin.tsx` to include tabs and the existing User Management.
- `reports` table migration and the reports queue UI.
- Test tooling and scripts: `package.json`, `vitest` configuration, unit tests for `AdminRoute` and `Forbidden`, and an integration test script.
- Mock moderation provider and integration into the `moderate-photo` function for local testing.

Next suggestions:
- Run `npm ci` and `npm run test` locally to validate unit tests, and `npm run test:integration` with `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE` set to run integration tests.
- Review and apply the SQL migrations to your Supabase instance and verify RLS policies.
- Replace or augment the mock moderation provider with a real provider (add a configurable provider chain for production).

If you want, I can now:
1. Run a dry-run of integration tests in CI configuration and show the expected logs (requires setting secrets in CI). ✅
2. Add end-to-end tests for the Forbidden route and Admin flows using Playwright/Cypress. 🎯
3. Add more comprehensive tests for KYC/photo moderation flows.

