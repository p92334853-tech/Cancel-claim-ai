/**
 * Central runtime configuration. Every external integration is optional: the
 * app is fully functional with none of them (deterministic AI, local SQLite,
 * dev-mode payments). Derived booleans tell the rest of the app what's live.
 */
const env = process.env;

function bool(value: string | undefined, fallback = false): boolean {
  if (value == null) return fallback;
  return ["1", "true", "yes", "on"].includes(value.toLowerCase());
}

export const config = {
  isProd: env.NODE_ENV === "production",
  siteUrl: env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
  sessionSecret: env.SESSION_SECRET || "dev-insecure-secret-change-me",

  database: {
    provider: env.DATABASE_PROVIDER || "sqlite",
    url: env.DATABASE_URL || "file:./dev.db",
  },

  ai: {
    apiKey: env.ANTHROPIC_API_KEY || "",
    model: env.AI_MODEL || "claude-sonnet-4-6",
    get enabled() {
      return Boolean(env.ANTHROPIC_API_KEY);
    },
  },

  stripe: {
    secretKey: env.STRIPE_SECRET_KEY || "",
    webhookSecret: env.STRIPE_WEBHOOK_SECRET || "",
    prices: {
      single: env.STRIPE_PRICE_SINGLE || "",
      bundle: env.STRIPE_PRICE_BUNDLE || "",
      pro: env.STRIPE_PRICE_PRO || "",
    },
    get enabled() {
      return Boolean(env.STRIPE_SECRET_KEY);
    },
  },

  analytics: {
    enabled: bool(env.NEXT_PUBLIC_ANALYTICS_ENABLED, false),
  },
} as const;

/** Warn loudly (server logs) about insecure defaults in production. */
export function assertProdConfig(): void {
  if (!config.isProd) return;
  if (config.sessionSecret === "dev-insecure-secret-change-me") {
    console.warn("[config] SESSION_SECRET is not set — sessions are insecure.");
  }
}
