import { z } from "zod";
import type { DraftVariant } from "../domain/types.js";

const variantWithSubject = z.object({ subject: z.string().optional(), body: z.string().min(1) });
const variantNoSubject = z.object({ body: z.string().min(1) });

/** Shape we ask the LLM to return for generation. All parts optional → we backfill. */
export const llmGenerateSchema = z.object({
  variants: z
    .object({
      short: variantWithSubject,
      formal: variantWithSubject,
      firm: variantWithSubject,
      chat: variantNoSubject,
      follow_up: variantWithSubject,
    })
    .partial()
    .default({}),
  evidenceSummary: z.string().optional(),
  nextBestAction: z.string().optional(),
});

export type LlmGenerateResult = z.infer<typeof llmGenerateSchema>;

export const llmClassifySchema = z.object({
  type: z.string(),
  confidence: z.number().min(0).max(1).default(0.6),
  rationale: z.string().default(""),
});

/** Extract the first balanced JSON object from a model response and parse it. */
export function extractJson(text: string): unknown {
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) throw new Error("No JSON object found in model response");
  return JSON.parse(text.slice(start, end + 1));
}

/**
 * Merge an LLM result over a deterministic base. Any variant the model omitted
 * keeps its high-quality deterministic draft, so output is always complete.
 */
export function mergeVariants(base: DraftVariant[], llm: LlmGenerateResult): DraftVariant[] {
  return base.map((variant) => {
    const override = llm.variants?.[variant.key];
    if (!override?.body) return variant;
    return {
      ...variant,
      subject: "subject" in override && override.subject ? override.subject : variant.subject,
      body: override.body,
    };
  });
}
