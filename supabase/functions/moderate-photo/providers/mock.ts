export async function moderateBuffer(buffer: Uint8Array) {
  // Very-simple mock: approve images < 3MB, otherwise reject
  const maxBytes = 3 * 1024 * 1024;
  if (buffer.byteLength > maxBytes) return { approved: false, reason: 'too_large' };
  // Simulate a quick heuristic: check if buffer contains some text signature 'NSFW' (mock)
  const txt = new TextDecoder().decode(buffer.slice(0, 1024));
  if (txt.includes('NSFW')) return { approved: false, reason: 'mock_flagged' };
  return { approved: true };
}
