const API_BASE = 'https://wolf-discovery-api.onrender.com';

export async function discoverQuery(query) {
  const url = new URL('/api/discover', API_BASE);
  url.searchParams.set('q', String(query || '').trim());
  const lang = String(navigator.language || '').trim();
  if (lang) url.searchParams.set('lang', lang);

  const response = await fetch(url, {
    method: 'GET',
    headers: { accept: 'application/json' },
    cache: 'no-store'
  });

  if (!response.ok) {
    const error = new Error('DISCOVERY_REQUEST_FAILED');
    error.status = response.status;
    throw error;
  }

  return response.json();
}

export const DISCOVERY_API_BASE = API_BASE;
