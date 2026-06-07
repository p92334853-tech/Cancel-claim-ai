import type { Metadata } from "next";
import { Container, Eyebrow } from "@/components/ui";

export const metadata: Metadata = {
  title: "Terms & disclaimer",
  description: "The terms of use and the important legal disclaimer for Cancel & Claim AI.",
};

export default function TermsPage() {
  return (
    <Container className="py-16">
      <div className="mx-auto max-w-prose">
        <Eyebrow>Legal</Eyebrow>
        <h1 className="mt-3 font-serif text-4xl font-semibold tracking-tightish text-navy">Terms &amp; Disclaimer</h1>
        <p className="mt-2 text-sm text-stone-500">Last updated: this is a template. Review with counsel before launch.</p>

        <div className="prose-doc mt-8">
          <div className="rounded-xl border border-gold/30 bg-gold/5 p-4">
            <p className="!mt-0 font-medium text-navy">
              Important: Cancel &amp; Claim AI is a self-help tool, not a law firm, and does not provide legal advice. We do
              not represent you, and using the service does not create a lawyer–client relationship. You are responsible
              for reviewing and sending everything yourself.
            </p>
          </div>

          <h2>Acceptance</h2>
          <p>By using Cancel &amp; Claim AI you agree to these terms. If you do not agree, do not use the service.</p>

          <h2>What the service is</h2>
          <p>
            We generate draft communications and an organised case file based on the information you provide. Outcomes
            depend on your specific facts, the other party, and applicable rules — we do not and cannot guarantee any
            particular result, refund, cancellation, or decision.
          </p>

          <h2>Your responsibilities</h2>
          <ul>
            <li>Provide accurate information and review every draft before sending it.</li>
            <li>Use the service lawfully and not for harassment, fraud, or any unlawful purpose.</li>
            <li>Make your own decision about whether to seek professional advice for important matters.</li>
          </ul>

          <h2>No legal advice</h2>
          <p>
            Nothing produced by the service is legal advice. References to common consumer expectations are general
            information, not advice about your situation. For complex, high-value, or time-sensitive matters, consult a
            qualified professional.
          </p>

          <h2>Payments</h2>
          <p>
            Some features require payment. Prices are shown before purchase. One-time case purchases unlock the relevant
            case; subscriptions renew until cancelled. Refunds are handled in line with the policy shown at checkout and
            applicable law.
          </p>

          <h2>Limitation of liability</h2>
          <p>
            To the maximum extent permitted by law, the service is provided &quot;as is&quot; and we are not liable for any
            indirect or consequential losses, or for outcomes arising from communications you choose to send.
          </p>

          <h2>Changes</h2>
          <p>We may update these terms. Material changes will be reflected by the &quot;last updated&quot; date above.</p>

          <h2>Contact</h2>
          <p>
            Questions? Email <a href="mailto:support@cancelclaim.ai">support@cancelclaim.ai</a>.
          </p>
        </div>
      </div>
    </Container>
  );
}
