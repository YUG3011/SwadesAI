import { Hono } from 'hono';
import { serve } from '@hono/node-server';
import { cors } from 'hono/cors';
import { errorCatcher } from './middleware/errorHandler';
import { chatBook } from './routes/chat';
import { agentBook } from './routes/agents';

const webApp = new Hono().basePath('/api');

webApp.use('*', cors());
webApp.use('*', errorCatcher());

webApp.route('/chat', chatBook);
webApp.route('/agents', agentBook);

webApp.get('/health', (context) => context.json({ ok: true }));

const portChoice = Number(process.env.PORT ?? '3000');

serve({
  fetch: webApp.fetch,
  port: portChoice,
});

console.log(`Backend running on http://localhost:${portChoice}`);
