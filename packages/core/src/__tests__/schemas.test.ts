import { describe, expect, it } from "vitest";
import { validateIntake } from "../domain/schemas.js";

describe("validateIntake", () => {
  it("flags required fields that are missing", () => {
    const result = validateIntake("refund_request", { yourName: "Alex" });
    expect(result.ready).toBe(false);
    const fields = result.items.filter((i) => i.severity === "required").map((i) => i.field);
    expect(fields).toContain("company");
    expect(fields).toContain("amount");
    expect(fields).toContain("reason");
  });

  it("is ready when all required fields are present", () => {
    const result = validateIntake("refund_request", {
      company: "Acme",
      amount: "50.00",
      reason: "Item never arrived",
      desiredOutcome: "full_refund",
      yourName: "Alex",
    });
    expect(result.ready).toBe(true);
  });

  it("warns on malformed email without blocking", () => {
    const result = validateIntake("cancel_subscription", {
      company: "Acme",
      desiredOutcome: "cancel_only",
      yourName: "Alex",
      accountEmail: "not-an-email",
    });
    expect(result.ready).toBe(true);
    expect(result.items.some((i) => i.field === "accountEmail")).toBe(true);
  });
});
