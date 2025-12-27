// Supabase Edge Function: moderate-photo
// Template that accepts a POST multipart/form-data with a `file` field
// and returns JSON: { approved: boolean, reason?: string }

export default async function handler(req: Request): Promise<Response> {
  if (req.method !== 'POST') return new Response('Only POST allowed', { status: 405 });

  try {
    const form = await req.formData();
    const file = form.get('file') as File | null;

    if (!file) {
      return new Response(JSON.stringify({ approved: false, reason: 'no_file' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }

    // OPTIONAL: Call external moderation API if configured
    const MOD_API_KEY = Deno.env.get('MOD_API_KEY');
    if (MOD_API_KEY) {
      // Example placeholder: forward to a third-party moderation API
      // Note: Replace with your provider's endpoint and payload
      // const resp = await fetch('https://api.moderation.example/v1/moderate', { method: 'POST', headers: { 'Authorization': `Bearer ${MOD_API_KEY}` }, body: file.stream() });
      // const json = await resp.json();
      // if (json.flagged) return new Response(JSON.stringify({ approved: false, reason: 'flagged_by_model' }), { status: 200, headers: { 'Content-Type': 'application/json' } });

      // For now, we pass through
      return new Response(JSON.stringify({ approved: true }), { status: 200, headers: { 'Content-Type': 'application/json' } });
    }

    // If no external provider, use local mock provider (included for testing/dev)
    try {
      const mockModule = await import('./providers/mock.ts');
      const buf = new Uint8Array(await file.arrayBuffer());
      const out = await mockModule.moderateBuffer(buf);
      if (!out.approved) {
        return new Response(JSON.stringify({ approved: false, reason: out.reason }), { status: 200, headers: { 'Content-Type': 'application/json' } });
      }
    } catch (err) {
      console.warn('mock moderation failed, proceeding to default check', err);
    }

    // Default behavior - simple rule: accept images below 5MB
    const maxBytes = 5 * 1024 * 1024;
    if (file.size > maxBytes) {
      return new Response(JSON.stringify({ approved: false, reason: 'file_too_large' }), { status: 200, headers: { 'Content-Type': 'application/json' } });
    }

    // Otherwise approve (placeholder)
    return new Response(JSON.stringify({ approved: true }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (err) {
    console.error('moderate-photo error', err);
    return new Response(JSON.stringify({ approved: false, reason: 'server_error' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}
