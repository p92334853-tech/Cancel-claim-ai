import { createCaseInputSchema } from "@cancelclaim/core";
import { jsonError, jsonOk, readBody } from "@/lib/api";
import { caseRepository } from "@/lib/repository";
import { ensureOwnerId, getOwnerId } from "@/lib/session";
import { audit } from "@/lib/audit";

export const runtime = "nodejs";

export async function GET(): Promise<Response> {
  const ownerId = await getOwnerId();
  if (!ownerId) return jsonOk({ cases: [] });
  const cases = await caseRepository.list(ownerId);
  return jsonOk({ cases });
}

export async function POST(req: Request): Promise<Response> {
  const parsed = await readBody(req, createCaseInputSchema);
  if (!parsed.ok) return parsed.response;

  const ownerId = await ensureOwnerId();
  try {
    const created = await caseRepository.create(ownerId, {
      type: parsed.data.type,
      locale: parsed.data.locale,
      intake: parsed.data.intake,
      title: parsed.data.title,
    });
    await audit("case.create", { ownerId, targetType: "case", targetId: created.id, meta: { type: created.type } });
    return jsonOk({ case: created }, { status: 201 });
  } catch {
    return jsonError("Could not create case", 500);
  }
}
