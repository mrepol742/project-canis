export function normalize(raw: string): string | null {
  try {
    const u = new URL(raw.trim());
    let normalized = `${u.protocol}//${u.hostname}${u.pathname}`;
    if (!normalized.endsWith("/")) {
      normalized += "/";
    }
    return normalized;
  } catch {
    return null;
  }
}
