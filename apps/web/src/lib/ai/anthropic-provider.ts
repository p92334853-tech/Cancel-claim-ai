import Anthropic from "@anthropic-ai/sdk";
import {
  CASE_TYPES,
  buildCaseDraft,
  buildClassifyPrompt,
  buildGeneratePrompt,
  classifyByRules,
  extractJson,
  llmClassifySchema,
  llmGenerateSchema,
  mergeVariants,
  nowISO,
  type AiProvider,
  type CaseOutput,
  type CaseType,
  type ClassifyContext,
  type Classification,
  type GenerationContext,
} from "@cancelclaim/core";

/**
 * Anthropic-backed provider. It enhances the deterministic draft with the model
 * rather than replacing its guarantees: every code path returns a complete,
 * well-formed CaseOutput, falling back to the template engine on any failure.
 */
export class AnthropicProvider implements AiProvider {
  readonly id = "anthropic";
  readonly mode = "llm" as const;
  readonly model: string;
  private readonly client: Anthropic;

  constructor(apiKey: string, model: string) {
    this.client = new Anthropic({ apiKey });
    this.model = model;
  }

  async classify(ctx: ClassifyContext): Promise<Classification> {
    try {
      const { system, user } = buildClassifyPrompt(ctx.text);
      const text = await this.complete(system, user, 300);
      const parsed = llmClassifySchema.parse(extractJson(text));
      const valid = (CASE_TYPES as readonly string[]).includes(parsed.type);
      const type = valid ? (parsed.type as CaseType) : classifyByRules(ctx.text).type;
      return { type, confidence: parsed.confidence, rationale: parsed.rationale || "Classified by Claude." };
    } catch {
      return classifyByRules(ctx.text);
    }
  }

  async generate(ctx: GenerationContext): Promise<CaseOutput> {
    const base = buildCaseDraft({
      caseType: ctx.caseType,
      intake: ctx.intake,
      locale: ctx.locale,
      evidence: ctx.evidence,
      today: ctx.today,
    });

    try {
      const { system, user } = buildGeneratePrompt(ctx);
      const text = await this.complete(system, user, 2200);
      const parsed = llmGenerateSchema.parse(extractJson(text));
      return {
        variants: mergeVariants(base.variants, parsed),
        evidenceSummary: parsed.evidenceSummary || base.evidenceSummary,
        timeline: base.timeline,
        nextBestAction: parsed.nextBestAction || base.nextBestAction,
        followUpPlan: base.followUpPlan,
        generatedBy: "llm",
        model: this.model,
        generatedAt: nowISO(),
      };
    } catch {
      return { ...base, generatedBy: "template", generatedAt: nowISO() };
    }
  }

  private async complete(system: string, user: string, maxTokens: number): Promise<string> {
    const response = await this.client.messages.create({
      model: this.model,
      max_tokens: maxTokens,
      temperature: 0.4,
      system,
      messages: [{ role: "user", content: user }],
    });
    const block = response.content.find((b) => b.type === "text");
    return block && "text" in block ? block.text : "";
  }
}
