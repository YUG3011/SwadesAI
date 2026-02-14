import { Hono } from 'hono';
import { serve } from '@hono/node-server';
import { cors } from 'hono/cors';
import { errorCatcher } from './middleware/errorHandler';
import { buildRateLimiter } from './middleware/rateLimiter';
import { chatBook } from './routes/chat';
import { agentBook } from './routes/agents';

const webApp = new Hono().basePath('/api');

webApp.use('*', cors());
webApp.use('*', errorCatcher());
webApp.use('/chat/*', buildRateLimiter());

webApp.route('/chat', chatBook);
webApp.route('/agents', agentBook);

webApp.get('/health', (context) => context.json({ ok: true }));

const portChoice = Number(process.env.PORT ?? '3000');
console.log("PORT FROM ENV:", process.env.PORT);
console.log("Using port:", portChoice);

serve({
  fetch: webApp.fetch,
  port: portChoice,
});

console.log(`Backend running on http://localhost:${portChoice}`);
