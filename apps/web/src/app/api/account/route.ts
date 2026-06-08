import { jsonOk } from "@/lib/api";
import { caseRepository } from "@/lib/repository";
import { clearSession, getOwnerId } from "@/lib/session";
import { audit } from "@/lib/audit";

export const runtime = "nodejs";

/** Export all data held for the current session/owner (privacy control). */
export async function GET(): Promise<Response> {
  const ownerId = await getOwnerId();
  if (!ownerId) return jsonOk({ exportedAt: new Date().toISOString(), cases: [] });

  const data = await caseRepository.exportOwner(ownerId);
  await audit("account.export", { ownerId });
  return new Response(JSON.stringify(data, null, 2), {
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": `attachment; filename="cancel-claim-ai-export.json"`,
      "Cache-Control": "no-store",
    },
  });
}

/** Delete all data held for the current session/owner and clear the session. */
export async function DELETE(): Promise<Response> {
  const ownerId = await getOwnerId();
  if (ownerId) {
    const count = await caseRepository.deleteOwner(ownerId);
    await audit("account.delete", { ownerId, meta: { cases: count } });
  }
  await clearSession();
  return jsonOk({ ok: true });
}
