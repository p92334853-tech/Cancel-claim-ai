import type Stripe from "stripe";
import { config } from "@/lib/config";
import { getStripe, recordPayment, type PlanId } from "@/lib/payments";
import { caseRepository } from "@/lib/repository";
import { prisma } from "@/lib/db";
import { audit } from "@/lib/audit";

export const runtime = "nodejs";

/**
 * Stripe webhook. Verifies the signature and unlocks the relevant case on
 * successful payment. Returns 200 quickly so Stripe doesn't retry needlessly.
 */
export async function POST(req: Request): Promise<Response> {
  if (!config.stripe.enabled || !config.stripe.webhookSecret) {
    return new Response("Stripe not configured", { status: 503 });
  }

  const signature = req.headers.get("stripe-signature");
  if (!signature) return new Response("Missing signature", { status: 400 });

  const payload = await req.text();
  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(payload, signature, config.stripe.webhookSecret);
  } catch {
    return new Response("Invalid signature", { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const ownerId = session.metadata?.ownerId;
    const caseId = session.metadata?.caseId || undefined;
    const plan = (session.metadata?.plan as PlanId) || "single";

    if (ownerId) {
      await recordPayment({ ownerId, caseId, plan, status: "paid", providerRef: session.id });
      if (caseId) {
        await caseRepository.setUnlocked(ownerId, caseId, true);
      } else {
        // Bundle / pro: unlock the owner's most recent case as a convenience.
        const latest = await prisma.case.findFirst({ where: { ownerId }, orderBy: { updatedAt: "desc" } });
        if (latest) await caseRepository.setUnlocked(ownerId, latest.id, true);
      }
      await audit("payment.completed", { ownerId, targetType: "case", targetId: caseId, meta: { plan, ref: session.id } });
    }
  }

  return new Response("ok", { status: 200 });
}
