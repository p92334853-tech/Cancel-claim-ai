import type {
  CaseOutput,
  CaseType,
  Classification,
  EvidenceItem,
  ExtractedFact,
  IntakeData,
  Locale,
  MissingInfo,
} from "../domain/types.js";
import { validateIntake } from "../domain/schemas.js";
import { buildCaseDraft, extractFacts } from "../templates/index.js";
import { nowISO, todayISO } from "../utils/dates.js";
import type { AiProvider, GenerationContext } from "./provider.js";

export interface GenerateCaseInput {
  caseType: CaseType;
  locale: Locale;
  intake: IntakeData;
  evidence?: EvidenceItem[];
  /** Pre-extracted facts; computed deterministically if omitted. */
  facts?: ExtractedFact[];
}

/**
 * The workflow engine. It classifies intent, detects missing info, extracts
 * facts, calls the configured provider, and guarantees a complete, well-formed
 * output — falling back to the deterministic draft if a provider misbehaves.
 *
 * Swapping providers (template ↔ Anthropic ↔ anything) requires no changes here.
 */
export class CaseEngine {
  constructor(
    private readonly provider: AiProvider,
    private readonly clock: () => Date = () => new Date(),
  ) {}

  get mode(): "llm" | "template" {
    return this.provider.mode;
  }

  get providerId(): string {
    return this.provider.id;
  }

  async classify(text: string, locale: Locale = "en"): Promise<Classification> {
    return this.provider.classify({ text, locale });
  }

  missingInfo(type: CaseType, intake: IntakeData): MissingInfo {
    return validateIntake(type, intake);
  }

  extractFacts(type: CaseType, intake: IntakeData, evidence: EvidenceItem[] = []): ExtractedFact[] {
    return extractFacts(type, intake, evidence);
  }

  async generate(input: GenerateCaseInput): Promise<CaseOutput> {
    const today = todayISO(this.clock());
    const evidence = input.evidence ?? [];
    const facts = input.facts ?? extractFacts(input.caseType, input.intake, evidence);
    const ctx: GenerationContext = {
      caseType: input.caseType,
      locale: input.locale,
      intake: input.intake,
      facts,
      evidence,
      today,
    };

    try {
      const output = await this.provider.generate(ctx);
      return this.ensureComplete(output, ctx);
    } catch {
      // Never leave a critical flow without a fallback.
      return this.deterministic(ctx);
    }
  }

  /** Backfill any missing pieces from the deterministic draft. */
  private ensureComplete(output: CaseOutput, ctx: GenerationContext): CaseOutput {
    const base = buildCaseDraft({
      caseType: ctx.caseType,
      intake: ctx.intake,
      locale: ctx.locale,
      evidence: ctx.evidence,
      today: ctx.today,
    });

    const variants = output.variants?.length === base.variants.length ? output.variants : base.variants;
    return {
      variants,
      evidenceSummary: output.evidenceSummary || base.evidenceSummary,
      timeline: output.timeline?.length ? output.timeline : base.timeline,
      nextBestAction: output.nextBestAction || base.nextBestAction,
      followUpPlan: output.followUpPlan?.steps?.length ? output.followUpPlan : base.followUpPlan,
      generatedBy: output.generatedBy ?? this.provider.mode,
      model: output.model ?? this.provider.model,
      generatedAt: output.generatedAt || nowISO(this.clock()),
    };
  }

  private deterministic(ctx: GenerationContext): CaseOutput {
    const base = buildCaseDraft({
      caseType: ctx.caseType,
      intake: ctx.intake,
      locale: ctx.locale,
      evidence: ctx.evidence,
      today: ctx.today,
    });
    return { ...base, generatedBy: "template", generatedAt: nowISO(this.clock()) };
  }
}
