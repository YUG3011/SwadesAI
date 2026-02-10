import type { Context, Next } from 'hono';

const errorCatcher = () => async (context: Context, nextStep: Next) => {
  try {
    await nextStep();
  } catch (trouble) {
    console.error('Server trouble', trouble);
    const messageText = trouble instanceof Error ? trouble.message : 'Unexpected issue';
    return context.json({ error: messageText }, 500);
  }
};

export { errorCatcher };
