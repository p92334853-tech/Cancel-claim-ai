import type { Locale } from "../domain/types.js";
import { en, type MessageKey } from "./locales/en.js";
import { es } from "./locales/es.js";

const catalogs: Record<Locale, Partial<Record<MessageKey, string>>> = { en, es };

/**
 * Minimal, dependency-free translator. Looks up the locale catalog and falls
 * back to English, then to the key itself. Supports `{name}` interpolation.
 */
export function translate(locale: Locale, key: MessageKey, vars?: Record<string, string | number>): string {
  const template = catalogs[locale]?.[key] ?? en[key] ?? key;
  if (!vars) return template;
  return template.replace(/\{(\w+)\}/g, (_, k: string) => String(vars[k] ?? `{${k}}`));
}

/** Curried helper for a fixed locale: `const t = makeT('en'); t('cta.start')`. */
export function makeT(locale: Locale) {
  return (key: MessageKey, vars?: Record<string, string | number>) => translate(locale, key, vars);
}

export type { MessageKey };
