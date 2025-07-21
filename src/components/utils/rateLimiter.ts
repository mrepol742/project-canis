const rateLimitMap: Map<string, { timestamps: number[]; notified: boolean }> = new Map();
const LIMIT = 3;
const WINDOW_MS = 600000;

/**
 * Returns:
 *   true  - allowed
 *   false - rate limited, but not yet notified (should notify)
 *   null  - rate limited, already notified (do not notify again)
 */
export default function rateLimiter(number: string): true | false | null {
  const now = Date.now();
  const entry = rateLimitMap.get(number) || { timestamps: [], notified: false };

  // Remove older timestamps
  entry.timestamps = entry.timestamps.filter((ts) => now - ts < WINDOW_MS);

  if (entry.timestamps.length >= LIMIT) {
    if (entry.notified) {
      rateLimitMap.set(number, entry);
      return null;
    } else {
      entry.notified = true;
      rateLimitMap.set(number, entry);
      return false; // Notified for the first time
    }
  }

  // Allowed, reset notified flag
  entry.timestamps.push(now);
  entry.notified = false;
  rateLimitMap.set(number, entry);
  return true;
}
