import process from 'node:process';
import { Hono } from 'hono';
import { serve } from '@hono/node-server';
import { cors } from 'hono/cors';
import { errorCatcher } from './middleware/errorHandler.js';
import { buildRateLimiter } from './middleware/rateLimiter.js';
import { chatBook } from './routes/chat.js';
import { agentBook } from './routes/agents.js';
const app = new Hono();
// Root route for Azure to do health check
app.get('/', (c) => c.text('Server is running'));
// API routes
const webApp = new Hono().basePath('/api');
webApp.use('*', cors());
webApp.use('*', errorCatcher());
webApp.use('/chat/*', buildRateLimiter());
webApp.route('/chat', chatBook);
webApp.route('/agents', agentBook);
webApp.get('/health', (c) => c.json({ ok: true }));
app.route('/', webApp);
const portChoice = Number.parseInt(process.env.PORT ?? '8080', 10);
console.log("PORT FROM ENV:", process.env.PORT);
console.log("Using port:", portChoice);
serve({
    fetch: app.fetch,
    port: portChoice,
    hostname: '0.0.0.0',
});
console.log(`Backend running on port ${portChoice}`);
