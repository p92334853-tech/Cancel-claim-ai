import type { CaseType, DraftVariantKey } from "../domain/types.js";

/**
 * Structured analytics events. A small, typed catalog — not a firehose — aligned
 * to the funnel we actually care about: discover → start → complete → pay →
 * export → return. Wire a real sink (PostHog, etc.) in the app layer.
 */
export type AnalyticsEvent =
  | { name: "landing_view"; props?: { ref?: string } }
  | { name: "solution_view"; props: { caseType: CaseType } }
  | { name: "case_started"; props: { caseType: CaseType; source: "picker" | "classifier" | "solution" } }
  | { name: "intake_completed"; props: { caseType: CaseType; fieldsFilled: number } }
  | { name: "case_generated"; props: { caseType: CaseType; engine: "llm" | "template"; ms: number } }
  | { name: "export_done"; props: { caseType: CaseType; format: "pdf" | "copy" | "email" } }
  | { name: "variant_copied"; props: { caseType: CaseType; variant: DraftVariantKey } }
  | { name: "checkout_started"; props: { plan: string } }
  | { name: "payment_completed"; props: { plan: string; amount: number } }
  | { name: "reminder_engaged"; props: { caseType: CaseType; stepLabel: string } }
  | { name: "case_completed"; props: { caseType: CaseType; secondsToComplete: number } }
  | { name: "drop_off"; props: { step: string; caseType?: CaseType } };

export type AnalyticsEventName = AnalyticsEvent["name"];

export interface AnalyticsSink {
  capture(event: AnalyticsEvent, context?: { anonymousId?: string }): void | Promise<void>;
}

/** Default no-op sink (safe for SSR, tests, and when analytics is disabled). */
export const noopSink: AnalyticsSink = { capture() {} };

/** A console sink useful in development. */
export const consoleSink: AnalyticsSink = {
  capture(event) {
    // eslint-disable-next-line no-console
    console.info(`[analytics] ${event.name}`, "props" in event ? event.props : undefined);
  },
};
