import type { Metadata } from "next";
import { Container, Eyebrow } from "@/components/ui";

export const metadata: Metadata = {
  title: "Privacy",
  description: "How Cancel & Claim AI collects, uses, and protects your data — and the controls you have over it.",
};

export default function PrivacyPage() {
  return (
    <Container className="py-16">
      <div className="mx-auto max-w-prose">
        <Eyebrow>Privacy</Eyebrow>
        <h1 className="mt-3 font-serif text-4xl font-semibold tracking-tightish text-navy">Privacy Policy</h1>
        <p className="mt-2 text-sm text-stone-500">Last updated: this is a template. Review with counsel before launch.</p>

        <div className="prose-doc mt-8">
          <p>
            Cancel &amp; Claim AI (&quot;we&quot;) helps you prepare cancellation requests, refund claims, disputes,
            complaints, and appeals. This policy explains what we collect and the control you have over it. We practise
            data minimisation: we collect only what is needed to produce and store your case.
          </p>

          <h2>What we collect</h2>
          <ul>
            <li><strong>Case details you provide</strong> — the information you type into a case (company names, dates, amounts, your name) and any evidence text you paste or attach.</li>
            <li><strong>Generated content</strong> — the drafts, summaries, and follow-up plans we create for you.</li>
            <li><strong>A session identifier</strong> — a signed cookie that ties your cases to your device so you can return to them. You can start without an account.</li>
            <li><strong>Minimal operational data</strong> — limited, redacted logs of sensitive actions (for example, that a case was generated or exported) for security and reliability.</li>
          </ul>

          <h2>How we use it</h2>
          <ul>
            <li>To generate your drafts, evidence summary, timeline, and follow-up plan.</li>
            <li>To store your cases so you can return, edit, and export them.</li>
            <li>To process payments when you unlock a case (handled by our payment processor).</li>
            <li>To keep the service secure and working (rate limiting, abuse prevention).</li>
          </ul>

          <h2>AI processing</h2>
          <p>
            When an AI model is configured, the case details and evidence text needed to draft your documents are sent to
            that provider solely to generate your content. We design prompts to treat your content as data, and we never
            ask the model to take actions on your behalf. If no model is configured, drafting runs locally with our
            built-in engine.
          </p>

          <h2>Sharing</h2>
          <p>
            We do not sell your personal data. We share data only with service providers that help us operate (for example,
            hosting, database, payment, and — if configured — the AI provider), under appropriate safeguards.
          </p>

          <h2>Security</h2>
          <p>
            Data is encrypted in transit. We store the minimum necessary, sanitise uploaded text, validate inputs, and rate
            limit sensitive endpoints. No system is perfectly secure, but we aim to limit what we hold and for how long.
          </p>

          <h2>Your controls</h2>
          <ul>
            <li><strong>Export</strong> — download everything we hold for your session from your cases page.</li>
            <li><strong>Delete</strong> — permanently delete all your cases and clear your session at any time.</li>
          </ul>

          <h2>Contact</h2>
          <p>
            Questions about privacy? Email <a href="mailto:privacy@cancelclaim.ai">privacy@cancelclaim.ai</a>.
          </p>
        </div>
      </div>
    </Container>
  );
}
