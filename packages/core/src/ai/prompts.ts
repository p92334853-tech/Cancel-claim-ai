import { CASE_TYPES } from "../domain/types.js";
import { getCaseTypeDefinition } from "../domain/case-types.js";
import { asDataBlock } from "../utils/redact.js";
import type { GenerationContext } from "./provider.js";

const STYLE_RULES = `You are the drafting engine for "Cancel & Claim AI", a premium assistant that helps everyday people cancel subscriptions, claim refunds, and resolve disputes.

Rules you must always follow:
- Write clear, confident, professional prose. Persuasive but never aggressive or rude.
- Use ONLY facts provided. Never invent names, dates, amounts, policies, or laws.
- If an essential detail is missing, use a clearly marked placeholder like [order number].
- Do not give legal advice or cite specific statutes. You may reference reasonable, common-sense consumer expectations.
- Keep it tight. No filler, no hedging, no AI throat-clearing.
- Output valid JSON only — no markdown, no commentary.`;

export function buildClassifyPrompt(text: string): { system: string; user: string } {
  return {
    system: `${STYLE_RULES}\n\nTask: classify the user's situation into exactly one case type from this list: ${CASE_TYPES.join(", ")}.`,
    user: `Classify the situation in the data block. Respond with JSON: {"type": one of [${CASE_TYPES.join(
      ", ",
    )}], "confidence": 0..1, "rationale": short string}.\n\n${asDataBlock("situation", text)}`,
  };
}

export function buildGeneratePrompt(ctx: GenerationContext): { system: string; user: string } {
  const def = getCaseTypeDefinition(ctx.caseType);
  const factLines = ctx.facts.map((f) => `- ${f.label}: ${f.value}`).join("\n") || "- (no structured facts provided)";
  const evidenceBlocks =
    ctx.evidence
      .filter((e) => e.textContent)
      .map((e) => asDataBlock("evidence", `${e.name}\n${e.textContent}`))
      .join("\n") || "(no evidence text attached)";

  const system = `${STYLE_RULES}

You are drafting a "${def.label}" case. Goal for the user: ${def.description}

Produce these five variants:
- "short": a brief, polite email (3-5 sentences). Include a subject.
- "formal": a complete formal letter. Include a subject.
- "firm": a firm, escalation-ready email that states consequences calmly. Include a subject.
- "chat": 1-3 sentences for a live chat / support box. No subject, no signature.
- "follow_up": a short follow-up email to send if there's no reply. Include a subject.

Also write:
- "evidenceSummary": 1-3 sentences summarising the attached evidence (or guiding the user to add some).
- "nextBestAction": one concrete sentence on what to do next.`;

  const user = `Locale: ${ctx.locale}. Today: ${ctx.today}.

Case facts:
${factLines}

Evidence:
${evidenceBlocks}

Respond with JSON exactly in this shape:
{
  "variants": {
    "short": {"subject": string, "body": string},
    "formal": {"subject": string, "body": string},
    "firm": {"subject": string, "body": string},
    "chat": {"body": string},
    "follow_up": {"subject": string, "body": string}
  },
  "evidenceSummary": string,
  "nextBestAction": string
}`;

  return { system, user };
}
