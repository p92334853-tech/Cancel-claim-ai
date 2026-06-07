/**
 * A minimal fixed-window rate limiter held in memory. Good enough for a single
 * instance and for protecting expensive routes (AI generation, uploads). For
 * multi-instance production, back this with Redis using the same interface.
 */
type Bucket = { count: number; resetAt: number };
const buckets = new Map<string, Bucket>();

export interface RateLimitResult {
  ok: boolean;
  remaining: number;
  retryAfterSeconds: number;
}

export function rateLimit(key: string, limit: number, windowMs: number): RateLimitResult {
  const now = Date.now();
  const bucket = buckets.get(key);

  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true, remaining: limit - 1, retryAfterSeconds: 0 };
  }

  if (bucket.count >= limit) {
    return { ok: false, remaining: 0, retryAfterSeconds: Math.ceil((bucket.resetAt - now) / 1000) };
  }

  bucket.count += 1;
  return { ok: true, remaining: limit - bucket.count, retryAfterSeconds: 0 };
}

// Opportunistically evict expired buckets so the map can't grow unbounded.
if (typeof setInterval !== "undefined") {
  const timer = setInterval(() => {
    const now = Date.now();
    for (const [key, bucket] of buckets) if (bucket.resetAt <= now) buckets.delete(key);
  }, 60_000);
  // Don't keep the process alive just for cleanup.
  (timer as { unref?: () => void }).unref?.();
}
