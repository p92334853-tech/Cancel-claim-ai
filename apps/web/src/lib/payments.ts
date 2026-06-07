import Stripe from "stripe";
import { config } from "./config";
import { prisma } from "./db";

export type PlanId = "single" | "bundle" | "pro";

export interface Plan {
  id: PlanId;
  name: string;
  amount: number; // minor units (cents)
  currency: string;
  interval?: "month";
  tagline: string;
  features: string[];
}

/** Transparent, purchase-intent-friendly pricing. One-time per case + a bundle + a light sub. */
export const PLANS: Record<PlanId, Plan> = {
  single: {
    id: "single",
    name: "Single case",
    amount: 1200,
    currency: "usd",
    tagline: "One complete, ready-to-send case pack.",
    features: ["All five draft versions", "PDF case packet & evidence summary", "Full follow-up plan", "Edit & re-export anytime"],
  },
  bundle: {
    id: "bundle",
    name: "3-case bundle",
    amount: 2400,
    currency: "usd",
    tagline: "Three cases — for when it's never just one.",
    features: ["Everything in Single", "Three full case packs", "Best value per case", "Cases never expire"],
  },
  pro: {
    id: "pro",
    name: "Pro",
    amount: 900,
    currency: "usd",
    interval: "month",
    tagline: "Unlimited cases for frequent disputes.",
    features: ["Unlimited case packs", "Priority generation", "All future case types", "Cancel anytime"],
  },
};

export function formatPrice(amount: number, currency = "usd"): string {
  return (amount / 100).toLocaleString("en-US", { style: "currency", currency: currency.toUpperCase() });
}

function appendQuery(url: string, params: Record<string, string>): string {
  const u = new URL(url);
  for (const [k, v] of Object.entries(params)) u.searchParams.set(k, v);
  return u.toString();
}

export async function recordPayment(args: {
  ownerId: string;
  caseId?: string;
  plan: PlanId;
  status: "pending" | "paid" | "refunded";
  providerRef?: string;
}): Promise<void> {
  const plan = PLANS[args.plan];
  await prisma.payment.create({
    data: {
      ownerId: args.ownerId,
      caseId: args.caseId,
      plan: args.plan,
      amount: plan.amount,
      currency: plan.currency,
      status: args.status,
      provider: config.stripe.enabled ? "stripe" : "dev",
      providerRef: args.providerRef,
    },
  });
}

/**
 * Create a checkout. With Stripe configured, returns a hosted Checkout URL; in
 * dev mode (no keys) returns the success URL flagged so the case unlocks
 * instantly — the purchase flow is testable end-to-end without Stripe.
 */
export async function createCheckout(args: {
  plan: PlanId;
  ownerId: string;
  caseId?: string;
  successUrl: string;
  cancelUrl: string;
}): Promise<{ url: string; mode: "live" | "dev" }> {
  if (!config.stripe.enabled) {
    return { url: appendQuery(args.successUrl, { dev_unlocked: "1", plan: args.plan }), mode: "dev" };
  }

  const stripe = new Stripe(config.stripe.secretKey);
  const plan = PLANS[args.plan];
  const isSubscription = plan.interval === "month";
  const priceId = config.stripe.prices[args.plan];

  const session = await stripe.checkout.sessions.create({
    mode: isSubscription ? "subscription" : "payment",
    line_items: priceId
      ? [{ price: priceId, quantity: 1 }]
      : [
          {
            quantity: 1,
            price_data: {
              currency: plan.currency,
              unit_amount: plan.amount,
              product_data: { name: `Cancel & Claim AI — ${plan.name}` },
              ...(isSubscription ? { recurring: { interval: "month" as const } } : {}),
            },
          },
        ],
    success_url: appendQuery(args.successUrl, { session_id: "{CHECKOUT_SESSION_ID}" }),
    cancel_url: args.cancelUrl,
    client_reference_id: args.caseId ?? args.ownerId,
    metadata: { ownerId: args.ownerId, caseId: args.caseId ?? "", plan: args.plan },
  });

  return { url: session.url ?? args.cancelUrl, mode: "live" };
}

export function getStripe(): Stripe {
  return new Stripe(config.stripe.secretKey);
}
