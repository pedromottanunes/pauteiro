NeuroContent Proxy Server
=========================

Small Express proxy to call SerpAPI, Google Custom Search (CSE) and Bing Web Search from a trusted server, keeping API keys out of the browser.

Setup

1. Copy `.env.example` to `.env` and fill the keys.
2. Install dependencies:

```powershell
cd server
npm install
```

3. Run locally:

```powershell
npm run start
```

Endpoints

- `POST /api/search` — body: `{ provider: 'serpapi'|'googlecse'|'bing', query: string, num?: number, cx?: string }`

The proxy provides basic in-memory caching and simple retry/backoff.

Notes

- Use Node.js 18+ so `fetch` is available globally.
- This is intentionally minimal; for production you should add authentication, stronger caching (Redis), rate-limit and monitoring.

Authentication (optional)

- You can require clients to send a proxy token by setting `PROXY_TOKEN` in the server `.env` file. When set, all requests must include the header `x-proxy-token: <token>`.
- To make development easier you can skip setting `PROXY_TOKEN` (proxy will accept requests without the header).

Client usage

- The client code attempts to call `/api/search` on the same origin. If you run the proxy on a different port or host, update the `PROXY_PATH` in `services/webSearchService.ts` accordingly.

