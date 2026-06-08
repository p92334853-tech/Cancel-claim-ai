import { addEvidenceInputSchema } from "@cancelclaim/core";
import { jsonError, jsonOk, readBody } from "@/lib/api";
import { caseRepository } from "@/lib/repository";
import { getOwnerId } from "@/lib/session";

export const runtime = "nodejs";

type Ctx = { params: Promise<{ id: string }> };

/**
 * Remove control characters (keeping tab/newline/return) and bound length.
 * Basic upload sanitisation for pasted or extracted evidence text.
 */
function cleanText(input: string | undefined): string | undefined {
  if (input == null) return undefined;
  let out = "";
  for (const ch of input) {
    const code = ch.codePointAt(0) ?? 0;
    const isControl = code < 0x20 && code !== 0x09 && code !== 0x0a && code !== 0x0d;
    if (!isControl) out += ch;
  }
  return out.slice(0, 20_000);
}

function cleanName(name: string): string {
  return name.replace(/[^\w.\- ]+/g, "_").slice(0, 200);
}

export async function POST(req: Request, ctx: Ctx): Promise<Response> {
  const ownerId = await getOwnerId();
  if (!ownerId) return jsonError("Not found", 404);
  const { id } = await ctx.params;

  const parsed = await readBody(req, addEvidenceInputSchema);
  if (!parsed.ok) return parsed.response;

  const added = await caseRepository.addEvidence(ownerId, id, {
    ...parsed.data,
    name: cleanName(parsed.data.name),
    textContent: cleanText(parsed.data.textContent),
  });
  return added ? jsonOk({ evidence: added }, { status: 201 }) : jsonError("Not found", 404);
}

export async function DELETE(req: Request, ctx: Ctx): Promise<Response> {
  const ownerId = await getOwnerId();
  if (!ownerId) return jsonError("Not found", 404);
  const { id } = await ctx.params;
  const evidenceId = new URL(req.url).searchParams.get("evidenceId");
  if (!evidenceId) return jsonError("evidenceId required", 400);

  const removed = await caseRepository.removeEvidence(ownerId, id, evidenceId);
  return removed ? jsonOk({ ok: true }) : jsonError("Not found", 404);
}
