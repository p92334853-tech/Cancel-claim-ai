import { classifyInputSchema } from "@cancelclaim/core";
import { clientIp, jsonError, jsonOk, readBody } from "@/lib/api";
import { getEngine } from "@/lib/ai";
import { rateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";

export async function POST(req: Request): Promise<Response> {
  const limit = rateLimit(`classify:${clientIp(req)}`, 30, 60_000);
  if (!limit.ok) return jsonError("Too many requests — please wait.", 429, { retryAfter: limit.retryAfterSeconds });

  const parsed = await readBody(req, classifyInputSchema);
  if (!parsed.ok) return parsed.response;

  const engine = getEngine();
  const classification = await engine.classify(parsed.data.text, parsed.data.locale);
  return jsonOk({ classification });
}
