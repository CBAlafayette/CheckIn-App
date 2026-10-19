# Check-In → Repair Order Sync

## Run locally (mic + Summarize)
1. Install Node.js 18+.
2. `cp .env.example .env` and put your real ANTHROPIC_API_KEY in it.
3. `npm install && npm run dev`
4. Open the printed localhost URL in Chrome or Edge.

## Deploy (works on phones/tablets, HTTPS automatic)
1. Push this folder to a GitHub repo (.env is git-ignored; never commit your key).
2. At vercel.com, import the repo (framework preset: Vite).
3. In Project Settings > Environment Variables add:
   - ANTHROPIC_API_KEY = your key
   - ACCESS_CODE = a shop password
4. Deploy. Open the https URL on the device, allow the mic, and enter the
   access code the first time you press Summarize.

In production, /api/summarize is served by api/summarize.js. Locally, the same
path is served by the middleware in vite.config.js.
Set a low monthly spend limit on your Anthropic account.
