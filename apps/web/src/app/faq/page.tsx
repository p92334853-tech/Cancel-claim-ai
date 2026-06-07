import type { Metadata } from "next";
import Link from "next/link";
import { Container, Eyebrow } from "@/components/ui";

export const metadata: Metadata = {
  title: "FAQ",
  description: "Answers about how Cancel & Claim AI works, what you get, pricing, privacy, and the legal disclaimer.",
};

const FAQS: { q: string; a: string }[] = [
  {
    q: "What does Cancel & Claim AI actually do?",
    a: "You describe a problem — an unwanted subscription, a refund you're owed, a charge to dispute, a complaint or appeal — and we generate a complete action pack: five ready-to-send drafts, an evidence summary, a timeline, a PDF case file, and a follow-up plan.",
  },
  {
    q: "Do you send anything on my behalf?",
    a: "No. You stay in control of every word. We prepare the drafts and the plan; you review, edit if you like, and send them yourself through email, chat, or post.",
  },
  {
    q: "Is this legal advice?",
    a: "No. Cancel & Claim AI is a self-help tool, not a law firm, and does not provide legal advice. For complex or high-value matters, consider speaking with a qualified professional.",
  },
  {
    q: "Can I try it before paying?",
    a: "Yes. Every case is free to start and the short version is always free to read and copy. You only pay to unlock the full pack — the formal, firm, chat, and follow-up versions plus the PDF and ready-to-send reminders.",
  },
  {
    q: "How much does it cost?",
    a: "A single case is a one-time payment. There's a discounted 3-case bundle, and a light Pro plan for people who deal with disputes often. See the pricing page for current prices.",
  },
  {
    q: "What happens to my data?",
    a: "Your cases are tied to your device session. We keep only what's needed to produce and store your case, and you can export or permanently delete everything at any time from your cases page.",
  },
  {
    q: "Does it work without an AI key?",
    a: "Yes. The product ships with a built-in deterministic drafting engine that produces complete, high-quality packs on its own. When an AI model is configured, drafts are further refined for tone and specificity.",
  },
  {
    q: "Which languages are supported?",
    a: "English today, with a multilingual architecture built in from day one so more languages can be added without reworking the product.",
  },
];

export default function FaqPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQS.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  return (
    <Container className="py-16">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="mx-auto max-w-3xl">
        <Eyebrow>FAQ</Eyebrow>
        <h1 className="mt-3 font-serif text-4xl font-semibold tracking-tightish text-navy">Questions, answered</h1>
        <p className="mt-4 text-lg text-stone-700">Everything you might want to know before you start a case.</p>

        <dl className="mt-10 divide-y divide-stone-200">
          {FAQS.map((f) => (
            <div key={f.q} className="py-6">
              <dt className="font-serif text-lg font-semibold text-navy">{f.q}</dt>
              <dd className="mt-2 leading-relaxed text-stone-700">{f.a}</dd>
            </div>
          ))}
        </dl>

        <p className="mt-8 text-stone-600">
          Still stuck?{" "}
          <Link href="/support" className="font-medium text-navy underline decoration-gold/40 underline-offset-4 hover:decoration-gold">
            Contact support
          </Link>
          .
        </p>
      </div>
    </Container>
  );
}
