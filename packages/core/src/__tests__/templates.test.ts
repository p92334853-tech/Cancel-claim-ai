import { describe, expect, it } from "vitest";
import { DRAFT_VARIANTS } from "../domain/types.js";
import { buildCaseDraft } from "../templates/index.js";

const today = "2026-06-07";

describe("deterministic draft generation", () => {
  it("produces all five variants with content", () => {
    const draft = buildCaseDraft({
      caseType: "refund_request",
      locale: "en",
      evidence: [],
      today,
      intake: {
        company: "Acme Store",
        amount: "89.00",
        reason: "Arrived damaged",
        desiredOutcome: "full_refund",
        orderId: "A-123",
        yourName: "Alex Morgan",
      },
    });

    expect(draft.variants.map((v) => v.key).sort()).toEqual([...DRAFT_VARIANTS].sort());
    for (const v of draft.variants) expect(v.body.length).toBeGreaterThan(20);

    const formal = draft.variants.find((v) => v.key === "formal")!;
    expect(formal.subject).toBeTruthy();
    expect(formal.body).toContain("89.00");
    expect(formal.body).toContain("Alex Morgan");

    const chat = draft.variants.find((v) => v.key === "chat")!;
    expect(chat.subject).toBeUndefined();
    expect(chat.body).not.toContain("Dear");
  });

  it("includes a timeline, next action, and a follow-up plan", () => {
    const draft = buildCaseDraft({
      caseType: "cancel_subscription",
      locale: "en",
      evidence: [],
      today,
      intake: { company: "Acme", desiredOutcome: "cancel_only", renewalDate: "2026-06-20", yourName: "Sam" },
    });

    expect(draft.followUpPlan.steps.length).toBeGreaterThanOrEqual(3);
    expect(draft.followUpPlan.steps[0]?.dueDate).toBe(today);
    expect(draft.nextBestAction).toContain("Acme");
    expect(draft.timeline.some((t) => t.label === "Prepared this case")).toBe(true);
  });

  it("guides the user when no evidence is attached", () => {
    const draft = buildCaseDraft({
      caseType: "complaint_letter",
      locale: "en",
      evidence: [],
      today,
      intake: { company: "Acme", description: "x", desiredOutcome: "fix it", yourName: "Sam" },
    });
    expect(draft.evidenceSummary.toLowerCase()).toContain("no documents");
  });
});
