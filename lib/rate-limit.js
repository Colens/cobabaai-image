/**
 * Simple in-memory fixed-window rate limiter (per process).
 * Good enough for a single Node instance / small traffic.
 */

const buckets = new Map();

function prune(now) {
  if (buckets.size < 2000) return;
  for (const [key, bucket] of buckets) {
    if (now - bucket.start > bucket.windowMs * 2) {
      buckets.delete(key);
    }
  }
}

/**
 * @param {string} key
 * @param {{ limit?: number, windowMs?: number }} options
 * @returns {{ ok: true } | { ok: false, retryAfterSec: number }}
 */
export function checkRateLimit(key, options = {}) {
  const limit = options.limit ?? 20;
  const windowMs = options.windowMs ?? 60_000;
  const now = Date.now();
  prune(now);

  let bucket = buckets.get(key);
  if (!bucket || now - bucket.start >= windowMs) {
    bucket = { start: now, count: 0, windowMs };
    buckets.set(key, bucket);
  }

  bucket.count += 1;
  if (bucket.count > limit) {
    const retryAfterSec = Math.max(
      1,
      Math.ceil((windowMs - (now - bucket.start)) / 1000),
    );
    return { ok: false, retryAfterSec };
  }
  return { ok: true };
}

export function getClientIp(request) {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }
  const realIp = request.headers.get("x-real-ip")?.trim();
  if (realIp) return realIp;
  return "unknown";
}
