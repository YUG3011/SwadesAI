import type { Context, MiddlewareHandler } from 'hono';

interface RateLimiterOptions {
  limit: number;
  windowMs: number;
  getClientId?: (context: Context) => string;
}

interface RateEntry {
  count: number;
  resetAt: number;
}

const parsePositiveNumber = (value: string | undefined, fallback: number) => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return fallback;
  }
  return parsed;
};

const defaultGetClientId = (context: Context) => {
  const headerNames = ['cf-connecting-ip', 'x-real-ip', 'x-forwarded-for'];
  for (const headerName of headerNames) {
    const headerValue = context.req.header(headerName);
    if (headerValue) {
      return headerValue.split(',')[0]?.trim() ?? headerValue;
    }
  }
  return context.req.header('authorization') ?? 'anonymous';
};

const buildRateLimiter = (options?: Partial<RateLimiterOptions>): MiddlewareHandler => {
  const limit = options?.limit ?? parsePositiveNumber(process.env.RATE_LIMIT, 30);
  const windowMs = options?.windowMs ?? parsePositiveNumber(process.env.RATE_LIMIT_WINDOW_MS, 60_000);
  const getClientId = options?.getClientId ?? defaultGetClientId;
  const entries = new Map<string, RateEntry>();

  return async (context, next) => {
    const clientId = getClientId(context);
    const now = Date.now();
    const currentEntry = entries.get(clientId);

    if (!currentEntry || currentEntry.resetAt <= now) {
      entries.set(clientId, { count: 1, resetAt: now + windowMs });
    } else if (currentEntry.count >= limit) {
      const retryAfterSeconds = Math.max(1, Math.ceil((currentEntry.resetAt - now) / 1000));
      context.header('Retry-After', retryAfterSeconds.toString());
      return context.json({ error: 'Rate limit exceeded. Try again soon.' }, 429);
    } else {
      currentEntry.count += 1;
    }

    const activeEntry = entries.get(clientId)!;
    context.header('X-RateLimit-Limit', limit.toString());
    context.header('X-RateLimit-Remaining', Math.max(limit - activeEntry.count, 0).toString());
    context.header('X-RateLimit-Reset', Math.floor(activeEntry.resetAt / 1000).toString());

    await next();
  };
};

export { buildRateLimiter };
