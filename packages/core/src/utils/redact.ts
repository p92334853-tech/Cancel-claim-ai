/**
 * Defensive helpers used before sending user content to an LLM.
 *
 * Two concerns:
 *  1. Prompt-injection hardening: user/evidence text is wrapped and obvious
 *     instruction-injection markers are neutralised so model instructions live
 *     only in the system/developer prompt.
 *  2. Optional redaction of high-risk identifiers from logs/analytics.
 */

/** Neutralise common prompt-injection vectors in untrusted text. */
export function sanitizeForPrompt(input: string, maxLen = 6000): string {
  let text = (input ?? "").slice(0, maxLen);
  // Strip code-fence / role markers that try to break out of the data block.
  text = text
    .replace(/```+/g, "ʼʼʼ")
    .replace(/<\/?(system|assistant|user|developer)>/gi, "[$1]")
    .replace(/\b(ignore (all|the|previous|above)[^.\n]*instructions?)/gi, "[redacted-instruction]")
    .replace(/\b(disregard[^.\n]*instructions?)/gi, "[redacted-instruction]");
  return text.trim();
}

/** Wrap untrusted content so the model treats it strictly as data. */
export function asDataBlock(label: string, content: string): string {
  const safe = sanitizeForPrompt(content);
  return `<${label}>\n${safe}\n</${label}>`;
}

const EMAIL = /[^\s@]+@[^\s@]+\.[^\s@]+/g;
const CARD = /\b(?:\d[ -]?){13,16}\b/g;
const LONGNUM = /\b\d{9,}\b/g;

/** Mask high-risk identifiers for logs/analytics (never for the user's own drafts). */
export function redactForLogs(input: string): string {
  return (input ?? "")
    .replace(EMAIL, "[email]")
    .replace(CARD, "[card]")
    .replace(LONGNUM, "[number]");
}
