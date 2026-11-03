/**
 * In-memory rate limiter. Nginx does not forward the visitor's IP, so
 * limits are counted per key (usually "all" for a global ceiling).
 */
export function createLimiter({ windowMs, max }: { windowMs: number; max: number }) {
  const hits = new Map<string, { count: number; reset: number }>()

  return {
    /** True when the key has used its quota for the current window. */
    blocked(key: string) {
      const entry = hits.get(key)
      return !!entry && entry.reset > Date.now() && entry.count >= max
    },
    hit(key: string) {
      const now = Date.now()
      const entry = hits.get(key)
      if (!entry || entry.reset <= now) hits.set(key, { count: 1, reset: now + windowMs })
      else entry.count++
    },
  }
}
