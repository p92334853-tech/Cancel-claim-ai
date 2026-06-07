import type { CaseOutput, CaseType, EvidenceItem, IntakeData, Locale } from "../domain/types.js";
import { buildFollowUpPlan } from "../followup/scheduler.js";
import { buildTimeline } from "./facts.js";
import { buildEvidenceSummary, buildNextBestAction, buildVariants } from "./library.js";

export { extractFacts, buildTimeline } from "./facts.js";
export { buildVariants, buildEvidenceSummary, buildNextBestAction } from "./library.js";

export interface DraftArgs {
  caseType: CaseType;
  intake: IntakeData;
  locale: Locale;
  evidence: EvidenceItem[];
  today: string;
}

/** Assemble a complete, deterministic case draft (sans engine metadata). */
export function buildCaseDraft(args: DraftArgs): Omit<CaseOutput, "generatedBy" | "model" | "generatedAt"> {
  const { caseType, intake, locale, evidence, today } = args;
  return {
    variants: buildVariants(caseType, intake, locale, today),
    evidenceSummary: buildEvidenceSummary(evidence),
    timeline: buildTimeline(caseType, intake, today),
    nextBestAction: buildNextBestAction(caseType, intake),
    followUpPlan: buildFollowUpPlan(caseType, intake, today),
  };
}
