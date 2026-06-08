export type { AiProvider, GenerationContext, ClassifyContext } from "./provider.js";
export { CaseEngine } from "./engine.js";
export type { GenerateCaseInput } from "./engine.js";
export { TemplateProvider } from "./template-provider.js";
export { classifyByRules } from "./classify-rules.js";
export { buildClassifyPrompt, buildGeneratePrompt } from "./prompts.js";
export {
  llmGenerateSchema,
  llmClassifySchema,
  extractJson,
  mergeVariants,
} from "./llm-response.js";
export type { LlmGenerateResult } from "./llm-response.js";
