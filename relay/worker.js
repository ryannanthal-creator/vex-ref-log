// VEX Ref Log rules relay: a Cloudflare Worker.
//
// events.vex.com doesn't let other websites read its game manual pages, so the ref log
// can't show official rule wording by itself. This Worker fetches one rule page at a
// time from the official manual and hands it to the ref log site. It only relays rule
// pages under events.vex.com/storage/game_manual/.../rules/, only for the sites listed
// below, and keeps nothing except Cloudflare's short-lived cache.
//
// Deploy: Cloudflare dashboard > Workers & Pages > Create > Hello World > Deploy >
// Edit code > replace everything with this file > Deploy. Then put the Worker's
// address (https://<name>.<account>.workers.dev) in config.js as rulesRelay.

const ALLOWED_ORIGINS = ['https://ryannanthal-creator.github.io'];
const RULE_PATH = /^\/storage\/game_manual\/[A-Za-z0-9_\-]+\/rules\/[A-Za-z0-9]{1,12}\.html$/;
const CACHE_SECONDS = 6 * 60 * 60;

export default {
  async fetch(request, env, ctx) {
    const origin = request.headers.get('Origin') || '';
    const cors = {
      'Access-Control-Allow-Origin': ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0],
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Max-Age': '86400',
      'Vary': 'Origin',
    };
    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors });
    if (request.method !== 'GET') return new Response('Only GET is allowed', { status: 405, headers: cors });

    const path = new URL(request.url).searchParams.get('path') || '';
    if (!RULE_PATH.test(path)) return new Response('Only official rule pages can be relayed', { status: 400, headers: cors });

    const target = 'https://events.vex.com' + path;
    const cache = caches.default;
    const key = new Request(target);
    let res = await cache.match(key);
    if (!res) {
      const upstream = await fetch(target, { headers: { 'User-Agent': 'VEX Ref Log rules relay' } });
      if (!upstream.ok) return new Response('events.vex.com answered ' + upstream.status, { status: upstream.status === 404 ? 404 : 502, headers: cors });
      res = new Response(await upstream.text(), {
        headers: { 'Content-Type': upstream.headers.get('Content-Type') || 'text/html; charset=utf-8', 'Cache-Control': 'public, max-age=' + CACHE_SECONDS },
      });
      ctx.waitUntil(cache.put(key, res.clone()));
    }
    const out = new Response(res.body, res);
    for (const [k, v] of Object.entries(cors)) out.headers.set(k, v);
    return out;
  },
};
