// Cloudflare Pages Function — runs server-side at /api/leaderboard
// Reads SHEET_URL from the Pages project's Environment Variables
// (Cloudflare dashboard → your project → Settings → Environment variables → add SHEET_URL,
// pointing at your Google Apps Script Web App deployment).
// Proxying server-side avoids browser CORS issues and keeps the sheet URL out of client code.

export async function onRequestPost(context) {
  const { env, request } = context;

  let entry;
  try {
    entry = await request.json();
  } catch (e) {
    return json({ error: 'Invalid JSON body.' }, 400);
  }

  if (!env.SHEET_URL) {
    // No sheet configured — that's fine, the score already lives in localStorage on the client.
    return json({ ok: true, synced: false, note: 'SHEET_URL not configured; score kept local only.' }, 200);
  }

  try {
    await fetch(env.SHEET_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(entry)
    });
    return json({ ok: true, synced: true }, 200);
  } catch (e) {
    return json({ ok: false, synced: false, error: e.message }, 502);
  }
}

function json(obj, status) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { 'Content-Type': 'application/json' }
  });
}
