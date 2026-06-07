import { z } from "zod";
import { jsonError, jsonOk, readBody } from "@/lib/api";
import { caseRepository } from "@/lib/repository";
import { getOwnerId } from "@/lib/session";

export const runtime = "nodejs";

type Ctx = { params: Promise<{ id: string }> };

const toggleSchema = z.object({ reminderId: z.string(), done: z.boolean() });

export async function PATCH(req: Request, ctx: Ctx): Promise<Response> {
  const ownerId = await getOwnerId();
  if (!ownerId) return jsonError("Not found", 404);
  const { id } = await ctx.params;
  const parsed = await readBody(req, toggleSchema);
  if (!parsed.ok) return parsed.response;

  const ok = await caseRepository.toggleReminder(ownerId, id, parsed.data.reminderId, parsed.data.done);
  return ok ? jsonOk({ ok: true }) : jsonError("Not found", 404);
}
