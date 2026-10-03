// Keeps a household's shopping data in step between phones.
//
// Each household is one JSON document in Netlify Blobs, found by a hash of its
// household code (the code itself is never stored). Every save bumps a revision
// number, and a save is only accepted if it was made on top of the latest
// revision; otherwise the phone gets the latest copy back (409), merges it with
// its own changes and tries again. That way two phones saving at the same time
// can't wipe out each other's changes.
//
//   GET /api/sync?rev=N        → { rev, data } or just { rev } if N is still current
//   PUT /api/sync { rev, data } → { rev } saved, or 409 { rev, data } if out of date
//
// The household code goes in the `X-Household` header.
import { getDeployStore, getStore } from '@netlify/blobs';
import type { Config, Context } from '@netlify/functions';

const MAX_BYTES = 4_000_000;

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json', 'cache-control': 'no-store' } });

// Production data lives in a site-wide store; previews and local dev get their
// own per-deploy store so testing never touches the real lists.
function households(context: Context) {
  const opts = { name: 'households', consistency: 'strong' as const };
  return context.deploy?.context === 'production' ? getStore(opts) : getDeployStore(opts);
}

async function blobKey(code: string) {
  const hash = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(code));
  return 'h/' + Array.from(new Uint8Array(hash), b => b.toString(16).padStart(2, '0')).join('');
}

export default async (req: Request, context: Context) => {
  // 16 characters from a 32-letter alphabet (no 0/O or 1/I), shown as XXXX-XXXX-XXXX-XXXX
  const code = (req.headers.get('x-household') || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
  if (!/^[A-HJ-NP-Z2-9]{16}$/.test(code)) return json({ error: 'Missing or invalid household code' }, 400);

  const store = households(context);
  const key = await blobKey(code);
  const latest = async () => {
    const got = await store.getWithMetadata(key, { type: 'json' });
    return got ? { rev: Number(got.metadata.rev) || 0, data: got.data } : { rev: 0, data: null };
  };

  if (req.method === 'GET') {
    const have = Number(new URL(req.url).searchParams.get('rev'));
    const meta = await store.getMetadata(key);
    const rev = meta ? Number(meta.metadata.rev) || 0 : 0;
    if (rev === have) return json({ rev });
    return json(await latest());
  }

  if (req.method === 'PUT') {
    const text = await req.text();
    if (text.length > MAX_BYTES) return json({ error: 'Too much data to sync' }, 413);
    let body: { rev?: unknown; data?: { lists?: unknown } } | null = null;
    try { body = JSON.parse(text); } catch {}
    if (!body || !Number.isInteger(body.rev) || !body.data || typeof body.data !== 'object' || !Array.isArray(body.data.lists)) {
      return json({ error: 'That isn’t shopping data' }, 400);
    }

    const meta = await store.getMetadata(key);
    const rev = meta ? Number(meta.metadata.rev) || 0 : 0;
    if (body.rev !== rev) return json(await latest(), 409);

    // Only write if nobody else has saved since we looked
    const res = await store.set(key, JSON.stringify(body.data), {
      metadata: { rev: rev + 1, at: Date.now() },
      ...(meta ? { onlyIfMatch: meta.etag } : { onlyIfNew: true }),
    });
    if (!res.modified) return json(await latest(), 409);
    return json({ rev: rev + 1 });
  }

  return json({ error: 'Method not allowed' }, 405);
};

export const config: Config = {
  path: '/api/sync',
};
