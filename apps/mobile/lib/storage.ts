/**
 * Typed local persistence for cases, backed by AsyncStorage.
 *
 * All cases are stored under a single key ("cc_cases_v1") as a JSON array. This
 * keeps reads/writes simple and atomic for the small data volumes a single user
 * generates on-device. The mobile app is fully functional standalone — drafts
 * are produced by core's deterministic engine, so nothing here touches a network.
 */
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { CaseType, IntakeData } from "@cancelclaim/core";
import { buildCaseDraft } from "@cancelclaim/core";

const STORAGE_KEY = "cc_cases_v1";

/** The output of `buildCaseDraft` (deterministic engine, sans engine metadata). */
export type CaseDraft = ReturnType<typeof buildCaseDraft>;

/** A case as persisted on-device. */
export interface StoredCase {
  id: string;
  type: CaseType;
  /** Human title derived at save time (case label + company/subject). */
  title: string;
  intake: IntakeData;
  output: CaseDraft;
  createdAt: string;
}

function isStoredCase(value: unknown): value is StoredCase {
  if (typeof value !== "object" || value === null) return false;
  const c = value as Record<string, unknown>;
  return (
    typeof c.id === "string" &&
    typeof c.type === "string" &&
    typeof c.title === "string" &&
    typeof c.intake === "object" &&
    c.intake !== null &&
    typeof c.output === "object" &&
    c.output !== null &&
    typeof c.createdAt === "string"
  );
}

async function readAll(): Promise<StoredCase[]> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isStoredCase);
  } catch {
    // Corrupt or unreadable store: fail safe to an empty list rather than crash.
    return [];
  }
}

async function writeAll(cases: StoredCase[]): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(cases));
}

/** All saved cases, most recent first. */
export async function listCases(): Promise<StoredCase[]> {
  const cases = await readAll();
  return cases.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

/** A single case by id, or null if not found. */
export async function getCase(id: string): Promise<StoredCase | null> {
  const cases = await readAll();
  return cases.find((c) => c.id === id) ?? null;
}

/** Insert or replace a case (matched by id). */
export async function saveCase(next: StoredCase): Promise<void> {
  const cases = await readAll();
  const idx = cases.findIndex((c) => c.id === next.id);
  if (idx >= 0) cases[idx] = next;
  else cases.push(next);
  await writeAll(cases);
}

/** Remove a case by id. */
export async function deleteCase(id: string): Promise<void> {
  const cases = await readAll();
  await writeAll(cases.filter((c) => c.id !== id));
}
