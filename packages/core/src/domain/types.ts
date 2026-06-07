/**
 * Core domain types for Cancel & Claim AI.
 *
 * These types are the single source of truth shared by the web app, the mobile
 * app, the AI layer, and the persistence layer. Keep them free of any
 * framework- or transport-specific concerns.
 */

/** The problem categories the product supports end-to-end. */
export const CASE_TYPES = [
  "cancel_subscription",
  "refund_request",
  "chargeback_dispute",
  "complaint_letter",
  "appeal_letter",
  "follow_up",
] as const;

export type CaseType = (typeof CASE_TYPES)[number];

/** Lifecycle of a case. Intentionally small. */
export const CASE_STATUSES = ["open", "generated", "archived"] as const;
export type CaseStatus = (typeof CASE_STATUSES)[number];

/**
 * The five output versions the product always produces. Each maps to a real
 * communication channel and tone so the user can act immediately.
 */
export const DRAFT_VARIANTS = [
  "short",
  "formal",
  "firm",
  "chat",
  "follow_up",
] as const;
export type DraftVariantKey = (typeof DRAFT_VARIANTS)[number];

export type Channel = "email" | "letter" | "chat";

/** Rewrite tones the AI layer can target. */
export const TONES = ["polite", "firm", "assertive", "formal", "short"] as const;
export type Tone = (typeof TONES)[number];

/** Supported locales. English ships first; the architecture supports more. */
export const LOCALES = ["en", "es"] as const;
export type Locale = (typeof LOCALES)[number];

/** A single intake field definition used to render forms and validate input. */
export interface IntakeField {
  name: string;
  label: string;
  type: "text" | "textarea" | "date" | "money" | "select" | "email";
  required: boolean;
  placeholder?: string;
  help?: string;
  /** For `select` fields. */
  options?: { value: string; label: string }[];
  /** Default value (e.g. a sensible desired outcome). */
  defaultValue?: string;
}

/** Static metadata + intake schema for a case type. Drives the whole flow. */
export interface CaseTypeDefinition {
  type: CaseType;
  /** Short, human label. */
  label: string;
  /** One-line value proposition. */
  tagline: string;
  /** Longer description used on landing/solution pages. */
  description: string;
  /** Lucide-style icon name (resolved by the UI layer). */
  icon: string;
  /** SEO slug for the dedicated solution landing page. */
  slug: string;
  /** Long-tail keywords for intent-based discovery. */
  keywords: string[];
  /** The ordered intake fields collected from the user. */
  fields: IntakeField[];
  /** Optional example to seed empty states. */
  example?: Partial<Record<string, string>>;
}

/** A user's answers to the intake fields. */
export type IntakeData = Record<string, string>;

/** A piece of evidence attached to a case. */
export interface EvidenceItem {
  id: string;
  kind: "file" | "note";
  name: string;
  mime?: string;
  size?: number;
  /** Extracted/typed text content used by the AI layer (never raw binaries). */
  textContent?: string;
  /** Reference to stored object (object storage key or data URL in dev). */
  storageKey?: string;
  createdAt: string;
}

/** A structured fact the AI extracted from intake + evidence. */
export interface ExtractedFact {
  key: string;
  label: string;
  value: string;
  confidence: number; // 0..1
  source: "intake" | "evidence" | "inferred";
}

/** One entry in the case timeline summary. */
export interface TimelineEntry {
  /** ISO date if known. */
  date?: string;
  label: string;
  detail?: string;
}

/** A generated draft in a particular tone/channel. */
export interface DraftVariant {
  key: DraftVariantKey;
  label: string;
  channel: Channel;
  tone: Tone;
  /** Present for email/letter variants. */
  subject?: string;
  body: string;
}

export type FollowUpChannel = "email" | "phone" | "chat" | "letter";

/** A single scheduled follow-up step. */
export interface FollowUpStep {
  id: string;
  /** Days after the case is sent that this step should happen. */
  offsetDays: number;
  channel: FollowUpChannel;
  label: string;
  /** Ready-to-send message for this step. */
  message: string;
  /** Computed absolute due date (ISO), set when a plan is anchored to a date. */
  dueDate?: string;
  done?: boolean;
}

export interface FollowUpPlan {
  /** The date the plan is anchored to (when the first message is sent). */
  anchorDate?: string;
  steps: FollowUpStep[];
}

/** The complete bundle the AI workflow produces for a case. */
export interface CaseOutput {
  variants: DraftVariant[];
  evidenceSummary: string;
  timeline: TimelineEntry[];
  nextBestAction: string;
  followUpPlan: FollowUpPlan;
  /** Which engine produced this output. */
  generatedBy: "llm" | "template";
  /** Model identifier when produced by an LLM. */
  model?: string;
  generatedAt: string;
}

/** The persisted case aggregate. */
export interface Case {
  id: string;
  /** Owning session/user. */
  ownerId: string;
  type: CaseType;
  status: CaseStatus;
  locale: Locale;
  title: string;
  intake: IntakeData;
  evidence: EvidenceItem[];
  facts: ExtractedFact[];
  output?: CaseOutput;
  /** Whether the full case pack has been unlocked (payment/entitlement). */
  unlocked: boolean;
  createdAt: string;
  updatedAt: string;
}

/** Result of classifying free-text into a case type. */
export interface Classification {
  type: CaseType;
  confidence: number; // 0..1
  rationale: string;
  /** Alternative interpretations, most likely first. */
  alternatives?: { type: CaseType; confidence: number }[];
}

/** A missing or weak input the user should provide before generation. */
export interface MissingInfoItem {
  field: string;
  label: string;
  /** A focused question to ask the user. */
  question: string;
  severity: "required" | "recommended";
}

export interface MissingInfo {
  items: MissingInfoItem[];
  /** True when nothing required is missing. */
  ready: boolean;
}
