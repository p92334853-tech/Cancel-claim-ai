import { describe, expect, it } from "vitest";
import { CaseEngine } from "../ai/engine.js";
import { TemplateProvider } from "../ai/template-provider.js";
import { mergeVariants } from "../ai/llm-response.js";
import { buildVariants } from "../templates/index.js";
import type { AiProvider } from "../ai/provider.js";

const fixedClock = () => new Date("2026-06-07T12:00:00.000Z");

describe("CaseEngine", () => {
  it("generates a complete output with the template provider", async () => {
    const engine = new CaseEngine(new TemplateProvider(), fixedClock);
    const output = await engine.generate({
      caseType: "refund_request",
      locale: "en",
      intake: { company: "Acme", amount: "20", reason: "broken", desiredOutcome: "full_refund", yourName: "Sam" },
    });

    expect(output.generatedBy).toBe("template");
    expect(output.variants).toHaveLength(5);
    expect(output.followUpPlan.steps.length).toBeGreaterThan(0);
    expect(output.generatedAt).toContain("2026-06-07");
  });

  it("falls back to a deterministic draft if the provider throws", async () => {
    const broken: AiProvider = {
      id: "broken",
      mode: "llm",
      async classify() {
        throw new Error("no");
      },
      async generate() {
        throw new Error("model exploded");
      },
    };
    const engine = new CaseEngine(broken, fixedClock);
    const output = await engine.generate({
      caseType: "complaint_letter",
      locale: "en",
      intake: { company: "Acme", description: "x", desiredOutcome: "fix", yourName: "Sam" },
    });

    expect(output.generatedBy).toBe("template");
    expect(output.variants).toHaveLength(5);
  });

  it("reports missing required info", () => {
    const engine = new CaseEngine(new TemplateProvider());
    const info = engine.missingInfo("refund_request", { yourName: "Sam" });
    expect(info.ready).toBe(false);
  });
});

describe("mergeVariants", () => {
  it("overrides only the variants the model returned", () => {
    const base = buildVariants("refund_request", { company: "Acme", amount: "10", yourName: "Sam" }, "en", "2026-06-07");
    const merged = mergeVariants(base, { variants: { short: { subject: "New", body: "LLM body" } } });
    const short = merged.find((v) => v.key === "short")!;
    const formal = merged.find((v) => v.key === "formal")!;
    expect(short.body).toBe("LLM body");
    expect(short.subject).toBe("New");
    expect(formal.body).toBe(base.find((v) => v.key === "formal")!.body);
  });
});
