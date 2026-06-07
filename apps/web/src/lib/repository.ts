import {
  type AddEvidenceInput,
  type Case,
  type CaseOutput,
  type CaseStatus,
  type CaseType,
  type EvidenceItem,
  type ExtractedFact,
  type FollowUpPlan,
  type FollowUpStep,
  type IntakeData,
  type Locale,
  getCaseTypeDefinition,
  shortId,
} from "@cancelclaim/core";
import { prisma } from "./db";

/**
 * The persistence boundary. The rest of the app speaks in core domain types;
 * this module is the only place that knows about Prisma rows and JSON columns.
 * Every read/write is scoped by ownerId to enforce tenant isolation.
 */

type CaseRow = {
  id: string;
  ownerId: string;
  userId: string | null;
  type: string;
  status: string;
  locale: string;
  title: string;
  intakeJson: string;
  factsJson: string;
  outputJson: string | null;
  unlocked: boolean;
  createdAt: Date;
  updatedAt: Date;
  evidence?: EvidenceRow[];
  reminders?: ReminderRow[];
};

type EvidenceRow = {
  id: string;
  kind: string;
  name: string;
  mime: string | null;
  size: number | null;
  textContent: string | null;
  storageKey: string | null;
  createdAt: Date;
};

type ReminderRow = {
  id: string;
  offsetDays: number;
  channel: string;
  label: string;
  message: string;
  dueDate: Date | null;
  done: boolean;
};

function parse<T>(json: string | null | undefined, fallback: T): T {
  if (!json) return fallback;
  try {
    return JSON.parse(json) as T;
  } catch {
    return fallback;
  }
}

function toEvidence(row: EvidenceRow): EvidenceItem {
  return {
    id: row.id,
    kind: row.kind as EvidenceItem["kind"],
    name: row.name,
    mime: row.mime ?? undefined,
    size: row.size ?? undefined,
    textContent: row.textContent ?? undefined,
    storageKey: row.storageKey ?? undefined,
    createdAt: row.createdAt.toISOString(),
  };
}

function toStep(row: ReminderRow): FollowUpStep {
  return {
    id: row.id,
    offsetDays: row.offsetDays,
    channel: row.channel as FollowUpStep["channel"],
    label: row.label,
    message: row.message,
    dueDate: row.dueDate ? row.dueDate.toISOString().slice(0, 10) : undefined,
    done: row.done,
  };
}

