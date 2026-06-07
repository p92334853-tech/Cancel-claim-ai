import { describe, expect, it } from "vitest";
import { classifyByRules } from "../ai/classify-rules.js";

describe("rule-based classifier", () => {
  const cases: [string, string][] = [
    ["I want to cancel my Netflix subscription before it renews", "cancel_subscription"],
    ["Please refund my order, the product was faulty", "refund_request"],
    ["I need to dispute an unauthorized charge with my bank", "chargeback_dispute"],
    ["I want to appeal the denied insurance claim decision", "appeal_letter"],
    ["Following up, I've had no reply to my earlier email", "follow_up"],
  ];

  it.each(cases)("classifies %j as %s", (text, expected) => {
    const result = classifyByRules(text);
    expect(result.type).toBe(expected);
    expect(result.confidence).toBeGreaterThan(0.3);
  });

  it("returns a safe default with low confidence for vague input", () => {
    const result = classifyByRules("hello there");
    expect(result.confidence).toBeLessThan(0.4);
  });
});
