import { jsonError } from "@/lib/api";
import { buildCasePdf } from "@/lib/pdf";
import { caseRepository } from "@/lib/repository";
import { getOwnerId } from "@/lib/session";
import { track } from "@/lib/analytics";
import { audit } from "@/lib/audit";

export const runtime = "nodejs";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: Request, ctx: Ctx): Promise<Response> {
  const ownerId = await getOwnerId();
  if (!ownerId) return jsonError("Not found", 404);
  const { id } = await ctx.params;

  const found = await caseRepository.get(ownerId, id);
  if (!found) return jsonError("Not found", 404);
  if (!found.output) return jsonError("Generate the case before exporting.", 409);
  if (!found.unlocked) return jsonError("Unlock this case to export the full pack.", 402);

  const bytes = await buildCasePdf(found);
  track({ name: "export_done", props: { caseType: found.type, format: "pdf" } }, ownerId);
  await audit("case.export", { ownerId, targetType: "case", targetId: id, meta: { format: "pdf" } });

  const filename = `${found.type}-case-pack.pdf`;
  return new Response(Buffer.from(bytes), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}
