# Cancel & Claim AI

**Recover money and end unwanted charges — from problem to a ready-to-send action pack in minutes.**

Cancel & Claim AI is a premium, outcome-first consumer product that helps everyday people
cancel subscriptions, request refunds, prepare chargebacks/disputes, and write complaints and
appeals. It moves the user along one clear path — **problem → evidence → action draft → export →
follow-up** — with the fewest possible steps.

It is intentionally **not** a generic chatbot. It behaves like a precise personal assistant: it
classifies the situation, asks only for what matters, writes five tailored drafts, packages a clean
case file, and gives a follow-up plan.

> ⚖️ **Disclaimer:** Cancel & Claim AI is a self-help tool, not a law firm, and does not provide
> legal advice. Users review and send everything themselves.

---

## Executive summary

- **What it is:** A monorepo product with a polished **web app** (primary) and an **Expo mobile
  app** (secondary), sharing one TypeScript **product brain** so there is a single source of truth
  for the AI workflow, validation, case logic, and templates.
- **What's shippable today (v1):** The complete core case flow works **end-to-end with zero
  external keys** — classification, intake, evidence, multi-tone draft generation, evidence/timeline
  summaries, PDF case packet, freemium gating, and a follow-up reminder plan. It upgrades
  transparently to Claude-quality drafts when an `ANTHROPIC_API_KEY` is present, and to live
  payments when Stripe keys are present.
- **Why it works without keys:** The AI layer is provider-agnostic. A real, deterministic
  **template engine** produces genuinely useful drafts on its own (not a stubbed placeholder); the
  LLM provider *enhances* that output and always falls back to it. No feature is a dead end.
- **Verified:** `@cancelclaim/core` has 21 passing unit tests; the web app builds cleanly (30
  routes); and a live smoke test creates a case, generates a 5-variant pack, enforces export
  gating, unlocks via dev-mode checkout, and returns a valid PDF.

---

## Monorepo layout

```
.
├── packages/
│   └── core/                 # @cancelclaim/core — the shared product brain (no UI, no I/O)
│       ├── domain/           # types, Zod schemas, case-type registry, missing-info detection
│       ├── ai/               # provider-agnostic AiProvider, CaseEngine, TemplateProvider, prompts
│       ├── templates/        # deterministic draft library (5 variants), facts, timeline
│       ├── followup/         # reminder sequences per case type
│       ├── i18n/             # en + es catalogs, locale-aware formatting
│       └── analytics/        # typed event catalog
├── apps/
│   ├── web/                  # @cancelclaim/web — Next.js 15 App Router (primary product)
│   │   ├── prisma/           # data model (SQLite dev / PostgreSQL prod)
│   │   └── src/
│   │       ├── app/          # pages + API routes
│   │       ├── components/   # design system + product components
│   │       └── lib/          # server: db, session, repository, ai factory, pdf, payments…
│   └── mobile/               # @cancelclaim/mobile — Expo app reusing core (on-device generation)
└── docs/                     # architecture, product blueprint, deployment, roadmap
```

See **[docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)**, **[docs/PRODUCT.md](docs/PRODUCT.md)**,
**[docs/DEPLOYMENT.md](docs/DEPLOYMENT.md)**, and **[docs/ROADMAP.md](docs/ROADMAP.md)**.

---

## Quickstart (web)

**Prerequisites:** Node ≥ 20 and pnpm ≥ 10.

```bash
pnpm install

# Configure environment (every integration is optional)
cp apps/web/.env.example apps/web/.env       # or create apps/web/.env

# Create the local database (SQLite by default — zero setup)
pnpm db:push

# Run the app
pnpm dev                                       # http://localhost:3000
```

That's it. With **no API keys at all**, you get the full flow: pick a problem → enter details →
add evidence → generate five drafts → preview the short version free → "unlock" instantly in
dev mode → export a PDF → work the follow-up plan.

**Run the test suite:**

```bash
pnpm test           # 21 core unit tests (Vitest)
pnpm build          # production build + full type-check of the web app
```

---

## Configuration

All configuration lives in `apps/web/.env` (and `prisma` reads it too). Everything is optional;
sensible, safe defaults apply.

| Variable | Purpose | Default / behavior when unset |
| --- | --- | --- |
| `DATABASE_PROVIDER` | `sqlite` or `postgresql` | `sqlite` |
| `DATABASE_URL` | Prisma connection string | `file:./dev.db` |
| `SESSION_SECRET` | Signs anonymous session cookies | dev fallback (warns in prod) |
| `ANTHROPIC_API_KEY` | Enables Claude-enhanced drafts | unset → deterministic engine |
| `AI_MODEL` | Claude model id | `claude-sonnet-4-6` |
| `STRIPE_SECRET_KEY` | Enables live payments | unset → dev-mode instant unlock |
| `STRIPE_WEBHOOK_SECRET` | Verifies Stripe webhooks | — |
| `STRIPE_PRICE_*` | Optional Stripe Price IDs (single/bundle/pro) | falls back to inline price_data |
| `NEXT_PUBLIC_SITE_URL` | Canonical URL for SEO + checkout redirects | `http://localhost:3000` |
| `NEXT_PUBLIC_ANALYTICS_ENABLED` | Toggles the analytics sink | `false` |

