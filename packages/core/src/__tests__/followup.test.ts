import { describe, expect, it } from "vitest";
import { buildFollowUpPlan, reanchorPlan } from "../followup/scheduler.js";

describe("follow-up scheduler", () => {
  it("anchors due dates to the send date", () => {
    const plan = buildFollowUpPlan("refund_request", { company: "Acme" }, "2026-06-07");
    expect(plan.anchorDate).toBe("2026-06-07");
    expect(plan.steps[0]?.dueDate).toBe("2026-06-07");
    const five = plan.steps.find((s) => s.offsetDays === 5);
    expect(five?.dueDate).toBe("2026-06-12");
    expect(plan.steps.every((s) => s.message.length > 0)).toBe(true);
  });

  it("re-anchors all steps when the send date changes", () => {
    const plan = buildFollowUpPlan("cancel_subscription", { company: "Acme" }, "2026-06-07");
    const moved = reanchorPlan(plan, "2026-07-01");
    expect(moved.anchorDate).toBe("2026-07-01");
    expect(moved.steps[0]?.dueDate).toBe("2026-07-01");
    const wk = moved.steps.find((s) => s.offsetDays === 7);
    expect(wk?.dueDate).toBe("2026-07-08");
  });
});
