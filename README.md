SwadesAI — Simple Multi-Agent Support Demo

This repo is a small, easy-to-read demo of a customer support sistema powered by small agents.


What this project does
- Receives user messages and routes them to sub-agents (order, billing, support)
- Streams agent replies back to the frontend
- Keeps conversation history in a database
- Has a lightweigth compactor to shrink old context before sending to the LLM
- Includes a basic rate limiter to protect endpoints from abuse
- I hvae build using Docker so u need docker desktop u can take my docker file and run it
- U can check in docker file also 
  <!-- image: postgres:16-alpine
    <!-- environment: -->
      <!-- POSTGRES_USER: postgres -->
      <!-- POSTGRES_PASSWORD: postgres -->
      <!-- POSTGRES_DB: multi_agent_support --> 

      -------------------------------------------------
Quick start (dev)
1. Install dependecies for backend and frontend:
   - `cd backend && npm install`
   - `cd ../frontend && npm install`
2. Start backend (Hono):
   - `cd backend && npm run dev`
3. Start frontend (Vite):
   - `cd frontend && npm run dev`

Environment
- Backend expects a `DATABASE_URL` in the enviroment for Prisma/Postgres.
- Optional: set `RATE_LIMIT` and `RATE_LIMIT_WINDOW_MS` to tune the limiter. if u not set then we have set by defoult

Testing
- A small Vitest setup is included for simple unit/integration tests.
- Run tests from the `backend` folder: `npm test`.

Notes about compaction and rate limit
- The compactor (`backend/src/services/compactor.ts`) keeps the most recent messages and folds older messages into a short system summary. This reduces token usage when calling LLMs.
- The rate limiter (`backend/src/middleware/rateLimiter.ts`) defaults to 30 requests per minute and returns proper `X-RateLimit-*` headers when in use.

Deploy frontend with backend
1. Build the frontend:
   - `cd frontend && npm install && npm run build`
2. Copy the build into the backend `public` folder:
   - `mkdir -p backend/public`
   - `cp -r frontend/dist/* backend/public/` (Windows PowerShell: `Copy-Item -Recurse frontend\dist\* backend\public`)
3. The backend already serves static files from `backend/public` and provides an SPA fallback.
4. Deploy the backend to Azure (same app):
   - `az webapp deploy --resource-group <rg> --name <app-name> --src-path backend`
After deployment:
- `https://<app-name>.azurewebsites.net/` → Frontend UI
- `https://<app-name>.azurewebsites.net/api/...` → API
