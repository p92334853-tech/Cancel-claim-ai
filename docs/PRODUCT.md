# Product blueprint

## Goal

An outcome-first consumer product that helps people **recover money and stop unwanted charges**.
The user moves from **problem → evidence → action draft → export → follow-up** with the fewest
possible steps. It should feel like a high-end personal assistant — precise, calm, trustworthy.

## Target users

Consumers under mild stress who want a result: subscription cancellers, refund seekers,
chargeback/dispute filers, complaint and appeal writers. Busy, non-technical, outcome-driven.

## Core case types (v1)

Cancel a subscription · Request a refund · Prepare a chargeback/dispute · Write a complaint ·
Appeal a decision · Send a follow-up.

## Outputs every case produces

Email draft · chat/support message · formal letter · short version · evidence summary · timeline ·
**PDF case packet** · follow-up plan · reminder schedule.

## Information architecture

Organised around five nouns: **Problem type → Evidence → Output → Follow-up → History.**

```
Landing ─► Start (pick / describe) ─► Intake wizard ─► Evidence ─► Generate
                                                                      │
                                            ┌─────────────────────────┘
                                            ▼
              Case detail: Next step · Drafts (5) · Follow-up plan · Evidence · Timeline · Export
                                            │
                                            └─► History (My cases)  ·  Privacy controls
```

## UX principles applied

- **One primary CTA per screen**; clear 3-step progress in the wizard.
- **Minimum input, maximum output** — only high-leverage fields are required; the rest are nudges.
- **Guiding empty/loading/success/error states** ("Drafting your case…", "No documents yet — adding
  one makes this stronger").
- **Calm, premium surfaces** — no clutter, no dark patterns, no noisy dashboards.
- **Trust first** — disclaimers are visible but never alarming; the user keeps control of every word.

## Brand & visual direction

Refined, subtly Byzantine: **deep navy `#0E2236`**, **ivory `#F7F4EC`**, **muted gold `#B8924A`**,
**stone grays**, ink `#0A1622`. Serif display headings, clean sans body, soft shadows, polished
cards, high contrast. Luxurious but restrained — no flashy gradients, no cheap startup aesthetic.

## Monetization

Built for fast purchase intent, no aggressive upsells:

| Plan | Price (default) | What it is |
| --- | --- | --- |
| Single case | $12 one-time | One complete, unlocked case pack |
| 3-case bundle | $24 | Three case packs — best value |
| Pro | $9 / month | Unlimited cases for frequent disputes |

**Free tier:** every case starts free and the *short* version is always free to read and copy.
Unlocking reveals the other four drafts, the ready-to-send reminder messages, and the PDF. Prices
are presented transparently; checkout is one click. Without Stripe keys the app runs in dev mode
(instant unlock, no charge) so the entire purchase flow is testable.

## Launch copy

**Hero:** "The calm way to cancel, claim, and dispute." — *Cancel & Claim AI turns a frustrating
situation into a ready-to-send action pack — the right words, the right evidence, and a plan to
follow up. From problem to outcome in minutes.*

**Value pillars:** Written to get a reply, not just to vent · Five versions for every channel and
tone · A clean PDF case file and evidence summary · A follow-up plan so nothing slips.

**App store one-liner:** "Cancel subscriptions, claim refunds, and win disputes — your calm,
premium recovery assistant."

## SEO / discovery

- **Intent-based, indexable solution pages** at `/solutions/[slug]`, one per case type, each with
  unique title/description, long-tail `keywords` (from the core registry), and a canonical URL.
- Clean URLs, `sitemap.xml`, `robots.txt`, OpenGraph metadata, and **FAQ JSON-LD** structured data.
- Fast pages (mostly static/SSG, minimal JS). Prepared for App Store / Play Store / Chrome Web Store
  discoverability via consistent naming and metadata.

## Analytics (funnel)

Typed event catalog in `core/analytics`: `landing_view`, `solution_view`, `case_started`,
`intake_completed`, `case_generated`, `export_done`, `variant_copied`, `checkout_started`,
`payment_completed`, `reminder_engaged`, `case_completed`, `drop_off`. Wire a real sink (PostHog,
warehouse) in `web/lib/analytics.ts` without touching call sites.
