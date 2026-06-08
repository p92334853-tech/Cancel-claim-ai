import { NextResponse, type NextRequest } from "next/server";
import { config as appConfig } from "./lib/config";
import { SESSION_COOKIE, newSubject, signSubject, verifyToken } from "./lib/session-crypto";

/**
 * Ensures every visitor has a valid signed session cookie before they reach a
 * page, so server components can read a stable owner id without setting cookies
 * themselves.
 */
export async function middleware(req: NextRequest): Promise<NextResponse> {
  const res = NextResponse.next();
  const token = req.cookies.get(SESSION_COOKIE)?.value;
  const valid = token ? await verifyToken(token, appConfig.sessionSecret) : null;

  if (!valid) {
    const subject = newSubject();
    res.cookies.set(SESSION_COOKIE, await signSubject(subject, appConfig.sessionSecret), {
      httpOnly: true,
      sameSite: "lax",
      secure: appConfig.isProd,
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
    });
  }
  return res;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|.*\\.(?:png|jpg|svg|ico)).*)"],
};
