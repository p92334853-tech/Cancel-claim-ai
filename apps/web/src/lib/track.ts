/**
 * Client-side analytics helper. Fire-and-forget; never throws and never blocks
 * the UI. Posts to /api/track which validates and forwards to the server sink.
 */
export function track(name: string, props?: Record<string, string | number | boolean>): void {
  try {
    const payload = JSON.stringify({ name, props });
    if (typeof navigator !== "undefined" && navigator.sendBeacon) {
      navigator.sendBeacon("/api/track", new Blob([payload], { type: "application/json" }));
      return;
    }
    void fetch("/api/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: payload,
      keepalive: true,
    });
  } catch {
    // analytics must never break the app
  }
}
