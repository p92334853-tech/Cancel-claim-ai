import { cookies } from "next/headers";
import { config } from "./config";
import { SESSION_COOKIE, newSubject, signSubject, verifyToken } from "./session-crypto";

const ONE_YEAR = 60 * 60 * 24 * 365;

function cookieOptions() {
  return { httpOnly: true, sameSite: "lax" as const, secure: config.isProd, path: "/", maxAge: ONE_YEAR };
}

/** Read the current owner id (server components / route handlers). */
export async function getOwnerId(): Promise<string | null> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  return verifyToken(token, config.sessionSecret);
}

/**
 * Read or create the owner id. Only valid in route handlers / server actions
 * (where setting cookies is permitted). Pages rely on the middleware-issued
 * cookie and use {@link getOwnerId}.
 */
export async function ensureOwnerId(): Promise<string> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (token) {
    const subject = await verifyToken(token, config.sessionSecret);
    if (subject) return subject;
  }
  const subject = newSubject();
  store.set(SESSION_COOKIE, await signSubject(subject, config.sessionSecret), cookieOptions());
  return subject;
}

/** Clear the session (used by account delete). */
export async function clearSession(): Promise<void> {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
}