function toDomain(row: CaseRow): Case {
  const output = parse<CaseOutput | undefined>(row.outputJson, undefined);
  // Reminder rows are authoritative for the live schedule once generated.
  if (output && row.reminders && row.reminders.length) {
    const steps = [...row.reminders].sort((a, b) => a.offsetDays - b.offsetDays).map(toStep);
    const plan: FollowUpPlan = { anchorDate: steps[0]?.dueDate, steps };
    output.followUpPlan = plan;
  }
  return {
    id: row.id,
    ownerId: row.ownerId,
    type: row.type as CaseType,
    status: row.status as CaseStatus,
    locale: row.locale as Locale,
    title: row.title,
    intake: parse<IntakeData>(row.intakeJson, {}),
    facts: parse<ExtractedFact[]>(row.factsJson, []),
    evidence: (row.evidence ?? []).map(toEvidence),
    output,
    unlocked: row.unlocked,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

const include = { evidence: true, reminders: true } as const;

function deriveTitle(type: CaseType, intake: IntakeData): string {
  const def = getCaseTypeDefinition(type);
  const subject = (intake.company || intake.organization || intake.subject || "").trim();
  return subject ? `${def.label}: ${subject}` : def.label;
}

export const caseRepository = {
  async create(ownerId: string, input: { type: CaseType; locale: Locale; intake: IntakeData; title?: string }): Promise<Case> {
    const title = input.title?.trim() || deriveTitle(input.type, input.intake);
    const row = await prisma.case.create({
      data: {
        ownerId,
        type: input.type,
        locale: input.locale,
        title,
        intakeJson: JSON.stringify(input.intake ?? {}),
      },
      include,
    });
    return toDomain(row as CaseRow);
  },

  async list(ownerId: string): Promise<Case[]> {
    const rows = await prisma.case.findMany({ where: { ownerId }, orderBy: { updatedAt: "desc" }, include });
    return rows.map((r) => toDomain(r as CaseRow));
  },

  async get(ownerId: string, id: string): Promise<Case | null> {
    const row = await prisma.case.findFirst({ where: { id, ownerId }, include });
    return row ? toDomain(row as CaseRow) : null;
  },

  async updateIntake(
    ownerId: string,
    id: string,
    patch: { intake?: IntakeData; title?: string; status?: CaseStatus; facts?: ExtractedFact[] },
  ): Promise<Case | null> {
    const existing = await prisma.case.findFirst({ where: { id, ownerId } });
    if (!existing) return null;
    const row = await prisma.case.update({
      where: { id },
      data: {
        intakeJson: patch.intake ? JSON.stringify(patch.intake) : undefined,
        factsJson: patch.facts ? JSON.stringify(patch.facts) : undefined,
        title: patch.title,
        status: patch.status,
      },
      include,
    });
    return toDomain(row as CaseRow);
  },

  async addEvidence(ownerId: string, caseId: string, input: AddEvidenceInput): Promise<EvidenceItem | null> {
    const owned = await prisma.case.findFirst({ where: { id: caseId, ownerId } });
    if (!owned) return null;
    const row = await prisma.evidence.create({
      data: {
        caseId,
        kind: input.kind,
        name: input.name,
        mime: input.mime,
        size: input.size,
        textContent: input.textContent,
        storageKey: input.storageKey,
      },
    });
    await prisma.case.update({ where: { id: caseId }, data: { updatedAt: new Date() } });
    return toEvidence(row as EvidenceRow);
  },

  async removeEvidence(ownerId: string, caseId: string, evidenceId: string): Promise<boolean> {
    const owned = await prisma.case.findFirst({ where: { id: caseId, ownerId } });
    if (!owned) return false;
    await prisma.evidence.deleteMany({ where: { id: evidenceId, caseId } });
    return true;
  },

  /** Persist generated output and (re)materialise its follow-up steps as reminders. */
  async saveOutput(ownerId: string, caseId: string, output: CaseOutput, facts?: ExtractedFact[]): Promise<Case | null> {
    const owned = await prisma.case.findFirst({ where: { id: caseId, ownerId } });
    if (!owned) return null;

    await prisma.$transaction([
      prisma.reminder.deleteMany({ where: { caseId } }),
      prisma.case.update({
        where: { id: caseId },
        data: {
          outputJson: JSON.stringify(output),
          factsJson: facts ? JSON.stringify(facts) : undefined,
          status: "generated",
        },
      }),
      prisma.reminder.createMany({
        data: output.followUpPlan.steps.map((s) => ({
          id: s.id || shortId("step"),
          caseId,
          offsetDays: s.offsetDays,
          channel: s.channel,
          label: s.label,
          message: s.message,
          dueDate: s.dueDate ? new Date(`${s.dueDate}T00:00:00.000Z`) : null,
          done: s.done ?? false,
        })),
      }),
    ]);

    const row = await prisma.case.findFirst({ where: { id: caseId }, include });
    return row ? toDomain(row as CaseRow) : null;
  },

  async setUnlocked(ownerId: string, caseId: string, unlocked: boolean): Promise<boolean> {
    const result = await prisma.case.updateMany({ where: { id: caseId, ownerId }, data: { unlocked } });
    return result.count > 0;
  },

  async toggleReminder(ownerId: string, caseId: string, reminderId: string, done: boolean): Promise<boolean> {
    const owned = await prisma.case.findFirst({ where: { id: caseId, ownerId } });
    if (!owned) return false;
    await prisma.reminder.updateMany({ where: { id: reminderId, caseId }, data: { done } });
    return true;
  },

  async delete(ownerId: string, caseId: string): Promise<boolean> {
    const result = await prisma.case.deleteMany({ where: { id: caseId, ownerId } });
    return result.count > 0;
  },

  /** Account controls: full export and full deletion for a session/owner. */
  async exportOwner(ownerId: string): Promise<{ exportedAt: string; cases: Case[] }> {
    const cases = await this.list(ownerId);
    return { exportedAt: new Date().toISOString(), cases };
  },

  async deleteOwner(ownerId: string): Promise<number> {
    const result = await prisma.case.deleteMany({ where: { ownerId } });
    await prisma.payment.deleteMany({ where: { ownerId } });
    return result.count;
  },
};