**Switching to PostgreSQL** (production): set `DATABASE_PROVIDER=postgresql` and a Postgres
`DATABASE_URL`, then `pnpm db:push`. The schema is intentionally engine-portable; a small script
(`apps/web/scripts/set-prisma-provider.mjs`) keeps Prisma's `provider` in sync because Prisma can't
read it from an env var.

---

## How the AI workflow works

The AI is structured like a **workflow engine**, not a chat wrapper:

1. **Classify** the situation into a case type (LLM or keyword classifier).
2. **Detect missing info** deterministically from the case-type field registry and ask only the
   most relevant questions.
3. **Extract facts** from intake + evidence text.
4. **Generate** five outputs — *short, formal, firm, chat, follow-up* — plus an evidence summary,
   a timeline, a next-best-action, and a follow-up reminder plan.
5. **Format & guarantee completeness** — the engine backfills anything an LLM omits from the
   deterministic draft, so output is always well-formed.

Providers implement a single `AiProvider` interface (`classify` + `generate`). Two ship today:

- **`TemplateProvider`** — deterministic, dependency-free, always available.
- **`AnthropicProvider`** (web `lib/ai`) — uses Claude to enhance the deterministic draft, with a
  hard fallback to it on any error.

Adding OpenAI, a local model, or a test double is a single new class — nothing else changes.
Untrusted user/evidence text is wrapped in data blocks and lightly sanitised against prompt
injection (`sanitizeForPrompt`, `asDataBlock`).

---

## Security & privacy

- HTTPS everywhere (deploy target); signed **HttpOnly** session cookies (HMAC, Web Crypto) issued
  by middleware; per-owner data isolation enforced in every repository query.
- Input validation with Zod on every API route; **rate limiting** on AI/expensive endpoints;
  upload **sanitisation** (control-char stripping, size/type bounds, text-only extraction in v1).
- **Data minimisation:** only extracted evidence *text* is stored (binaries go to object storage in
  prod); redacted audit logs for sensitive actions; no PII in logs.
- **User controls:** one-click **export** and permanent **delete** of all session data.
- Clear, repeated legal disclaimer (no legal-advice claims).

---

## Testing strategy

- **Unit (core):** Vitest covers the case-type registry, missing-info detection, deterministic
  draft generation (all 5 variants, timeline, follow-up), the classifier, the engine (including the
  provider-failure fallback path), and LLM-merge logic. `pnpm test`.
- **Build/type safety:** `pnpm build` runs the production build and full type-check across the app.
- **Integration smoke (manual/CI-ready):** the create → generate → gate → unlock → export PDF flow
  via the HTTP API (documented in `docs/DEPLOYMENT.md`).
- **Deferred:** Playwright e2e and React Testing Library component tests (scaffolding-ready).

---

## Assumptions made

1. **Web is the primary surface; mobile mirrors the core flow.** Mobile v1 generates drafts
   on-device with the shared engine and persists locally — usable offline, no backend needed.
2. **Anonymous, signed-cookie sessions** are an acceptable v1 identity model (no passwords/email
   required to start). A full auth provider can replace it behind the same "owner id" contract.
3. **Freemium shape:** the *short* version is always free; unlocking a case reveals the other four
   versions, the ready-to-send reminders, and the PDF. One-time per case + a bundle + a light Pro
   sub (transparent, no dark patterns).
4. **Default LLM is Anthropic Claude** (per project decision), behind the provider-agnostic
   interface; the product is fully functional without it.
5. **SQLite for local dev, PostgreSQL for production** (per project decision), one Prisma code path.
6. **Evidence in v1 is text/extracted text.** Binary files store a reference; OCR/PDF parsing and
   S3-style object storage are deferred but stubbed in the schema/config.

---

## Gaps & deferred (clearly labeled)

See **[docs/ROADMAP.md](docs/ROADMAP.md)** for the full list. Highlights:

- Real object storage + OCR/PDF text extraction for uploaded images/PDFs.
- Full auth provider (email magic-link / OAuth) on top of the session contract.
- Push/email delivery for follow-up reminders (schedule + data model exist; sender is the next step).
- Playwright e2e tests and per-component tests.
- Additional locales (architecture and `es` scaffold are in place).
- Mobile parity for evidence camera capture, payments, and server sync.

---

## License

UNLICENSED — private project scaffold.
