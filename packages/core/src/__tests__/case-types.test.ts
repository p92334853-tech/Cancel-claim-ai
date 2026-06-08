import { describe, expect, it } from "vitest";
import { CASE_TYPES } from "../domain/types.js";
import { getCaseTypeBySlug, listCaseTypeDefinitions } from "../domain/case-types.js";

describe("case-type registry", () => {
  const defs = listCaseTypeDefinitions();

  it("defines exactly the registered case types", () => {
    expect(defs.map((d) => d.type).sort()).toEqual([...CASE_TYPES].sort());
  });

  it("has unique, resolvable slugs", () => {
    const slugs = defs.map((d) => d.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
    for (const d of defs) expect(getCaseTypeBySlug(d.slug)?.type).toBe(d.type);
  });

  it("requires a sender name and uses unique field names", () => {
    for (const d of defs) {
      const names = d.fields.map((f) => f.name);
      expect(new Set(names).size).toBe(names.length);
      expect(names).toContain("yourName");
      expect(d.fields.find((f) => f.name === "yourName")?.required).toBe(true);
      expect(d.keywords.length).toBeGreaterThan(0);
    }
  });
});
