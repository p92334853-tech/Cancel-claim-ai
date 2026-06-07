import type { Metadata } from "next";
import Link from "next/link";
import { Check } from "lucide-react";
import { ButtonLink, Container, Eyebrow } from "@/components/ui";
import { CheckoutButton } from "@/components/checkout-button";
import { Disclaimer } from "@/components/site/disclaimer";
import { PLANS, formatPrice } from "@/lib/payments";
import { config } from "@/lib/config";

export const metadata: Metadata = {
  title: "Pricing",
  description: "Transparent pricing. Start free, preview your drafts, and pay per case — or save with a bundle or Pro.",
};

export default function PricingPage() {
  const plans = [PLANS.single, PLANS.bundle, PLANS.pro];

  return (
    <Container className="py-16">
      <div className="mx-auto max-w-2xl text-center">
        <Eyebrow className="justify-center">Pricing</Eyebrow>
        <h1 className="mt-3 font-serif text-4xl font-semibold tracking-tightish text-navy sm:text-5xl">
          Pay for outcomes, not subscriptions
        </h1>
        <p className="mt-4 text-lg text-stone-700">
          Start any case free and see your short version before you pay. Unlock the full pack only when it&apos;s worth it.
        </p>
      </div>

      <div className="mx-auto mt-12 grid max-w-5xl gap-6 lg:grid-cols-3">
        {plans.map((plan) => {
          const featured = plan.id === "bundle";
          return (
            <div
              key={plan.id}
              className={
                "card relative flex flex-col p-7 " + (featured ? "border-gold/50 shadow-card ring-1 ring-gold/30" : "")
              }
            >
              {featured ? (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gold px-3 py-1 text-xs font-semibold text-navy-900 shadow-gold">
                  Best value
                </span>
              ) : null}
              <h2 className="font-serif text-2xl font-semibold text-navy">{plan.name}</h2>
              <p className="mt-1 text-sm text-stone-600">{plan.tagline}</p>
              <div className="mt-5 flex items-baseline gap-1">
                <span className="font-serif text-4xl font-semibold text-navy">{formatPrice(plan.amount, plan.currency)}</span>
                <span className="text-sm text-stone-500">{plan.interval ? "/ month" : plan.id === "bundle" ? "/ 3 cases" : "/ case"}</span>
              </div>

              <ul className="mt-6 flex-1 space-y-3">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-sm text-stone-700">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-gold-700" /> {f}
                  </li>
                ))}
              </ul>

              <div className="mt-7">
                {plan.id === "single" ? (
                  <ButtonLink href="/start" variant={featured ? "gold" : "primary"} className="w-full justify-center">
                    Start a case
                  </ButtonLink>
                ) : (
                  <CheckoutButton plan={plan.id} label={plan.id === "pro" ? "Go Pro" : "Get the bundle"} variant={featured ? "gold" : "primary"} />
                )}
              </div>
            </div>
          );
        })}
      </div>

      {!config.stripe.enabled ? (
        <p className="mx-auto mt-8 max-w-2xl rounded-xl border border-stone-200 bg-stone-50 px-4 py-3 text-center text-sm text-stone-600">
          Demo mode: payments are simulated, so checkout unlocks instantly without a charge. Add Stripe keys to enable live
          payments.
        </p>
      ) : null}

      <div className="mx-auto mt-14 max-w-2xl text-center">
        <p className="text-stone-600">
          Questions about what&apos;s included?{" "}
          <Link href="/faq" className="font-medium text-navy underline decoration-gold/40 underline-offset-4 hover:decoration-gold">
            Read the FAQ
          </Link>
          .
        </p>
        <Disclaimer className="mt-6" />
      </div>
    </Container>
  );
}
