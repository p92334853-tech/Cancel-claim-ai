import { z } from "zod";
import { jsonOk, readBody } from "@/lib/api";
import { track } from "@/lib/analytics";
import { getOwnerId } from "@/lib/session";
import type { AnalyticsEvent } from "@cancelclaim/core";

export const runtime = "nodejs";

// Loose validation: a known event name plus an arbitrary (small) props object.
const trackSchema = z.object({
  name: z.string().min(1).max(64),
  props: z.record(z.union([z.string(), z.number(), z.boolean()])).optional(),
});

export async function POST(req: Request): Promise<Response> {
  const parsed = await readBody(req, trackSchema);
  if (!parsed.ok) return parsed.response;
  const ownerId = (await getOwnerId()) ?? undefined;
  // Cast: the typed catalog lives in core; the wire payload is validated loosely.
  track({ name: parsed.data.name, props: parsed.data.props } as unknown as AnalyticsEvent, ownerId);
  return jsonOk({ ok: true });
}
