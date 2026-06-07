import { z } from "zod";
import { jsonError, jsonOk, readBody } from "@/lib/api";
import { config } from "@/lib/config";
import { createCheckout, recordPayment } from "@/lib/payments";
import { caseRepository } from "@/lib/repository";
import { ensureOwnerId } from "@/lib/session";
import { track } from "@/lib/analytics";
import { audit } from "@/lib/audit";

export const runtime = "nodejs";

const checkoutSchema = z.object({
  plan: z.enum(["single", "bundle", "pro"]),
  caseId: z.string().optional(),
});

export async function POST(req: Request): Promise<Response> {
  const parsed = await readBody(req, checkoutSchema);
  if (!parsed.ok) return parsed.response;

  const ownerId = await ensureOwnerId();
  const { plan, caseId } = parsed.data;
  const base = config.siteUrl;
  const successUrl = caseId ? `${base}/cases/${caseId}` : `${base}/cases`;
  const cancelUrl = caseId ? `${base}/cases/${caseId}?canceled=1` : `${base}/pricing?canceled=1`;

  track({ name: "checkout_started", props: { plan } }, ownerId);

  // Dev mode (no Stripe keys): unlock immediately so the flow is fully testable.
  if (!config.stripe.enabled) {
    await recordPayment({ ownerId, caseId, plan, status: "paid" });
    if (caseId) await caseRepository.setUnlocked(ownerId, caseId, true);
    await audit("payment.dev_unlock", { ownerId, targetType: "case", targetId: caseId, meta: { plan } });
    return jsonOk({ url: successUrl, mode: "dev" });
  }

  try {
    await recordPayment({ ownerId, caseId, plan, status: "pending" });
    const { url } = await createCheckout({ plan, ownerId, caseId, successUrl, cancelUrl });
    return jsonOk({ url, mode: "live" });
  } catch {
    return jsonError("Could not start checkout. Please try again.", 502);
  }
}
