import type { CaseOutput } from "../domain/types.js";
import { nowISO } from "../utils/dates.js";
import { buildCaseDraft } from "../templates/index.js";
import { classifyByRules } from "./classify-rules.js";
import type { AiProvider, ClassifyContext, GenerationContext } from "./provider.js";

/**
 * The deterministic provider. Produces complete, genuinely usable case packs
 * with no external dependencies or API keys. It is both the zero-config default
 * and the guaranteed fallback if an LLM call fails.
 */
export class TemplateProvider implements AiProvider {
  readonly id = "template";
  readonly mode = "template" as const;

  async classify(ctx: ClassifyContext) {
    return classifyByRules(ctx.text);
  }

  async generate(ctx: GenerationContext): Promise<CaseOutput> {
    const draft = buildCaseDraft({
      caseType: ctx.caseType,
      intake: ctx.intake,
      locale: ctx.locale,
      evidence: ctx.evidence,
      today: ctx.today,
    });
    return { ...draft, generatedBy: "template", generatedAt: nowISO() };
  }
}
