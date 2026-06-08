import { NextResponse } from "next/server";
import type { z, ZodType } from "zod";

export function jsonOk<T>(data: T, init?: ResponseInit): NextResponse {
  return NextResponse.json(data, init);
}

export function jsonError(message: string, status = 400, extra?: Record<string, unknown>): NextResponse {
  return NextResponse.json({ error: message, ...extra }, { status });
}

type ReadResult<T> = { ok: true; data: T } | { ok: false; response: NextResponse };

/** Parse + validate a JSON request body. Returns the schema's *output* type (defaults applied). */
export async function readBody<S extends ZodType>(req: Request, schema: S): Promise<ReadResult<z.output<S>>> {
  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return { ok: false, response: jsonError("Invalid JSON body", 400) };
  }
  const parsed = schema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, response: jsonError("Validation failed", 422, { issues: parsed.error.flatten() }) };
  }
  return { ok: true, data: parsed.data as z.output<S> };
}

export function clientIp(req: Request): string {
  const h = req.headers;
  return (h.get("x-forwarded-for")?.split(",")[0] || h.get("x-real-ip") || "anon").trim();
}
