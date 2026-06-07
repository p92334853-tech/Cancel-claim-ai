import { type AnalyticsEvent, consoleSink, noopSink } from "@cancelclaim/core";
import { config } from "./config";

/**
 * Server-side analytics capture. Uses a console sink in dev (when enabled) and a
 * no-op otherwise. Swap in a real sink (PostHog, Segment, a warehouse) here
 * without touching call sites — they already emit the typed event catalog.
 */
const sink = config.analytics.enabled ? consoleSink : noopSink;

export function track(event: AnalyticsEvent, anonymousId?: string): void {
  void sink.capture(event, { anonymousId });
}
