# Deployment

The web app is a standard Next.js 15 application and deploys cleanly to Vercel (recommended) or any
Node host. The mobile app ships via Expo EAS.

## 1. Database (PostgreSQL in production)

Provision a Postgres database (Neon, Supabase, RDS, Railway, etc.). Then:

```bash
# In the deploy environment / locally pointed at prod:
DATABASE_PROVIDER=postgresql
DATABASE_URL=postgresql://USER:PASS@HOST:5432/cancelclaim?sslmode=require
pnpm db:push        # or: prisma migrate deploy (see below)
```

For migration history instead of `db:push`:

```bash
cd apps/web
node scripts/set-prisma-provider.mjs   # honors DATABASE_PROVIDER
prisma migrate dev --name init         # once, to create the first migration
prisma migrate deploy                  # in CI/CD
```

> Note: SQLite is for local dev only (ephemeral on serverless). Always use Postgres in production.

## 2. Environment variables

Set these in your host (Vercel Project → Settings → Environment Variables). See
`apps/web/.env.example` for the full list. Minimum for a real production deploy:

| Variable | Required | Notes |
| --- | --- | --- |
| `DATABASE_PROVIDER` / `DATABASE_URL` | ✅ | `postgresql` + connection string |
| `SESSION_SECRET` | ✅ | `openssl rand -base64 32` |
| `NEXT_PUBLIC_SITE_URL` | ✅ | e.g. `https://cancelclaim.ai` |
| `ANTHROPIC_API_KEY`, `AI_MODEL` | optional | enables Claude-enhanced drafts |
| `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_PRICE_*` | optional | enables live payments |
| `NEXT_PUBLIC_ANALYTICS_ENABLED` | optional | turn on the analytics sink |

## 3. Build

```bash
pnpm install
pnpm build        # runs prisma generate (provider-synced) + next build
pnpm start        # or the host's start command
```

On Vercel, set the **Root Directory** to the repo root and the build command to
`pnpm build` (it filters to the web app). `prisma generate` runs in `prebuild`.

## 4. Stripe (live payments)

1. Create three Prices in the Stripe Dashboard (single one-time, bundle one-time, pro monthly) and
   set `STRIPE_PRICE_SINGLE/BUNDLE/PRO`. (If omitted, the app falls back to inline `price_data`.)
2. Add a webhook endpoint → `https://YOUR_DOMAIN/api/webhooks/stripe`, event
   `checkout.session.completed`; put the signing secret in `STRIPE_WEBHOOK_SECRET`.
3. The webhook unlocks the relevant case (or the owner's latest case for bundle/pro).

Test locally with the Stripe CLI:

```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

## 5. AI (Anthropic)

Set `ANTHROPIC_API_KEY` and optionally `AI_MODEL` (default `claude-sonnet-4-6`). With no key the
deterministic engine is used — useful for cost control or as a guaranteed fallback.

## 6. Object storage (for binary evidence — when enabled)

v1 stores only extracted text. To enable real file uploads, wire an S3-compatible bucket using the
`STORAGE_*` env vars and store the object key in `Evidence.storageKey` (the field already exists).

## 7. Production smoke test

After deploy, verify the core flow (replace `$BASE`):

```bash
BASE=https://YOUR_DOMAIN; JAR=$(mktemp)
curl -s -c $JAR -o /dev/null $BASE/                                   # prime session
ID=$(curl -s -b $JAR -c $JAR -X POST $BASE/api/cases -H 'Content-Type: application/json' \
  -d '{"type":"refund_request","intake":{"company":"Acme","amount":"50","reason":"x","desiredOutcome":"full_refund","yourName":"A"}}' \
  | sed -n 's/.*"id":"\([^"]*\)".*/\1/p' | head -1)
curl -s -b $JAR -X POST $BASE/api/cases/$ID/generate -o /dev/null -w "generate %{http_code}\n"
curl -s -b $JAR -o /dev/null -w "export(locked) %{http_code}\n" $BASE/api/cases/$ID/export   # 402
```

## 8. Mobile (Expo EAS)

```bash
cd apps/mobile
npx expo start                     # local dev (Expo Go / simulator)
npx eas build --platform ios       # store builds (requires an Expo account + EAS config)
npx eas build --platform android
```

See `apps/mobile/README.md` for the monorepo Metro note and what's deferred.

## CI suggestions

- `pnpm install --frozen-lockfile`
- `pnpm test` (core unit tests)
- `pnpm build` (type-check + build)
- `prisma migrate deploy` against the production database on release.
