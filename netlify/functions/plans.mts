// Shared meal plans: a read-only copy of a week's meals and their recipes, so a
// meal plan can be sent to someone as a link.
//
// Each shared plan is one JSON document in Netlify Blobs under a random id that
// goes in the link (…/#plan=ID). Plans are never changed after they're saved:
// sharing the week again makes a new link.
//
//   POST /api/plans { v, week, meals, recipes } → { id }
//   GET  /api/plans?id=ID                       → the plan, or 404
import { getDeployStore, getStore } from '@netlify/blobs';
import type { Config, Context } from '@netlify/functions';

const MAX_BYTES = 400_000;
// 10 characters from a 32-letter alphabet (no 0/O or 1/I): about 50 bits, too many to guess
const ABC = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const ID_RX = /^[A-HJ-NP-Z2-9]{10}$/;
const newId = () => Array.from(crypto.getRandomValues(new Uint8Array(10)), b => ABC[b & 31]).join('');

const json = (body: unknown, status = 200, cache = 'no-store') =>
  new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json', 'cache-control': cache } });

// Production plans live in a site-wide store; previews and local dev get their
// own per-deploy store, as with the household sync.
function plans(context: Context) {
  const opts = { name: 'plans', consistency: 'strong' as const };
  return context.deploy?.context === 'production' ? getStore(opts) : getDeployStore(opts);
}

const isDate = (s: unknown) => typeof s === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(s);
const isText = (s: unknown, max: number) => typeof s === 'string' && s.length <= max;

// Only what the app needs to show a plan, so the store can't be used for anything else
function clean(body: any) {
  if (!body || typeof body !== 'object' || body.v !== 1 || !isDate(body.week)) return null;
  const { meals, recipes } = body;
  if (!Array.isArray(meals) || !meals.length || meals.length > 60 || !Array.isArray(recipes) || recipes.length > 40) return null;
  if (!recipes.every((md: unknown) => isText(md, 40_000))) return null;
  const out = [];
  for (const m of meals) {
    if (!m || !isDate(m.d) || !isText(m.t, 200) || !m.t.trim()) return null;
    const r = m.r === undefined ? undefined : m.r;
    if (r !== undefined && !(Number.isInteger(r) && r >= 0 && r < recipes.length)) return null;
    const s = typeof m.s === 'number' && m.s > 0 && m.s < 100 ? m.s : undefined;
    out.push({ d: m.d, t: m.t, ...(r !== undefined ? { r } : {}), ...(s ? { s } : {}) });
  }
  return { v: 1, week: body.week, meals: out, recipes };
}

export default async (req: Request, context: Context) => {
  const store = plans(context);

  if (req.method === 'GET') {
    const id = (new URL(req.url).searchParams.get('id') || '').toUpperCase();
    if (!ID_RX.test(id)) return json({ error: 'That link isn’t right' }, 400);
    const plan = await store.get('p/' + id, { type: 'json' });
    if (!plan) return json({ error: 'That meal plan couldn’t be found' }, 404);
    // a shared plan never changes, so phones can keep it
    return json(plan, 200, 'public, max-age=86400');
  }

  if (req.method === 'POST') {
    const text = await req.text();
    if (text.length > MAX_BYTES) return json({ error: 'That meal plan is too big to share' }, 413);
    let body: unknown = null;
    try { body = JSON.parse(text); } catch {}
    const plan = clean(body);
    if (!plan) return json({ error: 'That isn’t a meal plan' }, 400);
    for (let tries = 0; tries < 3; tries++) {
      const id = newId();
      const res = await store.set('p/' + id, JSON.stringify(plan), { metadata: { at: Date.now() }, onlyIfNew: true });
      if (res.modified) return json({ id });
    }
    return json({ error: 'Couldn’t save the meal plan' }, 500);
  }

  return json({ error: 'Method not allowed' }, 405);
};

export const config: Config = {
  path: '/api/plans',
};
