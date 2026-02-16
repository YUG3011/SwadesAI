import process from 'node:process';
import { Hono } from 'hono';
import { serve } from '@hono/node-server';
import { serveStatic } from '@hono/node-server/serve-static';
import { readFile } from 'node:fs/promises';
import { cors } from 'hono/cors';
import { errorCatcher } from './middleware/errorHandler.js';
import { buildRateLimiter } from './middleware/rateLimiter.js';
import { chatBook } from './routes/chat.js';
import { agentBook } from './routes/agents.js';

const app = new Hono();

// API routes
const webApp = new Hono().basePath('/api');

webApp.use('*', cors());
webApp.use('*', errorCatcher());
webApp.use('/chat/*', buildRateLimiter());

webApp.route('/chat', chatBook);
webApp.route('/agents', agentBook);
webApp.get('/health', (c) => c.json({ ok: true }));

app.route('/', webApp);

// Serve static assets (from frontend build) and SPA fallback
// Assets (e.g. hashed JS/CSS) will be served from /assets/*
app.use('/assets/*', serveStatic({ root: './public' }));

// SPA fallback for client-side routing (React/Vite)
app.get('*', async (c) => {
  try {
    const html = await readFile('./public/index.html', 'utf-8');
    return c.html(html);
  } catch (e) {
    // If public/index.html doesn't exist, fall back to health text
    return c.text('Server is running');
  }
});

const portChoice = Number.parseInt(process.env.PORT ?? '8080', 10);

console.log("PORT FROM ENV:", process.env.PORT);
console.log("Using port:", portChoice);

serve({
  fetch: app.fetch,
  port: portChoice,
  hostname: '0.0.0.0',
});

console.log(`Backend running on port ${portChoice}`);
