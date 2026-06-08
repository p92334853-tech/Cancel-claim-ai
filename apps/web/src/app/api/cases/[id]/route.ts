import { updateCaseInputSchema } from "@cancelclaim/core";
import { jsonError, jsonOk, readBody } from "@/lib/api";
import { caseRepository } from "@/lib/repository";
import { getOwnerId } from "@/lib/session";
import { audit } from "@/lib/audit";

export const runtime = "nodejs";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: Request, ctx: Ctx): Promise<Response> {
  const ownerId = await getOwnerId();
  if (!ownerId) return jsonError("Not found", 404);
  const { id } = await ctx.params;
  const found = await caseRepository.get(ownerId, id);
  return found ? jsonOk({ case: found }) : jsonError("Not found", 404);
}

export async function PATCH(req: Request, ctx: Ctx): Promise<Response> {
  const ownerId = await getOwnerId();
  if (!ownerId) return jsonError("Not found", 404);
  const { id } = await ctx.params;
  const parsed = await readBody(req, updateCaseInputSchema);
  if (!parsed.ok) return parsed.response;

  const updated = await caseRepository.updateIntake(ownerId, id, parsed.data);
  return updated ? jsonOk({ case: updated }) : jsonError("Not found", 404);
}

export async function DELETE(_req: Request, ctx: Ctx): Promise<Response> {
  const ownerId = await getOwnerId();
  if (!ownerId) return jsonError("Not found", 404);
  const { id } = await ctx.params;
  const deleted = await caseRepository.delete(ownerId, id);
  if (deleted) await audit("case.delete", { ownerId, targetType: "case", targetId: id });
  return deleted ? jsonOk({ ok: true }) : jsonError("Not found", 404);
}
