import http from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('.', import.meta.url));
const port = Number(process.env.PORT || 4173);
const braveKey = String(process.env.BRAVE_API_KEY || '').trim();
const frontendOrigin = 'https://wolf-braincore-evaluator.onrender.com';
const allowedOrigins = new Set([
  frontendOrigin,
  'http://127.0.0.1:4173',
  'http://localhost:4173'
]);
const rate = new Map();
const types = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp'
};

function corsHeaders(req) {
  const origin = String(req.headers.origin || '');
  if (!origin || allowedOrigins.has(origin)) {
    return {
      'access-control-allow-origin': origin || frontendOrigin,
      'access-control-allow-methods': 'GET,OPTIONS',
      'access-control-allow-headers': 'content-type',
      'vary': 'Origin'
    };
  }
  return {};
}

function sendJson(req, res, status, payload) {
  res.writeHead(status, {
    'content-type': 'application/json; charset=utf-8',
    'cache-control': 'no-store',
    'x-content-type-options': 'nosniff',
    ...corsHeaders(req)
  });
  res.end(JSON.stringify(payload));
}

function rateLimited(req) {
  const ip = String(req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown').split(',')[0].trim();
  const now = Date.now();
  const previous = rate.get(ip) || [];
  const recent = previous.filter(ts => now - ts < 60_000);
  if (recent.length >= 30) return true;
  recent.push(now);
  rate.set(ip, recent);
  if (rate.size > 500) {
    for (const [key, values] of rate) {
      if (!values.some(ts => now - ts < 60_000)) rate.delete(key);
    }
  }
  return false;
}

function safeLang(value) {
  const lang = String(value || '').toLowerCase().split('-')[0];
  return /^[a-z]{2}$/.test(lang) ? lang : '';
}

function compactDomain(url) {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return '';
  }
}

async function fetchBrave(query, lang) {
  if (!braveKey) return { enabled: false, results: [] };
  const url = new URL('https://api.search.brave.com/res/v1/web/search');
  url.searchParams.set('q', query);
  url.searchParams.set('count', '5');
  url.searchParams.set('safesearch', 'moderate');
  if (lang) url.searchParams.set('search_lang', lang);
  const response = await fetch(url, {
    headers: {
      accept: 'application/json',
      'x-subscription-token': braveKey
    },
    signal: AbortSignal.timeout(6500)
  });
  if (!response.ok) throw new Error('BRAVE_SEARCH_FAILED_' + response.status);
  const data = await response.json();
  const results = Array.isArray(data?.web?.results) ? data.web.results : [];
  return {
    enabled: true,
    results: results.slice(0, 5).map(item => ({
      title: String(item.title || '').trim(),
      url: String(item.url || '').trim(),
      domain: compactDomain(item.url),
      description: String(item.description || '').replace(/<[^>]+>/g, '').trim()
    })).filter(item => item.title && item.url)
  };
}

async function fetchOpenverse(query) {
  const url = new URL('https://api.openverse.org/v1/images/');
  url.searchParams.set('q', query);
  url.searchParams.set('page_size', '4');
  url.searchParams.set('license', 'pdm,cc0,by');
  const response = await fetch(url, {
    headers: { accept: 'application/json' },
    signal: AbortSignal.timeout(6500)
  });
  if (!response.ok) throw new Error('OPENVERSE_SEARCH_FAILED_' + response.status);
  const data = await response.json();
  const results = Array.isArray(data?.results) ? data.results : [];
  return results.slice(0, 4).map(item => ({
    title: String(item.title || 'Untitled').trim(),
    thumbnail: String(item.thumbnail || '').trim(),
    creator: String(item.creator || 'Unknown creator').trim(),
    attribution: String(item.attribution || '').trim(),
    license: String(item.license || '').toUpperCase(),
    licenseUrl: String(item.license_url || '').trim(),
    sourceUrl: String(item.foreign_landing_url || item.url || '').trim(),
    source: String(item.source || item.provider || 'Openverse').trim()
  })).filter(item => item.thumbnail && item.sourceUrl && item.licenseUrl);
}

async function discover(query, lang) {
  const [brave, visuals] = await Promise.allSettled([
    fetchBrave(query, lang),
    fetchOpenverse(query)
  ]);
  const web = brave.status === 'fulfilled' ? brave.value : { enabled: Boolean(braveKey), results: [] };
  const images = visuals.status === 'fulfilled' ? visuals.value : [];
  return {
    query,
    webEnabled: web.enabled,
    webProvider: 'Brave Search',
    webResults: web.results,
    visuals: images,
    partial: brave.status === 'rejected' || visuals.status === 'rejected'
  };
}

async function serveStatic(req, res, pathname) {
  const requested = pathname === '/' ? '/index.html' : pathname;
  const safe = normalize(requested).replace(/^(\.\.(\/|\\|$))+/, '');
  const path = join(root, safe);
  if (!path.startsWith(root)) {
    res.writeHead(403).end('Forbidden');
    return;
  }
  try {
    const body = await readFile(path);
    res.writeHead(200, {
      'content-type': types[extname(path)] || 'application/octet-stream',
      'cache-control': 'no-store',
      'x-content-type-options': 'nosniff',
      'referrer-policy': 'strict-origin-when-cross-origin'
    });
    res.end(body);
  } catch {
    res.writeHead(404, {'content-type':'text/plain; charset=utf-8'}).end('Not found');
  }
}

http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const pathname = url.pathname;

  if (req.method === 'OPTIONS' && pathname.startsWith('/api/')) {
    res.writeHead(204, corsHeaders(req)).end();
    return;
  }

  if (pathname === '/health') {
    sendJson(req, res, 200, {
      ok: true,
      service: 'wolf-discovery-api',
      braveConfigured: Boolean(braveKey)
    });
    return;
  }

  if (pathname === '/api/discover') {
    if (req.method !== 'GET') {
      sendJson(req, res, 405, { error: 'METHOD_NOT_ALLOWED' });
      return;
    }
    if (rateLimited(req)) {
      sendJson(req, res, 429, { error: 'RATE_LIMITED' });
      return;
    }
    const query = String(url.searchParams.get('q') || '').replace(/\s+/g, ' ').trim();
    if (query.length < 2 || query.length > 120) {
      sendJson(req, res, 400, { error: 'QUERY_REQUIRED', message: 'Use a query between 2 and 120 characters.' });
      return;
    }
    try {
      sendJson(req, res, 200, await discover(query, safeLang(url.searchParams.get('lang'))));
    } catch {
      sendJson(req, res, 502, { error: 'DISCOVERY_UNAVAILABLE' });
    }
    return;
  }

  await serveStatic(req, res, pathname);
}).listen(port, '0.0.0.0', () => {
  console.log(`WOLF service listening on http://0.0.0.0:${port}`);
});
