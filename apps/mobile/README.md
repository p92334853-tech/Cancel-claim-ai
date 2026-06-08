# @cancelclaim/mobile

The Cancel & Claim AI mobile app — an Expo (React Native) client that mirrors the
core web flow with a faster, compressed mobile UX. It **reuses the shared product
brain** (`@cancelclaim/core`) directly from TypeScript source, so the domain
model, intake schema, validation, deterministic draft generation, and follow-up
planning are identical to the web app.

## What's built

A fully functional, **standalone** v1 — no network or API needed. Drafts are
generated **on-device** with core's deterministic `buildCaseDraft`, and cases are
persisted locally with AsyncStorage.

Screens (file-based routing via `expo-router`, under `app/`):

- **Home** (`app/index.tsx`) — brand wordmark, promise, a single primary
  "Start a case" CTA, the six case types from `listCaseTypeDefinitions()`, and a
  link to My cases.
- **Intake** (`app/new/[type].tsx`) — renders the selected case type's fields
  (text/email/money → `TextInput`, textarea → multiline, date → `TextInput`
  with `YYYY-MM-DD` placeholder, select → option chips). Pre-fills field
  defaults, validates required answers with `validateIntake` (inline errors),
  then builds the draft on-device, saves it, and opens results.
- **My cases** (`app/cases.tsx`) — lists saved cases (title = case label +
  company/subject), tap to open, delete via row button or long-press, empty
  state with a CTA. Reloads on focus.
- **Results** (`app/case/[id].tsx`) — recommended next step, the draft variants
  in a segmented tab view (selectable body + Copy/Share per variant), the
  evidence summary, and the follow-up plan (each step: label, due date, channel,
  message, with Copy/Share). Copy uses `expo-clipboard`; Share uses the React
  Native `Share` API.

Shared:

- `theme.ts` — brand tokens (navy `#0E2236`, ivory `#F7F4EC`, gold `#B8924A`,
  stone grays, ink `#0A1622`), spacing scale, radius, font sizes, serif-ish
  heading family, shadows, and reusable text presets.
- `lib/storage.ts` — typed AsyncStorage helpers (`listCases`, `getCase`,
  `saveCase`, `deleteCase`) storing a JSON array under `cc_cases_v1`.
- `lib/format.ts` — small presentation helpers (case title, channel label,
  subject+body composition).
- `components/` — `Button`, `Card`, `Field`, `Badge`, `Screen`.

## Run it

From the repo root, install once so the workspace is linked:

```bash
pnpm install
```

Then start the dev server:

```bash
pnpm --filter @cancelclaim/mobile start
# or, from this folder:
npx expo start
```

Platform shortcuts: `npm run android`, `npm run ios`, `npm run web`.

Typecheck (the quality bar for this scaffold):

```bash
pnpm --filter @cancelclaim/mobile typecheck
# -> tsc --noEmit, currently clean
```

## Metro monorepo note

`metro.config.js` is tuned so Expo can consume `@cancelclaim/core` directly from
its TypeScript source in a pnpm workspace:

- `watchFolders` includes the repo root so edits in `packages/core` are picked up.
- `resolver.nodeModulesPaths` lists both the app and the root `node_modules`, and
  `disableHierarchicalLookup = false`, so hoisted + app-local deps both resolve.
- `resolver.unstable_enableSymlinks = true` because pnpm links packages via
  symlinks.
- `resolver.unstable_enablePackageExports = true` so Metro honors core's
  `exports` map (`"." -> "./src/index.ts"`) — there is no build step for core.

**`.js` → `.ts` specifiers:** core authors relative imports with explicit `.js`
extensions (e.g. `"./domain/index.js"`) that physically resolve to `.ts` files.
TypeScript resolves these under `moduleResolution: "Bundler"` (typecheck is
clean). Metro also resolves them because `ts`/`tsx` are in `resolver.sourceExts`
and Metro falls back to source extensions for relative requires. If a future
Metro version stops resolving these, the lowest-friction fix is to consume core's
build output instead of source (add a `build` step + `dist` to core) — that is
intentionally **not** done here to keep the shared-source demonstration simple.

## Deferred (not in v1)

- Camera / OCR evidence upload (intake passes `evidence: []`; core already
  supports `EvidenceItem[]`).
- Payments / entitlement unlock.
- Server sync and accounts (storage is local-only via AsyncStorage).
- Push notifications for follow-up reminders (the plan + due dates are generated;
  scheduling them as device notifications is future work).
- Native date picker (date fields use a `YYYY-MM-DD` text input for now).
- LLM-backed generation (the on-device path uses core's deterministic
  `buildCaseDraft`; core's `CaseEngine` can later swap in an AI provider).
