import type { MessageKey } from "./en.js";

/**
 * Spanish catalog (partial). Demonstrates the multilingual architecture; any
 * missing key falls back to English at lookup time. Expand as locales ship.
 */
export const es: Partial<Record<MessageKey, string>> = {
  "app.name": "Cancel & Claim AI",
  "app.tagline": "Recupera tu dinero y detén cargos no deseados — en minutos.",
  "cta.start": "Iniciar un caso",
  "cta.continue": "Continuar",
  "cta.generate": "Generar mis borradores",
  "cta.export": "Exportar el expediente",
  "nav.cases": "Mis casos",
  "nav.pricing": "Precios",
  "nav.faq": "Preguntas",
  "nav.support": "Soporte",
  "disclaimer.short": "Cancel & Claim AI es una herramienta de autoayuda, no un bufete, y no ofrece asesoría legal.",
};
