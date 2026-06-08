# Architecture

## Principles

- **One product brain.** All business logic — case types, validation, the AI workflow, draft
  templates, follow-up sequencing, i18n, analytics contracts — lives in `packages/core` and is
  consumed unchanged by web and mobile. There are not two product brains.
- **Separation of concerns.** UI (apps) ≠ business logic (core) ≠ persistence/transport (web `lib`).
  Core has no UI, no database, no network.
- **Provider-agnostic AI.** A single `AiProvider` interface; deterministic engine as the default and
  guaranteed fallback; LLM as an enhancement.
- **Strong typing, no stringly-typed logic.** Discriminated unions and Zod schemas at every boundary.

## Package boundaries

```
@cancelclaim/core  ──►  consumed by  ──►  @cancelclaim/web (Next.js)
        │                                  @cancelclaim/mobile (Expo)
        └── pure TS, source-only (no build step); apps transpile it
```

`core` is exported as raw TypeScript. The web app lists it in `transpilePackages` and aliases
`.js`→`.ts` in webpack; mobile resolves it via Metro `watchFolders`. Tests import it directly.

## The AI layer (`core/ai`)

| Piece | Responsibility |
| --- | --- |
| `AiProvider` | Interface: `classify(ctx)` + `generate(ctx) → CaseOutput`. |
| `CaseEngine` | Orchestrates: classify → missing-info → fact extraction → provider.generate → **completeness guarantee** → deterministic fallback on error. |
| `TemplateProvider` | Deterministic, dependency-free generation + keyword classifier. Always available. |
| `AnthropicProvider` (web `lib/ai`) | Calls Claude with structured, injection-hardened prompts; merges over the deterministic draft; falls back on any failure. |
| `prompts.ts` | System/user prompt builders; wraps untrusted text in `<data>` blocks. |
| `llm-response.ts` | Zod schema + JSON extraction + `mergeVariants` (model output never replaces guarantees). |

**Generation output (`CaseOutput`)** always contains: 5 `variants` (short / formal / firm / chat /
follow_up, each with channel + tone), `evidenceSummary`, `timeline`, `nextBestAction`,
`followUpPlan`, and provenance (`generatedBy`, `model`, `generatedAt`).

## Data model (Prisma — `apps/web/prisma/schema.prisma`)

Engine-portable (no native enums / Json / arrays) so the same schema runs on SQLite and PostgreSQL.
Enum-like values are strings; structured data is JSON-encoded strings handled at the repository
boundary.

| Model | Purpose | Key fields |
| --- | --- | --- |
| `Case` | Central aggregate | `ownerId`, `type`, `status`, `locale`, `title`, `intakeJson`, `factsJson`, `outputJson`, `unlocked` |
| `Evidence` | Files/notes attached to a case | `kind`, `name`, `mime`, `size`, `textContent`, `storageKey` |
| `Reminder` | Follow-up schedule (live state) | `offsetDays`, `channel`, `label`, `message`, `dueDate`, `done` |
| `Payment` | Entitlement / payment status | `ownerId`, `caseId`, `plan`, `amount`, `status`, `providerRef` |
| `AuditLog` | Append-only sensitive-action trail | `action`, `ownerId`, `targetId`, redacted `meta` |
| `AppUser` | Optional durable account (future auth) | `email` |

The **repository** (`web/lib/repository.ts`) is the only module that knows about Prisma rows and JSON
columns. It maps rows ↔ `core` domain types and scopes **every** read/write by `ownerId`. Reminder
rows are authoritative for the live follow-up schedule once a case is generated.

## API design (`apps/web/src/app/api`)

| Method & route | Purpose | Notes |
| --- | --- | --- |
| `POST /api/cases` | Create a case | Zod-validated; sets session cookie |
| `GET /api/cases` | List owner's cases | |
| `GET/PATCH/DELETE /api/cases/[id]` | Read / update intake / delete | owner-scoped |
| `POST /api/cases/[id]/evidence` | Add evidence | sanitised; `DELETE ?evidenceId=` to remove |
| `POST /api/cases/[id]/generate` | Run the workflow, persist output + reminders | rate-limited |
| `GET /api/cases/[id]/export` | PDF case packet | `402` unless unlocked |
| `PATCH /api/cases/[id]/reminders` | Toggle a follow-up step done | |
| `POST /api/classify` | Classify free text | rate-limited |
| `POST /api/checkout` | Start checkout / dev-unlock | Stripe or dev mode |
| `POST /api/webhooks/stripe` | Unlock on payment | signature-verified |
| `GET/DELETE /api/account` | Export / delete all owner data | privacy controls |
| `POST /api/track` | Analytics ingest | typed catalog in core |

All routes run on the Node runtime (Prisma/Stripe/pdf-lib), validate input, and return structured
JSON errors. Owner identity comes from a signed cookie (`getOwnerId` / `ensureOwnerId`).

## Sessions & auth

Edge **middleware** issues a signed (HMAC-SHA256, Web Crypto) HttpOnly session cookie to every
visitor so server components can read a stable `ownerId` without writing cookies. This is a secure
anonymous baseline; a full auth provider can replace it while keeping the `ownerId` contract — no
changes to the repository or routes.

## Rendering strategy (web)

- **Static:** landing, pricing, FAQ, legal, support, sitemap/robots.
- **SSG:** `/solutions/[slug]` and `/cases/new/[type]` (from `generateStaticParams`).
- **Dynamic:** `/cases` and `/cases/[id]` (read the session cookie) + all API routes.

## Web tech stack

Next.js 15 (App Router) · React 19 · Tailwind CSS 3 (custom Byzantine tokens) · Prisma 6 ·
Anthropic SDK · Stripe · pdf-lib · Zod · lucide-react.
