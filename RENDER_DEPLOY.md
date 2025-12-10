Render deployment (static site)

This project is a Vite React app. To deploy on Render as a static site:

1. Push the repository to GitHub (use the helper script in `scripts/push-to-github.ps1`).

2. On Render:
   - Create a new "Static Site" and connect your GitHub repository.
   - Build Command: `npm install && npm run build`
   - Publish Directory: `dist`

3. Environment variables:
   - Add any secrets in the Render dashboard (e.g., API keys). Do NOT commit them to the repo.

For a Node web service (if you prefer server-side proxy to be deployed together):

- You can create a separate Render service for the `server` folder. Use these settings:
  - Environment: Node
  - Build Command: `npm install`
  - Start Command: `node index.js`
  - Set environment variables from `.env` in the Render dashboard (SERPAPI_KEY, GOOGLE_CSE_KEY, GOOGLE_CSE_CX, BING_API_KEY, PROXY_TOKEN)

Notes
- Static deployment is simpler for the front-end. The proxy server should be deployed separately and protected by a token.
- After you push the repo and connect Render, I can review the Render settings and suggest exact commands.
