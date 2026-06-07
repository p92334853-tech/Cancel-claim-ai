import { z } from "zod";
import { CASE_TYPES, DRAFT_VARIANTS, LOCALES, TONES } from "./types.js";
import { getCaseTypeDefinition } from "./case-types.js";
import type { CaseType, MissingInfo, MissingInfoItem } from "./types.js";

/** Reasonable upper bounds to keep payloads — and prompts — sane. */
export const LIMITS = {
  shortText: 200,
  longText: 5000,
  intakeFieldMax: 5000,
  evidenceNoteMax: 20_000,
  maxEvidenceItems: 20,
} as const;

export const caseTypeSchema = z.enum(CASE_TYPES);
export const localeSchema = z.enum(LOCALES);
export const toneSchema = z.enum(TONES);
export const draftVariantKeySchema = z.enum(DRAFT_VARIANTS);

/**
 * Intake values arrive as a string map. We bound length defensively here and
 * apply per-field required/format checks in {@link validateIntake}.
 */
export const intakeDataSchema = z.record(
  z.string().max(LIMITS.intakeFieldMax),
);

export const evidenceItemSchema = z.object({
  id: z.string(),
  kind: z.enum(["file", "note"]),
  name: z.string().max(LIMITS.shortText),
  mime: z.string().max(LIMITS.shortText).optional(),
  size: z.number().int().nonnegative().optional(),
  textContent: z.string().max(LIMITS.evidenceNoteMax).optional(),
  storageKey: z.string().optional(),
  createdAt: z.string(),
});

export const createCaseInputSchema = z.object({
  type: caseTypeSchema,
  locale: localeSchema.default("en"),
  intake: intakeDataSchema.default({}),
  title: z.string().max(LIMITS.shortText).optional(),
});
export type CreateCaseInput = z.infer<typeof createCaseInputSchema>;

export const updateCaseInputSchema = z.object({
  intake: intakeDataSchema.optional(),
  title: z.string().max(LIMITS.shortText).optional(),
  status: z.enum(["open", "generated", "archived"]).optional(),
});
export type UpdateCaseInput = z.infer<typeof updateCaseInputSchema>;

export const addEvidenceInputSchema = z.object({
  kind: z.enum(["file", "note"]),
  name: z.string().min(1).max(LIMITS.shortText),
  mime: z.string().max(LIMITS.shortText).optional(),
  size: z.number().int().nonnegative().max(25 * 1024 * 1024).optional(),
  textContent: z.string().max(LIMITS.evidenceNoteMax).optional(),
  storageKey: z.string().optional(),
});
export type AddEvidenceInput = z.infer<typeof addEvidenceInputSchema>;

export const classifyInputSchema = z.object({
  text: z.string().min(3).max(LIMITS.longText),
  locale: localeSchema.default("en"),
});
export type ClassifyInput = z.infer<typeof classifyInputSchema>;

const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Validate intake answers against a case type's field schema. Returns the set of
 * missing/weak items the UI and AI layer use to ask focused follow-ups.
 *
 * This is pure, deterministic, and fully testable — the foundation of
 * "detect missing information and ask only the most relevant questions".
 */
export function validateIntake(type: CaseType, intake: Record<string, string>): MissingInfo {
  const def = getCaseTypeDefinition(type);
  const items: MissingInfoItem[] = [];

  for (const field of def.fields) {
    const raw = intake[field.name];
    const value = typeof raw === "string" ? raw.trim() : "";

    if (!value) {
      // Identity contact is genuinely optional; everything else flagged by config.
      if (field.required) {
        items.push({
          field: field.name,
          label: field.label,
          question: questionFor(field.label, field.type),
          severity: "required",
        });
      } else if (isRecommended(type, field.name)) {
        items.push({
          field: field.name,
          label: field.label,
          question: questionFor(field.label, field.type),
          severity: "recommended",
        });
      }
      continue;
    }

    if (field.type === "email" && !emailRe.test(value)) {
      items.push({
        field: field.name,
        label: field.label,
        question: `That email doesn't look right — what's the correct address for ${field.label.toLowerCase()}?`,
        severity: "recommended",
      });
    }
  }

  const ready = !items.some((i) => i.severity === "required");
  return { items, ready };
}

/** A small set of high-leverage optional fields worth nudging for per case type. */
function isRecommended(type: CaseType, field: string): boolean {
  const map: Partial<Record<CaseType, string[]>> = {
    cancel_subscription: ["renewalDate"],
    refund_request: ["purchaseDate", "orderId"],
    chargeback_dispute: ["attemptedResolution"],
    follow_up: ["originalDate"],
  };
  return (map[type] ?? []).includes(field);
}

function questionFor(label: string, type: string): string {
  const l = label.replace(/\s*\(optional\)/i, "").toLowerCase();
  if (type === "date") return `Do you have a date for "${l}"? It strengthens your case.`;
  if (type === "money") return `What's the ${l}?`;
  return `Could you add "${l}"? It helps us write a stronger message.`;
}
