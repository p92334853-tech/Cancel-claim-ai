import { validateIntake } from "@cancelclaim/core";
import { jsonError, jsonOk } from "@/lib/api";
import { getEngine } from "@/lib/ai";
import { caseRepository } from "@/lib/repository";
import { getOwnerId } from "@/lib/session";
import { rateLimit } from "@/lib/rate-limit";
import { track } from "@/lib/analytics";
import { audit } from "@/lib/audit";

export const runtime = "nodejs";
// AI generation can take time; allow headroom.
export const maxDuration = 60;

type Ctx = { params: Promise<{ id: string }> };

export async function POST(_req: Request, ctx: Ctx): Promise<Response> {
  const ownerId = await getOwnerId();
  if (!ownerId) return jsonError("Not found", 404);
  const { id } = await ctx.params;

  const limit = rateLimit(`generate:${ownerId}`, 15, 60_000);
  if (!limit.ok) return jsonError("Too many requests — please wait a moment.", 429, { retryAfter: limit.retryAfterSeconds });

  const found = await caseRepository.get(ownerId, id);
  if (!found) return jsonError("Not found", 404);

  const info = validateIntake(found.type, found.intake);
  if (!info.ready) return jsonError("Some required details are missing.", 422, { missing: info.items });

  const engine = getEngine();
  const facts = engine.extractFacts(found.type, found.intake, found.evidence);
  const start = Date.now();
  const output = await engine.generate({
    caseType: found.type,
    locale: found.locale,
    intake: found.intake,
    evidence: found.evidence,
    facts,
  });

  const updated = await caseRepository.saveOutput(ownerId, id, output, facts);
  track({ name: "case_generated", props: { caseType: found.type, engine: output.generatedBy, ms: Date.now() - start } }, ownerId);
  await audit("case.generate", { ownerId, targetType: "case", targetId: id, meta: { engine: output.generatedBy } });

  return jsonOk({ case: updated });
}
