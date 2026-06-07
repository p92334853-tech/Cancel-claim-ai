/**
 * Stateless, signed session tokens using the Web Crypto API so the same code
 * runs in the Edge middleware and Node route handlers. The token is
 * `<subject>.<hmac>`; the subject namespaces a person's cases. This is a secure
 * anonymous-session baseline; a full auth provider can replace it without
 * touching the rest of the app (the "owner id" contract stays the same).
 */
const encoder = new TextEncoder();

export const SESSION_COOKIE = "cc_session";

function base64url(bytes: Uint8Array): string {
  let binary = "";
  for (const b of bytes) binary += String.fromCharCode(b);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

async function hmac(secret: string, data: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(data));
  return base64url(new Uint8Array(signature));
}

export async function signSubject(subject: string, secret: string): Promise<string> {
  return `${subject}.${await hmac(secret, subject)}`;
}

export async function verifyToken(token: string, secret: string): Promise<string | null> {
  const idx = token.lastIndexOf(".");
  if (idx <= 0) return null;
  const subject = token.slice(0, idx);
  const signature = token.slice(idx + 1);
  const expected = await hmac(secret, subject);
  return constantTimeEqual(signature, expected) ? subject : null;
}

export function newSubject(): string {
  return crypto.randomUUID();
}

function constantTimeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i++) result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return result === 0;
}
