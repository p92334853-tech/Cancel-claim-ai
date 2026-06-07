import { redactForLogs } from "@cancelclaim/core";
import { prisma } from "./db";

/**
 * Append-only audit trail for sensitive actions. `meta` is redacted before
 * storage — we never persist raw PII in logs.
 */
export async function audit(
  action: string,
  opts: { ownerId?: string; targetType?: string; targetId?: string; meta?: unknown } = {},
): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        action,
        ownerId: opts.ownerId,
        targetType: opts.targetType,
        targetId: opts.targetId,
        meta: opts.meta ? redactForLogs(JSON.stringify(opts.meta)).slice(0, 2000) : null,
      },
    });
  } catch {
    // Auditing must never break the user-facing action.
  }
}
