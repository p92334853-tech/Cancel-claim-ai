import type { Locale } from "../domain/types.js";

export function todayISO(now: Date = new Date()): string {
  return now.toISOString().slice(0, 10);
}

export function nowISO(now: Date = new Date()): string {
  return now.toISOString();
}

export function addDays(isoDate: string, days: number): string {
  const d = new Date(`${isoDate}T00:00:00.000Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

/** Human-friendly long date, locale-aware where the runtime supports it. */
export function formatLongDate(iso: string | undefined, locale: Locale = "en"): string {
  if (!iso) return "";
  const d = new Date(iso.length <= 10 ? `${iso}T00:00:00.000Z` : iso);
  if (Number.isNaN(d.getTime())) return iso;
  try {
    return new Intl.DateTimeFormat(localeTag(locale), {
      year: "numeric",
      month: "long",
      day: "numeric",
      timeZone: "UTC",
    }).format(d);
  } catch {
    return d.toISOString().slice(0, 10);
  }
}

function localeTag(locale: Locale): string {
  return locale === "es" ? "es-ES" : "en-US";
}
