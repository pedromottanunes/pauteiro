require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5174;
const PROXY_TOKEN = process.env.PROXY_TOKEN || null;

// Simple in-memory cache with TTL
const cache = new Map();
const CACHE_TTL = 1000 * 60 * 5; // 5 minutes

const makeCacheKey = (body) => JSON.stringify(body);

const sleep = (ms) => new Promise(res => setTimeout(res, ms));

async function fetchWithRetry(url, opts = {}, retries = 2, backoff = 200) {
  try {
    const res = await fetch(url, opts);
    if (!res.ok) {
      const body = await res.text().catch(() => '');
      const err = new Error(`HTTP ${res.status} - ${body}`);
      err.status = res.status;
      throw err;
    }
    return res;
  } catch (err) {
    if (retries > 0) {
      await sleep(backoff);
      return fetchWithRetry(url, opts, retries - 1, backoff * 2);
    }
    throw err;
  }
}

app.post('/api/search', async (req, res) => {
  const { provider, query, num = 10, cx } = req.body || {};
  if (!provider || !query) return res.status(400).json({ error: 'provider and query required' });

  // If PROXY_TOKEN is set, require clients to provide it in header `x-proxy-token`.
  if (PROXY_TOKEN) {
    const incoming = (req.headers['x-proxy-token'] || req.headers['X-Proxy-Token'] || '').toString();
    if (!incoming || incoming !== PROXY_TOKEN) {
      return res.status(401).json({ error: 'invalid or missing proxy token' });
    }
  }

  const key = makeCacheKey({ provider, query, num, cx });
  const cached = cache.get(key);
  if (cached && (Date.now() - cached.ts) < CACHE_TTL) {
    return res.json({ cached: true, data: cached.data });
  }

  try {
    let result = null;
    if (provider === 'serpapi') {
      const apiKey = process.env.SERPAPI_KEY;
      if (!apiKey) return res.status(500).json({ error: 'SerpAPI key not configured' });
      const params = new URLSearchParams({ api_key: apiKey, q: query, num: String(num), engine: 'google' });
      const url = `https://serpapi.com/search?${params}`;
      const r = await fetchWithRetry(url, {}, 2, 250);
      result = await r.json();
    } else if (provider === 'googlecse') {
      const apiKey = process.env.GOOGLE_CSE_KEY;
      const cxKey = cx || process.env.GOOGLE_CSE_CX;
      if (!apiKey || !cxKey) return res.status(500).json({ error: 'Google CSE key/cx not configured' });
      const params = new URLSearchParams({ key: apiKey, cx: cxKey, q: query, num: String(num) });
      const url = `https://www.googleapis.com/customsearch/v1?${params}`;
      const r = await fetchWithRetry(url, {}, 2, 250);
      result = await r.json();
    } else if (provider === 'bing') {
      const apiKey = process.env.BING_API_KEY;
      if (!apiKey) return res.status(500).json({ error: 'Bing API key not configured' });
      const params = new URLSearchParams({ q: query, count: String(num), mkt: 'pt-BR' });
      const url = `https://api.bing.microsoft.com/v7.0/search?${params}`;
      const r = await fetchWithRetry(url, { headers: { 'Ocp-Apim-Subscription-Key': apiKey } }, 2, 250);
      result = await r.json();
    } else {
      return res.status(400).json({ error: 'unknown provider' });
    }

    cache.set(key, { ts: Date.now(), data: result });
    return res.json({ cached: false, data: result });
  } catch (err) {
    console.error('/api/search error', err);
    return res.status(500).json({ error: String(err?.message || err) });
  }
});

app.listen(PORT, () => console.log(`NeuroContent proxy running on http://localhost:${PORT}`));
