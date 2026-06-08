import { getCaseTypeDefinition } from "../domain/case-types.js";
import type { CaseType, EvidenceItem, ExtractedFact, IntakeData, TimelineEntry } from "../domain/types.js";

/** Fields that, when present, become timeline anchors. */
const DATE_FIELDS: Record<string, string> = {
  purchaseDate: "Purchase",
  transactionDate: "Transaction",
  renewalDate: "Next renewal",
  incidentDate: "Incident",
  decisionDate: "Decision",
  originalDate: "First contacted them",
  startDate: "Subscription started",
};

/**
 * Deterministically derive structured facts from intake answers and any
 * evidence text. The LLM provider can produce richer facts, but this guarantees
 * the product works — and stays consistent — with no model at all.
 */
export function extractFacts(type: CaseType, intake: IntakeData, evidence: EvidenceItem[] = []): ExtractedFact[] {
  const def = getCaseTypeDefinition(type);
  const facts: ExtractedFact[] = [];

  for (const field of def.fields) {
    if (field.name === "yourName" || field.name === "yourContact") continue;
    const value = (intake[field.name] ?? "").trim();
    if (!value) continue;
    facts.push({
      key: field.name,
      label: field.label.replace(/\s*\(optional\)/i, ""),
      value: labelForValue(field, value),
      confidence: 1,
      source: "intake",
    });
  }

  for (const item of evidence) {
    if (!item.textContent) continue;
    for (const f of scanText(item.textContent)) {
      if (!facts.some((existing) => existing.value === f.value)) facts.push(f);
    }
  }

  return facts;
}

function labelForValue(field: { type: string; options?: { value: string; label: string }[] }, value: string): string {
  if (field.type === "select" && field.options) {
    return field.options.find((o) => o.value === value)?.label ?? value;
  }
  return value;
}

const AMOUNT_RE = /(?:[$£€]\s?\d{1,3}(?:[.,]\d{2})?)|\b\d+[.,]\d{2}\b/g;
const ORDER_RE = /\b(?:order|ref|reference|invoice|ticket|case)\s*#?\s*([A-Z0-9-]{4,})\b/gi;

/** Lightweight evidence parsing for amounts and reference numbers. */
function scanText(text: string): ExtractedFact[] {
  const out: ExtractedFact[] = [];
  const amount = text.match(AMOUNT_RE)?.[0];
  if (amount) {
    out.push({ key: "evidence_amount", label: "Amount found in evidence", value: amount, confidence: 0.5, source: "evidence" });
  }
  let m: RegExpExecArray | null;
  ORDER_RE.lastIndex = 0;
  if ((m = ORDER_RE.exec(text)) && m[1]) {
    out.push({ key: "evidence_reference", label: "Reference found in evidence", value: m[1], confidence: 0.5, source: "evidence" });
  }
  return out;
}

/** Build an ordered timeline from known dates. */
export function buildTimeline(type: CaseType, intake: IntakeData, today: string): TimelineEntry[] {
  const entries: TimelineEntry[] = [];
  for (const [field, label] of Object.entries(DATE_FIELDS)) {
    const value = (intake[field] ?? "").trim();
    if (value) entries.push({ date: isoOrUndefined(value), label, detail: isoOrUndefined(value) ? undefined : value });
  }
  entries.push({ date: today, label: "Prepared this case", detail: "Drafts and follow-up plan generated." });

  return entries.sort((a, b) => {
    if (a.date && b.date) return a.date.localeCompare(b.date);
    if (a.date) return -1;
    if (b.date) return 1;
    return 0;
  });
}

function isoOrUndefined(value: string): string | undefined {
  return /^\d{4}-\d{2}-\d{2}/.test(value) ? value.slice(0, 10) : undefined;
}
