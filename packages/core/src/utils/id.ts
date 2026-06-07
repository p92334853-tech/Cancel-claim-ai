/**
 * Small, dependency-free ID helpers. Uses the platform Web Crypto API when
 * available (Node 18+, browsers, React Native via polyfill) and falls back to a
 * non-cryptographic generator only as a last resort.
 */

/** Minimal Web Crypto surface we rely on, to avoid depending on the DOM lib. */
interface CryptoLike {
  randomUUID?: () => string;
  getRandomValues?: <T extends ArrayBufferView>(array: T) => T;
}

function cryptoRef(): CryptoLike | undefined {
  return typeof globalThis !== "undefined"
    ? ((globalThis as { crypto?: CryptoLike }).crypto)
    : undefined;
}

export function uuid(): string {
  const c = cryptoRef();
  if (c?.randomUUID) return c.randomUUID();
  // Fallback (dev only): RFC4122-ish without strong randomness guarantees.
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (ch) => {
    const r = (Math.random() * 16) | 0;
    const v = ch === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/** Short, URL-safe id for non-security uses (step ids, evidence ids). */
export function shortId(prefix = ""): string {
  const c = cryptoRef();
  const bytes = new Uint8Array(8);
  if (c?.getRandomValues) c.getRandomValues(bytes);
  else for (let i = 0; i < bytes.length; i++) bytes[i] = (Math.random() * 256) | 0;
  const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
  return prefix ? `${prefix}_${hex}` : hex;
}
