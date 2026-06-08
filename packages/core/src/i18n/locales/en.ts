/** English catalog. The default and reference locale. */
export const en = {
  "app.name": "Cancel & Claim AI",
  "app.tagline": "Recover money and end unwanted charges — in minutes, not hours.",
  "cta.start": "Start a case",
  "cta.continue": "Continue",
  "cta.generate": "Generate my drafts",
  "cta.export": "Export case pack",
  "nav.cases": "My cases",
  "nav.pricing": "Pricing",
  "nav.faq": "FAQ",
  "nav.support": "Support",
  "disclaimer.short": "Cancel & Claim AI is a self-help tool, not a law firm, and does not provide legal advice.",
  "empty.cases": "You have no cases yet. Start one and we'll do the heavy lifting.",
  "state.generating": "Drafting your case…",
  "state.ready": "Your case pack is ready.",
} as const;

export type MessageKey = keyof typeof en;
