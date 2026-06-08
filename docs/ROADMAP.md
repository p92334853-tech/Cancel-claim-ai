# Roadmap

Prioritised after a shippable v1. Each item is additive — the v1 architecture was designed so these
slot in without rewrites.

## Shipped in v1

- Shared product brain (`@cancelclaim/core`) with 21 passing unit tests.
- Full web case flow: classify → intake → evidence → 5 drafts → PDF export → follow-up plan.
- Provider-agnostic AI (deterministic default + Claude enhancement with fallback).
- Prisma data model (SQLite dev / Postgres prod), owner-scoped repository.
- Stripe checkout + webhook with dev-mode unlock; freemium gating.
- Signed-cookie sessions, rate limiting, audit logging, input/upload sanitisation, prompt-injection
  guards, account export/delete.
- SEO solution pages, sitemap/robots, FAQ JSON-LD, structured analytics events.
- Expo mobile app reusing core (on-device generation + local persistence).

## Near-term (highest leverage)

1. **Object storage + OCR.** S3-compatible uploads (`Evidence.storageKey` exists) and text
   extraction from images/PDFs (Textract / Tesseract / a vision model) so photographed receipts feed
   the AI directly.
2. **Reminder delivery.** A scheduled worker (cron/queue) that sends the existing follow-up steps via
   email (Resend/SES) and, on mobile, local/push notifications. Data model + schedule already exist.
3. **Full auth provider.** Email magic-link or OAuth layered on the `ownerId` contract; merge a
   guest session's cases into the account on sign-in.
4. **E2E + component tests.** Playwright for the create→generate→unlock→export journey; RTL for key
   components; wire into CI.

## Mid-term

5. **More locales.** Translate templates + UI strings (the i18n layer and `es` scaffold exist);
   locale-aware draft generation per market.
6. **Smarter intake.** LLM-driven adaptive follow-up questions beyond the deterministic detector;
   per-case strategy selection.
7. **Mobile parity.** Camera capture for evidence, in-app payments (RevenueCat/Stripe), and optional
   server sync of cases across devices.
8. **Analytics sink + dashboards.** Wire PostHog/warehouse; funnel dashboards for the tracked events
   (start→complete→pay→export→repeat) and drop-off analysis.

## Longer-term

9. **Outcome tracking.** Let users mark "resolved / refunded / escalated" to learn which drafts and
   strategies actually win, and feed that back into template/prompt quality.
10. **Company playbooks.** Optional, carefully-sourced per-company cancellation/refund routes and
    addresses (kept as data, not legal advice).
11. **Chrome extension.** Capture a charge or order page and start a case in one click — intent
    discovery at the point of frustration.
12. **Team/assist mode.** A lightweight way for a helper (family member) to prepare a case for
    someone else.

## Explicit non-goals

No generic chatbot, social feed, marketplace, business directory, B2B sales tool, or template dump.
No dark patterns. Simplicity, trust, and shipping over breadth.
