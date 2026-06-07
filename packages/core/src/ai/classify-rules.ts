import { CASE_TYPES } from "../domain/types.js";
import type { CaseType, Classification } from "../domain/types.js";

const KEYWORDS: Record<CaseType, string[]> = {
  cancel_subscription: ["cancel", "subscription", "unsubscribe", "auto-renew", "auto renew", "renewal", "renew", "trial", "membership", "recurring", "stop charging"],
  refund_request: ["refund", "money back", "reimburse", "reimbursement", "return", "overcharged", "double charged", "charged twice"],
  chargeback_dispute: ["chargeback", "dispute", "unauthorized", "unauthorised", "fraud", "my bank", "card issuer", "credit card", "didn't receive", "did not receive", "never arrived", "not as described"],
  complaint_letter: ["complaint", "complain", "poor service", "bad service", "unhappy", "terrible", "rude", "speak to a manager", "escalate"],
  appeal_letter: ["appeal", "denied", "rejected", "reconsider", "overturn", "decision", "declined", "claim was denied"],
  follow_up: ["follow up", "follow-up", "no response", "no reply", "chase", "reminder", "haven't heard", "have not heard", "still waiting"],
};

/**
 * Deterministic keyword classifier. Fast, free, and good enough to route the
 * user; the LLM provider improves accuracy when configured.
 */
export function classifyByRules(text: string): Classification {
  const lower = ` ${text.toLowerCase()} `;
  const scores = CASE_TYPES.map((type) => {
    let score = 0;
    for (const kw of KEYWORDS[type]) {
      if (lower.includes(kw)) score += kw.includes(" ") ? 2 : 1;
    }
    return { type, score };
  }).sort((a, b) => b.score - a.score);

  const top = scores[0]!;
  const second = scores[1]!;

  if (top.score === 0) {
    return {
      type: "complaint_letter",
      confidence: 0.25,
      rationale: "No strong signal found; defaulting to a general complaint you can re-route.",
      alternatives: [{ type: "refund_request", confidence: 0.2 }],
    };
  }

  const total = scores.reduce((s, x) => s + x.score, 0) || 1;
  const confidence = Math.min(0.95, 0.4 + (top.score - second.score) / total + top.score / (total + 2));

  return {
    type: top.type,
    confidence: Number(confidence.toFixed(2)),
    rationale: `Matched on terms associated with ${top.type.replace(/_/g, " ")}.`,
    alternatives: scores
      .slice(1)
      .filter((s) => s.score > 0)
      .map((s) => ({ type: s.type, confidence: Number((s.score / total).toFixed(2)) })),
  };
}
