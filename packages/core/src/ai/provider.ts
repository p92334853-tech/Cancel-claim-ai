import type {
  CaseOutput,
  CaseType,
  Classification,
  EvidenceItem,
  ExtractedFact,
  IntakeData,
  Locale,
} from "../domain/types.js";

/** Everything a provider needs to generate a case output. */
export interface GenerationContext {
  caseType: CaseType;
  locale: Locale;
  intake: IntakeData;
  facts: ExtractedFact[];
  evidence: EvidenceItem[];
  /** ISO date (YYYY-MM-DD) used to anchor dates and follow-ups. */
  today: string;
}

export interface ClassifyContext {
  text: string;
  locale: Locale;
}

/**
 * Provider-agnostic AI contract. Two implementations ship: a deterministic
 * `TemplateProvider` (no keys, always available) and an `AnthropicProvider`
 * (higher quality when configured). Anything implementing this — OpenAI, a local
 * model, a test double — slots in unchanged.
 */
export interface AiProvider {
  readonly id: string;
  readonly mode: "llm" | "template";
  readonly model?: string;
  classify(ctx: ClassifyContext): Promise<Classification>;
  generate(ctx: GenerationContext): Promise<CaseOutput>;
}
