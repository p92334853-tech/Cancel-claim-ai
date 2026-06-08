/**
 * Small presentation helpers shared across screens. Kept separate from the
 * domain so the UI can format core data without reaching into core internals.
 */
import type { CaseType, IntakeData } from "@cancelclaim/core";
import { getCaseTypeDefinition } from "@cancelclaim/core";

/**
 * Derive a human title for a case from its type and intake. Prefers the most
 * identifying field (company / organization / subject) and falls back to the
 * case-type label alone.
 */
export function caseTitle(type: CaseType, intake: IntakeData): string {
  const def = getCaseTypeDefinition(type);
  const subject =
    pick(intake, "company") ||
    pick(intake, "organization") ||
    pick(intake, "subject");
  return subject ? `${def.label} - ${subject}` : def.label;
}

function pick(intake: IntakeData, key: string): string {
  const raw = intake[key];
  return typeof raw === "string" ? raw.trim() : "";
}

const CHANNEL_LABEL: Record<string, string> = {
  email: "Email",
  letter: "Letter",
  chat: "Chat",
  phone: "Phone",
};

export function channelLabel(channel: string): string {
  return CHANNEL_LABEL[channel] ?? channel;
}

/** Compose subject + body into a single copy/share-ready block. */
export function composeMessage(subject: string | undefined, body: string): string {
  return subject ? `Subject: ${subject}\n\n${body}` : body;
}
