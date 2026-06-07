/**
 * @cancelclaim/core — the shared product brain.
 *
 * Framework-agnostic TypeScript consumed by both the web and mobile apps. No UI,
 * no transport, no database. Domain model + validation + AI workflow + templates
 * + follow-up logic + i18n + analytics contracts.
 */

// Domain
export * from "./domain/index.js";

// AI workflow
export * from "./ai/index.js";

// Templates / deterministic generation
export { buildCaseDraft, extractFacts, buildTimeline, buildVariants } from "./templates/index.js";
export type { DraftArgs } from "./templates/index.js";

// Follow-up
export { buildFollowUpPlan, reanchorPlan } from "./followup/scheduler.js";

// i18n
export { translate, makeT } from "./i18n/index.js";
export type { MessageKey } from "./i18n/index.js";

// Analytics
export * from "./analytics/events.js";

// Utils (selected, app-useful)
export { uuid, shortId } from "./utils/id.js";
export { todayISO, nowISO, addDays, formatLongDate } from "./utils/dates.js";
export { sanitizeForPrompt, asDataBlock, redactForLogs } from "./utils/redact.js";
