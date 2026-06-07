import { CaseEngine, TemplateProvider } from "@cancelclaim/core";
import { config } from "../config";
import { AnthropicProvider } from "./anthropic-provider";

/**
 * Returns the configured workflow engine. With an Anthropic key set, drafts are
 * model-enhanced; otherwise the deterministic engine runs. Either way the API
 * surface — and the output shape — is identical.
 */
export function getEngine(): CaseEngine {
  if (config.ai.enabled) {
    return new CaseEngine(new AnthropicProvider(config.ai.apiKey, config.ai.model));
  }
  return new CaseEngine(new TemplateProvider());
}

export function aiModeLabel(): string {
  return config.ai.enabled ? `Claude (${config.ai.model})` : "Built-in engine";
}
