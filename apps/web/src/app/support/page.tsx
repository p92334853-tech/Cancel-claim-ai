import type { Metadata } from "next";
import Link from "next/link";
import { LifeBuoy, Mail, MessageCircleQuestion } from "lucide-react";
import { ButtonLink, Card, Container, Eyebrow } from "@/components/ui";

export const metadata: Metadata = {
  title: "Support",
  description: "Get help with Cancel & Claim AI — contact options, response times, and quick answers.",
};

export default function SupportPage() {
  return (
    <Container className="py-16">
      <div className="mx-auto max-w-3xl">
        <Eyebrow>Support</Eyebrow>
        <h1 className="mt-3 font-serif text-4xl font-semibold tracking-tightish text-navy">We&apos;re here to help</h1>
        <p className="mt-4 text-lg text-stone-700">
          Most answers are in the FAQ. For anything else, reach out — we typically reply within one business day.
        </p>

        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          <Card className="p-6">
            <span className="grid h-11 w-11 place-items-center rounded-xl bg-navy/5 text-navy">
              <Mail className="h-5 w-5" />
            </span>
            <h2 className="mt-4 font-serif text-lg font-semibold text-navy">Email us</h2>
            <p className="mt-1 text-sm text-stone-600">Questions about a case, billing, or your data.</p>
            <a href="mailto:support@cancelclaim.ai" className="mt-3 inline-block text-sm font-medium text-navy underline decoration-gold/40 underline-offset-4 hover:decoration-gold">
              support@cancelclaim.ai
            </a>
          </Card>

          <Card className="p-6">
            <span className="grid h-11 w-11 place-items-center rounded-xl bg-navy/5 text-navy">
              <MessageCircleQuestion className="h-5 w-5" />
            </span>
            <h2 className="mt-4 font-serif text-lg font-semibold text-navy">Read the FAQ</h2>
            <p className="mt-1 text-sm text-stone-600">How it works, what you get, privacy, and pricing.</p>
            <Link href="/faq" className="mt-3 inline-block text-sm font-medium text-navy underline decoration-gold/40 underline-offset-4 hover:decoration-gold">
              Open the FAQ
            </Link>
          </Card>
        </div>

        <Card className="mt-6 flex flex-col items-start gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <LifeBuoy className="mt-0.5 h-5 w-5 text-gold-700" />
            <div>
              <h2 className="font-serif text-lg font-semibold text-navy">A quick reminder</h2>
              <p className="mt-1 max-w-md text-sm text-stone-600">
                We help you prepare and organise — we don&apos;t contact companies on your behalf, and we don&apos;t provide
                legal advice. You stay in control of every message.
              </p>
            </div>
          </div>
          <ButtonLink href="/start" variant="gold" className="shrink-0">
            Start a case
          </ButtonLink>
        </Card>
      </div>
    </Container>
  );
}
